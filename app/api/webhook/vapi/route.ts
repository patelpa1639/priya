import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { sendEmail, createPriyaEmailContent } from '@/lib/email-service';
import { sendTelegramMessage, formatCallForTelegram, sendMissedCallAlert, TOPICS } from '@/lib/telegram';
import { getCallerProfile, upsertCallerProfile, logCall } from '@/lib/redis';

// Lazy-init so the build doesn't crash when env vars are missing
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

// Function to summarize transcript using OpenAI - customized for Priya
async function summarizeTranscript(transcript: string, callerInfo: string): Promise<string> {
  try {
    const prompt = `You are ${process.env.ASSISTANT_NAME || 'Priya'}, a personal AI assistant. You just handled a phone call and need to provide a clear, concise summary to your human.

Caller Information: ${callerInfo}

Call Transcript:
${transcript}

Please provide a professional summary that includes:
1. **Main Purpose**: What did the caller want or need?
2. **Key Information**: Important details, dates, times, or requests mentioned
3. **Action Items**: Any tasks, follow-ups, or meetings that need to be scheduled
4. **Next Steps**: What needs to be done next (if anything)

Keep the summary clear, professional, and actionable. Focus on what's most important for your human to know.`;

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are ${process.env.ASSISTANT_NAME || 'Priya'}, a helpful personal AI assistant. You handle calls professionally and provide clear, actionable summaries.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 400,
      temperature: 0.3,
    });

    return completion.choices[0]?.message?.content || 'Unable to generate summary';
  } catch (error) {
    console.error('Error summarizing transcript:', error);
    throw new Error('Failed to summarize transcript');
  }
}

// Main webhook handler
export async function POST(request: NextRequest) {
  try {
    // Parse the webhook payload
    const body = await request.json();

    // Vapi wraps data in a "message" field with a "type" discriminator
    const callData = body.message && typeof body.message === 'object' ? body.message : body;
    const eventType = callData.type || body.type;

    console.log('Vapi webhook received:', {
      eventType,
      keys: Object.keys(callData),
    });

    // Only process end-of-call-report — this is the event that has transcript + summary
    if (eventType !== 'end-of-call-report') {
      return NextResponse.json({
        success: true,
        message: `Ignoring event type: ${eventType || 'unknown'}`,
      });
    }

    // Extract data from Vapi's end-of-call-report structure
    const callId = callData.call?.id || callData.id;
    const callStatus = callData.call?.status || callData.status || 'ended';
    const endedReason = callData.endedReason;
    const duration = callData.durationSeconds || callData.duration;
    const transcript = callData.transcript;
    const vapiSummary = callData.summary;
    const recordingUrl = callData.recordingUrl;

    // Extract caller information
    const callerNumber = callData.customer?.number || callData.caller?.number;
    let callerName = callData.caller?.name || 'Unknown';

    // Try to extract caller name from the conversation
    if (callerName === 'Unknown' && transcript) {
      const nameMatch = transcript.match(/User: .*?(?:This is|my name is|I'm|I am) (\w+)/i);
      if (nameMatch) {
        callerName = nameMatch[1];
      }
    }

    // Build full transcript — prefer the transcript string, fall back to messages array
    let fullTranscript = transcript;
    if (!fullTranscript && callData.messages) {
      fullTranscript = callData.messages
        .filter((msg: any) => msg.role === 'user' || msg.role === 'bot' || msg.role === 'assistant')
        .map((msg: any) => `${msg.role === 'user' ? 'Caller' : 'Priya'}: ${msg.message}`)
        .join('\n');
    }

    // ── Missed call detection ──────────────────────────────
    const isMissedCall = !fullTranscript && (!duration || duration < 10);
    if (isMissedCall) {
      console.log('Missed call detected from:', callerNumber);

      // Check if we know this caller
      let knownName = callerName;
      if (callerNumber && process.env.UPSTASH_REDIS_REST_URL) {
        const profile = await getCallerProfile(callerNumber).catch(() => null);
        if (profile && profile.name !== 'Unknown') knownName = profile.name;
      }

      // Log missed call + send alert
      await Promise.allSettled([
        callerNumber && process.env.UPSTASH_REDIS_REST_URL
          ? logCall({ callId, callerName: knownName, callerNumber, summary: 'Missed call', duration: 0, timestamp: new Date().toISOString(), missed: true }).catch(() => {})
          : Promise.resolve(),
        sendMissedCallAlert(knownName, callerNumber || 'Unknown number').catch(err => console.error('Missed call alert failed:', err)),
      ]);

      return NextResponse.json({ success: true, message: 'Missed call alert sent', callId });
    }

    // ── Caller memory ──────────────────────────────────────
    let callerProfile = null;
    if (callerNumber && process.env.UPSTASH_REDIS_REST_URL) {
      callerProfile = await getCallerProfile(callerNumber).catch(() => null);
      // Use remembered name if we don't have one from this call
      if (callerName === 'Unknown' && callerProfile?.name && callerProfile.name !== 'Unknown') {
        callerName = callerProfile.name;
      }
    }

    console.log('Processing end-of-call-report:', {
      callId, callStatus, endedReason,
      hasTranscript: !!fullTranscript,
      duration, callerNumber, callerName,
      isRepeatCaller: callerProfile ? callerProfile.callCount > 0 : false,
    });

    // Use Vapi's summary if available, otherwise generate our own
    let summary = vapiSummary;
    if (!summary && fullTranscript) {
      const callerInfo = callerName !== 'Unknown'
        ? `${callerName} (${callerNumber})`
        : callerNumber || 'Unknown caller';
      summary = await summarizeTranscript(fullTranscript, callerInfo);
    } else if (!summary) {
      summary = `Call received but no conversation transcript available. Call status: ${callStatus}, Duration: ${duration} seconds`;
    }

    // ── Update caller memory + log call ────────────────────
    if (callerNumber && process.env.UPSTASH_REDIS_REST_URL) {
      const shortNote = summary.length > 120 ? summary.slice(0, 120) + '…' : summary;
      await Promise.allSettled([
        upsertCallerProfile(callerNumber, callerName, shortNote).catch(() => {}),
        logCall({
          callId, callerName, callerNumber, summary: shortNote,
          duration: duration || 0,
          timestamp: new Date().toISOString(),
          missed: false,
        }).catch(() => {}),
      ]);
    }

    // Create enhanced call data
    const enhancedCallData = {
      ...callData,
      id: callId,
      status: 'completed',
      transcript: fullTranscript || 'No transcript available',
      caller: { name: callerName, number: callerNumber },
      durationSeconds: duration,
      created_at: callData.call?.createdAt || new Date().toISOString(),
    };

    // Build Telegram message — include repeat caller context
    const repeatInfo = callerProfile && callerProfile.callCount > 0
      ? `🔁 _Repeat caller (${callerProfile.callCount} previous calls)_`
      : null;
    const telegramText = formatCallForTelegram(enhancedCallData, summary, repeatInfo);

    // Send email + Telegram in parallel
    const emailContent = createPriyaEmailContent(enhancedCallData, summary);
    await Promise.allSettled([
      sendEmail(emailContent).catch(err => console.error('Email failed (non-fatal):', err)),
      process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID
        ? sendTelegramMessage(telegramText, TOPICS.CALL_SUMMARIES).catch(err => console.error('Telegram failed (non-fatal):', err))
        : Promise.resolve(),
    ]);

    return NextResponse.json({
      success: true, message: 'Webhook processed by Priya',
      callId, caller: callerNumber, duration,
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

// Handle GET requests (for webhook verification)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: `${process.env.ASSISTANT_NAME || 'Priya'} webhook endpoint is active`,
    assistant: process.env.ASSISTANT_NAME || 'Priya',
    timestamp: new Date().toISOString(),
  });
} 
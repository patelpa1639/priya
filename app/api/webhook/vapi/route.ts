import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { sendEmail, createPriyaEmailContent } from '@/lib/email-service';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Vapi webhook payload interface
interface VapiWebhookPayload {
  id?: string;
  status?: string;
  caller?: {
    number: string;
    name?: string;
  };
  transcript?: string;
  summary?: string;
  metadata?: Record<string, any>;
  duration?: number;
  cost?: number;
  created_at?: string;
  ended_at?: string;
  // Vapi's actual structure
  call?: {
    id: string;
    status: string;
    createdAt?: string;
  };
  assistant?: {
    id: string;
    name: string;
  };
  durationMs?: number;
  durationSeconds?: number;
  durationMinutes?: number;
  recordingUrl?: string;
  stereoRecordingUrl?: string;
  customer?: {
    number: string;
  };
  messages?: {
    role: string;
    message: string;
  }[];
  endedReason?: string;
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

    const completion = await openai.chat.completions.create({
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
    // Verify the request is from Vapi (optional security check)
    const userAgent = request.headers.get('user-agent');
    if (userAgent && !userAgent.includes('Vapi')) {
      console.warn('Potential unauthorized webhook call:', userAgent);
    }

    // Parse the webhook payload
    const body = await request.json();

    // Log the full request body for debugging
    console.log('Full webhook payload received:', JSON.stringify(body, null, 2));

    // Debug: Check if transcript and summary exist at root level
    console.log('Direct field check:', {
      transcriptExists: 'transcript' in body,
      summaryExists: 'summary' in body,
      transcriptValue: body.transcript ? 'EXISTS' : 'MISSING',
      summaryValue: body.summary ? 'EXISTS' : 'MISSING',
      bodyKeys: Object.keys(body),
    });

    // Check if the data is nested in a message field
    let callData = body;
    if (body.message && typeof body.message === 'object') {
      console.log('Found nested data in message field');
      callData = body.message;
    }

    // Debug: Check if transcript and summary exist in the actual data location
    console.log('Call data check:', {
      transcriptExists: 'transcript' in callData,
      summaryExists: 'summary' in callData,
      transcriptValue: callData.transcript ? 'EXISTS' : 'MISSING',
      summaryValue: callData.summary ? 'EXISTS' : 'MISSING',
      callDataKeys: Object.keys(callData),
    });

    // Extract call status and check for call ending conditions
    const callStatus = callData.call?.status || callData.status;
    const endedReason = callData.endedReason;
    const duration = callData.durationSeconds || callData.duration;
    
    // Check if call has ended or should be considered complete
    const isCallComplete = 
      callStatus === 'completed' || 
      callStatus === 'ended' || 
      endedReason === 'user-hangup' ||
      endedReason === 'assistant-hangup' ||
      (duration && duration > 30); // Consider calls longer than 30 seconds as complete

    // Only process webhooks that contain call completion data or have transcripts
    if (!callData.transcript && !callData.summary && !isCallComplete) {
      console.log('Skipping real-time message webhook - waiting for call completion');
      return NextResponse.json({
        success: true,
        message: 'Real-time message webhook received, waiting for call completion',
        bodyKeys: Object.keys(body),
        hasMessageField: !!body.message,
        callDataKeys: Object.keys(callData),
        callStatus,
        isCallComplete,
      });
    }

    // Extract data from Vapi's actual structure
    const callId = callData.call?.id || callData.id;
    const transcript = callData.transcript; // This is at root level
    const vapiSummary = callData.summary; // This is at root level
    const recordingUrl = callData.recordingUrl;
    
    // Extract caller information from customer field
    const callerNumber = callData.customer?.number || callData.caller?.number;
    let callerName = callData.caller?.name || 'Unknown';
    
    // Try to extract caller name from the conversation
    if (callerName === 'Unknown' && transcript) {
      const nameMatch = transcript.match(/User: .*?This is (\w+)/i);
      if (nameMatch) {
        callerName = nameMatch[1];
      }
    }
    
    // Extract transcript from messages if not in transcript field
    let fullTranscript = transcript;
    if (!fullTranscript && callData.messages) {
      fullTranscript = callData.messages
        .filter((msg: any) => msg.role === 'user' || msg.role === 'bot')
        .map((msg: any) => `${msg.role === 'bot' ? 'Priya' : 'Caller'}: ${msg.message}`)
        .join('\n');
    }

    console.log('Raw webhook data check:', {
      hasTranscriptField: !!callData.transcript,
      hasSummaryField: !!callData.summary,
      transcriptLength: callData.transcript?.length || 0,
      summaryLength: callData.summary?.length || 0,
    });

    console.log('Processed Vapi webhook data:', {
      callId,
      callStatus,
      endedReason,
      isCallComplete,
      hasTranscript: !!fullTranscript,
      transcriptLength: fullTranscript?.length || 0,
      hasVapiSummary: !!vapiSummary,
      duration,
      recordingUrl: !!recordingUrl,
      callerNumber,
      callerName,
    });

    // Process calls that have transcripts or are complete
    if (!fullTranscript && !isCallComplete) {
      console.log('Skipping webhook - no transcript available and call not complete');
      return NextResponse.json({
        success: true,
        message: 'No transcript available and call not complete',
        callId,
        status: callStatus,
        hasTranscript: false,
        isCallComplete: false,
      });
    }

    // Use Vapi's summary if available, otherwise generate our own
    let summary = vapiSummary;
    if (!summary && fullTranscript) {
      console.log('Generating AI summary for call:', callId);
      const callerInfo = callerName !== 'Unknown' 
        ? `${callerName} (${callerNumber})`
        : callerNumber || 'Unknown caller';
      summary = await summarizeTranscript(fullTranscript, callerInfo);
    } else if (summary) {
      console.log('Using Vapi-generated summary for call:', callId);
    } else {
      // If no transcript and no summary, create a basic summary
      summary = `Call received but no conversation transcript available. Call status: ${callStatus}, Duration: ${duration} seconds`;
    }

    // Create enhanced call data for email
    const enhancedCallData = {
      ...callData,
      id: callId,
      status: isCallComplete ? 'completed' : callStatus,
      transcript: fullTranscript || 'No transcript available',
      caller: {
        name: callerName,
        number: callerNumber,
      },
      durationSeconds: duration,
      created_at: callData.call?.createdAt || new Date().toISOString(),
    };

    // Create email content using Priya's template
    const emailContent = createPriyaEmailContent(enhancedCallData, summary);

    // Send email using SendGrid
    console.log('Sending email notification for call:', callId);
    await sendEmail(emailContent);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully by Priya',
      callId,
      summaryGenerated: true,
      emailSent: true,
      assistant: process.env.ASSISTANT_NAME || 'Priya',
      caller: callerNumber,
      duration: duration,
      callStatus: isCallComplete ? 'completed' : callStatus,
      isCallComplete,
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
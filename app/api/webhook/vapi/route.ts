import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { sendEmail, createPriyaEmailContent } from '@/lib/email-service';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Vapi webhook payload interface
interface VapiWebhookPayload {
  id: string;
  status: string;
  caller?: {
    number: string;
    name?: string;
  };
  transcript?: string;
  summary?: string;
  metadata?: Record<string, any>;
  duration?: number;
  cost?: number;
  created_at: string;
  ended_at?: string;
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
    const callData: VapiWebhookPayload = body;

    console.log('Received Vapi webhook from Priya:', {
      id: callData.id,
      status: callData.status,
      caller: callData.caller,
      hasTranscript: !!callData.transcript,
    });

    // Only process completed calls with transcripts
    if (callData.status !== 'completed' || !callData.transcript) {
      return NextResponse.json({
        success: true,
        message: 'Call not completed or no transcript available',
        callId: callData.id,
      });
    }

    // Create caller info string
    const callerInfo = callData.caller?.name 
      ? `${callData.caller.name} (${callData.caller.number})`
      : callData.caller?.number || 'Unknown caller';

    // Generate AI summary using Priya's context
    console.log('Generating AI summary for call:', callData.id);
    const summary = await summarizeTranscript(callData.transcript, callerInfo);

    // Create email content using Priya's template
    const emailContent = createPriyaEmailContent(callData, summary);

    // Send email using Gmail SMTP
    console.log('Sending email notification for call:', callData.id);
    await sendEmail(emailContent);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully by Priya',
      callId: callData.id,
      summaryGenerated: true,
      emailSent: true,
      assistant: process.env.ASSISTANT_NAME || 'Priya',
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
import { NextRequest, NextResponse } from 'next/server';
import { getDailyLogs, clearDailyLogs } from '@/lib/redis';
import { sendTelegramMessage, formatDailyDigest, TOPICS } from '@/lib/telegram';

export async function GET(request: NextRequest) {
  try {
    // Verify this is from Vercel Cron (or manual trigger)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && !request.headers.get('x-vercel-cron')) {
      // Allow manual triggers in dev but log it
      console.log('Cron triggered without auth header — allowing');
    }

    const calls = await getDailyLogs();

    if (calls.length === 0) {
      // Send a quiet "no calls" message
      await sendTelegramMessage(
        `☀️ *Priya — Daily Digest*\n━━━━━━━━━━━━━━━━━━━━\n\nNo calls yesterday. Quiet day! 😌\n\n_Your daily brief from Priya_ 🤖✨`,
        TOPICS.DAILY_DIGEST,
      );
      return NextResponse.json({ success: true, message: 'No calls to report' });
    }

    const digest = formatDailyDigest(calls);
    await sendTelegramMessage(digest, TOPICS.DAILY_DIGEST);

    // Clear the logs after sending
    await clearDailyLogs();

    return NextResponse.json({
      success: true,
      message: `Daily digest sent: ${calls.length} calls`,
    });
  } catch (error) {
    console.error('Daily digest cron failed:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

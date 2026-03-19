export async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('Telegram not configured — skipping');
    return;
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Telegram send failed:', err);
    throw new Error(`Telegram send failed: ${res.status}`);
  }

  console.log('Telegram message sent successfully');
}

export function formatCallForTelegram(callData: {
  caller?: { name?: string; number?: string };
  durationSeconds?: number;
  transcript?: string;
}, summary: string): string {
  const caller = callData.caller?.name && callData.caller.name !== 'Unknown'
    ? `${callData.caller.name} (${callData.caller.number || 'no number'})`
    : callData.caller?.number || 'Unknown caller';

  const duration = callData.durationSeconds
    ? `${Math.round(callData.durationSeconds / 60)}m ${callData.durationSeconds % 60}s`
    : 'Unknown';

  const lines = [
    `*Priya — Call Summary*`,
    ``,
    `*Caller:* ${caller}`,
    `*Duration:* ${duration}`,
    ``,
    `*Summary:*`,
    summary,
  ];

  // Add transcript snippet (Telegram has a 4096 char limit)
  if (callData.transcript && callData.transcript !== 'No transcript available') {
    const maxTranscript = 2000;
    const trimmed = callData.transcript.length > maxTranscript
      ? callData.transcript.slice(0, maxTranscript) + '...'
      : callData.transcript;
    lines.push('', `*Transcript:*`, trimmed);
  }

  return lines.join('\n');
}

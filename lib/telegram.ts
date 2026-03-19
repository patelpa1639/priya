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
  created_at?: string;
}, summary: string): string {
  const callerName = callData.caller?.name && callData.caller.name !== 'Unknown'
    ? callData.caller.name
    : null;
  const callerNumber = callData.caller?.number || 'Unknown number';

  const mins = callData.durationSeconds ? Math.floor(callData.durationSeconds / 60) : 0;
  const secs = callData.durationSeconds ? callData.durationSeconds % 60 : 0;
  const duration = callData.durationSeconds
    ? mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
    : 'Unknown';

  const time = callData.created_at
    ? new Date(callData.created_at).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, month: 'short', day: 'numeric' })
    : new Date().toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, month: 'short', day: 'numeric' });

  const lines = [
    `📞 *Incoming Call Handled*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `👤 *From:* ${callerName ? `${callerName}` : 'Unknown Caller'}`,
    `📱 *Number:* \`${callerNumber}\``,
    `🕐 *Time:* ${time}`,
    `⏱ *Duration:* ${duration}`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `💡 *Summary*`,
    ``,
    summary,
  ];

  // Action items — pull lines that look like todos from the summary
  const actionLines = summary.split('\n').filter(l => /action|follow.?up|schedule|remind|todo|call back|send|meet/i.test(l));
  if (actionLines.length > 0) {
    lines.push('', `━━━━━━━━━━━━━━━━━━━━`, `📋 *Action Items*`, '');
    actionLines.forEach(l => {
      const cleaned = l.replace(/^[-•*\d.]+\s*/, '').replace(/\*\*/g, '');
      lines.push(`  ▸ ${cleaned}`);
    });
  }

  // Transcript
  if (callData.transcript && callData.transcript !== 'No transcript available') {
    const maxTranscript = 1500;
    const trimmed = callData.transcript.length > maxTranscript
      ? callData.transcript.slice(0, maxTranscript) + '…'
      : callData.transcript;

    // Format transcript nicely — indent each line
    const formatted = trimmed
      .split('\n')
      .map(line => {
        if (/^(User|Caller):/i.test(line)) return `  🗣 ${line}`;
        if (/^(Bot|Priya|Assistant):/i.test(line)) return `  🤖 ${line.replace(/^(Bot|Assistant):/i, 'Priya:')}`;
        return `  ${line}`;
      })
      .join('\n');

    lines.push('', `━━━━━━━━━━━━━━━━━━━━`, `🗒 *Transcript*`, ``, formatted);
  }

  lines.push('', `━━━━━━━━━━━━━━━━━━━━`, `_Handled by Priya_ 🤖✨`);

  return lines.join('\n');
}

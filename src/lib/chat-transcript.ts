import type { UIMessage } from 'ai';

export function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

/** One sentence per line for readable chat bubbles */
export function formatSentences(text: string): string {
  return text
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .join('\n');
}

export function formatIntroMessage(header: string, body: string, subtitle?: string): string {
  const lines = [header];
  if (subtitle) lines.push(subtitle);
  lines.push(formatSentences(body));
  return lines.join('\n');
}

export function messagesToTranscript(messages: UIMessage[]): string {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => `${m.role === 'user' ? 'Я' : 'Наставник'}: ${getMessageText(m)}`)
    .join('\n\n');
}

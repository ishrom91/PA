import type { UIMessage } from 'ai';

export function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

export function messagesToTranscript(messages: UIMessage[]): string {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => `${m.role === 'user' ? 'Я' : 'Наставник'}: ${getMessageText(m)}`)
    .join('\n\n');
}

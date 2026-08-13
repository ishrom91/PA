import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { getSystemPrompt, type MentorPractice } from '../src/lib/mentor-prompts';

export const config = {
  runtime: 'edge',
};

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY ?? '',
});

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  if (!process.env.GROQ_API_KEY) {
    return new Response(JSON.stringify({ error: 'GROQ_API_KEY not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await req.json()) as {
      messages: UIMessage[];
      practice?: MentorPractice;
    };

    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: getSystemPrompt(body.practice ?? 'free'),
      messages: await convertToModelMessages(body.messages ?? []),
    });

    return result.toUIMessageStreamResponse();
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

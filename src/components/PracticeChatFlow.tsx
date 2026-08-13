import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { useEffect, useMemo, useRef, useState } from 'react';
import StepProgress from './StepProgress';
import { hapticLight, hapticSuccess } from '../utils/haptics';
import { MENTOR_OPENERS, type MentorPractice } from '../lib/mentor-prompts';
import { getMessageText, messagesToTranscript } from '../lib/chat-transcript';

export interface PracticeChatStep {
  practice: MentorPractice;
  title: string;
  eyebrow?: string;
  subtitle?: string;
}

interface PracticeChatFlowProps {
  pageTitle?: string;
  pageSubtitle?: string;
  steps: PracticeChatStep[];
  onComplete: (transcripts: string[]) => void;
  doneTitle?: string;
  doneSubtitle?: string;
  embedded?: boolean;
  savedHint?: string;
}

function stepIntroMessage(step: PracticeChatStep, id: string): UIMessage {
  const opener = MENTOR_OPENERS[step.practice];
  const prefix = step.eyebrow ? `${step.eyebrow} · ` : '';
  const subtitle = step.subtitle ? `\n\n${step.subtitle}` : '';
  return {
    id,
    role: 'assistant',
    parts: [{ type: 'text', text: `${prefix}${step.title}${subtitle}\n\n${opener}` }],
  };
}

export default function PracticeChatFlow({
  pageTitle,
  pageSubtitle,
  steps,
  onComplete,
  doneTitle = 'Практика записана',
  doneSubtitle = 'Диалог сохранён в журнал',
  embedded = false,
  savedHint = 'Записано в журнал',
}: PracticeChatFlowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [stepIndex, setStepIndex] = useState(0);
  const [stepStartIndex, setStepStartIndex] = useState(0);
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [saved, setSaved] = useState(false);

  const stepIndexRef = useRef(0);
  const stepsRef = useRef(steps);
  stepIndexRef.current = stepIndex;
  stepsRef.current = steps;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/mentor',
        prepareSendMessagesRequest: ({ messages: chatMessages }) => ({
          body: {
            messages: chatMessages,
            practice: stepsRef.current[stepIndexRef.current]?.practice ?? 'free',
          },
        }),
      }),
    [],
  );

  const { messages, sendMessage, setMessages, status } = useChat({
    transport,
    messages: [stepIntroMessage(steps[0], 'intro-0')],
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, stepIndex, saved]);

  const current = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const isLoading = status === 'streaming' || status === 'submitted';
  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
  const lastAssistantText = lastAssistant ? getMessageText(lastAssistant) : '';
  const hasUserReply = messages.some((m) => m.role === 'user');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || isLoading || saved) return;
    sendMessage({ text });
    setInput('');
  };

  const handleStepComplete = () => {
    if (messages.length < 2 || saved) return;
    hapticLight();

    const stepTranscript = messagesToTranscript(messages.slice(stepStartIndex));
    const nextTranscripts = [...transcripts, stepTranscript];

    if (!isLast) {
      const nextIndex = stepIndex + 1;
      const nextStep = steps[nextIndex];
      const transition = stepIntroMessage(nextStep, `transition-${nextIndex}-${Date.now()}`);

      setTranscripts(nextTranscripts);
      setStepIndex(nextIndex);
      setStepStartIndex(messages.length);
      setMessages((prev) => [...prev, transition]);
      return;
    }

    onComplete(nextTranscripts);
    hapticSuccess();
    setTranscripts(nextTranscripts);
    setSaved(true);
    setMessages((prev) => [
      ...prev,
      {
        id: `saved-${Date.now()}`,
        role: 'assistant',
        parts: [{ type: 'text', text: `${savedHint}. Можешь выбрать другую практику или начать заново.` }],
      },
    ]);

    if (!embedded) {
      setFinished(true);
    }
  };

  if (finished && !embedded) {
    return (
      <div className="space-y-6 animate-fade-in">
        {pageTitle && (
          <div>
            <h1 className="page-title">{doneTitle}</h1>
            <p className="text-muted text-sm mt-1">{doneSubtitle}</p>
          </div>
        )}
        <div className="card space-y-4 text-sm">
          {steps.map((s, i) => (
            <div key={s.practice}>
              <h3 className="section-title mb-2">{s.title}</h3>
              <p className="text-muted whitespace-pre-wrap leading-relaxed line-clamp-6">
                {transcripts[i]}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const chatBody = (
    <>
      {!embedded && pageTitle && (
        <div className="mb-4">
          <h1 className="page-title">{pageTitle}</h1>
          {pageSubtitle && <p className="text-muted text-sm mt-1">{pageSubtitle}</p>}
        </div>
      )}

      {!embedded && steps.length > 1 && (
        <StepProgress
          current={stepIndex + 1}
          total={steps.length}
          labels={steps.map((s) => s.title.split('·').pop()?.trim() ?? s.title)}
        />
      )}

      <div
        className={
          embedded
            ? 'flex flex-col flex-1 min-h-0'
            : 'flex flex-col min-h-[calc(100dvh-13rem)] md:min-h-[520px] card !p-0 overflow-hidden'
        }
      >
        {!embedded && (
          <div className="px-4 py-3 border-b border-paper dark:border-paper-dark bg-cream/50 dark:bg-cream-dark/50 shrink-0">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-terracotta">
              {current.eyebrow ?? 'Наставник'}
            </p>
            <p className="text-sm font-medium text-graphite dark:text-graphite-dark">{current.title}</p>
            {current.subtitle && <p className="text-xs text-muted mt-0.5">{current.subtitle}</p>}
          </div>
        )}

        {embedded && steps.length > 1 && (
          <div className="px-4 py-2 border-b border-paper dark:border-paper-dark shrink-0">
            <StepProgress
              current={stepIndex + 1}
              total={steps.length}
              labels={steps.map((s) => s.title.split('·').pop()?.trim() ?? s.title)}
            />
          </div>
        )}

        <div className={`flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0 ${embedded ? 'max-h-[50dvh] md:max-h-none' : ''}`}>
          {messages.map((m) => (
            <div
              key={m.id}
              className={`text-sm leading-relaxed rounded-2xl px-3 py-2 max-w-[95%] ${
                m.role === 'user'
                  ? 'ml-auto bg-terracotta text-white'
                  : m.id.startsWith('saved-')
                    ? 'mr-auto bg-terracotta/10 text-terracotta border border-terracotta/20'
                    : 'mr-auto bg-cream dark:bg-cream-dark text-graphite dark:text-graphite-dark'
              }`}
            >
              {getMessageText(m)}
            </div>
          ))}
          {isLoading && <p className="text-xs text-faint animate-pulse">Наставник думает…</p>}
          <div ref={bottomRef} />
        </div>

        {!saved && (
          <div className="px-3 pt-2 pb-1 shrink-0 border-t border-paper dark:border-paper-dark bg-cream/30 dark:bg-cream-dark/30">
            <button
              type="button"
              className="btn-primary w-full text-sm"
              disabled={!hasUserReply || isLoading}
              onClick={handleStepComplete}
            >
              {lastAssistantText.includes('Записать это в журнал') || isLast
                ? 'Записать в журнал'
                : 'Далее — следующий шаг'}
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="p-3 border-t border-paper dark:border-paper-dark flex gap-2 shrink-0 bg-surface dark:bg-surface-dark"
        >
          <input
            className="input-field flex-1 !py-2.5 text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={saved ? 'Выберите другую практику…' : 'Ваш ответ…'}
            disabled={isLoading || saved}
          />
          <button
            type="submit"
            className="btn-primary !px-4 !py-2.5 text-sm shrink-0"
            disabled={isLoading || saved || !input.trim()}
          >
            →
          </button>
        </form>
      </div>
    </>
  );

  if (embedded) {
    return chatBody;
  }

  return <div className="space-y-4 animate-fade-in">{chatBody}</div>;
}

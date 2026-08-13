import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import StepProgress from './StepProgress';
import { IconSend } from './Icons';
import { hapticLight, hapticSuccess } from '../utils/haptics';
import { MENTOR_OPENERS, type MentorPractice } from '../lib/mentor-prompts';
import { getMessageText, messagesToTranscript, formatIntroMessage } from '../lib/chat-transcript';

export interface PracticeChatStep {
  practice: MentorPractice;
  title: string;
  eyebrow?: string;
  subtitle?: string;
}

export interface PracticeHeaderAction {
  label: string;
  disabled: boolean;
  hidden: boolean;
  onClick: () => void;
}

interface PracticeChatFlowProps {
  pageTitle?: string;
  pageSubtitle?: string;
  steps: PracticeChatStep[];
  onComplete: (transcripts: string[]) => void;
  doneTitle?: string;
  doneSubtitle?: string;
  embedded?: boolean;
  fillHeight?: boolean;
  saveInHeader?: boolean;
  onHeaderAction?: (action: PracticeHeaderAction) => void;
  savedHint?: string;
}

function stepIntroMessage(step: PracticeChatStep, id: string): UIMessage {
  const header = step.eyebrow ? `${step.eyebrow} · ${step.title}` : step.title;
  const text = formatIntroMessage(header, MENTOR_OPENERS[step.practice], step.subtitle);
  return {
    id,
    role: 'assistant',
    parts: [{ type: 'text', text }],
  };
}

function ChatMessageText({ text }: { text: string }) {
  const newline = text.indexOf('\n');
  const header = newline === -1 ? text : text.slice(0, newline);
  const body = newline === -1 ? '' : text.slice(newline + 1);
  const hasHeader = header.includes(' · ');

  if (!hasHeader) {
    return <p className="whitespace-pre-line">{text}</p>;
  }

  return (
    <div>
      <p className="font-semibold leading-snug">{header}</p>
      {body && <p className="whitespace-pre-line mt-1.5">{body}</p>}
    </div>
  );
}

function MentorAvatar({ className }: { className?: string }) {
  return (
    <div
      className={`w-7 h-7 rounded-full bg-gradient-to-br from-terracotta/90 to-terracotta flex items-center justify-center shrink-0 shadow-sm ${className ?? ''}`}
    >
      <span className="font-display text-[11px] font-bold text-white leading-none">Ф</span>
    </div>
  );
}

export default function PracticeChatFlow({
  pageTitle,
  pageSubtitle,
  steps,
  onComplete,
  doneTitle = 'Практика записана',
  doneSubtitle = 'Диалог сохранён в журнал',
  embedded = false,
  fillHeight = false,
  saveInHeader = false,
  onHeaderAction,
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

  const handleStepComplete = useCallback(() => {
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
  }, [
    messages,
    saved,
    stepStartIndex,
    transcripts,
    isLast,
    stepIndex,
    steps,
    setMessages,
    onComplete,
    savedHint,
    embedded,
  ]);

  const saveLabel =
    lastAssistantText.includes('Записать это в журнал') || isLast ? 'В журнал' : 'Далее';

  useEffect(() => {
    if (!saveInHeader || !onHeaderAction) return;
    onHeaderAction({
      label: saveLabel,
      disabled: isLoading,
      hidden: saved || !hasUserReply,
      onClick: handleStepComplete,
    });
  }, [
    saveInHeader,
    onHeaderAction,
    saveLabel,
    hasUserReply,
    isLoading,
    saved,
    handleStepComplete,
  ]);

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
          <div className="shrink-0 px-4 pt-2.5 pb-1">
            <StepProgress compact current={stepIndex + 1} total={steps.length} />
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0 scroll-smooth">
          {messages.map((m) => {
            const text = getMessageText(m);
            const isUser = m.role === 'user';
            const isSaved = m.id.startsWith('saved-');

            if (isUser) {
              return (
                <div key={m.id} className="flex justify-end animate-message-in">
                  <div className="max-w-[85%] text-[15px] leading-relaxed rounded-[1.25rem] rounded-br-md px-4 py-2.5 bg-terracotta text-white">
                    <ChatMessageText text={text} />
                  </div>
                </div>
              );
            }

            return (
              <div key={m.id} className="flex gap-2.5 items-end max-w-[92%] animate-message-in">
                <MentorAvatar className="mb-0.5" />
                <div
                  className={`text-[15px] leading-relaxed rounded-[1.25rem] rounded-bl-md px-4 py-2.5 ${
                    isSaved
                      ? 'bg-olive-soft/90 dark:bg-olive-soft-dark/90 text-olive'
                      : 'bg-cream/70 dark:bg-cream-dark/70 text-graphite dark:text-graphite-dark'
                  }`}
                >
                  <ChatMessageText text={text} />
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex gap-2.5 items-end animate-message-in">
              <MentorAvatar className="mb-0.5" />
              <div className="flex items-center gap-1 px-4 py-3 rounded-[1.25rem] rounded-bl-md bg-cream/70 dark:bg-cream-dark/70">
                <span className="w-2 h-2 rounded-full bg-graphite-tertiary dark:bg-graphite-tertiary-dark animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-graphite-tertiary dark:bg-graphite-tertiary-dark animate-pulse [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-graphite-tertiary dark:bg-graphite-tertiary-dark animate-pulse [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {!saved && !saveInHeader && (
          <div className="px-3 pt-2 pb-1 shrink-0 border-t border-paper/70 dark:border-paper-dark/70 bg-surface/95 dark:bg-surface-dark/95 backdrop-blur-sm">
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
          className="shrink-0 px-3 pb-3 pt-1"
        >
          <div className="flex items-end gap-2 rounded-[1.75rem] bg-surface dark:bg-surface-dark shadow-float dark:shadow-float-dark ring-1 ring-black/[0.05] dark:ring-white/[0.08] pl-4 pr-1.5 py-1.5 focus-within:ring-terracotta/25 transition-shadow">
            <input
              className="flex-1 min-w-0 bg-transparent border-0 py-2.5 text-[15px] text-graphite dark:text-graphite-dark placeholder:text-graphite-tertiary dark:placeholder:text-graphite-tertiary-dark focus:outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={saved ? 'Выберите другую практику…' : 'Сообщение…'}
              disabled={isLoading || saved}
            />
            <button
              type="submit"
              className={`w-9 h-9 flex items-center justify-center shrink-0 rounded-full transition-all ${
                input.trim() && !isLoading && !saved
                  ? 'bg-terracotta text-white shadow-sm hover:bg-terracotta/90 active:scale-95'
                  : 'bg-paper dark:bg-paper-dark text-faint'
              }`}
              disabled={isLoading || saved || !input.trim()}
              aria-label="Отправить"
            >
              <IconSend className="w-[18px] h-[18px]" />
            </button>
          </div>
        </form>
      </div>
    </>
  );

  if (embedded) {
    return (
      <div className={fillHeight ? 'flex flex-col flex-1 min-h-0' : undefined}>
        {chatBody}
      </div>
    );
  }

  return <div className="space-y-4 animate-fade-in">{chatBody}</div>;
}

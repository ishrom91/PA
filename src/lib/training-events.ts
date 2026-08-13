import { anonymizeContent } from './anonymize';
import { pushTrainingSample } from './sync/remote';
import { todayKey } from '../utils/date';

/** Event types for anonymous corpus — no user_id is ever stored */
export const TrainingEvent = {
  MORNING: 'morning',
  EVENING: 'evening',
  MENTOR_CHAT: 'mentor_chat',
  NOTE_ADDED: 'note_added',
  NOTE_REMOVED: 'note_removed',
  RULE_ACTIVATED: 'rule_activated',
  RULE_INTEGRATED: 'rule_integrated',
  VIRTUE_INTENTION: 'virtue_intention',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  PAGE_VIEW: 'page_view',
} as const;

const STRIP_KEYS = new Set([
  'id',
  'userId',
  'user_id',
  'email',
  'display_name',
  'displayName',
  'createdAt',
  'updatedAt',
  'activatedAt',
  'integratedAt',
  'initializedAt',
  'completedAt',
]);

/** Remove identifiers and coarse-grain timestamps before anonymization */
export function stripIdentifyingFields(value: unknown): unknown {
  if (value == null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(stripIdentifyingFields);

  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (STRIP_KEYS.has(key)) continue;
    out[key] = stripIdentifyingFields(val);
  }
  return out;
}

export function prepareAnonymousPayload(
  payload: unknown,
  meta?: Record<string, unknown>,
): Record<string, unknown> {
  const base =
    payload && typeof payload === 'object' && !Array.isArray(payload)
      ? { ...(payload as Record<string, unknown>), ...meta }
      : { ...(meta ?? {}), ...(payload != null ? { value: payload } : {}) };

  const stripped = stripIdentifyingFields(base);
  const anonymized = anonymizeContent(stripped);
  return {
    ...(typeof anonymized === 'object' && anonymized && !Array.isArray(anonymized)
      ? (anonymized as Record<string, unknown>)
      : { value: anonymized }),
    recordedOn: todayKey(),
  };
}

/** Fire-and-forget: writes anonymized event when user opted in */
export function recordAnonymousEvent(
  eventType: string,
  payload: unknown,
  shareEnabled: boolean,
  meta?: Record<string, unknown>,
): void {
  if (!shareEnabled) return;
  const content = prepareAnonymousPayload(payload, meta);
  void pushTrainingSample(eventType, content).catch(() => {
    /* offline or RLS — local UX must not break */
  });
}

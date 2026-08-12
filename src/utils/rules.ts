import type { RuleStatus, RuleStatusRecord, AppStorage } from '../types';
import { todayKey, daysBetween, addDays } from './date';

const UNLOCK_DAYS = 14;
const INITIAL_ACTIVE_COUNT = 3;

export function createInitialRuleStatuses(): Record<number, RuleStatusRecord> {
  const today = todayKey();
  const statuses: Record<number, RuleStatusRecord> = {};

  for (let i = 1; i <= 17; i++) {
    if (i <= INITIAL_ACTIVE_COUNT) {
      statuses[i] = { status: 'active', activatedAt: today };
    } else {
      statuses[i] = { status: 'locked' };
    }
  }
  return statuses;
}

export function computeRuleStatuses(
  stored: Record<number, RuleStatusRecord>,
): Record<number, RuleStatusRecord> {
  const today = todayKey();
  const result = { ...stored };

  for (let i = 1; i <= 17; i++) {
    const current = result[i];
    if (!current) continue;
    if (current.status === 'integrated') continue;

    if (i <= INITIAL_ACTIVE_COUNT) {
      if (current.status === 'locked') {
        result[i] = { status: 'active', activatedAt: current.activatedAt ?? today };
      }
      continue;
    }

    const prev = result[i - 1];
    if (!prev?.activatedAt) continue;

    const unlockDate = addDays(prev.activatedAt, UNLOCK_DAYS);
    const daysUntil = daysBetween(today, unlockDate);

    if (daysUntil <= 0 && current.status === 'locked') {
      result[i] = { status: 'available', activatedAt: undefined };
    }
  }

  return result;
}

export function activateRule(
  statuses: Record<number, RuleStatusRecord>,
  ruleNumber: number,
): Record<number, RuleStatusRecord> {
  const today = todayKey();
  return {
    ...statuses,
    [ruleNumber]: { status: 'active', activatedAt: today },
  };
}

export function integrateRule(
  statuses: Record<number, RuleStatusRecord>,
  ruleNumber: number,
): Record<number, RuleStatusRecord> {
  const today = todayKey();
  return {
    ...statuses,
    [ruleNumber]: {
      status: 'integrated',
      activatedAt: statuses[ruleNumber]?.activatedAt ?? today,
      integratedAt: today,
    },
  };
}

export function countIntegrated(statuses: Record<number, RuleStatusRecord>): number {
  return Object.values(statuses).filter((s) => s.status === 'integrated').length;
}

export function getActiveRules(statuses: Record<number, RuleStatusRecord>): number[] {
  return Object.entries(statuses)
    .filter(([, s]) => s.status === 'active')
    .map(([n]) => Number(n))
    .sort((a, b) => a - b);
}

export function statusLabel(status: RuleStatus): string {
  const labels: Record<RuleStatus, string> = {
    locked: 'Заблокировано',
    available: 'Доступно',
    active: 'Активно',
    integrated: 'Внедрено',
  };
  return labels[status];
}

export function daysUntilUnlock(
  statuses: Record<number, RuleStatusRecord>,
  ruleNumber: number,
): number | null {
  if (ruleNumber <= INITIAL_ACTIVE_COUNT) return null;
  const prev = statuses[ruleNumber - 1];
  if (!prev?.activatedAt) return null;
  const unlockDate = addDays(prev.activatedAt, UNLOCK_DAYS);
  const remaining = daysBetween(todayKey(), unlockDate);
  return remaining > 0 ? remaining : null;
}

export function createInitialStorage(): AppStorage {
  const today = todayKey();
  return {
    ruleStatuses: createInitialRuleStatuses(),
    journal: [],
    notes: [],
    initializedAt: today,
    onboardingCompleted: false,
  };
}

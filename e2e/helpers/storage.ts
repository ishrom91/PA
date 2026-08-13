import type { Page } from '@playwright/test';

const STORAGE_KEY = 'philosophia-activa';

/** Seed localStorage so Dashboard skips onboarding in E2E runs. */
export async function seedOnboardingComplete(page: Page) {
  await page.addInitScript((key) => {
    navigator.serviceWorker?.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    });

    const today = new Date().toISOString().slice(0, 10);
    const storage = {
      ruleStatuses: {
        1: { status: 'active', activatedAt: today },
        2: { status: 'active', activatedAt: today },
        3: { status: 'active', activatedAt: today },
      },
      journal: [],
      notes: [],
      initializedAt: today,
      onboardingCompleted: true,
    };
    window.localStorage.setItem(key, JSON.stringify(storage));
  }, STORAGE_KEY);
}

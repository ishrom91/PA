import { test, expect } from '@playwright/test';
import { seedOnboardingComplete } from './helpers/storage';

test.beforeEach(async ({ page }) => {
  await seedOnboardingComplete(page);
});

test.describe('practices navigation', () => {
  test('mobile: tab bar navigates to rules from practices', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-chrome', 'Mobile-only scenario');

    await page.goto('/practices');
    await expect(page.getByTestId('practice-mode-picker')).toBeVisible();

    await page.getByTestId('nav-rules').click();
    await page.waitForURL(/\/rules$/);
    await expect(page.getByTestId('practice-mode-picker')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: '17 правил' })).toBeVisible();
  });

  test('mobile: tab bar navigates home from practices', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-chrome', 'Mobile-only scenario');

    await page.goto('/practices');
    await page.getByTestId('nav-home').click();
    await page.waitForURL(/\/$/);
    await expect(page.getByTestId('practice-mode-picker')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Philosophia Activa' })).toBeVisible();
  });

  test('mobile: tab bar works when practice picker is open', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-chrome', 'Mobile-only scenario');

    await page.goto('/practices');
    await page.getByTestId('practice-mode-picker').click();
    await expect(page.getByRole('listbox')).toBeVisible();

    await page.getByTestId('nav-book').click();
    await page.waitForURL(/\/book$/);
    await expect(page.getByTestId('practice-mode-picker')).toHaveCount(0);
  });

  test('mobile: hit-test at tab bar center targets nav button', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-chrome', 'Mobile-only scenario');

    await page.goto('/practices');
    const navRules = page.getByTestId('nav-rules');
    await expect(navRules).toBeVisible();

    const box = await navRules.boundingBox();
    expect(box).not.toBeNull();
    const x = box!.x + box!.width / 2;
    const y = box!.y + box!.height / 2;

    const hit = await page.evaluate(({ px, py }) => {
      const el = document.elementFromPoint(px, py);
      if (!el) return null;
      const navBtn = el.closest('[data-testid^="nav-"]');
      return navBtn?.getAttribute('data-testid') ?? el.tagName.toLowerCase();
    }, { px: x, py: y });

    expect(hit).toBe('nav-rules');
  });

  test('desktop: sidebar navigates to rules from practices', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only scenario');

    await page.goto('/practices');
    await page.getByTestId('sidebar-nav-rules').click();
    await page.waitForURL(/\/rules$/);
    await expect(page.getByTestId('practice-mode-picker')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: '17 правил' })).toBeVisible();
  });
});

const SHARE_TITLE = 'Philosophia Activa';
const SHARE_TEXT =
  'Дневник практик по книге Рим Рами — Philosophia Activa. Свободное приложение для утренних, дневных и вечерних ритуалов.';

export type ShareResult = 'shared' | 'copied' | 'cancelled';

export async function shareAppLink(): Promise<ShareResult> {
  const url = window.location.origin;

  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: SHARE_TITLE, text: SHARE_TEXT, url });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return 'cancelled';
      }
    }
  }

  await navigator.clipboard.writeText(url);
  return 'copied';
}

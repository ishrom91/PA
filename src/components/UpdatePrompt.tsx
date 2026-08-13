import { useRegisterSW } from 'virtual:pwa-register/react';

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;

      const check = () => registration.update().catch(() => undefined);

      window.setInterval(check, 60 * 60 * 1000);

      const onVisible = () => {
        if (document.visibilityState === 'visible') check();
      };
      document.addEventListener('visibilitychange', onVisible);
    },
  });

  if (!needRefresh) return null;

  const refresh = async () => {
    await updateServiceWorker(true);
    setNeedRefresh(false);
  };

  const dismiss = () => setNeedRefresh(false);

  return (
    <div className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] md:bottom-6 inset-x-4 md:inset-x-auto md:right-6 md:left-auto md:max-w-sm z-[50] animate-slide-up">
      <div className="card-glass !p-4 flex items-start gap-3 shadow-float dark:shadow-float-dark border border-terracotta/20">
        <div className="w-11 h-11 rounded-2xl bg-terracotta/15 text-terracotta flex items-center justify-center font-display text-xl shrink-0">
          ↑
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[15px] text-graphite dark:text-graphite-dark">Доступна новая версия</p>
          <p className="text-[13px] text-muted mt-0.5 leading-snug">
            Обновите приложение, чтобы получить последние изменения.
          </p>
          <div className="flex gap-2 mt-3">
            <button type="button" className="btn-primary !py-2 !px-4 text-sm" onClick={refresh}>
              Обновить
            </button>
            <button type="button" className="btn-ghost !py-2 text-sm" onClick={dismiss}>
              Позже
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

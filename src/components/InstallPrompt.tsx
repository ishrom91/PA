import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    const dismissed = localStorage.getItem('pa-install-dismissed');
    if (dismissed) setHidden(true);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed || hidden || !deferred) return null;

  const install = async () => {
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    if (outcome === 'dismissed') {
      localStorage.setItem('pa-install-dismissed', '1');
      setHidden(true);
    }
  };

  const dismiss = () => {
    localStorage.setItem('pa-install-dismissed', '1');
    setHidden(true);
    setDeferred(null);
  };

  return (
    <div className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] md:bottom-6 inset-x-4 md:inset-x-auto md:right-6 md:left-auto md:max-w-sm z-[45] animate-slide-up">
      <div className="card-glass !p-4 flex items-start gap-3 shadow-float dark:shadow-float-dark">
        <div className="w-11 h-11 rounded-2xl bg-terracotta text-white flex items-center justify-center font-display text-xl shrink-0">
          φ
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[15px] text-graphite dark:text-graphite-dark">Установить приложение</p>
          <p className="text-[13px] text-muted mt-0.5 leading-snug">
            Добавьте на экран — быстрый доступ к практикам и книге.
          </p>
          <div className="flex gap-2 mt-3">
            <button type="button" className="btn-primary !py-2 !px-4 text-sm" onClick={install}>
              Установить
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

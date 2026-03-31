import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { canUseStorage } from '@/utils/cookieConsent';

const DISMISSED_KEY = 'pwa-install-dismissed';

const isMobileDevice = () => /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

interface PwaInstallContextValue {
  canInstall: boolean;
  dismissed: boolean;
  promptInstall: () => Promise<void>;
  dismiss: () => void;
  resetDismiss: () => void;
}

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null);

export const PwaInstallProvider = ({ children }: { children: ReactNode }) => {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    if (!canUseStorage()) return false;
    return localStorage.getItem(DISMISSED_KEY) === 'true';
  });

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallEvent(e);
    };

    if (isMobileDevice()) {
      window.addEventListener('beforeinstallprompt', handler);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const promptInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === 'accepted') setInstallEvent(null);
  };

  const dismiss = () => {
    if (canUseStorage()) {
      localStorage.setItem(DISMISSED_KEY, 'true');
    }
    setDismissed(true);
  };

  const resetDismiss = () => {
    localStorage.removeItem(DISMISSED_KEY);
    setDismissed(false);
  };

  return (
    <PwaInstallContext.Provider value={{ canInstall: !!installEvent, dismissed, promptInstall, dismiss, resetDismiss }}>
      {children}
    </PwaInstallContext.Provider>
  );
};

export const usePwaInstallContext = (): PwaInstallContextValue => {
  const ctx = useContext(PwaInstallContext);
  if (!ctx) throw new Error('usePwaInstallContext must be used within PwaInstallProvider');
  return ctx;
};

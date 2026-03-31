/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_VERSION?: string;
  readonly VITE_APP_BUILD_DATE?: string;
  readonly VITE_APP_GIT_SHA?: string;
  readonly VITE_ENABLE_QUANTITATIVE_ONLY?: string;
  readonly VITE_ENABLE_MILESTONE?: string;
  readonly VITE_ENABLE_RECURRING?: string;
  readonly VITE_ENABLE_HABIT?: string;
  readonly VITE_ENABLE_ATTACHMENTS?: string;
  readonly VITE_ENABLE_NOTES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Global version constants injected at build time
declare const __APP_VERSION__: string;
declare const __BUILD_DATE__: string;
declare const __GIT_SHA__: string;

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

interface WindowEventMap {
  beforeinstallprompt: BeforeInstallPromptEvent;
}

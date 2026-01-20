/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_VERSION?: string;
  readonly VITE_APP_BUILD_DATE?: string;
  readonly VITE_APP_GIT_SHA?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Global version constants injected at build time
declare const __APP_VERSION__: string;
declare const __BUILD_DATE__: string;
declare const __GIT_SHA__: string;

/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** App version injected at build time from package.json */
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

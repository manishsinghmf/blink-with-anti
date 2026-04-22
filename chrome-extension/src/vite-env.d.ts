/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PREVIEW_ALLOWED_HOSTS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

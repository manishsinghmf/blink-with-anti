/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PREVIEW_ALLOWED_HOSTS?: string;
  readonly VITE_SOLANA_RPC_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

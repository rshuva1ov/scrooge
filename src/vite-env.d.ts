/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPPORT_EMAIL?: string;
  readonly VITE_DONATE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.module.scss" {
  const classes: Record<string, string>;
  export default classes;
}

declare module "*.scss" {
  const content: string;
  export default content;
}
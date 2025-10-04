/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRAPI_API_URL?: string
  readonly VITE_STRAPI_API_TOKEN?: string
  readonly VITE_USE_STRAPI?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

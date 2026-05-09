/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DATABASE_URL: string;
  readonly DEEPSEEK_API_KEY: string;
  readonly BROWSERLESS_TOKEN: string;
  readonly SCRAPINGBEE_API_KEY: string;
  readonly VERCEL_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

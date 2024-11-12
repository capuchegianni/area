/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly API_URL: string;
    readonly ORIGIN?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

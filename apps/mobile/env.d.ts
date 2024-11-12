declare namespace NodeJS {
    interface ProcessEnv {
        EXPO_PUBLIC_API_URL: string;
        EXPO_USE_METRO_WORKSPACE_ROOT?: 1 | 0;
        EXPO_PUBLIC_NODE_ENV: "production" | "development";
        EXPO_PUBLIC_FRONTEND_URL: string;
    }
}

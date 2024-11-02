const SERVICE_NAMES: Record<string, string> = {
    google: "Google",
    youtube: "YouTube",
    discord: "Discord"
};

export function serviceName(service: string): string {
    if (SERVICE_NAMES[service])
        return SERVICE_NAMES[service];
    return service;
}

const OAUTH_SERVICE_NAMES: Record<string, string> = {
    youtube: "google",
    twitch: "twitch"
};

export function oauthServiceName(service: string): string {
    if (OAUTH_SERVICE_NAMES[service])
        return OAUTH_SERVICE_NAMES[service];
    return service;
}

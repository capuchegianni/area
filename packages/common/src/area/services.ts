export const serviceNames: Record<string, string> = {
    google: "Google",
    youtube: "YouTube",
    discord: "Discord"
};

export function serviceName(service: string): string {
    if (serviceNames[service])
        return serviceNames[service];
    return service;
}

export const oauthServiceNames: Record<string, string> = {
    youtube: "google",
    twitch: "twitch"
};

export function oauthServiceName(service: string): string {
    if (oauthServiceNames[service])
        return oauthServiceNames[service];
    return service;
}

const SERVICE_NAMES: Record<string, string> = {
    google: "Google",
    gmail: "Gmail",
    youtube: "YouTube",
    discord: "Discord",
    twitch: "Twitch"
};

export function serviceName(service: string): string {
    if (SERVICE_NAMES[service])
        return SERVICE_NAMES[service];
    return service;
}

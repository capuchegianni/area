export const serviceNames: Record<string, string> = {
    youtube: "YouTube",
    discord: "Discord"
};

export function serviceName(service: string): string {
    if (serviceNames[service])
        return serviceNames[service];
    return service;
}

export const OAUTH_SERVICES = ["google", "discord", "twitch"] as const;

export type OAuthService = typeof OAUTH_SERVICES[number];

export function isOauthService(service: string): service is OAuthService {
    return OAUTH_SERVICES.includes(service as OAuthService);
}

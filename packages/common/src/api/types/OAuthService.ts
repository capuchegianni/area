const oauthServices = ["google", "discord", "twitch"] as const;

export type OAuthService = typeof oauthServices[number];

export function isOauthService(service: string): service is OAuthService {
    return oauthServices.includes(service as OAuthService);
}

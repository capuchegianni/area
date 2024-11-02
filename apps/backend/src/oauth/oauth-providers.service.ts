import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export type OAuthProvider = {
    OAUTH_AUTHORIZATION_URL: string;
    OAUTH_TOKEN_URL: string;
    OAUTH_REVOKE_URL: string;
    CLIENT_ID: string;
    CLIENT_SECRET: string;
};

@Injectable()
export class OAuthProvidersService {
    constructor(private readonly configService: ConfigService) {}

    get google(): OAuthProvider {
        return {
            OAUTH_AUTHORIZATION_URL:
                "https://accounts.google.com/o/oauth2/v2/auth",
            OAUTH_TOKEN_URL: "https://oauth2.googleapis.com/token",
            OAUTH_REVOKE_URL: "https://oauth2.googleapis.com/revoke",
            CLIENT_ID:
                this.configService.getOrThrow<string>("GOOGLE_CLIENT_ID"),
            CLIENT_SECRET: this.configService.getOrThrow<string>(
                "GOOGLE_CLIENT_SECRET"
            )
        };
    }

    get discord(): OAuthProvider {
        return {
            OAUTH_AUTHORIZATION_URL: "https://discord.com/oauth2/authorize",
            OAUTH_TOKEN_URL: "https://discord.com/api/oauth2/token",
            OAUTH_REVOKE_URL: "https://discord.com/api/oauth2/token/revoke",
            CLIENT_ID:
                this.configService.getOrThrow<string>("DISCORD_CLIENT_ID"),
            CLIENT_SECRET: this.configService.getOrThrow<string>(
                "DISCORD_CLIENT_SECRET"
            )
        };
    }

    get twitch(): OAuthProvider {
        return {
            OAUTH_AUTHORIZATION_URL: "https://id.twitch.tv/oauth2/authorize",
            OAUTH_TOKEN_URL: "https://id.twitch.tv/oauth2/token",
            OAUTH_REVOKE_URL: "https://id.twitch.tv/oauth2/revoke",
            CLIENT_ID:
                this.configService.getOrThrow<string>("TWITCH_CLIENT_ID"),
            CLIENT_SECRET: this.configService.getOrThrow<string>(
                "TWITCH_CLIENT_SECRET"
            )
        };
    }
}

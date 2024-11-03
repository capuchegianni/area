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

    get github(): OAuthProvider {
        const clientId = this.configService.get<string>("GITHUB_CLIENT_ID");

        return {
            OAUTH_AUTHORIZATION_URL: "https://github.com/login/oauth/authorize",
            OAUTH_TOKEN_URL: "https://github.com/login/oauth/access_token",
            OAUTH_REVOKE_URL: `https://api.github.com/applications/${clientId}/grant`,
            CLIENT_ID: clientId,
            CLIENT_SECRET: this.configService.getOrThrow<string>(
                "GITHUB_CLIENT_SECRET"
            )
        };
    }

    get slack(): OAuthProvider {
        return {
            OAUTH_AUTHORIZATION_URL: "https://slack.com/oauth/v2/authorize",
            OAUTH_TOKEN_URL: "https://slack.com/api/oauth.v2.access",
            OAUTH_REVOKE_URL: "https://slack.com/api/auth.revoke",
            CLIENT_ID: this.configService.getOrThrow<string>("SLACK_CLIENT_ID"),
            CLIENT_SECRET: this.configService.getOrThrow<string>(
                "SLACK_CLIENT_SECRET"
            )
        };
    }

    get reddit(): OAuthProvider {
        return {
            OAUTH_AUTHORIZATION_URL: "https://www.reddit.com/api/v1/authorize",
            OAUTH_TOKEN_URL: "https://www.reddit.com/api/v1/access_token",
            OAUTH_REVOKE_URL: "https://www.reddit.com/api/v1/revoke_token",
            CLIENT_ID:
                this.configService.getOrThrow<string>("REDDIT_CLIENT_ID"),
            CLIENT_SECRET: this.configService.getOrThrow<string>(
                "REDDIT_CLIENT_SECRET"
            )
        };
    }
}

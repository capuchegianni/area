import axios from "axios";
import {
    ForbiddenException,
    Injectable,
    UnprocessableEntityException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/prisma/prisma.service";
import { OAuthDBService } from "../oauthDb.service";
import { OAuthCredential, OAuthManager } from "../oauth.interface";

@Injectable()
export class DiscordOAuthService
    extends OAuthDBService
    implements OAuthManager
{
    readonly OAUTH_TOKEN_URL: string = `https://discord.com/api/oauth2/token`;

    readonly OAUTH_REVOKE_URL: string = `https://discord.com/api/oauth2/token/revoke`;

    private readonly clientId: string;

    private readonly clientSecret: string;

    private readonly redirectUri: string;

    constructor(
        private readonly configService: ConfigService,
        protected readonly prismaService: PrismaService
    ) {
        super(prismaService);
        const restAPIUrl = this.configService.getOrThrow("REST_API_URL");

        this.clientId =
            this.configService.getOrThrow<string>("DISCORD_CLIENT_ID");
        this.clientSecret = this.configService.getOrThrow<string>(
            "DISCORD_CLIENT_SECRET"
        );
        this.redirectUri = encodeURIComponent(
            `${restAPIUrl}/oauth/discord/callback`
        );
    }

    getOAuthUrl(state: string, scope: string): string {
        const url = new URL("https://discord.com/oauth2/authorize");

        url.searchParams.append("client_id", this.clientId);
        url.searchParams.append("redirect_uri", this.redirectUri);
        url.searchParams.append("scope", scope);
        url.searchParams.append("state", state);
        url.searchParams.append("response_type", "code");

        return url.toString();
    }

    async getCredentials(code: string): Promise<OAuthCredential> {
        if (undefined === code)
            throw new ForbiddenException("The scope were invalid.");

        const data = new URLSearchParams({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            code,
            grant_type: "authorization_code",
            redirect_uri: this.redirectUri
        });

        const response = (
            await axios.post<{
                access_token: string;
                refresh_token: string;
                scope: string;
                expires_in: number;
                token_type: "Bearer";
            }>(this.OAUTH_TOKEN_URL, data, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            })
        ).data;

        return {
            access_token: response.access_token,
            refresh_token: response.refresh_token,
            scope: response.scope,
            expires_at: new Date(Date.now() + response.expires_in * 1000)
        };
    }

    async refreshCredential(
        oauthCredential: OAuthCredential
    ): Promise<OAuthCredential> {
        const response = (
            await axios.post<{
                access_token: string;
                scope: string;
                expires_in: number;
                token_type: "Bearer";
            }>(
                this.OAUTH_TOKEN_URL,
                {
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    grant_type: "refresh_token",
                    refresh_token: oauthCredential.refresh_token
                },
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            )
        ).data;

        return {
            id: oauthCredential.id,
            access_token: response.access_token,
            refresh_token: oauthCredential.refresh_token,
            scope: response.scope,
            expires_at: new Date(Date.now() + response.expires_in * 1000)
        };
    }

    async revokeCredential(oauthCredential: OAuthCredential): Promise<void> {
        try {
            await axios.post(
                this.OAUTH_REVOKE_URL,
                {
                    token: oauthCredential.access_token
                },
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    auth: {
                        username: this.clientId,
                        password: this.clientSecret
                    }
                }
            );
        } catch (e) {
            const { error } = e.response.data;
            console.error(error, this.OAUTH_REVOKE_URL, oauthCredential);
            if ("invalid_client" === error) {
                throw new UnprocessableEntityException(
                    "Unable to revoke the token. It may be from the wrong provider."
                );
            }
        }

        try {
            await axios.post(
                this.OAUTH_REVOKE_URL,
                {
                    token: oauthCredential.refresh_token
                },
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    auth: {
                        username: this.clientId,
                        password: this.clientSecret
                    }
                }
            );
        } catch (e) {
            const { error } = e.response.data;
            console.error(error, this.OAUTH_REVOKE_URL, oauthCredential);
            if ("invalid_client" === error) {
                throw new UnprocessableEntityException(
                    "Unable to revoke the token. It may be from the wrong provider."
                );
            }
        }
    }
}

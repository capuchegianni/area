import axios from "axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { OAuthDBService } from "../oauthDb.service";
import { OAuthManager, OAuthCredential } from "../../oauth/oauth.interface";

@Injectable()
export class GoogleOAuthService extends OAuthDBService implements OAuthManager {
    readonly OAUTH_TOKEN_URL: string = `https://oauth2.googleapis.com/token`;

    readonly OAUTH_REVOKE_URL: string = `https://oauth2.googleapis.com/revoke`;

    private readonly clientId: string;

    private readonly clientSecret: string;

    private readonly redirectUri: string;

    constructor(
        private readonly configService: ConfigService,
        protected readonly prismaService: PrismaService
    ) {
        super(prismaService);
        const restAPIPort = this.configService.get<number>(
            "REST_API_PORT",
            8080
        );
        const baseURL = `http://localhost:${restAPIPort}`;

        this.clientId = this.configService.get<string>("GOOGLE_CLIENT_ID");
        this.clientSecret = this.configService.get<string>(
            "GOOGLE_CLIENT_SECRET"
        );
        this.redirectUri = encodeURIComponent(
            `${baseURL}/oauth/google/callback`
        );
    }

    getOAuthUrl(state: string, scope: string): string {
        const queries = {
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            scope,
            state,
            response_type: "code",
            access_type: "offline",
            include_granted_scopes: true
        };

        return `https://accounts.google.com/o/oauth2/v2/auth?${Object.entries(
            queries
        )
            .map(([k, v]) => `${k}=${v}`)
            .join("&")}`;
    }

    async getCredentials(code: string): Promise<OAuthCredential> {
        const response = (
            await axios.post<{
                access_token: string;
                refresh_token: string;
                scope: string;
                expires_in: number;
                token_type: "Bearer";
            }>(
                this.OAUTH_TOKEN_URL,
                {
                    code,
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    grant_type: "authorization_code",
                    redirect_uri: decodeURIComponent(this.redirectUri)
                },
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            )
        ).data;

        return {
            access_token: response.access_token,
            refresh_token: response.refresh_token,
            scope: response.scope,
            expires_at: new Date(
                new Date().getTime() + response.expires_in * 1000
            )
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
            expires_at: new Date(
                new Date().getTime() + response.expires_in * 1000
            )
        };
    }

    async revokeCredential(oauthCredential: OAuthCredential): Promise<void> {
        await axios.post(
            this.OAUTH_REVOKE_URL,
            {
                token: oauthCredential.access_token
            },
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );
    }
}

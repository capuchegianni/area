import {
    BadRequestException,
    Inject,
    Injectable,
    InternalServerErrorException,
    UnprocessableEntityException
} from "@nestjs/common";
import * as crypto from "node:crypto";
import { Cache } from "cache-manager";
import { User } from "../users/interfaces/user.interface";
import { ForbiddenException } from "@nestjs/common";
import axios from "axios";
import { OAuthCredential, OAuthMetadata } from "./oauth.interface";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { OAuthProvider } from "./oauth-providers.service";

type OAuthCredentialResponse = {
    access_token: string;
    refresh_token?: string;
    scope: string;
    expires_in: number;
    token_type: "Bearer";
};

@Injectable()
export class OAuthService {
    private static readonly OAUTH_STATE_TTL: number = 600000; // 10 minutes

    constructor(
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache
    ) {}

    private static createState(userId: User["id"], requestedAt: number) {
        return crypto.hash("SHA-512", `${userId}:${requestedAt}`, "hex");
    }

    private async prepareOAuthSession(
        userId: User["id"],
        redirectUri: string
    ): Promise<string> {
        const requestedAt = Date.now();

        const state = OAuthService.createState(userId, requestedAt);

        const oauthMetadata: OAuthMetadata = {
            state,
            requestedAt,
            redirectUri
        };

        await this.cacheManager.set(
            `oauth-${userId}`,
            oauthMetadata,
            OAuthService.OAUTH_STATE_TTL
        );

        return state;
    }

    private async verifyState(
        userId: User["id"],
        state: string
    ): Promise<string> {
        const oauthMetadata: OAuthMetadata = await this.cacheManager.get(
            `oauth-${userId}`
        );

        if (undefined === oauthMetadata)
            throw new ForbiddenException("Session expired.");

        const forbiddenException = new ForbiddenException(
            "Invalid state. Possibly due to a CSRF attack attempt."
        );

        await this.cacheManager.del(`oauth-${userId}`);

        if (state !== oauthMetadata.state) throw forbiddenException;

        const computedState = OAuthService.createState(
            userId,
            oauthMetadata.requestedAt
        );
        if (state !== computedState) throw forbiddenException;

        return oauthMetadata.redirectUri;
    }

    async getAuthorizationUrl(
        provider: OAuthProvider,
        userId: User["id"],
        redirectUri: string,
        scope: string
    ): Promise<string> {
        const state = await this.prepareOAuthSession(userId, redirectUri);

        const url = new URL(provider.OAUTH_AUTHORIZATION_URL);

        url.searchParams.append("client_id", provider.CLIENT_ID);
        url.searchParams.append("redirect_uri", redirectUri);
        url.searchParams.append("scope", scope);
        url.searchParams.append("state", state);
        url.searchParams.append("response_type", "code");
        url.searchParams.append("access_type", "offline");
        url.searchParams.append("prompt", "consent");

        return url.toString();
    }

    async callback(
        provider: OAuthProvider,
        userId: User["id"],
        code: string,
        state: string
    ): Promise<OAuthCredential> {
        const redirectUri = await this.verifyState(userId, state);

        if (undefined === code)
            throw new ForbiddenException("The scope were invalid.");

        const data = new URLSearchParams({
            client_id: provider.CLIENT_ID,
            client_secret: provider.CLIENT_SECRET,
            code,
            grant_type: "authorization_code",
            redirect_uri: redirectUri
        }).toString();

        try {
            const response = (
                await axios.post<OAuthCredentialResponse>(
                    provider.OAUTH_TOKEN_URL,
                    data,
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
                expires_at: new Date(Date.now() + response.expires_in * 1000)
            };
        } catch (e) {
            if (400 === e.response.status)
                throw new BadRequestException("Invalid 'code' provided.");
            console.error(e.response.data, e.response.status);
            throw new InternalServerErrorException();
        }
    }

    async refresh(
        provider: OAuthProvider,
        oauthCredential: OAuthCredential
    ): Promise<OAuthCredential> {
        const data = new URLSearchParams({
            client_id: provider.CLIENT_ID,
            client_secret: provider.CLIENT_SECRET,
            grant_type: "refresh_token",
            refresh_token: oauthCredential.refresh_token
        }).toString();

        const response = (
            await axios.post<OAuthCredentialResponse>(
                provider.OAUTH_TOKEN_URL,
                data,
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
            refresh_token:
                response.refresh_token ?? oauthCredential.refresh_token,
            scope: response.scope,
            expires_at: new Date(Date.now() + response.expires_in * 1000)
        };
    }

    private async internalRevoke(
        provider: OAuthProvider,
        token: string,
        tokenTypeHint: "access_token" | "refresh_token"
    ): Promise<void> {
        const data = new URLSearchParams({
            client_id: provider.CLIENT_ID,
            client_secret: provider.CLIENT_SECRET,
            token,
            token_type_hint: tokenTypeHint
        }).toString();

        try {
            await axios.post(provider.OAUTH_REVOKE_URL, data, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });
        } catch (e) {
            const { error } = e.response.data;

            if (400 === e.response.status) {
                throw new UnprocessableEntityException(
                    "Unable to revoke the token. It may be from the wrong provider."
                );
            }

            console.error({ error, token, tokenTypeHint });
            throw new InternalServerErrorException(
                "Unable to revoke the token."
            );
        }
    }

    async revoke(
        provider: OAuthProvider,
        oauthCredential: OAuthCredential
    ): Promise<void> {
        await this.internalRevoke(
            provider,
            oauthCredential.access_token,
            "access_token"
        );

        await this.internalRevoke(
            provider,
            oauthCredential.refresh_token,
            "refresh_token"
        );
    }
}

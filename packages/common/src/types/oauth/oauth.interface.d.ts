import { OAuthDBService } from "./oauth-db.service";
export declare class OAuthCredential {
    readonly id?: number;
    readonly access_token: string;
    readonly refresh_token: string;
    readonly expires_at: Date;
    readonly scope: string;
}
export declare abstract class OAuthManager extends OAuthDBService {
    readonly OAUTH_TOKEN_URL: string;
    readonly OAUTH_REVOKE_URL: string;
    abstract getOAuthUrl(state: string, scope: string): string;
    abstract getCredentials(code: string): Promise<OAuthCredential>;
    abstract refreshCredential(oauthCredential: OAuthCredential): Promise<OAuthCredential>;
    abstract revokeCredential(oauthCredential: OAuthCredential): Promise<void>;
}
export declare function OAuthController_getAuthorizationUrl(): MethodDecorator & ClassDecorator;
export declare function OAuthController_callback(): MethodDecorator & ClassDecorator;
export declare function OAuthController_credentials(): MethodDecorator & ClassDecorator;
export declare function OAuthController_revoke(): MethodDecorator & ClassDecorator;
export interface OAuthMetadata {
    state: string;
    requestedAt: number;
    redirectUri: string;
}

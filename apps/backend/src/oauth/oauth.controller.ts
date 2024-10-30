import { Request } from "express";

import { OAuthService } from "./oauth.service";
import {
    Controller,
    NotFoundException,
    Param,
    ParseIntPipe,
    Query,
    Req
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
    OAuthController_callback,
    OAuthController_credentials,
    OAuthController_getAuthorizationUrl,
    OAuthController_revoke,
    OAuthCredential
} from "./oauth.interface";
import { User } from "src/users/interfaces/user.interface";
import { OAuthDBService } from "./oauth-db.service";
import { OAuthProvidersService } from "./oauth-providers.service";

@ApiTags("OAuth")
@Controller("/oauth")
export class OAuthController {
    constructor(
        private readonly oauthService: OAuthService,
        private readonly oauthDbService: OAuthDBService,
        private readonly oauthProviders: OAuthProvidersService
    ) {}

    @OAuthController_getAuthorizationUrl()
    async getAuthorizationUrl(
        @Req() req: Request,
        @Param("provider") providerName: string,
        @Query("scope") scope: string,
        @Query("redirect_uri") redirectUri: string
    ) {
        const { id } = req.user as Pick<User, "id">;

        const provider = this.oauthProviders[providerName];

        if (undefined === provider)
            throw new NotFoundException(
                `Unknown OAuth2.0 provider : ${providerName}`
            );

        const authorizationUrl = await this.oauthService.getAuthorizationUrl(
            provider,
            id,
            redirectUri,
            scope
        );

        return {
            redirect_uri: authorizationUrl
        };
    }

    @OAuthController_callback()
    async callback(
        @Req() req: Request,
        @Param("provider") providerName: string,
        @Query("code") code: string,
        @Query("state") state: string
    ): Promise<void> {
        const { id } = req.user as Pick<User, "id">;

        const provider = this.oauthProviders[providerName];

        if (undefined === provider)
            throw new NotFoundException(
                `Unknown OAuth2.0 provider : ${providerName}`
            );

        const oauthCredential = await this.oauthService.callback(
            provider,
            id,
            code,
            state
        );

        await this.oauthDbService.saveCredential(
            id,
            oauthCredential,
            provider.OAUTH_TOKEN_URL,
            provider.OAUTH_REVOKE_URL
        );
    }

    @OAuthController_credentials()
    async credentials(
        @Req() req: Request,
        @Param("provider") providerName: string
    ): Promise<OAuthCredential[]> {
        const { id } = req.user as Pick<User, "id">;

        const provider = this.oauthProviders[providerName];

        if (undefined === provider)
            throw new NotFoundException(
                `Unknown OAuth2.0 provider : ${providerName}`
            );

        const oauthCredentials =
            await this.oauthDbService.loadCredentialsByUserId(
                id,
                provider.OAUTH_TOKEN_URL,
                provider.OAUTH_REVOKE_URL
            );

        return oauthCredentials;
    }

    @OAuthController_revoke()
    async revoke(
        @Req() req: Request,
        @Param("provider") providerName: string,
        @Param("id", ParseIntPipe) oauthCredentialId: number
    ): Promise<void> {
        const { id } = req.user as Pick<User, "id">;

        const provider = this.oauthProviders[providerName];

        if (undefined === provider)
            throw new NotFoundException(
                `Unknown OAuth2.0 provider : ${providerName}`
            );

        const oauthCredential = await this.oauthDbService.loadCredentialById(
            id,
            oauthCredentialId
        );

        await this.oauthService.revoke(provider, oauthCredential);

        await this.oauthDbService.deleteCredential(id, oauthCredential);
    }
}

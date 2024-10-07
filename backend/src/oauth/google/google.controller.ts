import { Request } from "express";
import {
    Controller,
    HttpRedirectResponse,
    HttpStatus,
    Param,
    Query,
    Req
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { GoogleOAuthService } from "./google.service";
import { User } from "../../users/interfaces/user.interface";
import {
    OAuthController,
    OAuthController_callback,
    OAuthController_credentials,
    OAuthController_getOAuthUrl,
    OAuthController_revoke,
    OAuthCredential
} from "../oauth.interface";

@ApiTags("Google OAuth")
@Controller("oauth/google")
export class GoogleOAuthController implements OAuthController {
    constructor(private readonly oauthManager: GoogleOAuthService) {}

    @OAuthController_getOAuthUrl()
    getOAuthUrl(
        @Req() req: Request,
        @Query("redirect_uri") redirectUri: string,
        @Query("scope") scope: string
    ) {
        const { id } = req.user as Pick<User, "id">;
        const state = OAuthController.prepareOAuthSession(
            req.session,
            id,
            redirectUri
        );

        return {
            redirect_uri: this.oauthManager.getOAuthUrl(state, scope)
        };
    }

    @OAuthController_callback()
    async callback(
        @Req() req: Request,
        @Query("code") code: string,
        @Query("state") state: string
    ): Promise<HttpRedirectResponse> {
        OAuthController.verifyState(req.session, state);

        const tokens = await this.oauthManager.getCredentials(code);

        await this.oauthManager.saveCredential(
            req.session["user_id"],
            tokens,
            this.oauthManager.OAUTH_TOKEN_URL,
            this.oauthManager.OAUTH_REVOKE_URL
        );

        req.session.destroy((err) => {
            if (err) console.error(err);
        });

        return {
            url: req.session["redirect_uri"] || "/",
            statusCode: HttpStatus.SEE_OTHER
        };
    }

    @OAuthController_credentials()
    async credentials(@Req() req: Request): Promise<OAuthCredential[]> {
        const { id } = req.user as Pick<User, "id">;
        return await this.oauthManager.loadCredentialsByUserId(
            id,
            this.oauthManager.OAUTH_TOKEN_URL,
            this.oauthManager.OAUTH_REVOKE_URL
        );
    }

    @OAuthController_revoke()
    async revoke(
        @Req() req: Request,
        @Param("oauthCredentialId") oauthCredentialId: OAuthCredential["id"]
    ): Promise<void> {
        const { id } = req.user as Pick<User, "id">;
        const oauthCredential = await this.oauthManager.loadCredentialById(
            id,
            oauthCredentialId
        );
        await this.oauthManager.revokeCredential(oauthCredential);
    }
}

import { Module } from "@nestjs/common";
import { OAuthService } from "./oauth.service";
import { OAuthDBService } from "./oauthDb.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { OAuthController } from "./oauth.controller";
import { OAuthProvidersService } from "./oauth-providers.service";

@Module({
    imports: [PrismaModule],
    controllers: [OAuthController],
    providers: [OAuthService, OAuthDBService, OAuthProvidersService],
    exports: [OAuthService, OAuthDBService, OAuthProvidersService]
})
export class OAuthModule {}

import { Test, TestingModule } from "@nestjs/testing";
import {
    OAuthProvider,
    OAuthProvidersService
} from "./oauth-providers.service";
import { ConfigService } from "@nestjs/config";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";

describe("OauthService", () => {
    let service: OAuthProvidersService;
    let configService: DeepMockProxy<ConfigService>;

    beforeEach(async () => {
        configService = mockDeep<ConfigService>();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OAuthProvidersService,
                {
                    provide: ConfigService,
                    useValue: configService
                }
            ]
        }).compile();

        service = module.get<OAuthProvidersService>(OAuthProvidersService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("Google OAuth", () => {
        it("should return Google's OAuth credentials", () => {
            configService.getOrThrow.mockImplementation((k: string) => {
                if (k === "GOOGLE_CLIENT_ID" || k === "GOOGLE_CLIENT_SECRET")
                    return k;
                throw new Error("key not found");
            });

            const provider: OAuthProvider = service.google;

            expect(configService.getOrThrow).toHaveBeenCalledWith(
                "GOOGLE_CLIENT_ID"
            );

            expect(configService.getOrThrow).toHaveBeenCalledWith(
                "GOOGLE_CLIENT_SECRET"
            );

            configService.getOrThrow.mockClear();

            expect(provider).toStrictEqual({
                OAUTH_AUTHORIZATION_URL:
                    "https://accounts.google.com/o/oauth2/v2/auth",
                OAUTH_TOKEN_URL: "https://oauth2.googleapis.com/token",
                OAUTH_REVOKE_URL: "https://oauth2.googleapis.com/revoke",
                CLIENT_ID: "GOOGLE_CLIENT_ID",
                CLIENT_SECRET: "GOOGLE_CLIENT_SECRET"
            });
        });
    });

    describe("Discord OAuth", () => {
        it("should return Discord's OAuth credentials", () => {
            configService.getOrThrow.mockImplementation((k: string) => {
                if (k === "DISCORD_CLIENT_ID" || k === "DISCORD_CLIENT_SECRET")
                    return k;
                throw new Error("key not found");
            });

            const provider: OAuthProvider = service.discord;

            expect(configService.getOrThrow).toHaveBeenCalledWith(
                "DISCORD_CLIENT_ID"
            );

            expect(configService.getOrThrow).toHaveBeenCalledWith(
                "DISCORD_CLIENT_SECRET"
            );

            configService.getOrThrow.mockClear();

            expect(provider).toStrictEqual({
                OAUTH_AUTHORIZATION_URL:
                    "https://discord.com/oauth2/authorize",
                OAUTH_TOKEN_URL: "https://discord.com/api/oauth2/token",
                OAUTH_REVOKE_URL: "https://discord.com/api/oauth2/token/revoke",
                CLIENT_ID: "DISCORD_CLIENT_ID",
                CLIENT_SECRET: "DISCORD_CLIENT_SECRET"
            });
        });
    });

    describe("Twitch OAuth", () => {
        it("should return Twitch's OAuth credentials", () => {
            configService.getOrThrow.mockImplementation((k: string) => {
                if (k === "TWITCH_CLIENT_ID" || k === "TWITCH_CLIENT_SECRET")
                    return k;
                throw new Error("key not found");
            });

            const provider: OAuthProvider = service.twitch;

            expect(configService.getOrThrow).toHaveBeenCalledWith(
                "TWITCH_CLIENT_ID"
            );

            expect(configService.getOrThrow).toHaveBeenCalledWith(
                "TWITCH_CLIENT_SECRET"
            );

            configService.getOrThrow.mockClear();

            expect(provider).toStrictEqual({
                OAUTH_AUTHORIZATION_URL:
                    "https://id.twitch.tv/oauth2/authorize",
                OAUTH_TOKEN_URL: "https://id.twitch.tv/oauth2/token",
                OAUTH_REVOKE_URL: "https://id.twitch.tv/oauth2/revoke",
                CLIENT_ID: "TWITCH_CLIENT_ID",
                CLIENT_SECRET: "TWITCH_CLIENT_SECRET"
            });
        });
    });
});

import * as crypto from "node:crypto";
import { Test, TestingModule } from "@nestjs/testing";
import { OAuthService } from "./oauth.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { Cache } from "cache-manager";
import { OAuthProvider } from "./oauth-providers.service";
import {
    BadRequestException,
    ForbiddenException,
    InternalServerErrorException,
    UnprocessableEntityException
} from "@nestjs/common";
import axios from "axios";
import { OAuthCredential } from "./oauth.interface";

describe("OauthService", () => {
    let service: OAuthService;
    let cache: DeepMockProxy<Cache>;

    const provider: OAuthProvider = {
        OAUTH_AUTHORIZATION_URL: "https://accounts.google.com/o/oauth2/v2/auth",
        OAUTH_TOKEN_URL: "https://oauth2.googleapis.com/token",
        OAUTH_REVOKE_URL: "https://oauth2.googleapis.com/revoke",
        CLIENT_ID: "GOOGLE_CLIENT_ID",
        CLIENT_SECRET: "GOOGLE_CLIENT_SECRET"
    };

    beforeEach(async () => {
        cache = mockDeep<Cache>();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OAuthService,
                {
                    provide: CACHE_MANAGER,
                    useValue: cache
                }
            ]
        }).compile();

        service = module.get<OAuthService>(OAuthService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("getAuthorizationUrl", () => {
        it("should return the URL for Google authorization", async () => {
            const dateNow = jest.spyOn(Date, "now");

            const hash = jest.spyOn(crypto, "hash");

            const userId = "user-id";

            const redirectUri = "https://localhost:8081/oauth/google/callback";

            const scope = "https://googleapis.com/auth/youtube.readonly";

            hash.mockReturnValueOnce("hashed-state");

            dateNow.mockReturnValueOnce(0);

            cache.set.mockResolvedValueOnce();

            const authorizationUrl = await service.getAuthorizationUrl(
                provider,
                userId,
                redirectUri,
                scope
            );

            expect(dateNow).toHaveBeenCalledTimes(1);

            expect(hash).toHaveBeenCalledWith("SHA-512", `${userId}:0`, "hex");

            expect(cache.set).toHaveBeenCalledWith(
                `oauth-${userId}`,
                {
                    state: "hashed-state",
                    requestedAt: 0,
                    redirectUri
                },
                600000
            );

            expect(authorizationUrl).toBe(
                `https://accounts.google.com/o/oauth2/v2/auth?client_id=GOOGLE_CLIENT_ID&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=hashed-state&response_type=code`
            );
        });
    });

    describe("callback", () => {
        it("should throw a ForbiddenException because no session was registered for the current user", async () => {
            cache.get.mockResolvedValueOnce(undefined);

            try {
                await service.callback(provider, "user-id", "code", undefined);
                fail("This should throw an error");
            } catch (e) {
                expect(e).toBeInstanceOf(ForbiddenException);
            }

            expect(cache.get).toHaveBeenCalledWith("oauth-user-id");
        });

        it("should throw a ForbiddenException because 'state' is undefined", async () => {
            cache.get.mockResolvedValueOnce({
                state: "CACHED_STATE",
                requestedAt: 0,
                redirectUri: "REDIRECT_URI"
            });

            cache.del.mockResolvedValueOnce();

            try {
                await service.callback(provider, "user-id", "code", undefined);
                fail("This sould throw an error");
            } catch (e) {
                expect(e).toBeInstanceOf(ForbiddenException);
            }

            expect(cache.get).toHaveBeenCalledWith("oauth-user-id");

            expect(cache.del).toHaveBeenCalledWith("oauth-user-id");
        });

        it("should throw a ForbiddenException because the computed 'state' do not match the initial one", async () => {
            const hash = jest.spyOn(crypto, "hash");

            hash.mockReturnValueOnce("hashed-state-bad");

            cache.get.mockResolvedValueOnce({
                state: "hashed-state",
                requestedAt: 0,
                redirectUri: "REDIRECT_URI"
            });

            cache.del.mockResolvedValueOnce();

            try {
                await service.callback(
                    provider,
                    "user-id",
                    "code",
                    "hashed-state"
                );
                fail("This sould throw an error");
            } catch (e) {
                expect(e).toBeInstanceOf(ForbiddenException);
            }

            expect(hash).toHaveBeenCalledWith("SHA-512", `user-id:0`, "hex");

            expect(cache.get).toHaveBeenCalledWith("oauth-user-id");

            expect(cache.del).toHaveBeenCalledWith("oauth-user-id");
        });

        it("should throw a ForbiddenException because 'code' is undefined", async () => {
            const hash = jest.spyOn(crypto, "hash");

            hash.mockReturnValueOnce("hashed-state");

            cache.get.mockResolvedValueOnce({
                state: "hashed-state",
                requestedAt: 0,
                redirectUri: "REDIRECT_URI"
            });

            cache.del.mockResolvedValueOnce();

            try {
                await service.callback(
                    provider,
                    "user-id",
                    undefined,
                    "hashed-state"
                );
                fail("This sould throw an error");
            } catch (e) {
                expect(e).toBeInstanceOf(ForbiddenException);
            }

            expect(hash).toHaveBeenCalledWith("SHA-512", `user-id:0`, "hex");

            expect(cache.get).toHaveBeenCalledWith("oauth-user-id");

            expect(cache.del).toHaveBeenCalledWith("oauth-user-id");
        });

        it("should throw a BadRequestException because the code is invalid", async () => {
            const hash = jest.spyOn(crypto, "hash");

            hash.mockReturnValueOnce("hashed-state");

            cache.get.mockResolvedValueOnce({
                state: "hashed-state",
                requestedAt: 0,
                redirectUri: "REDIRECT_URI"
            });

            cache.del.mockResolvedValueOnce();

            const axiosPost = jest.spyOn(axios, "post");

            axiosPost.mockRejectedValueOnce({
                response: {
                    status: 400
                }
            });

            try {
                await service.callback(
                    provider,
                    "user-id",
                    "code",
                    "hashed-state"
                );
                fail("This should throw an error");
            } catch (e) {
                expect(e).toBeInstanceOf(BadRequestException);
            }

            expect(hash).toHaveBeenCalledWith("SHA-512", `user-id:0`, "hex");

            expect(cache.get).toHaveBeenCalledWith("oauth-user-id");

            expect(cache.del).toHaveBeenCalledWith("oauth-user-id");

            expect(axiosPost).toHaveBeenCalledWith(
                "https://oauth2.googleapis.com/token",
                "client_id=GOOGLE_CLIENT_ID&client_secret=GOOGLE_CLIENT_SECRET&code=code&grant_type=authorization_code&redirect_uri=REDIRECT_URI",
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            );
        });

        it("should throw an error internally because anything can happen", async () => {
            const hash = jest.spyOn(crypto, "hash");

            hash.mockReturnValueOnce("hashed-state");

            cache.get.mockResolvedValueOnce({
                state: "hashed-state",
                requestedAt: 0,
                redirectUri: "REDIRECT_URI"
            });

            cache.del.mockResolvedValueOnce();

            const axiosPost = jest.spyOn(axios, "post");

            axiosPost.mockRejectedValueOnce({
                response: {
                    status: 500,
                    data: {
                        error: "InteralServerError",
                        error_description: "Internal server error"
                    }
                }
            });

            const consoleError = jest.spyOn(console, "error");

            consoleError.mockReturnValueOnce();

            try {
                await service.callback(
                    provider,
                    "user-id",
                    "code",
                    "hashed-state"
                );
                fail("This should throw an error");
            } catch (e) {
                expect(e).toBeInstanceOf(InternalServerErrorException);
            }

            expect(hash).toHaveBeenCalledWith("SHA-512", `user-id:0`, "hex");

            expect(cache.get).toHaveBeenCalledWith("oauth-user-id");

            expect(cache.del).toHaveBeenCalledWith("oauth-user-id");

            expect(axiosPost).toHaveBeenCalledWith(
                "https://oauth2.googleapis.com/token",
                "client_id=GOOGLE_CLIENT_ID&client_secret=GOOGLE_CLIENT_SECRET&code=code&grant_type=authorization_code&redirect_uri=REDIRECT_URI",
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            );

            expect(consoleError).toHaveBeenCalledTimes(1);

            consoleError.mockClear();
        });

        it("should validate the state and exchange the code to oauth credentials", async () => {
            const hash = jest.spyOn(crypto, "hash");

            hash.mockReturnValueOnce("hashed-state");

            cache.get.mockResolvedValueOnce({
                state: "hashed-state",
                requestedAt: 0,
                redirectUri: "REDIRECT_URI"
            });

            cache.del.mockResolvedValueOnce();

            const axiosPost = jest.spyOn(axios, "post");

            axiosPost.mockResolvedValueOnce({
                data: {
                    access_token: "access_token_here",
                    refresh_token: "refresh_token_here",
                    scope: "https://googleapis.com/auth/youtube.readonly",
                    expires_in: 3599,
                    token_type: "Bearer"
                }
            });

            const dateNow = jest.spyOn(Date, "now");

            dateNow.mockReturnValue(0);

            const credential = await service.callback(
                provider,
                "user-id",
                "code",
                "hashed-state"
            );

            expect(hash).toHaveBeenCalledWith("SHA-512", `user-id:0`, "hex");

            expect(cache.get).toHaveBeenCalledWith("oauth-user-id");

            expect(cache.del).toHaveBeenCalledWith("oauth-user-id");

            expect(axiosPost).toHaveBeenCalledWith(
                "https://oauth2.googleapis.com/token",
                "client_id=GOOGLE_CLIENT_ID&client_secret=GOOGLE_CLIENT_SECRET&code=code&grant_type=authorization_code&redirect_uri=REDIRECT_URI",
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            );

            expect(credential).toStrictEqual({
                access_token: "access_token_here",
                refresh_token: "refresh_token_here",
                scope: "https://googleapis.com/auth/youtube.readonly",
                expires_at: new Date(Date.now() + 3599 * 1000)
            });
        });
    });

    describe("refresh", () => {
        it("should refresh the OAuth credential", async () => {
            const axiosPost = jest.spyOn(axios, "post");

            axiosPost.mockResolvedValueOnce({
                data: {
                    access_token: "refreshed_access_token_here",
                    refresh_token: "refreshed_refresh_token_here",
                    scope: "https://googleapis.com/auth/youtube.readonly",
                    expires_in: 3599,
                    token_type: "Bearer"
                }
            });

            const credential: OAuthCredential = {
                access_token: "access_token_here",
                refresh_token: "refresh_token_here",
                expires_at: new Date(),
                scope: "scope here"
            };

            const refreshedCredential = await service.refresh(
                provider,
                credential
            );

            expect(axiosPost).toHaveBeenCalledWith(
                "https://oauth2.googleapis.com/token",
                `client_id=GOOGLE_CLIENT_ID&client_secret=GOOGLE_CLIENT_SECRET&grant_type=refresh_token&refresh_token=${credential.refresh_token}`,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            );

            expect(refreshedCredential.access_token).not.toBe(
                credential.access_token
            );

            expect(refreshedCredential.refresh_token).not.toBe(
                credential.refresh_token
            );
        });
        it("should refresh the OAuth credential and handle the case where the provider does not provide a new refresh_token", async () => {
            const axiosPost = jest.spyOn(axios, "post");

            axiosPost.mockResolvedValueOnce({
                data: {
                    access_token: "refreshed_access_token_here",
                    scope: "https://googleapis.com/auth/youtube.readonly",
                    expires_in: 3599,
                    token_type: "Bearer"
                }
            });

            const credential: OAuthCredential = {
                access_token: "access_token_here",
                refresh_token: "refresh_token_here",
                expires_at: new Date(),
                scope: "scope here"
            };

            const refreshedCredential = await service.refresh(
                provider,
                credential
            );

            expect(axiosPost).toHaveBeenCalledWith(
                "https://oauth2.googleapis.com/token",
                `client_id=GOOGLE_CLIENT_ID&client_secret=GOOGLE_CLIENT_SECRET&grant_type=refresh_token&refresh_token=${credential.refresh_token}`,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            );
            expect(refreshedCredential.access_token).not.toBe(
                credential.access_token
            );

            expect(refreshedCredential.refresh_token).toBe(
                credential.refresh_token
            );
        });
    });

    describe("revoke", () => {
        it("should revoke both access and refresh tokens", async () => {
            const axiosPost = jest.spyOn(axios, "post");

            axiosPost.mockResolvedValue(null);

            const credential: OAuthCredential = {
                access_token: "access_token_here",
                refresh_token: "refresh_token_here",
                expires_at: new Date(),
                scope: "scope here"
            };

            await service.revoke(provider, credential);

            expect(axiosPost).toHaveBeenCalledWith(
                "https://oauth2.googleapis.com/revoke",
                `client_id=GOOGLE_CLIENT_ID&client_secret=GOOGLE_CLIENT_SECRET&token=${credential.access_token}&token_type_hint=access_token`,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            );

            expect(axiosPost).toHaveBeenCalledWith(
                "https://oauth2.googleapis.com/revoke",
                `client_id=GOOGLE_CLIENT_ID&client_secret=GOOGLE_CLIENT_SECRET&token=${credential.refresh_token}&token_type_hint=refresh_token`,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            );

            axiosPost.mockClear();
        });

        it("should throw an error because the token does not belong the provider", async () => {
            const axiosPost = jest.spyOn(axios, "post");

            axiosPost.mockRejectedValue({
                response: {
                    status: 400,
                    data: {
                        error: "invalid_client",
                        error_description: "Invalid client"
                    }
                }
            });

            const credential: OAuthCredential = {
                access_token: "access_token_here",
                refresh_token: "refresh_token_here",
                expires_at: new Date(),
                scope: "scope here"
            };

            try {
                await service.revoke(provider, credential);
                fail("This should throw an error");
            } catch (e) {
                expect(e).toBeInstanceOf(UnprocessableEntityException);
            }

            expect(axiosPost).toHaveBeenCalledWith(
                "https://oauth2.googleapis.com/revoke",
                `client_id=GOOGLE_CLIENT_ID&client_secret=GOOGLE_CLIENT_SECRET&token=${credential.access_token}&token_type_hint=access_token`,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            );
        });
        it("should throw an error because the provider might have an internal error", async () => {
            const axiosPost = jest.spyOn(axios, "post");

            axiosPost.mockRejectedValue({
                response: {
                    status: 500,
                    data: {
                        error: "internal_server_error",
                        error_description: "Internal Server Error"
                    }
                }
            });

            const credential: OAuthCredential = {
                access_token: "access_token_here",
                refresh_token: "refresh_token_here",
                expires_at: new Date(),
                scope: "scope here"
            };

            const consoleError = jest.spyOn(console, "error");

            consoleError.mockReturnValueOnce();

            try {
                await service.revoke(provider, credential);
                fail("This should throw an error");
            } catch (e) {
                expect(e).toBeInstanceOf(InternalServerErrorException);
            }

            expect(axiosPost).toHaveBeenCalledWith(
                "https://oauth2.googleapis.com/revoke",
                `client_id=GOOGLE_CLIENT_ID&client_secret=GOOGLE_CLIENT_SECRET&token=${credential.access_token}&token_type_hint=access_token`,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            );

            expect(consoleError).toHaveBeenCalledTimes(1);
            consoleError.mockClear();
        });
    });
});

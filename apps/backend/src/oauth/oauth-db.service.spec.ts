import { Test, TestingModule } from "@nestjs/testing";
import { OAuthDBService } from "./oauth-db.service";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { randomUUID } from "node:crypto";
import { OAuthCredential } from "./oauth.interface";
import { NotFoundException } from "@nestjs/common";

describe("OAuthDBService", () => {
    let service: OAuthDBService;
    let prismaService: DeepMockProxy<PrismaClient>;

    beforeEach(async () => {
        prismaService = mockDeep<PrismaClient>();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OAuthDBService,
                { provide: PrismaService, useValue: prismaService }
            ]
        }).compile();

        service = module.get<OAuthDBService>(OAuthDBService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("saveCredential", () => {
        it("should save the credential to the DB", async () => {
            const userId = randomUUID();
            const credential: OAuthCredential = {
                access_token: "i",
                refresh_token: "refresh_token_here",
                expires_at: new Date(),
                scope: "scope here"
            };
            const oauthTokenUrl = "https://oauth2.provider.com/token";
            const oauthRevokeUrl = "https://oauth2.provider.com/revoke";

            prismaService.oAuthCredential.create.mockResolvedValueOnce({
                id: 1
            } as any);

            const credentialId = await service.saveCredential(
                userId,
                credential,
                oauthTokenUrl,
                oauthRevokeUrl
            );

            expect(prismaService.oAuthCredential.create).toHaveBeenCalledWith({
                data: {
                    accessToken: credential.access_token,
                    refreshToken: credential.refresh_token,
                    expiresAt: credential.expires_at,
                    scopes: ["scope", "here"],
                    tokenUrl: oauthTokenUrl,
                    revokeUrl: oauthRevokeUrl,
                    userId
                },
                select: {
                    id: true
                }
            });

            expect(credentialId).toBe(1);
        });
    });

    describe("loadCredentialsByUserId", () => {
        it("should load a few credentials", async () => {
            const userId = randomUUID();
            const oauthTokenUrl = "https://oauth2.provider.com/token";
            const oauthRevokeUrl = "https://oauth2.provider.com/revoke";
            const now = new Date();

            prismaService.oAuthCredential.findMany.mockResolvedValueOnce([
                {
                    id: 1,
                    accessToken: "i",
                    refreshToken: "refresh_token_here",
                    expiresAt: now,
                    scopes: ["scope", "here"]
                } as any
            ]);

            const credentials = await service.loadCredentialsByUserId(
                userId,
                oauthTokenUrl,
                oauthRevokeUrl
            );

            expect(prismaService.oAuthCredential.findMany).toHaveBeenCalledWith(
                {
                    where: {
                        userId,
                        tokenUrl: oauthTokenUrl,
                        revokeUrl: oauthRevokeUrl
                    },
                    select: {
                        id: true,
                        accessToken: true,
                        refreshToken: true,
                        expiresAt: true,
                        scopes: true
                    }
                }
            );

            expect(credentials).toStrictEqual([
                {
                    id: 1,
                    access_token: "i",
                    refresh_token: "refresh_token_here",
                    expires_at: now,
                    scope: "scope here"
                }
            ]);
        });
    });

    describe("laodCredentialsByScopes", () => {
        it("should load credentials which includes ALL scopes", async () => {
            const userId = randomUUID();
            const oauthTokenUrl = "https://oauth2.provider.com/token";
            const oauthRevokeUrl = "https://oauth2.provider.com/revoke";
            const scopes = ["scope", "here"];
            const now = new Date();

            prismaService.oAuthCredential.findMany.mockResolvedValueOnce([
                {
                    id: 1,
                    scopes,
                    accessToken: "i",
                    refreshToken: "refresh_token_here",
                    expiresAt: now
                } as any
            ]);

            const credentials = await service.loadCredentialsByScopes(
                userId,
                scopes,
                oauthTokenUrl,
                oauthRevokeUrl
            );

            expect(prismaService.oAuthCredential.findMany).toHaveBeenCalledWith(
                {
                    where: {
                        scopes: { hasEvery: scopes },
                        userId,
                        tokenUrl: oauthTokenUrl,
                        revokeUrl: oauthRevokeUrl
                    },
                    select: {
                        id: true,
                        accessToken: true,
                        refreshToken: true,
                        expiresAt: true,
                        scopes: true
                    }
                }
            );

            expect(credentials).toStrictEqual([
                {
                    id: 1,
                    access_token: "i",
                    refresh_token: "refresh_token_here",
                    expires_at: now,
                    scope: "scope here"
                }
            ]);
        });
    });

    describe("loadCredentialById", () => {
        it("should load the credential by it's ID", async () => {
            const userId = randomUUID();
            const scopes = ["scope", "here"];
            const now = new Date();

            prismaService.oAuthCredential.findUnique.mockResolvedValueOnce({
                id: 1,
                scopes,
                accessToken: "i",
                refreshToken: "refresh_token_here",
                expiresAt: now
            } as any);

            const credential = await service.loadCredentialById(userId, 1);

            expect(
                prismaService.oAuthCredential.findUnique
            ).toHaveBeenCalledWith({
                where: {
                    id: 1,
                    userId
                },
                select: {
                    id: true,
                    accessToken: true,
                    refreshToken: true,
                    expiresAt: true,
                    scopes: true
                }
            });

            expect(credential).toStrictEqual({
                id: 1,
                access_token: "i",
                refresh_token: "refresh_token_here",
                expires_at: now,
                scope: "scope here"
            });
        });

        it("should throw an error because it's not found", async () => {
            const userId = randomUUID();
            prismaService.oAuthCredential.findUnique.mockResolvedValueOnce(
                null
            );

            try {
                await service.loadCredentialById(userId, 2);
                fail(
                    "This is not supposed to pass. An error should have been thrown."
                );
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundException);
            }
            expect(
                prismaService.oAuthCredential.findUnique
            ).toHaveBeenCalledWith({
                where: {
                    id: 2,
                    userId
                },
                select: {
                    id: true,
                    accessToken: true,
                    refreshToken: true,
                    expiresAt: true,
                    scopes: true
                }
            });
        });
    });

    describe("updateCredential", () => {
        it("should update the credential", async () => {
            const oauthCredential: OAuthCredential = {
                id: 1,
                access_token: "updated_i",
                refresh_token: "updated_refresh_token_here",
                expires_at: new Date(),
                scope: "scope here"
            };

            prismaService.oAuthCredential.update.mockResolvedValueOnce(null);

            await service.updateCredential(oauthCredential);

            expect(prismaService.oAuthCredential.update).toHaveBeenCalledWith({
                where: {
                    id: 1
                },
                data: {
                    accessToken: oauthCredential.access_token,
                    refreshToken: oauthCredential.refresh_token,
                    expiresAt: oauthCredential.expires_at,
                    scopes: ["scope", "here"]
                }
            });
        });
    });

    describe("deleteCredential", () => {
        it("should delete the credential", async () => {
            const userId = randomUUID();
            const oauthCredential: OAuthCredential = {
                id: 1,
                access_token: "updated_i",
                refresh_token: "updated_refresh_token_here",
                expires_at: new Date(),
                scope: "scope here"
            };

            prismaService.oAuthCredential.delete.mockResolvedValueOnce(null);

            await service.deleteCredential(userId, oauthCredential);

            expect(prismaService.oAuthCredential.delete).toHaveBeenCalledWith({
                where: {
                    id: 1,
                    userId
                }
            });
        });
    });
});

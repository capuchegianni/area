import { Test, TestingModule } from "@nestjs/testing";
import { SchedulerService } from "./scheduler.service";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { AreaService } from "src/area/area.service";
import { OAuthService } from "src/oauth/oauth.service";
import { OAuthDBService } from "src/oauth/oauth-db.service";
import { OAuthProvidersService } from "src/oauth/oauth-providers.service";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { AreaTask } from "src/area/interfaces/area.interface";
import { YOUTUBE_ACTIONS } from "src/area/services/youtube/youtube.actions";
import { OAuthCredential } from "src/oauth/oauth.interface";
import { AreaStatus } from "@prisma/client";
import { GMAIL_REACTIONS } from "src/area/services/gmail/gmail.reactions";

describe("SchedulerService", () => {
    const oauthProvidersService: Partial<OAuthProvidersService> = {
        google: {
            OAUTH_AUTHORIZATION_URL:
                "https://accounts.google.com/o/oauth2/v2/auth",
            OAUTH_TOKEN_URL: "https://oauth2.googleapis.com/token",
            OAUTH_REVOKE_URL: "https://oauth2.googleapis.com/revoke",
            CLIENT_ID: "GOOGLE_CLIENT_ID",
            CLIENT_SECRET: "GOOGLE_CLIENT_SECRET"
        },
        discord: {
            OAUTH_AUTHORIZATION_URL: "https://discord.com/oauth2/authorize",
            OAUTH_TOKEN_URL: "https://discord.com/api/oauth2/token",
            OAUTH_REVOKE_URL: "https://discord.com/api/oauth2/token/revoke",
            CLIENT_ID: "DISCORD_CLIENT_ID",
            CLIENT_SECRET: "DISCORD_CLIENT_SECRET"
        },
        twitch: {
            OAUTH_AUTHORIZATION_URL: "https://id.twitch.tv/oauth2/authorize",
            OAUTH_TOKEN_URL: "https://id.twitch.tv/oauth2/token",
            OAUTH_REVOKE_URL: "https://id.twitch.tv/oauth2/revoke",
            CLIENT_ID: "DISCORD_CLIENT_ID",
            CLIENT_SECRET: "DISCORD_CLIENT_SECRET"
        }
    };
    let service: SchedulerService;
    let cache: DeepMockProxy<Cache>;
    let areaService: DeepMockProxy<AreaService>;
    let oauthService: DeepMockProxy<OAuthService>;
    let oauthDbService: DeepMockProxy<OAuthDBService>;

    beforeEach(async () => {
        cache = mockDeep<Cache>();
        areaService = mockDeep<AreaService>();
        oauthService = mockDeep<OAuthService>();
        oauthDbService = mockDeep<OAuthDBService>();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SchedulerService,
                {
                    provide: CACHE_MANAGER,
                    useValue: cache
                },
                { provide: AreaService, useValue: areaService },
                { provide: OAuthService, useValue: oauthService },
                { provide: OAuthDBService, useValue: oauthDbService },
                {
                    provide: OAuthProvidersService,
                    useValue: oauthProvidersService
                }
            ]
        }).compile();

        service = module.get<SchedulerService>(SchedulerService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("onModuleInit", () => {
        it("should reset the cache", async () => {
            cache.reset.mockResolvedValue();

            await service.onModuleInit();

            expect(cache.reset).toHaveBeenCalledTimes(1);
        });
    });

    describe("onModuleDestroy", () => {
        it("should reset the cache", async () => {
            cache.reset.mockResolvedValue();

            await service.onModuleDestroy();

            expect(cache.reset).toHaveBeenCalledTimes(1);
        });
    });

    describe("postData", () => {
        it("should post data to the reaction endpoint", async () => {
            const task: AreaTask = {
                action: {
                    service: "youtube",
                    method: "on_liked_video",
                    config: YOUTUBE_ACTIONS["on_liked_video"]
                },
                reaction: {
                    service: "gmail",
                    method: "send_mail",
                    config: GMAIL_REACTIONS["send_mail"]
                },
                actionMetadata: {},
                actionOAuthId: 1,
                reactionOAuthId: 2,
                areaId: "area-id",
                delay: 10,
                name: "name",
                reactionBody: {},
                userId: "user-id"
            };

            const transformedData = {};

            oauthDbService.loadCredentialsByScopes.mockResolvedValueOnce([
                {
                    access_token: "access_token_here",
                    refresh_token: "refresh_token_here",
                    expires_at: new Date(Date.now() + 1000000000),
                    scope: "https://www.googleapis.com/auth/youtube.readonly",
                    id: 1
                }
            ]);

            const produce = jest.spyOn(task.reaction.config, "produce");

            produce.mockResolvedValueOnce();

            const posted = await service.postData(task, transformedData);

            expect(produce).toHaveBeenCalledWith(
                "access_token_here",
                transformedData
            );

            expect(posted).toBe(true);
        });

        it("should post data to the reaction endpoint and refresh the oauth credentials", async () => {
            const task: AreaTask = {
                action: {
                    service: "youtube",
                    method: "on_liked_video",
                    config: YOUTUBE_ACTIONS["on_liked_video"]
                },
                reaction: {
                    service: "gmail",
                    method: "send_mail",
                    config: GMAIL_REACTIONS["send_mail"]
                },
                actionMetadata: {},
                actionOAuthId: 1,
                reactionOAuthId: 2,
                areaId: "area-id",
                delay: 10,
                name: "name",
                reactionBody: {},
                userId: "user-id"
            };

            const transformedData = {};

            const produce = jest.spyOn(task.reaction.config, "produce");

            oauthDbService.loadCredentialsByScopes.mockResolvedValueOnce([
                {
                    access_token: "access_token_here",
                    refresh_token: "refresh_token_here",
                    expires_at: new Date(Date.now() + 100000000),
                    scope: "scope here",
                    id: 1
                }
            ]);

            produce.mockResolvedValueOnce();

            const posted = await service.postData(task, transformedData);

            expect(produce).toHaveBeenCalledWith(
                "access_token_here",
                transformedData
            );

            expect(oauthDbService.loadCredentialsByScopes).toHaveBeenCalledWith(
                "user-id",
                GMAIL_REACTIONS["send_mail"]["oauthScopes"],
                oauthProvidersService.google.OAUTH_TOKEN_URL,
                oauthProvidersService.google.OAUTH_REVOKE_URL
            );

            expect(posted).toBe(true);
        });

        it("should produce an error when posting the data", async () => {
            const task: AreaTask = {
                action: {
                    service: "youtube",
                    method: "on_liked_video",
                    config: YOUTUBE_ACTIONS["on_liked_video"]
                },
                reaction: {
                    service: "gmail",
                    method: "send_mail",
                    config: GMAIL_REACTIONS["send_mail"]
                },
                actionMetadata: {},
                actionOAuthId: 1,
                reactionOAuthId: 2,
                areaId: "area-id",
                delay: 10,
                name: "name",
                reactionBody: {},
                userId: "user-id"
            };

            const transformedData = {};

            const produce = jest.spyOn(task.reaction.config, "produce");

            produce.mockRejectedValueOnce(null);

            oauthDbService.loadCredentialsByScopes.mockResolvedValueOnce([
                {
                    access_token: "access_token_here",
                    refresh_token: "refresh_token_here",
                    expires_at: new Date(Date.now() + 1000000),
                    scope: YOUTUBE_ACTIONS["on_liked_video"][
                        "oauthScopes"
                    ].join(" "),
                    id: 1
                }
            ]);

            const posted = await service.postData(task, transformedData);

            expect(produce).toHaveBeenCalledWith(
                "access_token_here",
                transformedData
            );

            expect(oauthDbService.loadCredentialsByScopes).toHaveBeenCalledWith(
                "user-id",
                GMAIL_REACTIONS["send_mail"]["oauthScopes"],
                oauthProvidersService.google.OAUTH_TOKEN_URL,
                oauthProvidersService.google.OAUTH_REVOKE_URL
            );

            expect(posted).toBe(false);
        });
    });

    describe("execute", () => {
        it("should execute a task without issue", async () => {
            const userId = "user-id";
            const task: AreaTask = {
                action: {
                    service: "youtube",
                    method: "on_liked_video",
                    config: YOUTUBE_ACTIONS["on_liked_video"]
                },
                reaction: {
                    service: "gmail",
                    method: "send_mail",
                    config: GMAIL_REACTIONS["send_mail"]
                },
                actionMetadata: {},
                actionOAuthId: 1,
                reactionOAuthId: 2,
                areaId: "area-id",
                delay: 10,
                name: "name",
                reactionBody: {},
                userId: "user-id"
            };
            const consoleLog = jest.spyOn(console, "log");
            consoleLog.mockReturnValue();
            const getResourceTrigger = jest.spyOn(
                task.action.config,
                "trigger"
            );
            getResourceTrigger.mockResolvedValueOnce({
                data: {} as any,
                cacheValue: "video-id"
            });
            const credential: OAuthCredential = {
                access_token: "access_token_here",
                refresh_token: "refresh_token_here",
                expires_at: new Date(Date.now() + 1000000000),
                scope: "https://www.googleapis.com/auth/youtube.readonly",
                id: 1
            };
            oauthDbService.loadCredentialsByScopes.mockResolvedValue([
                credential
            ]);
            const produce = jest.spyOn(task.reaction.config, "produce");
            produce.mockResolvedValueOnce();
            cache.get.mockResolvedValueOnce('"string"');
            const executed = await service.executeTask(task);
            expect(cache.get).toHaveBeenCalledWith(task.name);
            expect(consoleLog).toHaveBeenCalled();
            consoleLog.mockClear();
            expect(oauthDbService.loadCredentialsByScopes).toHaveBeenCalledWith(
                userId,
                ["https://www.googleapis.com/auth/youtube.readonly"],
                oauthProvidersService.google.OAUTH_TOKEN_URL,
                oauthProvidersService.google.OAUTH_REVOKE_URL
            );
            expect(oauthDbService.loadCredentialsByScopes).toHaveBeenCalledWith(
                userId,
                ["https://www.googleapis.com/auth/gmail.send"],
                oauthProvidersService.google.OAUTH_TOKEN_URL,
                oauthProvidersService.google.OAUTH_REVOKE_URL
            );
            expect(getResourceTrigger).toHaveBeenCalledWith(
                "access_token_here",
                {},
                "string"
            );
            expect(produce).toHaveBeenCalledWith("access_token_here", {});
            expect(executed).toBe(true);
            oauthDbService.loadCredentialsByScopes.mockClear();
        });
        it("should execute a task but requires to refresh the access token", async () => {
            const userId = "user-id";
            const task: AreaTask = {
                action: {
                    service: "youtube",
                    method: "on_liked_video",
                    config: YOUTUBE_ACTIONS["on_liked_video"]
                },
                reaction: {
                    service: "gmail",
                    method: "send_mail",
                    config: GMAIL_REACTIONS["send_mail"]
                },
                actionMetadata: {},
                actionOAuthId: 1,
                reactionOAuthId: 2,
                areaId: "area-id",
                delay: 10,
                name: "name",
                reactionBody: {},
                userId: "user-id"
            };
            const consoleLog = jest.spyOn(console, "log");
            consoleLog.mockReturnValue();
            const getResourceTrigger = jest.spyOn(
                task.action.config,
                "trigger"
            );
            getResourceTrigger.mockResolvedValueOnce({
                data: {} as any,
                cacheValue: "video-id"
            });
            const credential: OAuthCredential = {
                access_token: "access_token_here",
                refresh_token: "refresh_token_here",
                expires_at: new Date(Date.now() - 1000000000),
                scope: "https://www.googleapis.com/auth/youtube.readonly",
                id: 1
            };
            const refreshedCredential: OAuthCredential = {
                ...credential,
                access_token: "refreshed_access_token_here",
                refresh_token: "refreshed_refresh_token_here",
                expires_at: new Date(Date.now() + 1000000000)
            };
            oauthService.refresh.mockResolvedValue(refreshedCredential);

            oauthDbService.loadCredentialsByScopes.mockResolvedValue([
                credential
            ]);
            const produce = jest.spyOn(task.reaction.config, "produce");
            produce.mockResolvedValueOnce();
            cache.get.mockResolvedValueOnce('"string"');
            const executed = await service.executeTask(task);
            expect(cache.get).toHaveBeenCalledWith(task.name);
            expect(consoleLog).toHaveBeenCalled();
            consoleLog.mockClear();
            expect(oauthService.refresh).toHaveBeenCalledWith(
                oauthProvidersService.google,
                credential
            );
            expect(oauthService.refresh).toHaveBeenCalledTimes(2);
            expect(oauthDbService.loadCredentialsByScopes).toHaveBeenCalledWith(
                userId,
                ["https://www.googleapis.com/auth/youtube.readonly"],
                oauthProvidersService.google.OAUTH_TOKEN_URL,
                oauthProvidersService.google.OAUTH_REVOKE_URL
            );
            expect(oauthDbService.loadCredentialsByScopes).toHaveBeenCalledWith(
                userId,
                ["https://www.googleapis.com/auth/gmail.send"],
                oauthProvidersService.google.OAUTH_TOKEN_URL,
                oauthProvidersService.google.OAUTH_REVOKE_URL
            );
            expect(getResourceTrigger).toHaveBeenCalledWith(
                "access_token_here",
                {},
                "string"
            );
            expect(produce).toHaveBeenCalledWith("access_token_here", {});
            expect(executed).toBe(true);
            oauthDbService.loadCredentialsByScopes.mockClear();
            oauthService.refresh.mockClear();
        });
        it("should not be able to retrieve the oauth credential in getServiceAuth", async () => {
            const userId = "user-id";
            const task: AreaTask = {
                action: {
                    service: "youtube",
                    method: "on_liked_video",
                    config: YOUTUBE_ACTIONS["on_liked_video"]
                },
                reaction: {
                    service: "gmail",
                    method: "send_mail",
                    config: GMAIL_REACTIONS["send_mail"]
                },
                actionMetadata: {},
                actionOAuthId: 1,
                reactionOAuthId: 2,
                areaId: "area-id",
                delay: 10,
                name: "name",
                reactionBody: {},
                userId: "user-id"
            };
            const consoleLog = jest.spyOn(console, "log");
            consoleLog.mockReturnValue();
            const getResourceTrigger = jest.spyOn(
                task.action.config,
                "trigger"
            );
            getResourceTrigger.mockResolvedValueOnce({
                data: {} as any,
                cacheValue: "video-id"
            });

            cache.get.mockResolvedValueOnce('"string"');
            oauthDbService.loadCredentialsByScopes.mockResolvedValueOnce([]);
            const produce = jest.spyOn(task.reaction.config, "produce");
            produce.mockResolvedValueOnce();
            const executed = await service.executeTask(task);
            expect(cache.get).toHaveBeenCalledWith(task.name);
            expect(consoleLog).toHaveBeenCalled();
            consoleLog.mockClear();
            expect(oauthDbService.loadCredentialsByScopes).toHaveBeenCalledWith(
                userId,
                ["https://www.googleapis.com/auth/youtube.readonly"],
                oauthProvidersService.google.OAUTH_TOKEN_URL,
                oauthProvidersService.google.OAUTH_REVOKE_URL
            );
            expect(getResourceTrigger).toHaveBeenCalledWith(
                "access_token_here",
                {},
                "string"
            );
            expect(executed).toBe(false);
            expect(produce).toHaveBeenCalledWith("access_token_here", {});
        });
    });
    describe("startPolling", () => {
        it("should set the area status to ERROR", async () => {
            const task: AreaTask = {
                action: {
                    service: "youtube",
                    method: "on_liked_video",
                    config: YOUTUBE_ACTIONS["on_liked_video"]
                },
                reaction: {
                    service: "gmail",
                    method: "send_mail",
                    config: GMAIL_REACTIONS["send_mail"]
                },
                actionMetadata: {},
                actionOAuthId: 1,
                reactionOAuthId: 2,
                areaId: "area-id",
                delay: 10,
                name: "name",
                reactionBody: {},
                userId: "user-id"
            };

            const executeTask = jest.spyOn(service, "executeTask");

            executeTask.mockResolvedValueOnce(false);

            areaService.update.mockResolvedValueOnce(null);

            await service.startPolling(task);

            expect(executeTask).toHaveBeenCalledWith(task);

            expect(areaService.update).toHaveBeenCalledWith(
                task.userId,
                task.areaId,
                { status: AreaStatus.ERROR }
            );
        });
        it("should schedule the task", async () => {
            const task: AreaTask = {
                action: {
                    service: "youtube",
                    method: "on_liked_video",
                    config: YOUTUBE_ACTIONS["on_liked_video"]
                },
                reaction: {
                    service: "gmail",
                    method: "send_mail",
                    config: GMAIL_REACTIONS["send_mail"]
                },
                actionMetadata: {},
                actionOAuthId: 1,
                reactionOAuthId: 2,
                areaId: "area-id",
                delay: 10,
                name: "name",
                reactionBody: {},
                userId: "user-id"
            };

            const executeTask = jest.spyOn(service, "executeTask");

            executeTask.mockResolvedValueOnce(true);

            const scheduleTask = jest.spyOn(service, "scheduleTask");

            scheduleTask.mockReturnValueOnce();

            areaService.update.mockResolvedValueOnce(null);

            await service.startPolling(task);

            expect(scheduleTask).toHaveBeenCalledWith(task);

            expect(executeTask).toHaveBeenCalledWith(task);

            expect(areaService.update).not.toHaveBeenCalled();
        });
    });
});

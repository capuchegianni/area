import { Test, TestingModule } from "@nestjs/testing";
import { SchedulerService } from "./scheduler.service";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { AreaService } from "src/area/area.service";
import { OAuthService } from "src/oauth/oauth.service";
import { OAuthDBService } from "src/oauth/oauth-db.service";
import {
    OAuthProvider,
    OAuthProvidersService
} from "src/oauth/oauth-providers.service";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { AreaTask } from "src/area/interfaces/area.interface";
import { YOUTUBE_ACTIONS } from "src/area/services/youtube/youtube.actions";
import { DISCORD_REACTIONS } from "src/area/services/discord/discord.reactions";
import { OAuthCredential } from "src/oauth/oauth.interface";
import axios from "axios";

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
                    service: "discord",
                    method: "send_embed",
                    config: DISCORD_REACTIONS["send_embed"]
                },
                actionAuth: { apiKey: null, webhook: null, oauth: 1 },
                reactionAuth: {
                    apiKey: null,
                    webhook: "https://...",
                    oauth: null
                },
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

            // areaService.getAreaTask.mockResolvedValueOnce(task);

            const posted = await service.postData(task, transformedData);

            expect(posted).toBe(true);

            expect(produce).toHaveBeenCalledWith(
                { webhook: "https://..." },
                transformedData
            );
        });

        it("should post data to the reaction endpoint and refresh the oauth credentials", async () => {
            const task: AreaTask = {
                action: {
                    service: "youtube",
                    method: "on_liked_video",
                    config: YOUTUBE_ACTIONS["on_liked_video"]
                },
                reaction: {
                    service: "discord",
                    method: "send_embed",
                    config: DISCORD_REACTIONS["send_embed"]
                },
                actionAuth: { apiKey: null, webhook: null, oauth: 1 },
                reactionAuth: {
                    apiKey: null,
                    webhook: "https://...",
                    oauth: null
                },
                areaId: "area-id",
                delay: 10,
                name: "name",
                reactionBody: {},
                userId: "user-id"
            };

            const transformedData = {};

            // const credential: OAuthCredential = {
            //     access_token: "access_token_here",
            //     refresh_token: "refresh_token_here",
            //     expires_at: new Date(Date.now() - 1000000000),
            //     scope: "https://www.googleapis.com/auth/youtube.readonly",
            //     id: 1
            // };

            // oauthDbService.loadCredentialsByScopes.mockResolvedValueOnce([
            //     credential
            // ]);

            const produce = jest.spyOn(task.reaction.config, "produce");

            produce.mockResolvedValueOnce();

            // const refreshedCredential: OAuthCredential = {
            //     ...credential,
            //     access_token: "refreshed_access_token_here",
            //     refresh_token: "refreshed_refresh_token_here",
            //     expires_at: new Date(Date.now() + 1000000000)
            // };

            // oauthService.refresh.mockResolvedValueOnce(refreshedCredential);

            // areaService.getAreaTask.mockResolvedValueOnce(task);

            const posted = await service.postData(task, transformedData);

            expect(produce).toHaveBeenCalledWith(
                { webhook: "https://..." },
                transformedData
            );

            expect(posted).toBe(true);

            // expect(oauthService.refresh).toHaveBeenCalledWith(
            //     provider,
            //     credential
            // );

            // expect(oauthDbService.updateCredential).toHaveBeenCalledWith(
            //     refreshedCredential
            // );
        });

        it("should produce an error when posting the data", async () => {
            const task: AreaTask = {
                action: {
                    service: "youtube",
                    method: "on_liked_video",
                    config: YOUTUBE_ACTIONS["on_liked_video"]
                },
                reaction: {
                    service: "discord",
                    method: "send_embed",
                    config: DISCORD_REACTIONS["send_embed"]
                },
                actionAuth: { apiKey: null, webhook: null, oauth: 1 },
                reactionAuth: {
                    apiKey: null,
                    webhook: "https://...",
                    oauth: null
                },
                areaId: "area-id",
                delay: 10,
                name: "name",
                reactionBody: {},
                userId: "user-id"
            };

            const transformedData = {};

            const produce = jest.spyOn(task.reaction.config, "produce");

            produce.mockRejectedValueOnce(null);

            const posted = await service.postData(task, transformedData);

            expect(produce).toHaveBeenCalledWith(
                { webhook: "https://..." },
                transformedData
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
                    service: "discord",
                    method: "send_embed",
                    config: DISCORD_REACTIONS["send_embed"]
                },
                actionAuth: { apiKey: null, webhook: null, oauth: 1 },
                reactionAuth: {
                    apiKey: null,
                    webhook: "https://...",
                    oauth: null
                },
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

            // const refreshedCredential: OAuthCredential = {
            //     ...credential,
            //     access_token: "refreshed_access_token_here",
            //     refresh_token: "refreshed_refresh_token_here",
            //     expires_at: new Date(Date.now() + 1000000000)
            // };

            // oauthService.refresh.mockResolvedValueOnce(refreshedCredential);

            // areaService.getAreaTask.mockResolvedValueOnce(task);

            const credential: OAuthCredential = {
                access_token: "access_token_here",
                refresh_token: "refresh_token_here",
                expires_at: new Date(Date.now() + 1000000000),
                scope: "https://www.googleapis.com/auth/youtube.readonly",
                id: 1
            };

            oauthDbService.loadCredentialsByScopes.mockResolvedValueOnce([
                credential
            ]);

            const axiosPost = jest.spyOn(axios, "post");

            axiosPost.mockResolvedValueOnce(null);

            const executed = await service.executeTask(task);

            expect(consoleLog).toHaveBeenCalled();

            consoleLog.mockClear();

            expect(oauthDbService.loadCredentialsByScopes).toHaveBeenCalledWith(
                userId,
                ["https://www.googleapis.com/auth/youtube.readonly"],
                oauthProvidersService.google.OAUTH_TOKEN_URL,
                oauthProvidersService.google.OAUTH_REVOKE_URL
            );

            expect(getResourceTrigger).toHaveBeenCalledWith({
                oauth: credential.access_token
            });

            expect(executed).toBe(true);

            expect(axiosPost).toHaveBeenCalledTimes(1);
        });
    });
});

import { Test, TestingModule } from "@nestjs/testing";
import { WebhookService } from "./webhook.service";
import { PrismaService } from "src/prisma/prisma.service";
import { AreaService } from "src/area/area.service";
import { SchedulerService } from "src/scheduler/scheduler.service";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { AreaStatus, PrismaClient } from "@prisma/client";
import { NotFoundException } from "@nestjs/common";
import { YOUTUBE_ACTIONS } from "src/area/services/youtube/youtube.actions";
import { DISCORD_REACTIONS } from "src/area/services/discord/discord.reactions";

describe("WebhookService", () => {
    let service: WebhookService;
    let prismaService: DeepMockProxy<PrismaClient>;
    let areaService: DeepMockProxy<AreaService>;
    let schedulerService: DeepMockProxy<SchedulerService>;

    beforeEach(async () => {
        prismaService = mockDeep<PrismaClient>();
        areaService = mockDeep<AreaService>();
        schedulerService = mockDeep<SchedulerService>();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WebhookService,
                { provide: PrismaService, useValue: prismaService },
                {
                    provide: AreaService,
                    useValue: areaService
                },
                { provide: SchedulerService, useValue: schedulerService }
            ]
        }).compile();

        service = module.get<WebhookService>(WebhookService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("findUnique", () => {
        it("should retrieve an AREA", async () => {
            prismaService.area.findUnique.mockResolvedValueOnce({
                id: "area-id",
                name: "name",
                description: "description",
                actionId: "youtube.on_liked_video",
                reactionId: "discord.send_embed",
                status: AreaStatus.RUNNING
            } as any);

            const area = await service.findUnique("area-id");

            expect(prismaService.area.findUnique).toHaveBeenCalledWith({
                where: {
                    id: "area-id",
                    actionAuth: {
                        apiKey: null,
                        oauth: null
                    }
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    actionId: true,
                    reactionId: true,
                    status: true
                }
            });

            expect(area).toStrictEqual({
                id: "area-id",
                name: "name",
                description: "description",
                actionId: "youtube.on_liked_video",
                reactionId: "discord.send_embed",
                status: AreaStatus.RUNNING
            });
        });

        it("should throw a NotFoundException", async () => {
            prismaService.area.findUnique.mockResolvedValueOnce(null);

            try {
                await service.findUnique("area-id");
                fail("This should throw an error.");
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundException);
            }

            expect(prismaService.area.findUnique).toHaveBeenCalledWith({
                where: {
                    id: "area-id",
                    actionAuth: {
                        apiKey: null,
                        oauth: null
                    }
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    actionId: true,
                    reactionId: true,
                    status: true
                }
            });
        });
    });

    describe("execute", () => {
        it("should execute a webhook", async () => {
            const area = {
                id: "area-id",
                name: "name",
                description: "description",
                actionId: "youtube.on_liked_video",
                actionAuthId: 1,
                reactionId: "discord.send_embed",
                reactionBody: {},
                reactionAuthId: 2,
                status: AreaStatus.RUNNING,
                delay: 0,
                userId: "user-id"
            };

            prismaService.area.findUnique.mockResolvedValueOnce(area as any);

            const getAreaTask = jest.spyOn(areaService, "getAreaTask");

            const task = {
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
                actionAuth: { apiKey: null, oauth: null, webhook: "local" },
                reactionAuth: {
                    apiKey: null,
                    oauth: null,
                    webhook: "https://..."
                },
                areaId: area.id,
                delay: area.delay,
                name: area.name,
                reactionBody: area.reactionBody,
                userId: area.userId
            };

            getAreaTask.mockResolvedValueOnce(task);

            const postData = jest.spyOn(schedulerService, "postData");

            postData.mockResolvedValueOnce(true);

            await service.execute("area-id", {} as any);

            expect(postData).toHaveBeenCalledWith(task, {});

            expect(getAreaTask).toHaveBeenCalledWith(area);

            expect(prismaService.area.findUnique).toHaveBeenCalledWith({
                where: {
                    id: "area-id",
                    status: AreaStatus.RUNNING
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    actionId: true,
                    actionAuthId: true,
                    reactionId: true,
                    reactionBody: true,
                    reactionAuthId: true,
                    delay: true,
                    status: true,
                    userId: true
                }
            });

            expect(area).toStrictEqual({
                id: "area-id",
                name: "name",
                description: "description",
                actionId: "youtube.on_liked_video",
                actionAuthId: 1,
                reactionId: "discord.send_embed",
                reactionAuthId: 2,
                reactionBody: {},
                delay: 0,
                userId: "user-id",
                status: AreaStatus.RUNNING
            });
        });
        it("should execute a webhook but update it to ERROR", async () => {
            const area = {
                id: "area-id",
                name: "name",
                description: "description",
                actionId: "youtube.on_liked_video",
                actionAuthId: 1,
                reactionId: "discord.send_embed",
                reactionBody: {},
                reactionAuthId: 2,
                status: AreaStatus.RUNNING,
                delay: 0,
                userId: "user-id"
            };

            prismaService.area.findUnique.mockResolvedValueOnce(area as any);

            const getAreaTask = jest.spyOn(areaService, "getAreaTask");

            const task = {
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
                actionAuth: { apiKey: null, oauth: null, webhook: "local" },
                reactionAuth: {
                    apiKey: null,
                    oauth: null,
                    webhook: "https://..."
                },
                areaId: area.id,
                delay: area.delay,
                name: area.name,
                reactionBody: area.reactionBody,
                userId: area.userId
            };

            getAreaTask.mockResolvedValueOnce(task);

            const postData = jest.spyOn(schedulerService, "postData");

            const areaUpdate = jest.spyOn(areaService, "update");

            areaUpdate.mockResolvedValueOnce(null);

            postData.mockResolvedValueOnce(false);

            await service.execute("area-id", {} as any);

            expect(postData).toHaveBeenCalledWith(task, {});

            expect(areaUpdate).toHaveBeenCalledWith(area.userId, area.id, {
                status: AreaStatus.ERROR
            });

            expect(getAreaTask).toHaveBeenCalledWith(area);

            expect(prismaService.area.findUnique).toHaveBeenCalledWith({
                where: {
                    id: "area-id",
                    status: AreaStatus.RUNNING
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    actionId: true,
                    actionAuthId: true,
                    reactionId: true,
                    reactionBody: true,
                    reactionAuthId: true,
                    delay: true,
                    status: true,
                    userId: true
                }
            });

            expect(area).toStrictEqual({
                id: "area-id",
                name: "name",
                description: "description",
                actionId: "youtube.on_liked_video",
                actionAuthId: 1,
                reactionId: "discord.send_embed",
                reactionAuthId: 2,
                reactionBody: {},
                delay: 0,
                userId: "user-id",
                status: AreaStatus.RUNNING
            });
        });
        it("should throw a NotFoundException", async () => {
            prismaService.area.findUnique.mockResolvedValueOnce(null);

            const postData = jest.spyOn(schedulerService, "postData");

            postData.mockResolvedValueOnce(false);

            try {
                await service.execute("area-id", {} as any);
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundException);
            }

            expect(postData).not.toHaveBeenCalled();

            expect(prismaService.area.findUnique).toHaveBeenCalledWith({
                where: {
                    id: "area-id",
                    status: AreaStatus.RUNNING
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    actionId: true,
                    actionAuthId: true,
                    reactionId: true,
                    reactionBody: true,
                    reactionAuthId: true,
                    delay: true,
                    status: true,
                    userId: true
                }
            });
        });
    });
});

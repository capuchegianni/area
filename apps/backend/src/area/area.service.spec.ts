import { Test, TestingModule } from "@nestjs/testing";
import { AreaService } from "./area.service";
import { SchedulerService } from "src/scheduler/scheduler.service";
import { PrismaService } from "src/prisma/prisma.service";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { Area as PrismaArea, AreaStatus, PrismaClient } from "@prisma/client";
import { YOUTUBE_ACTIONS } from "./services/youtube/youtube.actions";
import { DISCORD_REACTIONS } from "./services/discord/discord.reactions";
import { NotFoundException } from "@nestjs/common";
import { AreaTask } from "./interfaces/area.interface";

describe("AreaService", () => {
    let service: AreaService;
    let prismaService: DeepMockProxy<PrismaClient>;
    let schedulerService: DeepMockProxy<SchedulerService>;

    beforeEach(async () => {
        prismaService = mockDeep<PrismaClient>();
        schedulerService = mockDeep<SchedulerService>();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AreaService,
                { provide: PrismaService, useValue: prismaService },
                { provide: SchedulerService, useValue: schedulerService }
            ]
        }).compile();

        service = module.get<AreaService>(AreaService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("getAreaConfig", () => {
        it("should return action and reaction based on registered services", () => {
            const actionId = "youtube.on_liked_video";
            const reactionId = "discord.send_embed";

            const action = service.getAreaConfig(actionId, "action");
            expect(action.config).toStrictEqual(
                YOUTUBE_ACTIONS["on_liked_video"]
            );

            const reaction = service.getAreaConfig(reactionId, "reaction");
            expect(reaction.config).toStrictEqual(
                DISCORD_REACTIONS["send_embed"]
            );
        });
        it("should throw an error for unknowned action or reaction", () => {
            try {
                service.getAreaConfig("bad-action-id", "action");
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundException);
            }

            try {
                service.getAreaConfig("bad-reaction-id", "reaction");
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundException);
            }
        });
        it("should action or reaction is found, but not the method", () => {
            try {
                service.getAreaConfig("youtube.invalid-method", "action");
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundException);
            }

            try {
                service.getAreaConfig("discord.invalid-method", "reaction");
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundException);
            }
        });
    });

    describe("findMany", () => {
        it("should find all the areas", async () => {
            const areas = [
                {
                    id: "areaId",
                    name: "areaName",
                    description: "areaDescription",
                    actionId: "actionId",
                    actionAuthId: 1,
                    reactionId: "reactionId",
                    reactionBody: {},
                    reactionAuthId: 2,
                    delay: 10,
                    status: AreaStatus.STOPPED,
                    userId: "user-id"
                }
            ];

            const transformedAreas = [
                {
                    id: "areaId",
                    name: "areaName",
                    description: "areaDescription",
                    action_id: "actionId",
                    action_auth_id: 1,
                    reaction_id: "reactionId",
                    reaction_body: {},
                    reaction_auth_id: 2,
                    delay: 10,
                    status: AreaStatus.STOPPED
                }
            ];

            prismaService.area.findMany.mockResolvedValueOnce(areas);

            const areasResult = await service.findMany("user-id");

            expect(prismaService.area.findMany).toHaveBeenCalledWith({
                where: {
                    userId: "user-id"
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
                    status: true
                }
            });

            expect(areasResult).toStrictEqual(transformedAreas);
        });
    });

    describe("findUnique", () => {
        it("should find an area based on it's ID and the userId", async () => {
            const areas = {
                id: "areaId",
                name: "areaName",
                description: "areaDescription",
                actionId: "actionId",
                actionAuthId: 1,
                reactionId: "reactionId",
                reactionBody: {},
                reactionAuthId: 2,
                delay: 10,
                status: AreaStatus.STOPPED,
                userId: "user-id"
            };

            const transformedAreas = {
                id: "areaId",
                name: "areaName",
                description: "areaDescription",
                action_id: "actionId",
                action_auth_id: 1,
                reaction_id: "reactionId",
                reaction_body: {},
                reaction_auth_id: 2,
                delay: 10,
                status: AreaStatus.STOPPED
            };

            prismaService.area.findUnique.mockResolvedValueOnce(areas);

            const areasResult = await service.findUnique("user-id", "areaId");

            expect(prismaService.area.findUnique).toHaveBeenCalledWith({
                where: {
                    id: "areaId",
                    userId: "user-id"
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

            expect(areasResult).toStrictEqual(transformedAreas);
        });
        it("should throw a NotFoundException", async () => {
            prismaService.area.findUnique.mockResolvedValueOnce(null);

            try {
                await service.findUnique("user-id", "areaId");
                fail("This should throw an error");
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundException);
            }

            expect(prismaService.area.findUnique).toHaveBeenCalledWith({
                where: {
                    id: "areaId",
                    userId: "user-id"
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

    describe("getAreaTask", () => {
        it("should return the area task", async () => {
            const area: PrismaArea = {
                id: "area-id",
                actionAuthId: 1,
                actionId: "youtube.on_liked_video",
                reactionAuthId: 2,
                reactionId: "discord.send_embed",
                delay: 10,
                description: "description",
                name: "area-id|youtube.on_liked_video|discord.send_embed",
                reactionBody: {},
                status: AreaStatus.RUNNING,
                userId: "user-id"
            };

            prismaService.areaServiceAuthentication.findUnique.mockResolvedValue(
                { apiKey: null, oauth: 1, webhook: null } as any
            );

            const areaTask = await service.getAreaTask(area);

            const expectedAreaTask: AreaTask = {
                areaId: "area-id",
                name: "area-id|youtube.on_liked_video|discord.send_embed",
                action: {
                    service: "youtube",
                    method: "on_liked_video",
                    config: YOUTUBE_ACTIONS["on_liked_video"]
                },
                actionAuth: {
                    apiKey: null,
                    oauth: 1,
                    webhook: null
                },
                reaction: {
                    service: "discord",
                    method: "send_embed",
                    config: DISCORD_REACTIONS["send_embed"]
                },
                reactionBody: {},
                reactionAuth: {
                    apiKey: null,
                    oauth: 1,
                    webhook: null
                },
                delay: 10,
                userId: "user-id"
            };

            expect(
                prismaService.areaServiceAuthentication.findUnique
            ).toHaveBeenCalledWith({
                where: {
                    id: area.actionAuthId
                },
                select: {
                    apiKey: true,
                    oauth: true,
                    webhook: true
                }
            });

            expect(
                prismaService.areaServiceAuthentication.findUnique
            ).toHaveBeenCalledWith({
                where: {
                    id: area.reactionAuthId
                },
                select: {
                    apiKey: true,
                    oauth: true,
                    webhook: true
                }
            });

            prismaService.areaServiceAuthentication.findUnique.mockClear();

            expect(areaTask).toStrictEqual(expectedAreaTask);
        });
    });

    describe("schedule", () => {
        it("should schedule an area based on it's ID", async () => {
            const area = {
                id: "areaId",
                name: "areaName",
                description: "areaDescription",
                actionId: "youtube.on_liked_video",
                actionAuthId: 1,
                reactionId: "discord.send_embed",
                reactionBody: {},
                reactionAuthId: 2,
                delay: 10,
                status: AreaStatus.STOPPED,
                userId: "user-id"
            };

            prismaService.area.findUnique.mockResolvedValueOnce(area);

            prismaService.areaServiceAuthentication.findUnique.mockResolvedValue(
                {
                    apiKey: null,
                    oauth: 1,
                    webhook: null
                } as any
            );

            const result = await service.schedule(area.id);

            expect(prismaService.area.findUnique).toHaveBeenCalledWith({
                where: {
                    id: "areaId"
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

        it("should schedule an area based on it's object and ID", async () => {
            const area = {
                id: "areaId",
                name: "areaName",
                description: "areaDescription",
                actionId: "youtube.on_liked_video",
                actionAuthId: 1,
                reactionId: "discord.send_embed",
                reactionBody: {},
                reactionAuthId: 2,
                delay: 10,
                status: AreaStatus.STOPPED,
                userId: "user-id"
            };

            prismaService.area.findUnique.mockResolvedValueOnce(area);

            prismaService.areaServiceAuthentication.findUnique.mockResolvedValue(
                {
                    apiKey: null,
                    oauth: 1,
                    webhook: null
                } as any
            );

            const result = await service.schedule(area.id, area);

            expect(prismaService.area.findUnique).not.toHaveBeenCalled();
        });
    });
});

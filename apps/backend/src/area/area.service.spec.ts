import { Test, TestingModule } from "@nestjs/testing";
import { AreaService } from "./area.service";
import { SchedulerService } from "src/scheduler/scheduler.service";
import { PrismaService } from "src/prisma/prisma.service";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { Area as PrismaArea, AreaStatus, PrismaClient } from "@prisma/client";
import { YOUTUBE_ACTIONS } from "./services/youtube/youtube.actions";
import { DISCORD_REACTIONS } from "./services/discord/discord.reactions";
import {
    NotFoundException,
    UnprocessableEntityException
} from "@nestjs/common";
import { Area, AreaTask } from "./interfaces/area.interface";
import { CreateAreaDto } from "./dto/createArea.dto";
import { UpdateAreaDto } from "./dto/updateArea.dto";

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

            await service.schedule(area.id);

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

            expect(schedulerService.startPolling).not.toHaveBeenCalled();
        });

        it("should schedule an area based on it's object and ID", async () => {
            const area = {
                id: "area-id",
                name: "areaName",
                description: "areaDescription",
                actionId: "youtube.on_liked_video",
                actionAuthId: 1,
                reactionId: "discord.send_embed",
                reactionBody: {},
                reactionAuthId: 2,
                delay: 10,
                status: AreaStatus.RUNNING,
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

            const areaTask: AreaTask = {
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

            await service.schedule(area.id, area);

            expect(prismaService.area.findUnique).not.toHaveBeenCalled();

            expect(schedulerService.startPolling).toHaveBeenCalledWith(
                areaTask
            );
        });
    });

    describe("create", () => {
        it("should create a new area", async () => {
            const userId = "user-id";
            const createDto: CreateAreaDto = {
                actionAuth: { oauth: 1 },
                reactionAuth: { webhook: "http://..." },
                actionId: "youtube.on_liked_video",
                reactionId: "discord.send_embed",
                delay: 10,
                description: "description",
                name: "name",
                reactionBody: {}
            };

            prismaService.area.create.mockResolvedValueOnce({
                id: "area-id",
                name: "name",
                description: "description",
                actionId: "youtube.on_liked_video",
                actionAuthId: 1,
                reactionId: "discord.send_embed",
                reactionBody: {},
                reactionAuthId: 1,
                delay: 10,
                status: AreaStatus.STOPPED
            } as any);

            const expectedArea: Area = {
                name: createDto.name,
                description: createDto.description,
                action_id: createDto.actionId,
                action_auth_id: 1,
                reaction_id: createDto.reactionId,
                reaction_auth_id: 1,
                reaction_body: createDto.reactionBody,
                delay: createDto.delay,
                status: AreaStatus.STOPPED,
                id: "area-id"
            };

            const area = await service.create("user-id", createDto);

            expect(prismaService.area.create).toHaveBeenCalledWith({
                data: {
                    user: { connect: { id: userId } },
                    name: createDto.name,
                    description: createDto.description,
                    actionId: createDto.actionId,
                    actionAuth: {
                        create: createDto.actionAuth
                    },
                    reactionId: createDto.reactionId,
                    reactionAuth: {
                        create: createDto.reactionAuth
                    },
                    reactionBody: createDto.reactionBody,
                    delay: createDto.delay
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

            expect(area).toStrictEqual(expectedArea);
        });
        it("should throw an UnprocessableEntityException when the auth fields do not match the service's authentication method", async () => {
            const createDto: CreateAreaDto = {
                actionAuth: { oauth: 1 },
                reactionAuth: { oauth: 1 },
                actionId: "youtube.on_liked_video",
                reactionId: "discord.send_embed",
                delay: 10,
                description: "description",
                name: "name",
                reactionBody: {}
            };

            try {
                await service.create("user-id", createDto);
                fail("This should throw an error.");
            } catch (e) {
                expect(e).toBeInstanceOf(UnprocessableEntityException);
            }

            expect(prismaService.area.create).not.toHaveBeenCalled();
        });
    });

    describe("update", () => {
        it("should update an area", async () => {
            const userId = "user-id";
            const areaId = "area-id";
            const updateDto: UpdateAreaDto = {
                status: AreaStatus.RUNNING
            };

            const area = {
                actionId: "youtube.on_liked_video",
                reactionId: "discord.send_embed",
                actionAuth: {
                    id: 1,
                    oauth: 1
                },
                reactionAuth: {
                    id: 2,
                    webhook: "https://"
                }
            };

            const updatedArea = {
                userId: userId,
                id: areaId,
                name: "name",
                description: "description",
                actionId: "youtube.on_liked_video",
                actionAuthId: 1,
                reactionId: "discord.send_embed",
                reactionBody: {},
                reactionAuthId: 1,
                delay: 10,
                status: AreaStatus.RUNNING
            };

            prismaService.area.findUnique.mockResolvedValueOnce(area as any);

            prismaService.area.update.mockResolvedValueOnce(updatedArea);

            const resultUpdatedArea = await service.update(
                userId,
                areaId,
                updateDto
            );

            expect(prismaService.area.findUnique).toHaveBeenCalledWith({
                where: {
                    id: areaId,
                    userId
                },
                select: {
                    actionId: true,
                    reactionId: true,
                    actionAuth: true,
                    reactionAuth: true
                }
            });
            expect(prismaService.area.update).toHaveBeenCalledWith({
                where: {
                    id: areaId
                },
                data: {
                    name: updateDto.name,
                    description: updateDto.description,
                    actionAuth: {
                        update: updateDto.actionAuth
                    },
                    reactionAuth: {
                        update: updateDto.reactionAuth
                    },
                    reactionBody: updateDto.reactionBody,
                    delay: updateDto.delay,
                    status: updateDto.status
                },
                select: {
                    userId: true,
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

            expect(resultUpdatedArea).toStrictEqual({
                id: areaId,
                name: "name",
                description: "description",
                action_id: "youtube.on_liked_video",
                action_auth_id: 1,
                reaction_id: "discord.send_embed",
                reaction_body: {},
                reaction_auth_id: 1,
                delay: 10,
                status: AreaStatus.RUNNING
            });
        });
        it("should throw an UnprocessableEntityException when the auth fields do not match the service's authentication method", async () => {
            const userId = "user-id";
            const areaId = "area-id";
            const updateDto: UpdateAreaDto = {
                status: AreaStatus.RUNNING
            };

            const area = {
                actionId: "youtube.on_liked_video",
                reactionId: "discord.send_embed",
                actionAuth: {
                    id: 1,
                    oauth: 1
                },
                reactionAuth: {
                    id: 2,
                    oauth: 1
                }
            };

            prismaService.area.findUnique.mockResolvedValueOnce(area as any);

            try {
                await service.update(userId, areaId, updateDto);
            } catch (e) {
                expect(e).toBeInstanceOf(UnprocessableEntityException);
            }

            expect(prismaService.area.findUnique).toHaveBeenCalledWith({
                where: {
                    id: areaId,
                    userId
                },
                select: {
                    actionId: true,
                    reactionId: true,
                    actionAuth: true,
                    reactionAuth: true
                }
            });

            expect(prismaService.area.update).not.toHaveBeenCalled();
        });
    });

    describe("delete", () => {
        it("should delete an area", async () => {
            const userId = "user-id";
            const areaId = "area-id";

            const area: PrismaArea = {
                id: areaId,
                userId,
                actionAuthId: 1,
                actionId: "youtube.on_liked_video",
                delay: 10,
                description: "description",
                name: "name",
                reactionAuthId: 1,
                reactionId: "discord.send_embed",
                reactionBody: {},
                status: AreaStatus.STOPPED
            };

            prismaService.areaServiceAuthentication.findUnique.mockResolvedValue(
                { apiKey: null, oauth: 1, webhook: null } as any
            );

            prismaService.area.findUnique.mockResolvedValueOnce(area);

            prismaService.area.delete.mockResolvedValueOnce(null);

            await service.delete(userId, areaId);

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

            expect(schedulerService.stopPolling).toHaveBeenCalledWith(
                `area-id|youtube.on_liked_video|discord.send_embed`
            );

            expect(prismaService.area.delete).toHaveBeenCalledWith({
                where: {
                    userId,
                    id: areaId
                },
                include: {
                    actionAuth: true,
                    reactionAuth: true
                }
            });

            prismaService.areaServiceAuthentication.findUnique.mockClear();
        });
    });
});

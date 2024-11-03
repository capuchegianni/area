import { Test, TestingModule } from "@nestjs/testing";
import { AreaService } from "./area.service";
import { SchedulerService } from "src/scheduler/scheduler.service";
import { PrismaService } from "src/prisma/prisma.service";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { Area as PrismaArea, AreaStatus, PrismaClient } from "@prisma/client";
import { YOUTUBE_ACTIONS } from "./services/youtube/youtube.actions";
import { NotFoundException } from "@nestjs/common";
import { Area, AreaTask } from "./interfaces/area.interface";
import { CreateAreaDto } from "./dto/createArea.dto";
import { UpdateAreaDto } from "./dto/updateArea.dto";
import { GMAIL_REACTIONS } from "./services/gmail/gmail.reactions";

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
            const reactionId = "gmail.send_mail";

            const action = service.getAreaConfig(actionId, "action");
            expect(action.config).toStrictEqual(
                YOUTUBE_ACTIONS["on_liked_video"]
            );

            const reaction = service.getAreaConfig(reactionId, "reaction");
            expect(reaction.config).toStrictEqual(GMAIL_REACTIONS["send_mail"]);
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
            const areas: PrismaArea[] = [
                {
                    id: "areaId",
                    name: "areaName",
                    description: "areaDescription",
                    actionId: "actionId",
                    actionMetadata: {},
                    actionOAuthId: 1,
                    reactionId: "reactionId",
                    reactionBody: {},
                    reactionOAuthId: 2,
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
                    action_oauth_id: 1,
                    reaction_id: "reactionId",
                    reaction_body: {},
                    reaction_oauth_id: 2,
                    action_metadata: {},
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
                    actionMetadata: true,
                    actionOAuthId: true,
                    reactionId: true,
                    reactionBody: true,
                    reactionOAuthId: true,
                    delay: true,
                    status: true
                }
            });

            expect(areasResult).toStrictEqual(transformedAreas);
        });
    });

    describe("findUnique", () => {
        it("should find an area based on it's ID and the userId", async () => {
            const areas: PrismaArea = {
                id: "areaId",
                name: "areaName",
                description: "areaDescription",
                actionId: "actionId",
                actionOAuthId: 1,
                reactionId: "reactionId",
                actionMetadata: {},
                reactionBody: {},
                reactionOAuthId: 2,
                delay: 10,
                status: AreaStatus.STOPPED,
                userId: "user-id"
            };

            const transformedAreas = {
                id: "areaId",
                name: "areaName",
                description: "areaDescription",
                action_id: "actionId",
                action_oauth_id: 1,
                reaction_id: "reactionId",
                reaction_body: {},
                reaction_oauth_id: 2,
                delay: 10,
                action_metadata: {},
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
                    actionMetadata: true,
                    actionOAuthId: true,
                    reactionId: true,
                    reactionBody: true,
                    reactionOAuthId: true,
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
                    actionMetadata: true,
                    actionOAuthId: true,
                    reactionId: true,
                    reactionBody: true,
                    reactionOAuthId: true,
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
                actionOAuthId: 1,
                actionId: "youtube.on_liked_video",
                reactionOAuthId: 2,
                reactionId: "gmail.send_mail",
                delay: 10,
                description: "description",
                actionMetadata: {},
                name: "area-id|youtube.on_liked_video|gmail.send_mail",
                reactionBody: {},
                status: AreaStatus.RUNNING,
                userId: "user-id"
            };

            const areaTask = await service.getAreaTask(area);

            const expectedAreaTask: AreaTask = {
                areaId: "area-id",
                name: "area-id|youtube.on_liked_video|gmail.send_mail",
                action: {
                    service: "youtube",
                    method: "on_liked_video",
                    config: YOUTUBE_ACTIONS["on_liked_video"]
                },
                actionOAuthId: 1,
                actionMetadata: {},
                reaction: {
                    service: "gmail",
                    method: "send_mail",
                    config: GMAIL_REACTIONS["send_mail"]
                },
                reactionBody: {},
                reactionOAuthId: 2,
                delay: 10,
                userId: "user-id"
            };
            expect(areaTask).toStrictEqual(expectedAreaTask);
        });
    });

    describe("schedule", () => {
        it("should schedule an area based on it's ID", async () => {
            const area: PrismaArea = {
                id: "areaId",
                name: "areaName",
                description: "areaDescription",
                actionId: "youtube.on_liked_video",
                actionOAuthId: 1,
                reactionId: "gmail.send_mail",
                reactionBody: {},
                reactionOAuthId: 2,
                actionMetadata: {},
                delay: 10,
                status: AreaStatus.STOPPED,
                userId: "user-id"
            };

            prismaService.area.findUnique.mockResolvedValueOnce(area);

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
                    actionMetadata: true,
                    actionOAuthId: true,
                    reactionId: true,
                    reactionBody: true,
                    reactionOAuthId: true,
                    delay: true,
                    status: true,
                    userId: true
                }
            });

            expect(schedulerService.startPolling).not.toHaveBeenCalled();
        });

        it("should schedule an area based on it's object and ID", async () => {
            const area: PrismaArea = {
                id: "area-id",
                actionMetadata: {},
                name: "areaName",
                description: "areaDescription",
                actionId: "youtube.on_liked_video",
                actionOAuthId: 1,
                reactionId: "gmail.send_mail",
                reactionBody: {},
                reactionOAuthId: 2,
                delay: 10,
                status: AreaStatus.RUNNING,
                userId: "user-id"
            };

            prismaService.area.findUnique.mockResolvedValueOnce(area);

            const areaTask: AreaTask = {
                areaId: "area-id",
                name: "area-id|youtube.on_liked_video|gmail.send_mail",
                action: {
                    service: "youtube",
                    method: "on_liked_video",
                    config: YOUTUBE_ACTIONS["on_liked_video"]
                },
                actionOAuthId: 1,
                actionMetadata: {},
                reaction: {
                    service: "gmail",
                    method: "send_mail",
                    config: GMAIL_REACTIONS["send_mail"]
                },
                reactionBody: {},
                reactionOAuthId: 2,
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
                action_oauth_id: 1,
                reaction_oauth_id: 2,
                action_id: "youtube.on_liked_video",
                reaction_id: "gmail.send_mail",
                delay: 10,
                description: "description",
                name: "name",
                reaction_body: {},
                action_metadata: {}
            };

            prismaService.area.create.mockResolvedValueOnce({
                id: "area-id",
                name: "name",
                description: "description",
                actionId: "youtube.on_liked_video",
                actionOAuthId: 1,
                reactionId: "gmail.send_mail",
                reactionBody: {},
                reactionOAuthId: 2,
                actionMetadata: {},
                delay: 10,
                status: AreaStatus.STOPPED
            } as any);

            const expectedArea: Area = {
                name: createDto.name,
                description: createDto.description,
                action_id: createDto.action_id,
                action_metadata: createDto.action_metadata,
                action_oauth_id: createDto.action_oauth_id,
                reaction_id: createDto.reaction_id,
                reaction_oauth_id: createDto.reaction_oauth_id,
                reaction_body: createDto.reaction_body,
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
                    actionId: createDto.action_id,
                    actionMetadata: createDto.action_metadata,
                    actionOAuth: {
                        connect: { id: createDto.action_oauth_id }
                    },
                    reactionId: createDto.reaction_id,
                    reactionOAuth: {
                        connect: { id: createDto.reaction_oauth_id }
                    },
                    reactionBody: createDto.reaction_body,
                    delay: createDto.delay
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    actionId: true,
                    actionMetadata: true,
                    actionOAuthId: true,
                    reactionId: true,
                    reactionBody: true,
                    reactionOAuthId: true,
                    delay: true,
                    status: true
                }
            });

            expect(area).toStrictEqual(expectedArea);
        });
    });

    describe("update", () => {
        it("should update an area", async () => {
            const userId = "user-id";
            const areaId = "area-id";
            const updateDto: UpdateAreaDto = {
                action_oauth_id: 1,
                reaction_oauth_id: 2,
                delay: 10,
                description: "new description",
                name: "new name",
                reaction_body: {},
                status: AreaStatus.RUNNING
            };

            const area: Partial<PrismaArea> = {
                actionId: "youtube.on_liked_video",
                reactionId: "gmail.send_mail",
                actionOAuthId: 1,
                reactionOAuthId: 2
            };

            const updatedArea: PrismaArea = {
                userId: userId,
                id: areaId,
                name: "new name",
                description: "new description",
                actionId: "youtube.on_liked_video",
                actionOAuthId: 1,
                reactionId: "gmail.send_mail",
                reactionBody: {},
                reactionOAuthId: 2,
                delay: 10,
                status: AreaStatus.RUNNING,
                actionMetadata: {}
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
                    actionOAuth: true,
                    reactionOAuth: true
                }
            });
            expect(prismaService.area.update).toHaveBeenCalledWith({
                where: {
                    id: areaId
                },
                data: {
                    name: updatedArea.name,
                    description: updatedArea.description,
                    actionOAuth: {
                        update: { id: updatedArea.actionOAuthId }
                    },
                    reactionOAuth: {
                        update: { id: updatedArea.reactionOAuthId }
                    },
                    reactionBody: updatedArea.reactionBody,
                    delay: updatedArea.delay,
                    status: updatedArea.status
                },
                select: {
                    name: true,
                    description: true,
                    actionOAuthId: true,
                    actionMetadata: true,
                    reactionBody: true,
                    reactionOAuthId: true,
                    delay: true,
                    status: true
                }
            });

            expect(resultUpdatedArea).toStrictEqual({
                id: areaId,
                name: "new name",
                description: "new description",
                action_id: "youtube.on_liked_video",
                action_oauth_id: 1,
                reaction_id: "gmail.send_mail",
                reaction_body: {},
                reaction_oauth_id: 2,
                delay: 10,
                action_metadata: {},
                status: AreaStatus.RUNNING
            });
        });
    });

    describe("delete", () => {
        it("should delete an area", async () => {
            const userId = "user-id";
            const areaId = "area-id";

            const area: PrismaArea = {
                id: areaId,
                userId,
                actionOAuthId: 1,
                actionId: "youtube.on_liked_video",
                delay: 10,
                description: "description",
                name: "name",
                reactionOAuthId: 1,
                reactionId: "gmail.send_mail",
                reactionBody: {},
                actionMetadata: {},
                status: AreaStatus.STOPPED
            };

            prismaService.area.findUnique.mockResolvedValueOnce(area);

            prismaService.area.delete.mockResolvedValueOnce(null);

            await service.delete(userId, areaId);

            expect(schedulerService.stopPolling).toHaveBeenCalledWith(
                `area-id|youtube.on_liked_video|gmail.send_mail`
            );

            expect(prismaService.area.delete).toHaveBeenCalledWith({
                where: {
                    userId,
                    id: areaId
                },
                include: {
                    actionOAuth: true,
                    reactionOAuth: true
                }
            });
        });
    });
});

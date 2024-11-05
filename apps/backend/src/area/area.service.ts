import {
    forwardRef,
    Inject,
    Injectable,
    NotFoundException
} from "@nestjs/common";
import { User } from "../users/interfaces/user.interface";
import { CreateAreaDto } from "./dto/createArea.dto";
import { SchedulerService } from "../scheduler/scheduler.service";
import { YOUTUBE_ACTIONS } from "./services/youtube/youtube.actions";
import { YOUTUBE_REACTIONS } from "./services/youtube/youtube.reactions";
import { DISCORD_ACTIONS } from "./services/discord/discord.actions";
import { DISCORD_REACTIONS } from "./services/discord/discord.reactions";
import {
    ActionDescription,
    ReactionDescription
} from "./services/interfaces/service.interface";
import { PrismaService } from "../prisma/prisma.service";
import {
    Area,
    AreaAction,
    AreaReaction,
    AreaTask
} from "./interfaces/area.interface";
import { AreaStatus, Area as PrismaArea } from "@prisma/client";
import { UpdateAreaDto } from "./dto/updateArea.dto";
import { GMAIL_ACTIONS } from "./services/gmail/gmail.actions";
import { GMAIL_REACTIONS } from "./services/gmail/gmail.reactions";
import { TWITCH_ACTIONS } from "./services/twitch/twitch.actions";
import { TWITCH_REACTIONS } from "./services/twitch/twitch.reactions";
import { REDDIT_ACTIONS } from "./services/reddit/reddit.actions";
import { REDDIT_REACTIONS } from "./services/reddit/reddit.reactions";

@Injectable()
export class AreaService {
    private readonly configs = {
        action: {
            youtube: YOUTUBE_ACTIONS,
            discord: DISCORD_ACTIONS,
            twitch: TWITCH_ACTIONS,
            gmail: GMAIL_ACTIONS,
            reddit: REDDIT_ACTIONS
        },
        reaction: {
            youtube: YOUTUBE_REACTIONS,
            discord: DISCORD_REACTIONS,
            twitch: TWITCH_REACTIONS,
            gmail: GMAIL_REACTIONS,
            reddit: REDDIT_REACTIONS
        }
    };

    constructor(
        private readonly prismaService: PrismaService,
        @Inject(forwardRef(() => SchedulerService))
        private readonly schedulerService: SchedulerService
    ) {}

    getAreaConfig(
        id: string,
        kind: "action" | "reaction"
    ): AreaAction | AreaReaction {
        const [service, method] = id.split(/\./);
        const referer = this.configs[kind];

        if (!Object.keys(referer).includes(service))
            throw new NotFoundException(
                `Invalid action service ID : ${service}.`
            );

        const config: ActionDescription & ReactionDescription =
            referer[service][method];
        if (undefined !== config)
            return {
                service,
                method,
                config
            };

        throw new NotFoundException(`Invalid ${kind} method : ${method}.`);
    }

    private prismaAreaToArea({
        id,
        name,
        description,
        actionId,
        actionMetadata,
        actionOAuthId,
        reactionId,
        reactionBody,
        reactionOAuthId,
        delay,
        status
    }: Partial<PrismaArea>): Area {
        return {
            id,
            name,
            description,
            action_id: actionId,
            action_metadata: actionMetadata as object,
            action_oauth_id: actionOAuthId,
            reaction_id: reactionId,
            reaction_body: reactionBody as object,
            reaction_oauth_id: reactionOAuthId,
            delay,
            status
        };
    }

    async findMany(userId: User["id"]): Promise<Area[]> {
        const areas = await this.prismaService.area.findMany({
            where: {
                userId
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
        return areas.map(this.prismaAreaToArea);
    }

    private async _findUnique(
        areaId: Area["id"],
        userId?: User["id"]
    ): Promise<PrismaArea> {
        const area = await this.prismaService.area.findUnique({
            where: userId
                ? {
                      id: areaId,
                      userId
                  }
                : {
                      id: areaId
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
        if (null === area) throw new NotFoundException();
        return area;
    }

    async findUnique(userId: User["id"], areaId: Area["id"]): Promise<Area> {
        return this.prismaAreaToArea(await this._findUnique(areaId, userId));
    }

    async getAreaTask(area: PrismaArea): Promise<AreaTask> {
        const action = this.getAreaConfig(
            area.actionId,
            "action"
        ) as AreaAction;
        const reaction = this.getAreaConfig(
            area.reactionId,
            "reaction"
        ) as AreaReaction;
        const taskName = `${area.id}|${action.service}.${action.method}|${reaction.service}.${reaction.method}`;

        return {
            areaId: area.id,
            name: taskName,
            action,
            actionMetadata: area.actionMetadata as object,
            actionOAuthId: area.actionOAuthId,
            reaction,
            reactionBody: area.reactionBody as object,
            reactionOAuthId: area.reactionOAuthId,
            delay: area.delay,
            userId: area.userId
        };
    }

    async schedule(areaId: PrismaArea["id"], _area: PrismaArea = null) {
        const area = null !== _area ? _area : await this._findUnique(areaId);
        const task = await this.getAreaTask(area);

        this.schedulerService.stopPolling(task.name);
        if (area.status === AreaStatus.RUNNING)
            this.schedulerService.startPolling(task);
    }

    async create(
        userId: User["id"],
        createAreaDto: CreateAreaDto
    ): Promise<Area> {
        this.getAreaConfig(createAreaDto.action_id, "action");

        this.getAreaConfig(createAreaDto.reaction_id, "reaction");

        const area = await this.prismaService.area.create({
            data: {
                user: { connect: { id: userId } },
                name: createAreaDto.name,
                description: createAreaDto.description,
                actionId: createAreaDto.action_id,
                actionMetadata: createAreaDto.action_metadata,
                actionOAuth: { connect: { id: createAreaDto.action_oauth_id } },
                reactionId: createAreaDto.reaction_id,
                reactionOAuth: {
                    connect: { id: createAreaDto.reaction_oauth_id }
                },
                reactionBody: createAreaDto.reaction_body,
                delay: createAreaDto.delay
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

        return this.prismaAreaToArea(area);
    }

    async update(
        userId: User["id"],
        areaId: Area["id"],
        updateAreaDto: UpdateAreaDto
    ): Promise<Area> {
        const area = await this.prismaService.area.findUnique({
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

        this.getAreaConfig(area.actionId, "action");

        this.getAreaConfig(area.reactionId, "reaction");

        const updated = await this.prismaService.area.update({
            where: {
                id: areaId
            },
            data: {
                name: updateAreaDto.name,
                description: updateAreaDto.description,
                actionMetadata: updateAreaDto.action_metadata,
                actionOAuth: {
                    update: { id: updateAreaDto.action_oauth_id }
                },
                reactionOAuth: {
                    update: { id: updateAreaDto.reaction_oauth_id }
                },
                reactionBody: updateAreaDto.reaction_body,
                delay: updateAreaDto.delay,
                status: updateAreaDto.status
            },
            select: {
                name: true,
                description: true,
                actionMetadata: true,
                actionOAuthId: true,
                reactionBody: true,
                reactionOAuthId: true,
                delay: true,
                status: true
            }
        });

        const fullyUpdated: PrismaArea = {
            ...updated,
            actionId: area.actionId,
            reactionId: area.reactionId,
            id: areaId,
            userId
        };

        await this.schedule(areaId, fullyUpdated);

        return this.prismaAreaToArea(fullyUpdated);
    }

    async delete(userId: User["id"], areaId: Area["id"]) {
        const area = await this._findUnique(areaId, userId);
        const task = await this.getAreaTask(area);
        this.schedulerService.stopPolling(task.name);
        return this.prismaService.area.delete({
            where: {
                id: areaId,
                userId
            },
            include: {
                actionOAuth: true,
                reactionOAuth: true
            }
        });
    }
}

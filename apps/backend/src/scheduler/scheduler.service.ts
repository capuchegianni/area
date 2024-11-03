import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
    ForbiddenException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
    OnModuleDestroy,
    OnModuleInit
} from "@nestjs/common";
import { Cache } from "cache-manager";
import { transformer } from "../area/generic.transformers";
import { OAuthCredential } from "../oauth/oauth.interface";
import { AreaStatus } from "@prisma/client";
import {
    AreaAction,
    AreaReaction,
    AreaTask
} from "../area/interfaces/area.interface";
import { AreaService } from "../area/area.service";
import { OAuthService } from "../oauth/oauth.service";
import { ActionResource } from "../area/services/interfaces/service.interface";
import { User } from "src/users/interfaces/user.interface";
import { OAuthDBService } from "src/oauth/oauth-db.service";
import {
    OAuthProvider,
    OAuthProvidersService
} from "src/oauth/oauth-providers.service";

@Injectable()
export class SchedulerService implements OnModuleInit, OnModuleDestroy {
    private clockIds: { [task: string]: NodeJS.Timeout } = {};

    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        @Inject(forwardRef(() => AreaService))
        private readonly areaService: AreaService,
        private readonly oauthService: OAuthService,
        private readonly oauthDbService: OAuthDBService,
        private readonly oauthProvidersService: OAuthProvidersService
    ) {}

    async onModuleInit() {
        await this.cacheManager.reset();
    }

    async onModuleDestroy() {
        Object.values(this.clockIds).forEach(clearTimeout);
        this.clockIds = {};
        await this.cacheManager.reset();
    }

    private async getOAuthCredential(
        userId: User["id"],
        providerName: string,
        scopes: string[]
    ): Promise<OAuthCredential | null> {
        const provider: OAuthProvider =
            this.oauthProvidersService[providerName];

        if (undefined === provider)
            throw new NotFoundException(
                `The provider ${providerName} was not found.`
            );

        const credentials: OAuthCredential[] =
            await this.oauthDbService.loadCredentialsByScopes(
                userId,
                scopes,
                provider.OAUTH_TOKEN_URL,
                provider.OAUTH_REVOKE_URL
            );

        if (0 === credentials.length) return null;

        const credential = credentials[0];

        if (credential.expires_at > new Date()) return credential;

        const refreshedCredentials = await this.oauthService.refresh(
            provider,
            credential
        );
        await this.oauthDbService.updateCredential(refreshedCredentials);

        return refreshedCredentials;
    }

    private async getServiceOAuth(
        userId: User["id"],
        kind: AreaAction | AreaReaction
    ): Promise<OAuthCredential["access_token"]> {
        const credential = await this.getOAuthCredential(
            userId,
            kind.config.oauthProvider!,
            kind.config.oauthScopes
        );
        if (null === credential)
            throw new ForbiddenException("Token was revoked.");
        return credential.access_token;
    }

    private async getResource(
        task: AreaTask,
        oldCache: object
    ): Promise<ActionResource> {
        const accessToken = await this.getServiceOAuth(
            task.userId,
            task.action
        );
        return await task.action.config.trigger(
            accessToken,
            task.actionMetadata,
            oldCache
        );
    }

    async postData(task: AreaTask, transformedData: object): Promise<boolean> {
        let accessToken: OAuthCredential["access_token"];
        try {
            accessToken = await this.getServiceOAuth(
                task.userId,
                task.reaction
            );
        } catch {
            return false;
        }

        try {
            await task.reaction.config.produce(accessToken, transformedData);
        } catch {
            return false;
        }
        return true;
    }

    private logTask(task: AreaTask) {
        console.log(`--- [AREA ${task.areaId} Log Start] ---`);
        console.log(`Action : ${task.action.service}.${task.action.method}`);
        console.log(
            `Reaction : ${task.reaction.service}.${task.reaction.method}`
        );
        console.log(`Next tick: ${task.delay} seconds`);
        console.log(`--- [AREA ${task.areaId} Log End] ---`);
    }

    async executeTask(task: AreaTask): Promise<boolean> {
        this.logTask(task);
        const oldCache: string = await this.cacheManager.get(task.name);
        const parsedOldCache = JSON.parse(oldCache);

        let data: ActionResource;
        try {
            data = await this.getResource(task, parsedOldCache);
        } catch (e) {
            console.error(e);
            return false;
        }

        const transformedData =
            null !== data.data
                ? transformer(data.data, {
                      ...task.reactionBody
                  })
                : null;

        await this.cacheManager.set(
            task.name,
            data.cacheValue,
            (task.delay + 60) * 1000
        );

        console.log(oldCache, data.cacheValue);

        if (
            null === oldCache ||
            data.cacheValue === oldCache ||
            null === transformedData
        )
            return true;

        const isPosted = await this.postData(task, transformedData);
        console.log(isPosted);
        return isPosted;
    }

    scheduleTask(task: AreaTask) {
        const clockId = setInterval(async () => {
            const keepPolling = await this.executeTask(task);

            if (
                !keepPolling ||
                !Object.keys(this.clockIds).includes(task.name)
            ) {
                clearInterval(clockId);
                delete this.clockIds[task.name];
                await this.areaService.update(task.userId, task.areaId, {
                    status: AreaStatus.ERROR
                });
            }
        }, task.delay * 1000);
        this.clockIds[task.name] = clockId;
    }

    async startPolling(task: AreaTask) {
        const keepPolling = await this.executeTask(task);
        if (!keepPolling) {
            await this.areaService.update(task.userId, task.areaId, {
                status: AreaStatus.ERROR
            });
            return;
        }

        this.scheduleTask(task);
    }

    isRunning(taskName: string): boolean {
        return undefined !== this.clockIds[taskName];
    }

    stopPolling(taskName: string) {
        if (!this.isRunning(taskName)) return;
        clearTimeout(this.clockIds[taskName]);
        delete this.clockIds[taskName];
    }
}

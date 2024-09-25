import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    constructor(private readonly configService: ConfigService) {
        super({
            datasources: {
                db: {
                    url: configService.get("POSTGRESQL_URL")
                }
            }
        });
    }

    onModuleInit() {
        return this.$connect();
    }

    onModuleDestroy() {
        return this.$disconnect();
    }
}

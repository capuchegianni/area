import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "./prisma.service";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { ConfigService } from "@nestjs/config";
import { PrismaClient } from "@prisma/client";

describe("PrismaService", () => {
    let configService: DeepMockProxy<ConfigService>;
    let prismaService: DeepMockProxy<PrismaClient>;
    let module: TestingModule;
    let purePrismaService: PrismaService;

    beforeEach(async () => {
        configService = mockDeep<ConfigService>();
        prismaService = mockDeep<PrismaClient>();
        module = await Test.createTestingModule({
            providers: [
                { provide: PrismaService, useValue: prismaService },
                { provide: ConfigService, useValue: configService }
            ]
        }).compile();
        purePrismaService = module.get<PrismaService>(PrismaService);
    });

    it("should be defined", () => {
        expect(purePrismaService).toBeDefined();
    });
});

import { Test, TestingModule } from "@nestjs/testing";
import { AreaService } from "./area.service";
import { SchedulerService } from "src/scheduler/scheduler.service";
import { PrismaService } from "src/prisma/prisma.service";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";

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
});

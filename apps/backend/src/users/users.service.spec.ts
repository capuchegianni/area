import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { NotFoundException } from "@nestjs/common";

describe("UsersService", () => {
    let service: UsersService;
    let prismaService: DeepMockProxy<PrismaClient>;

    beforeEach(async () => {
        prismaService = mockDeep<PrismaClient>();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: PrismaService, useValue: prismaService }
            ]
        }).compile();

        service = module.get<UsersService>(UsersService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("getUser", () => {
        it("should retrieve the user", async () => {
            prismaService.user.findUnique.mockResolvedValueOnce({
                email: "blabla@gmail.com",
                firstname: "bob",
                lastname: "DUPONT"
            } as any);

            const user = await service.getUser("id");

            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { id: "id" },
                select: { email: true, firstname: true, lastname: true }
            });

            expect(user).toStrictEqual({
                email: "blabla@gmail.com",
                firstname: "bob",
                lastname: "DUPONT"
            });
        });

        it("should throw a NotFoundException", async () => {
            prismaService.user.findUnique.mockResolvedValueOnce(null);

            try {
                await service.getUser("id");
                fail("This should throw an error.");
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundException);
            }

            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { id: "id" },
                select: { email: true, firstname: true, lastname: true }
            });
        });
    });
});

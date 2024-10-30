import { Test, TestingModule } from "@nestjs/testing";
import { OAuthService } from "./oauth.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";

describe("OauthService", () => {
    let service: OAuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OAuthService,
                {
                    provide: CACHE_MANAGER,
                    useValue: () => ({ get: jest.fn(), set: jest.fn() })
                }
            ]
        }).compile();

        service = module.get<OAuthService>(OAuthService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});

import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "./jwt.service";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";
import * as jose from "jose";

const fakeEnv = {
    JWT_ISSUER: "area-backend-unit-tests",
    JWT_SECRET: "5044d47226c19a4d63fd7eab79373b30",
    JWE_PUBLIC_KEY: "test/test_jwe_public_key.pem",
    JWE_PRIVATE_KEY: "test/test_jwe_private_key.pem",
    JWT_EXPIRES_IN: "1s"
};

const reasonableEnv = {
    JWT_ISSUER: fakeEnv.JWT_ISSUER,
    JWT_SECRET: fakeEnv.JWT_SECRET,
    JWE_PUBLIC_KEY: fakeEnv.JWE_PUBLIC_KEY,
    JWE_PRIVATE_KEY: fakeEnv.JWE_PRIVATE_KEY,
    JWT_EXPIRES_IN: "10s"
};

const configService: Partial<ConfigService> = {
    get: jest
        .fn()
        .mockImplementation((property: string): string => fakeEnv[property]),
    getOrThrow: jest.fn().mockImplementation((property: string): string => {
        const value = fakeEnv[property];
        if (undefined === value)
            throw new Error(`Env variable not found: ${property}`);
        return value;
    })
};

function b64decode(s: string): string {
    return Buffer.from(s, "base64").toString("utf-8");
}

describe("CryptoService", () => {
    let jwtService: JwtService;
    let jweDataExample: jose.JWTPayload = { id: "blabla" };
    let jweExample: string;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtService,
                { provide: ConfigService, useValue: configService }
            ]
        }).compile();

        const _jwtService = module.get<JwtService>(JwtService);
        expect(_jwtService.areKeysLoaded()).toBe(false);
        jweExample = await _jwtService.forgeJwe(jweDataExample);
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtService,
                { provide: ConfigService, useValue: configService }
            ]
        }).compile();

        jwtService = module.get<JwtService>(JwtService);
        expect(jwtService.areKeysLoaded()).toBe(false);
    });

    it("should be defined", () => {
        expect(jwtService).toBeDefined();
    });

    describe("JWE settings", () => {
        it("should confirm the required settings for JWE forge and verification", () => {
            expect(JwtService.JWS_ALG).toBe("HS512");
            expect(JwtService.JWE_ALG).toBe("RSA-OAEP-512");
            expect(JwtService.JWE_ENC).toBe("A256GCM");
        });

        it("should make sure the secret key is 32 bytes long", () => {
            expect(
                Test.createTestingModule({
                    providers: [
                        JwtService,
                        {
                            provide: ConfigService,
                            useValue: {
                                get: jest
                                    .fn()
                                    .mockImplementation(
                                        (property: string): string =>
                                            property !== "JWT_SECRET"
                                                ? fakeEnv[property]
                                                : "invalidkeylength"
                                    )
                            }
                        }
                    ]
                }).compile()
            ).rejects.toThrow(Error);
        });
    });

    describe("JWE forge", () => {
        it("should forge a new JWE", async () => {
            const _payload = { id: randomUUID() };
            const jwe = await jwtService.forgeJwe(_payload);
            expect(jwtService.areKeysLoaded()).toBe(true);
            const segments = jwe.split(".", 2);

            const decodedHeader = b64decode(segments[0]);
            expect(JSON.parse(decodedHeader)).toStrictEqual({
                alg: JwtService.JWE_ALG,
                enc: JwtService.JWE_ENC
            });

            const decodedPayload = b64decode(segments[1]);
            expect(() => JSON.parse(decodedPayload)).toThrow(SyntaxError);
        });
    });

    describe("JWE decrypt", () => {
        it("should decrypt the jwe", async () => {
            expect(jwtService.areKeysLoaded()).toBe(false);

            const data = await jwtService.decryptJwe(jweExample);

            expect(jwtService.areKeysLoaded()).toBe(true);

            const parsedData = JSON.parse(
                Buffer.from(data.split(/\./)[1], "base64").toString("utf-8")
            );

            expect(parsedData.id).toBe(jweDataExample.id);
        });
    });

    describe("JWE verify", () => {
        it("should return an error as the jwe is expired", async () => {
            const jwe = await jwtService.forgeJwe({ id: randomUUID() });
            const timeout = setTimeout(async function () {
                try {
                    await jwtService.verifyJwe(jwe);
                    fail("JWE must have expired.");
                } catch (e) {
                    expect(e).toBeInstanceOf(jose.errors.JWTExpired);
                }
                clearTimeout(timeout);
            }, 1250);
        });

        it("should return an the data", async () => {
            const configService: Partial<ConfigService> = {
                get: jest
                    .fn()
                    .mockImplementation(
                        (property: string): string => reasonableEnv[property]
                    ),
                getOrThrow: jest
                    .fn()
                    .mockImplementation((property: string): string => {
                        const value = reasonableEnv[property];
                        if (undefined === value)
                            throw new Error(
                                `Env variable not found: ${property}`
                            );
                        return value;
                    })
            };

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    JwtService,
                    { provide: ConfigService, useValue: configService }
                ]
            }).compile();

            const jwtService = module.get<JwtService>(JwtService);

            expect(jwtService.areKeysLoaded()).toBe(false);

            const id = randomUUID();

            const jwe = await jwtService.forgeJwe({ id });

            const decrypted = jwtService.decryptJwe(jwe);

            jest.spyOn(jwtService, "decryptJwe").mockResolvedValueOnce(
                decrypted
            );

            const data = await jwtService.verifyJwe(jwe);

            expect(jwtService.decryptJwe).toHaveBeenCalledWith(jwe);

            expect(data["id"]).toMatch(id);
        });
    });

    describe("Check for 32 bytes secret key", () => {
        it("Should throw an error for secret keys which don't ahve exactly 32 bytes", async () => {
            const configService: Partial<ConfigService> = {
                get: jest
                    .fn()
                    .mockImplementation(
                        (property: string): string => reasonableEnv[property]
                    ),
                getOrThrow: jest
                    .fn()
                    .mockImplementation((property: string): string => {
                        if (property === "JWT_SECRET") return "invalid";

                        const value = reasonableEnv[property];
                        if (undefined === value)
                            throw new Error(
                                `Env variable not found: ${property}`
                            );
                        return value;
                    })
            };

            try {
                const module: TestingModule = await Test.createTestingModule({
                    providers: [
                        JwtService,
                        { provide: ConfigService, useValue: configService }
                    ]
                }).compile();
                fail();
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
            }
        });
    });
});

import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { Argon2Module } from "src/argon2/argon2.module";
import { JwtModule } from "src/jwt/jwt.module";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
    imports: [PrismaModule, Argon2Module, JwtModule],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService]
})
export class AuthModule {}

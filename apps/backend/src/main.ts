import { NestFactory } from "@nestjs/core";
import {
    DocumentBuilder,
    OpenAPIObject,
    SwaggerCustomOptions,
    SwaggerModule
} from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerTheme, SwaggerThemeNameEnum } from "swagger-themes";

function getSwaggerDocumentConfig(): Omit<OpenAPIObject, "paths"> {
    return new DocumentBuilder()
        .setTitle("AREA API Documentation")
        .setDescription(
            "This document showcases all the API endpoints that you can use to communicate with the backend server. It provides example and an exhaustive set of param definitions."
        )
        .setVersion("1.0")
        .addTag(
            "Authentication",
            "Describes all the routes for authentication purposes."
        )
        .addTag(
            "OAuth",
            "Describes all the endpoints to deal with OAuth2.0 credentials."
        )
        .addTag("AREA", "Describes all the routes to deal with AREA's CRUD.")
        .addTag("Users", "Describes all the routes to deal with users CRUD.")
        .addBearerAuth({
            type: "http",
            description:
                "An encrypted JWT returned by the 'register' or 'login' endpoint.",
            name: "bearer"
        })
        .build();
}

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe());

    const configService = app.get(ConfigService);

    app.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["*"],
                    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                    imgSrc: ["'self'", "data:", "blob:"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    upgradeInsecureRequests: null
                }
            }
        })
    );
    app.enableCors({
        origin: configService.getOrThrow("ORIGIN"),
        credentials: true
    });

    const swaggerDocumentConfig = getSwaggerDocumentConfig();

    const document = SwaggerModule.createDocument(app, swaggerDocumentConfig);

    const swaggerTheme = new SwaggerTheme();
    const swaggerConfig: SwaggerCustomOptions = {
        customCss: swaggerTheme.getBuffer(SwaggerThemeNameEnum.DARK),
        customSiteTitle: swaggerDocumentConfig.info.title
    };
    SwaggerModule.setup("/", app, document, swaggerConfig);

    await app.listen(
        configService.get<number>("REST_API_PORT", 8080),
        "0.0.0.0"
    );
}
bootstrap();

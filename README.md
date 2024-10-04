# AREA Backend Documentation

This document provides a high-level overview of the backend architecture and implementation using NestJS. It is structured to be easily understandable by developers who have not participated in the project.

## Table of Contents
- [Overview](#overview)
- [Main Application](#main-application)
- [AREA Module](#area-module)
- [Authentication](#authentication)
- [Token Generation](#token-generation)
- [OAuth Integration](#oauth-integration)
- [Polling Services](#polling-services)
- [Webhooks](#webhooks)
- [Cron Jobs](#cron-jobs)
- [User Management](#user-management)
- [Database Integration (Prisma)](#database-integration-prisma)
- [Conclusion](#conclusion)

---

## Overview

The backend is built using the **NestJS** framework, structured around various modules that handle specific concerns such as authentication, OAuth, polling, webhooks, and user management. The project utilizes **Prisma** for database integration, and **JWT** for authentication. Cron jobs and various external services are also integrated into the system.

---

## Main Application

The main entry point of the application is defined in `main.ts`, where the application is bootstrapped.

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

The ```AppModule``` (in ```app.module.ts```) serves as the root module and imports all other modules used in the project. Key imports include:

- **AuthModule**
- **OAuthModule**
- **UsersModule**
- **PrismaModule**
- **CronModule**
- **Argon2Module**
- **JwtModule**
- **AreaModule**
- **PollingModule**
- **WebhookModule**
- **SchedulerModule**

This modular structure allows for clean separation of concerns.

---

## AREA Module

The **AREA** (**Action-Event-Reaction Automation**) module implements the core functionality of the application.

#### Key Components:

- **AreaService** (```area.service.ts```): Contains the business logic for handling AREA automation, including creating and managing AREA configurations.
- **AreaController** (```area.controller.ts```): Exposes endpoints for managing AREA actions, events, and reactions via the API.

#### DTOs:
- **CreateAreaDto** (```create_area.dto.ts```): Defines the data structure for creating a new AREA.

#### Interfaces:
- **ServicesInterface** (```services.interface.ts```): Provides interfaces for the services related to AREA functionality.

---

## Authentication

The authentication system is implemented in the auth module and supports user login and registration through **JWT-based authentication**.

#### Key Components:

- **AuthModule** (```auth.module.ts```): Registers the authentication services and controllers.
- **AuthService** (```auth.service.ts```): Contains the logic for validating user credentials, generating JWT tokens, and managing user sessions.
- **AuthController** (```auth.controller.ts```): Exposes API endpoints for login and registration.

#### JWT Strategy:

The JWT strategy is implemented in ```jwt.strategy.ts```. It ensures that protected routes can only be accessed with valid JWT tokens.

#### DTOs:

- **LoginDto** (```login.dto.ts```): Used for user login data validation.
- **RegisterDto** (```register.dto.ts```): Used for user registration validation.

---

## Token Generation

The project uses RSA key pairs for generating JWT tokens. The script responsible for generating these keys is located in the ```crypto``` directory.

- **Key Pair Generation Script**: The file ```crypto/generate_key_pair.sh``` is a shell script that generates a private and public key pair used for signing JWT tokens. This script leverages OpenSSL to generate a secure key pair.

```
#!/bin/bash

openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -outform PEM -pubout -out public.pem
```

The private key is used to sign the tokens, while the public key is used to verify the token's authenticity.

---

## OAuth Integration

OAuth functionality is provided through the ```oauth``` module, with specific support for Google OAuth.

#### Key Components:

- **OAuthModule** (```oauth.module.ts```): Defines the base OAuth service structure.
- **GoogleModule** (```google.module.ts```): Handles integration with Google OAuth.
- **GoogleService** (```google.service.ts```): Contains the logic to authenticate users via Google, fetch user data, and handle tokens.
- **GoogleController** (```google.controller.ts```): Provides endpoints for handling OAuth authentication requests.

#### OAuth Interfaces:

- ```oauth.interface.ts```: Defines common OAuth-related interfaces used across different services.

---

## Polling Services

The application supports polling of external services. One key example is **YouTube polling**.

#### Key Components:

- **YouTubeService** (```youtube.service.ts```): Polls YouTube for updates and provides necessary data processing.
- **YouTubeModule** (```youtube.module.ts```): Registers the YouTube service and its dependencies.

#### Interfaces:
- **YouTubeVideoInterface** (```youtube-video.interface.ts```): Defines the structure of YouTube video data that the service interacts with.

---

## Webhooks

Webhooks are used to trigger actions when specific events occur. One integration example is **Discord**.

#### Key Components:

- **DiscordService** (```discord.service.ts```): Handles sending webhook events to Discord.
- **DiscordModule** (```discord.module.ts```): Defines the structure for handling Discord webhooks.

---

## Cron Jobs

Scheduled tasks are implemented using the ```cron``` module.

#### Key Components:

- **CronService** (```cron.service.ts```): Contains logic for scheduling and running periodic tasks in the application.
- **CronModule** (```cron.module.ts```): Registers cron-related services and dependencies.

#### Cron Interface:

- **CronInterface** (```cron.interface.ts```): Defines the structure of the cron jobs used by the service.

---

## User Management

User-related logic is encapsulated within the ```users``` module.

#### Key Components:

- **UsersService** (```users.service.ts```): Contains business logic for managing user data, such as creating, updating, or fetching users from the database.
- **UsersController** (```users.controller.ts```): Provides endpoints for interacting with user data, such as ```/users``` to fetch all users or ```/users/:id``` to fetch a single user.

#### User Interface:

- **UserInterface** (```user.interface.ts```): Defines the structure of a user entity.

---

## Database Integration (Prisma)

The backend uses Prisma as an ORM to interact with the database. The Prisma schema defines the database structure and is stored in the ```schema.prisma``` file, located in the Prisma configuration folder.

#### Key Components:

- **PrismaService** (```prisma.service.ts```): This service is responsible for establishing the database connection and provides methods to interact with the database. It abstracts common database operations used across various services.

The ```schema.prisma``` file is where all the database tables, fields, and relationships are defined. Prisma then generates the corresponding TypeScript code based on this schema for use throughout the application.

---

## Conclusion

This documentation covers the major components of the backend built using NestJS. The system is modular, with clear separation between different functionalities such as authentication, polling, and cron jobs. The use of Prisma for database interaction ensures scalability, while OAuth and webhooks provide integrations with external services. Token generation for JWTs is secured using RSA key pairs generated by a dedicated script.
# AREA - Backend 🧠

## Backend full documentation 📚
You can find the full documentation of the backend architecture [here](./documentation/README.md).

## Our tech stack 🧮
- [NestJS](https://nestjs.com/) - The backend framework
- [Prisma](https://www.prisma.io/) - The ORM used to interact with the database
- [Jest](https://jestjs.io/) - Testing framework
- [Swagger](https://swagger.io/) - API documentation
- [PostgreSQL](https://www.postgresql.org/) - The database
- [Redis](https://redis.io/) - Our cache server

## Launching using Docker 🐋
You can run the backend without setting up anything by using our `docker-compose`. At the root of the project, run the following command:
```bash
docker compose up --build server
```

## Project setup 🏗️
**1.** To get started with the project, you need to met the following **requirements**:
- **Node.js**(v20 or higher) & **npm**(v10.8 or higher) installed on your machine. (You can download it [here](https://nodejs.org/en/download/))
- [**Git**](https://git-scm.com/downloads) & [**Docker**](https://docs.docker.com/get-started/) installed on your machine.
---
**2.** Then you can **clone the repository**:
```bash
git clone https://github.com/zowks/B-DEV-500-area.git
cd B-DEV-500-area
```
---
**3.** Install the **dependencies** and navigate to the project directory:
```bash
npm install
cd apps/backend
```
---
**4.** Create a `.env` file using the `.env.example` as a template:
```bash
cp .env.example .env
```
Customize the `.env` file to your needs. (If you're using our `docker-compose`, don't forget to also check the `README.md` in the root directory)

## How to start in dev mode 🚀
When everything is ready, you can start the development server by running the following command:
```bash
npm run start:dev
```
This will start the server in watch mode.

## How to run the tests 🧪
```bash
npm run test
```
Or in watch mode:
```bash
npm run test:watch
```
End-to-end tests can be run with:
```bash
npm run test:e2e
```
You can also generate a coverage report by running:
```bash
npm run test:cov
```

## How to use the Linter 🧹
```bash
npm run lint
```
You can also fix the linting errors using:
```bash
npm run lint:fix
```

## How to build the project 📦
```bash
npm run build
```
Then you can preview the production build with:
```bash
npm run container
```

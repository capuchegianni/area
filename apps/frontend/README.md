# AREA - Frontend 🖼️
## Our tech stack 🧮
- [SvelteKit](https://kit.svelte.dev/) - The frontend framework
- [Vite](https://vitejs.dev/) - The build tool
- [ShadcnUI](https://ui.shadcn.com/) - UI library
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [i18n](https://github.com/ivanhofer/typesafe-i18n) - Typesafe internationalization library
- [Cypress](https://www.cypress.io/) - Testing framework

## Launching using Docker 🐋
You can run the frontend without setting up anything by using our `docker-compose`. At the root of the project, run the following command:
```bash
docker compose up --build client_web
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
cd apps/frontend
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
npm run dev
```
Or if you need to start the vite server next to your host machine:
```bash
npm run dev:host
```

## How to run the tests 🧪
In headless mode:
```bash
npm run cy:run
```
Or in interactive mode with the Cypress GUI:
```bash
npm run cy:open
```

## How to check your code *(Unused CSS, Hints, Compilation errors)* 🧐
```bash
npm run check
```
Or in watch mode:
```bash
npm run check:watch
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
npm run preview
```

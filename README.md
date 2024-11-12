# AREA
Action-REAction | Create an automation platform

## Architecture 🏛️
- [Application Server](./apps/backend/README.md) - The backend part of the project
- [Web Client](./apps/frontend/README.md) - The frontend part of the project
- [Mobile Client](./apps/mobile/README.md) - The mobile part of the project

*(Links point to the README of each part)*

## Project setup 🏗️
### Requirements:
- [**Git**](https://git-scm.com/downloads) installed on your machine.
- [**Docker**](https://docs.docker.com/get-started/) installed on your machine.
- A `.env` file configured using the documentation within the `.env.example`

### Generate keys 🔑
To generate the keys needed within the `.env` file, you can run the following command from the root of the project:
```bash
cd crypto/
./generate_key_pair.sh
```
If your file is not executable, you can run this and try again:
```bash
chmod +x generate_key_pair.sh
```
---
#### Clone the repository
```bash
git clone https://github.com/zowks/B-DEV-500-area.git
cd B-DEV-500-area
```

When everything is ready, run the following command
```bash
docker compose up --build
```

This will start 5 services:
- `postgres`: The database that stores all the data needed for the app to work
- `redis`: Used to cache requests to the REST API and JWT tokens
- `server`: Brain of the REST API (Nest.js)
- `client_mobile`: Build the mobile Android APK (Expo / React Native) and place it in a volume shared with the `client_web` service
- `client_web`: Serves the website of the AREA project (SvelteKit)

## Pre-development setup 🧰

### Requirements:
- **Node.js**(v20 or higher) & **npm**(v10.8 or higher) installed on your machine. (You can download it [here](https://nodejs.org/en/download/))
- [**Git**](https://git-scm.com/downloads) & [**Docker**](https://docs.docker.com/get-started/) installed on your machine.

### How to install packages 📦
Since the project is using **NPM workspaces**, all package installations should be done at the root of the project.

To first install all the packages, run the following command (at the root of the project):
```bash
npm install
```

### Adding a new package 🛒
To add a new package to the project, run the following command (always at the root of the project):
```bash
npm install <package-name> -w <workspace-name>
```
Where `<package-name>` is the name of the package you want to install and `<workspace-name>` is the name of the workspace you want to install the package in.\
For example, to install the `typescript` package in the `backend` workspace (which is in `apps/backend/`), you would run:
```bash
npm install -D typescript -w apps/backend
```

You can also install a package from a workspace folder by running the following command:
```bash
cd <workspace-folder>
npm install <package-name>
```

> To know more about NPM workspaces, you can check the [official documentation](https://docs.npmjs.com/cli/using-npm/workspaces).

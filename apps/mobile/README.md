# AREA - Mobile 📱
## Our tech stack 🧮
- [Expo](https://expo.dev/) - The mobile framework
- [React Native Reusables](https://rnr-docs.vercel.app/) - UI library
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [i18next](https://www.i18next.com/) - Internationalization library
- [Jest-Expo](https://docs.expo.dev/develop/unit-testing/) - Testing framework

## Project setup 🏗️
**1.** To get started with the project, you need to met the following **requirements**:
- **Node.js**(v20 or higher) & **npm**(v10.8 or higher) installed on your machine. (You can download it [here](https://nodejs.org/en/download/))
- [**Git**](https://git-scm.com/downloads) & [**Docker**](https://docs.docker.com/get-started/) installed on your machine.

**2.** Then you can **clone the repository**:
```bash
git clone https://github.com/zowks/B-DEV-500-area.git
cd B-DEV-500-area
```

**3.** Install the **dependencies** and navigate to the project directory:
```bash
npm install
cd apps/mobile
```

**4.** Create a `.env` file using the `.env.example` as a template:
```bash
cp .env.example .env
```
Customize the `.env` file to your needs. (If you're using our `docker-compose`, don't forget to also check the `README.md` in the root directory)

## How to start in dev mode 🚀
When everything is ready, you can start the app in development mode by running the following command:
```bash
npm run dev
```
You can optionnaly select a target platform by running:
```bash
npm run dev:<android|ios|web>
```

## How to run the tests 🧪
```bash
npm run test
```
Or in watch mode:
```bash
npm run test:watch
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
You can build locally (not using Expo Cloud services) by running:
```bash
npm run build:local
```

## Add a UI component 📥
To add a UI component to the application, you can use the components provided by `react-native-reusables`.

1. Go to [React Native Reusable docs](https://rnr-docs.vercel.app).
2. Find a component you want to use.
3. Follow the installation instructions (use CLI installation).
4. Use the component in the application.

## Add an icon 👱
`lucide-react-native` provides a set of icons that you can use in the application.\
In order to be able to use them, you need to follow the steps described in the [React Native Reusable/Adding Icons documentation](https://rnr-docs.vercel.app/getting-started/adding-icons).

## Learn more about Expo 📚
To learn more about developing your application with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

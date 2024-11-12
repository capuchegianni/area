import type { BaseTranslation } from "../i18n-types";

const en = {
    welcome: "Hello, {name}! What do you want to automate today?",
    error: {
        goHome: "Go to homepage",
        api: {
            unknown: "An unknown error occurred",
            unauthorized: "You are not authorized to perform this action",
            incorrectFields: "One or more fields are incorrect",
            emailAlreadyTaken: "The email is already taken",
            termsDenied: "You must accept the terms and conditions",
            invalidCredentials: "Invalid credentials"
        },
        incorrectField: "Missing or invalid field: {field}"
    },
    components: {
        combobox: {
            select: "Select a {element}",
            search: "Search a {element}",
            no: "No {element} found",
            clear: "Clear selection"
        }
    },
    header: {
        selectLanguage: "Select language",
        toggleTheme: "Toggle theme",
        selectTheme: "Select theme",
        light: "Light",
        dark: "Dark",
        system: "System"
    },
    apk: {
        title: "Download the Android APK",
        download: "Download"
    },
    auth: {
        email: "Email",
        password: "Password",
        firstname: "Firstname",
        lastname: "Lastname",
        acceptTerms: "Accept terms and conditions",
        signIn: {
            title: "Sign in",
            subtitle: "Enter your credentials below to login to your account",
            forgotPassword: {
                trigger: "Forgot your password?",
                title: "Forgot password",
                unavailable: "Password reset is not yet available.",
                contact: "Please contact the support to reset your password.",
                action: "Understood"
            },
            action: "Sign in"
        },
        signUp: {
            title: "Sign up",
            subtitle: "Enter your credentials below to create an account",
            action: "Sign up"

        },
        signOut: {
            title: "Sign out",
            action: "Sign out"
        },
        noAccount: "Don't have an account?",
        alreadyHaveAccount: "Already have an account?",
        placeholders: {
            email: "email@example.com"
        },
        errors: {
            missingEmail: "Email is required",
            incorrectEmail: "Email is incorrect",
            missingPassword: "Password is required",
            incorrectPassword: "Password is incorrect (must be at least 8 characters)",
            missingField: "One or more fields are missing"
        }
    },
    area: {
        createArea: "Create an AREA",
        createAreaDescription: "Link an Action and a REAction to create an AREA",
        updateArea: "Update the AREA",
        updateAreaDescription: "Update the Action and REAction of the AREA",
        oauth: {
            action: "Sign in with {service}"
        }
    }
} satisfies BaseTranslation;

export default en;

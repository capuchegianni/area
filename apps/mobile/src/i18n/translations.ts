const englishTranslations = {
    "login": "Log in",
    "signup": "Sign up",
    "logout": "Log out",
    "password": "Password",
    "language": "En",
    "newUser": "Don't have an account ?",
    "hasAnAccount": "Already have an account ?",
    "name": "First name",
    "lastName": "Last name",
    "tos": "Accept terms and conditions",
    "registerError": {
        "400": "Some of the fields are incorrect.",
        "409": "The email is already taken.",
        "422": "Please accept the ToS before creating your account.",
        "500": "An internal error happened."
    },
    "loginError": {
        "400": "Some of the fields are incorrect.",
        "403": "The email or the password is not valid.",
        "500": "An internal error happened."
    },
    "home": "Home",
    "createArea": "Create a new AREA",
    "servicesConnect": "Connect your account to multiple services!",
    "areaDescription": "Link an Action and a REAction to create an AREA"
};

type Translation = {
    translation: typeof englishTranslations;
};

const translations: Record<string, Translation> = {
    en: {
        translation: englishTranslations
    },
    fr: {
        translation: {
            "login": "Se connecter",
            "signup": "Créer un compte",
            "logout": "Se déconnecter",
            "password": "Mot de passe",
            "language": "Fr",
            "newUser": "Vous n'avez pas de compte ?",
            "hasAnAccount": "Vous avez déjà un compte ?",
            "name": "Prénom",
            "lastName": "Nom",
            "tos": "Accepter les conditions d'utilisations",
            "registerError": {
                "400": "Certaines valeurs sont incorrectes.",
                "409": "L'addresse mail est déjà utilisée.",
                "422": "Veuillez accepter les ToS avant de créer un compte.",
                "500": "Une erreur interne est survenue."
            },
            "loginError": {
                "400": "Certaines valeurs sont incorrectes.",
                "403": "L'email ou le mot de passe est invalide.",
                "500": "Une erreur interne est survenue."
            },
            "home": "Accueil",
            "createArea": "Créer une nouvelle AREA",
            "servicesConnect": "Connectez votre compte avec plusieurs services !",
            "areaDescription": "Liez une Action avec une REAction afin de créer une AREA"
        }
    }
};

export default translations;

// This file was auto-generated by 'typesafe-i18n'. Any manual changes will be overwritten.
/* eslint-disable */
import type { BaseTranslation as BaseTranslationType, LocalizedString } from 'typesafe-i18n'

export type BaseTranslation = BaseTranslationType
export type BaseLocale = 'en'

export type Locales =
	| 'en'
	| 'fr'

export type Translation = RootTranslation

export type Translations = RootTranslation

type RootTranslation = {
	error: {
		/**
		 * G​o​ ​t​o​ ​h​o​m​e​p​a​g​e
		 */
		goHome: string
	}
	header: {
		/**
		 * S​e​l​e​c​t​ ​l​a​n​g​u​a​g​e
		 */
		selectLanguage: string
		/**
		 * T​o​g​g​l​e​ ​t​h​e​m​e
		 */
		toggleTheme: string
		/**
		 * S​e​l​e​c​t​ ​t​h​e​m​e
		 */
		selectTheme: string
		/**
		 * L​i​g​h​t
		 */
		light: string
		/**
		 * D​a​r​k
		 */
		dark: string
		/**
		 * S​y​s​t​e​m
		 */
		system: string
	}
	apk: {
		/**
		 * D​o​w​n​l​o​a​d​ ​t​h​e​ ​A​n​d​r​o​i​d​ ​A​P​K
		 */
		title: string
		/**
		 * D​o​w​n​l​o​a​d
		 */
		download: string
	}
	auth: {
		/**
		 * E​m​a​i​l
		 */
		email: string
		/**
		 * P​a​s​s​w​o​r​d
		 */
		password: string
		signIn: {
			/**
			 * S​i​g​n​ ​i​n
			 */
			title: string
			/**
			 * E​n​t​e​r​ ​y​o​u​r​ ​c​r​e​d​e​n​t​i​a​l​s​ ​b​e​l​o​w​ ​t​o​ ​l​o​g​i​n​ ​t​o​ ​y​o​u​r​ ​a​c​c​o​u​n​t
			 */
			subtitle: string
			forgotPassword: {
				/**
				 * F​o​r​g​o​t​ ​y​o​u​r​ ​p​a​s​s​w​o​r​d​?
				 */
				trigger: string
				/**
				 * F​o​r​g​o​t​ ​p​a​s​s​w​o​r​d
				 */
				title: string
				/**
				 * P​a​s​s​w​o​r​d​ ​r​e​s​e​t​ ​i​s​ ​n​o​t​ ​y​e​t​ ​a​v​a​i​l​a​b​l​e​.
				 */
				unavailable: string
				/**
				 * P​l​e​a​s​e​ ​c​o​n​t​a​c​t​ ​t​h​e​ ​s​u​p​p​o​r​t​ ​t​o​ ​r​e​s​e​t​ ​y​o​u​r​ ​p​a​s​s​w​o​r​d​.
				 */
				contact: string
				/**
				 * U​n​d​e​r​s​t​o​o​d
				 */
				action: string
			}
			/**
			 * S​i​g​n​ ​i​n
			 */
			action: string
		}
		signUp: {
			/**
			 * S​i​g​n​ ​u​p
			 */
			title: string
			/**
			 * E​n​t​e​r​ ​y​o​u​r​ ​c​r​e​d​e​n​t​i​a​l​s​ ​b​e​l​o​w​ ​t​o​ ​c​r​e​a​t​e​ ​a​n​ ​a​c​c​o​u​n​t
			 */
			subtitle: string
			/**
			 * S​i​g​n​ ​u​p
			 */
			action: string
		}
		signOut: {
			/**
			 * S​i​g​n​ ​o​u​t
			 */
			title: string
			/**
			 * S​i​g​n​ ​o​u​t
			 */
			action: string
		}
		/**
		 * D​o​n​'​t​ ​h​a​v​e​ ​a​n​ ​a​c​c​o​u​n​t​?
		 */
		noAccount: string
		/**
		 * A​l​r​e​a​d​y​ ​h​a​v​e​ ​a​n​ ​a​c​c​o​u​n​t​?
		 */
		alreadyHaveAccount: string
		placeholders: {
			/**
			 * e​m​a​i​l​@​e​x​a​m​p​l​e​.​c​o​m
			 */
			email: string
		}
		errors: {
			/**
			 * E​m​a​i​l​ ​i​s​ ​r​e​q​u​i​r​e​d
			 */
			missingEmail: string
			/**
			 * E​m​a​i​l​ ​i​s​ ​i​n​c​o​r​r​e​c​t
			 */
			incorrectEmail: string
			/**
			 * P​a​s​s​w​o​r​d​ ​i​s​ ​r​e​q​u​i​r​e​d
			 */
			missingPassword: string
			/**
			 * P​a​s​s​w​o​r​d​ ​i​s​ ​i​n​c​o​r​r​e​c​t​ ​(​m​u​s​t​ ​b​e​ ​a​t​ ​l​e​a​s​t​ ​8​ ​c​h​a​r​a​c​t​e​r​s​)
			 */
			incorrectPassword: string
		}
	}
}

export type TranslationFunctions = {
	error: {
		/**
		 * Go to homepage
		 */
		goHome: () => LocalizedString
	}
	header: {
		/**
		 * Select language
		 */
		selectLanguage: () => LocalizedString
		/**
		 * Toggle theme
		 */
		toggleTheme: () => LocalizedString
		/**
		 * Select theme
		 */
		selectTheme: () => LocalizedString
		/**
		 * Light
		 */
		light: () => LocalizedString
		/**
		 * Dark
		 */
		dark: () => LocalizedString
		/**
		 * System
		 */
		system: () => LocalizedString
	}
	apk: {
		/**
		 * Download the Android APK
		 */
		title: () => LocalizedString
		/**
		 * Download
		 */
		download: () => LocalizedString
	}
	auth: {
		/**
		 * Email
		 */
		email: () => LocalizedString
		/**
		 * Password
		 */
		password: () => LocalizedString
		signIn: {
			/**
			 * Sign in
			 */
			title: () => LocalizedString
			/**
			 * Enter your credentials below to login to your account
			 */
			subtitle: () => LocalizedString
			forgotPassword: {
				/**
				 * Forgot your password?
				 */
				trigger: () => LocalizedString
				/**
				 * Forgot password
				 */
				title: () => LocalizedString
				/**
				 * Password reset is not yet available.
				 */
				unavailable: () => LocalizedString
				/**
				 * Please contact the support to reset your password.
				 */
				contact: () => LocalizedString
				/**
				 * Understood
				 */
				action: () => LocalizedString
			}
			/**
			 * Sign in
			 */
			action: () => LocalizedString
		}
		signUp: {
			/**
			 * Sign up
			 */
			title: () => LocalizedString
			/**
			 * Enter your credentials below to create an account
			 */
			subtitle: () => LocalizedString
			/**
			 * Sign up
			 */
			action: () => LocalizedString
		}
		signOut: {
			/**
			 * Sign out
			 */
			title: () => LocalizedString
			/**
			 * Sign out
			 */
			action: () => LocalizedString
		}
		/**
		 * Don't have an account?
		 */
		noAccount: () => LocalizedString
		/**
		 * Already have an account?
		 */
		alreadyHaveAccount: () => LocalizedString
		placeholders: {
			/**
			 * email@example.com
			 */
			email: () => LocalizedString
		}
		errors: {
			/**
			 * Email is required
			 */
			missingEmail: () => LocalizedString
			/**
			 * Email is incorrect
			 */
			incorrectEmail: () => LocalizedString
			/**
			 * Password is required
			 */
			missingPassword: () => LocalizedString
			/**
			 * Password is incorrect (must be at least 8 characters)
			 */
			incorrectPassword: () => LocalizedString
		}
	}
}

export type Formatters = {}

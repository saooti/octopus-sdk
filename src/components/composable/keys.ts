import { InjectionKey } from "vue";
import { loadLocaleMessages } from "../../i18n";

/**
 * Verifies a recaptcha token server-side. The consuming app provides its own
 * implementation via `app.provide(CHECK_TOKEN_KEY, ...)`; defaults to
 * always-verified so RecaptchaModal degrades gracefully when unregistered.
 */
export const CHECK_TOKEN_KEY: InjectionKey<(token: string) => Promise<boolean>> = Symbol("checkToken");

/**
 * Loads/merges i18n locale messages for a given locale. The consuming app
 * can provide a richer implementation (e.g. merging its own locale bundles)
 * via `app.provide(LOAD_LOCALE_MESSAGES_KEY, ...)`; defaults to the SDK's
 * own base-translations loader.
 */
export const LOAD_LOCALE_MESSAGES_KEY: InjectionKey<typeof loadLocaleMessages> = Symbol("loadLocaleMessages");

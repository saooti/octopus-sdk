import { nextTick } from "vue";
import { createI18n, I18n } from "vue-i18n";

export function setupI18n(options: { [key:string]: string|boolean }, isAuthenticated: boolean, isEducation: boolean) {
  const i18n = createI18n(options);
  loadLocaleMessages(i18n.global, options.locale,  isAuthenticated, isEducation);
  return i18n;
}

let i18nInstance: I18n | null = null;

/**
 * Register the app's i18n instance so it can be reached from code that
 * doesn't run inside a component setup, where useI18n() is unavailable.
 */
export function registerI18n(instance: I18n): void {
  i18nInstance = instance;
}

export function getI18n(): I18n {
  if (!i18nInstance) {
    throw new Error('i18n instance accessed before registerI18n() was called');
  }
  return i18nInstance;
}

export function setI18nLanguage(i18n: any, locale: string) {
  i18n.locale.value= locale;
  const html = document.querySelector("html");
  if (html) {
    html.setAttribute("lang", locale);
  }
}

export async function loadLocaleMessages(
  i18n: any,
  locale: string,
  isAuthenticated: boolean,
  isEducation: boolean,
) {
  if (
    !i18n.messages[locale] ||
    0 === Object.keys(i18n.messages[locale]).length
  ) {
    let messages = await import(`./locale/${locale}.ts`);
    messages = messages.default;
    if (isEducation && ("fr" === locale || "en" === locale)) {
      const messagesEdu = await import(`./locale/education${locale}.ts`);
      messages = { ...messages, ...messagesEdu.default };
    }
    i18n.setLocaleMessage(locale, messages);
  }
  setI18nLanguage(i18n, locale);
  return nextTick();
}

import { nextTick } from "vue";
import { createI18n } from "vue-i18n";
import dayjs from "dayjs";
import "dayjs/locale/de";
import "dayjs/locale/es";
import "dayjs/locale/fr";
import "dayjs/locale/it";
import "dayjs/locale/sl";

export function setupI18n(options: { locale: string }, isEducation: boolean) {
  const i18n = createI18n(options);
  loadLocaleMessages(i18n.global, options.locale, isEducation);
  return i18n;
}

export function setI18nLanguage(i18n: any, locale: string) {
  i18n.locale = locale;
  dayjs.locale(locale);
  const html = document.querySelector("html");
  if (html) {
    html.setAttribute("lang", locale);
  }
}

export async function loadLocaleMessages(
  i18n: any,
  locale: string,
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

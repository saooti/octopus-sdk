/**
 * Utility function to retrieve most relevant language for the user
 * @returns The most relevant language
 */
export function getLanguage(): string {
  const nameEQ = "octopus-language=";
  const ca = document.cookie.split(";");

  let language = "";
  for (const valueCookie of ca) {
    let c = valueCookie;
    while (c.startsWith(" ")) {
      c = c.substring(1, c.length);
    }
    if (0 === c.indexOf(nameEQ)) {
      language = c.substring(nameEQ.length, c.length);
      break;
    }
  }

  if (0 === language.length) {
    const navigatorLang = navigator.language;
    language = "fr";
    if (navigatorLang.includes("en")) {
      language = "en";
    } else if (navigatorLang.includes("it")) {
      language = "it";
    } else if (navigatorLang.includes("sl")) {
      language = "sl";
    } else if (navigatorLang.includes("es")) {
      language = "es";
    } else if (navigatorLang.includes("de")) {
      language = "de";
    }
  }

  return language;
}

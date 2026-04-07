/**
 * Utility function to retrieve most relevant language for the user
 * @params forceToKnown When set to true (default), will limit language to one
 *                      one of 6 known languages. When set to false, allow all
 *                      languages.
 * @returns The most relevant language
 */
export function getLanguage(forceToKnown = true): string {
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
        if (forceToKnown === true) {
            // Choose best avilable language
            for (const navigatorLang of navigator.languages) {
                if (navigatorLang.includes("fr")) {
                    language = "fr";
                    break;
                } else if (navigatorLang.includes("en")) {
                    language = "en";
                    break;
                } else if (navigatorLang.includes("it")) {
                    language = "it";
                    break;
                } else if (navigatorLang.includes("sl")) {
                    language = "sl";
                    break;
                } else if (navigatorLang.includes("es")) {
                    language = "es";
                    break;
                } else if (navigatorLang.includes("de")) {
                    language = "de";
                    break;
                }
            }
            if (!language) {
                language = "fr";
            }
        } else {
            language = navigator.language;
        }
    }

    return language;
}

import { ref } from "vue";
import { localisation } from "@tests/localisation";

export function mockI18n() {
    return {
        useI18n: () => ({
            t: localisation,
            te: () => true,
            locale: ref('fr')
        }),
        createI18n: () => {}
    };
}

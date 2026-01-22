import { vi } from "vitest";
import { ref } from "vue";
import { localisation } from "@tests/utils";

vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: localisation,
        locale: ref('fr')
    }),
    createI18n: () => {}
}));

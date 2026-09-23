<template>
    <div
        v-if="subOrganisations.length > 0"
        class="d-flex flex-column ms-4"
    >
        <span class="label mb-1">
            {{ t('RightsScopeSelector - Title', { rubriquage: rubriquage?.title}) }}
        </span>
        <div class="d-flex value">
            <button
                type="button"
                class="btn-transparent d-flex align-items-center"
                aria-controls="suborga-list-menu"
                :aria-expanded="open"
                @click="$emit('change')"
            >
                <span
                    v-if="selectedSubOrganisation"
                    class="me-2 selected"
                >
                    {{ selectedSubOrganisation.name }}
                </span>
                <span v-else class="me-2">
                    {{ t('RightsScopeSelector - No filter') }}
                </span>
                <SwapIcon class="icon" />
            </button>
            <button
                v-if="selectedSubOrganisation"
                type="button"
                class="btn-transparent"
                @click="unselectSubOrganisation"
            >
                <ClearIcon
                    class="icon"
                    :title="t('RightsScopeSelector - Clear filter')"
                />
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "../../stores/AuthStore";
import { ref, toRef, watch } from "vue";
import { useSubOrganisations } from "../composable/useSubOrganisations";
import { Rubriquage } from "@/stores/class/rubrique/rubriquage";
import { rubriquesApi } from "@/api";

import SwapIcon from "vue-material-design-icons/SwapHorizontalCircleOutline.vue";
import ClearIcon from "vue-material-design-icons/CloseCircleOutline.vue";
import { useI18n } from "vue-i18n";

//Composables
const { t } = useI18n();
const authStore = useAuthStore();
const authOrgaId = toRef(authStore, 'authOrgaId');
const rubriquage = ref<Rubriquage|null>(null);
const {
    selectedSubOrganisation,
    subOrganisations,
    unselectSubOrganisation
} = useSubOrganisations(authOrgaId);

defineProps<{
    /** Whether the sub organisation menu controlled by this selector is open */
    open?: boolean;
}>();

defineEmits<{
    (e: 'change'): void;
}>();

watch(authOrgaId, async () => {
    rubriquage.value = await rubriquesApi.findRestrictiveRubriquage(authOrgaId.value);
}, { immediate: true });
</script>

<style scoped lang="scss">
#header-scope-selector:deep(.octopus-select-field) {
    background: transparent;
    border-color: rgba(255, 255, 255, 0.1);
    margin-left: 200px;

    .octopus-select-value {
        color: var(--octopus-secondary);
        font-weight: bold;
        align-content: center;
    }

    input {
        color: white;
    }

    button {
        color: rgba(255, 255, 255, 0.3);
    }
}

.value {
    color: var(--octopus-secondary);
    font-weight: bold;
    align-content: center;
    align-items: center;

    button {
        color: inherit;
        font-weight: inherit;
        text-align: start;
        padding: 0;
    }

    span:not(.selected):not(.icon) {
        opacity: .5;
        transition: opacity .5s;

        &:hover {
            opacity: .7;
        }
    }
}

.label {
    color: rgba(255, 255, 255, 0.3);
    font-weight: 600;
    font-style: italic;
    font-size: 14px;
    white-space: nowrap;
    overflow-y: visible;
}

.icon {
    opacity: .7;
    transition: opacity .5s;

    &:hover {
        opacity: 1;
    }
}
</style>

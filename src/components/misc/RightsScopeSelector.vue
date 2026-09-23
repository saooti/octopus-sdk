<template>
    <div
        v-if="subOrganisations.length > 0"
        class="d-flex flex-column ms-4"
    >
        <span class="label mb-1">Filtrage du contenu ({{ rubriquage?.title }})</span>
        <div class="d-flex selected">
            <span class="me-2">{{ selectedSubOrganisation?.name ?? 'Aucun filtrage' }}</span>
            <SwapIcon @click="$emit('change')" />
            <ClearIcon v-if="selectedSubOrganisation" />
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

//Composables
const authStore = useAuthStore();
const authOrgaId = toRef(authStore, 'authOrgaId');
const rubriquage = ref<Rubriquage|null>(null);
const {
    selectedSubOrganisation,
    subOrganisations
} = useSubOrganisations(authOrgaId);

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

.selected {
    color: var(--octopus-secondary);
    font-weight: bold;
    align-content: center;
    align-items: center;
}

.label {
    color: rgba(255, 255, 255, 0.3);
    font-weight: 600;
    font-style: italic;
    font-size: 14px;
    white-space: nowrap;
    overflow-y: visible;
}
</style>

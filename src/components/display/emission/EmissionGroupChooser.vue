<template>
    <OctopusMultiselect
        :placeholder="$t('Search - Emission groups placeholder')"
        :selected="groups"
        :options="allGroups"
        :no-border="noBorder"
        option-label="name"
        option-key="groupId"
        @update:selected="emitSelected"
    />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

import OctopusMultiselect from "../../form/OctopusMultiselect.vue"; 
import { groupsApi, EmissionGroup } from "../../../api/groupsApi";

//Props 
const props = defineProps<{
    /** Filter by organisation */
    organisationId?: string|Array<string>;
    /** Currently selected groups */
    groups: Array<EmissionGroup>;
    /** Disable borders */
    noBorder?: boolean;
}>();

//Emits
const emit = defineEmits<{
    (e: "update:groups", groups: Array<EmissionGroup>): void;
}>();

//Data
const maxElement = 200;
const allGroups = ref<Array<EmissionGroup>>([]);

onMounted(async() => {
    const response = await groupsApi.search({
        first: 0,
        size: maxElement,
        organisationIds: [props.organisationId].flat(),
    });

    // Only groups with emissions are available
    allGroups.value =  response.result.filter(g => g.emissionIds?.length ?? 0 > 0);
});

function emitSelected(option: Array<EmissionGroup>) {
    emit("update:groups", option);
}
</script>

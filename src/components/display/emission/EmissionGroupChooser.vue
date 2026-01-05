<template>
    <ClassicMultiselect
        id="group-chooser"
        ref="selectGroup"
        option-label="name"
        :placeholder="$t('Search - Emission groups placeholder')"
        :max-element="maxElement"
        width="400px"
        in-modal
        :option-chosen="groups"
        multiple
        @on-search="onSearch"
        @selected="emitSelected"
    />
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue";

import ClassicMultiselect from "../../form/ClassicMultiselect.vue"; 
import { groupsApi, EmissionGroup } from "../../../api/groupsApi";

//Props 
const props = defineProps<{
    /** Filter by organisation */
    organisationId?: string|Array<string>;
    /** Currently selected groups */
    groups: Array<EmissionGroup>;
}>();

//Emits
const emit = defineEmits(["update:groups"]);

//Data
const maxElement = 50;
const selectGroupRef = useTemplateRef('selectGroup');

//Methods
async function onSearch(query?: string): Promise<void> {
    const response = await groupsApi.search({
        first: 0,
        size: maxElement,
        search: query,
        organisationIds: [props.organisationId].flat(),
    });

    selectGroupRef.value!.afterSearch(
        response.result.filter(g => g.emissionIds?.length ?? 0 > 0),
        response.count
    );
}

function emitSelected(option: Array<EmissionGroup>) {
    emit("update:groups", option);
}
</script>

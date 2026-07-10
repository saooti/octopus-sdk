<!--
  Component to display an emission with its description
-->
<template>
    <PresentationItem
        :name="emission.name"
        :route="route"
        :image-url="emission.imageUrl"
        :description="isDescription ? emission.description : undefined"
        :vertical="isVertical"
        :tags="tags"
        :additional-info="additionalInfoFor(emission)"
    />
</template>

<script setup lang="ts">
import { Emission } from "@/stores/class/general/emission";
import PresentationItem from "../../layouts/PresentationItem.vue";
import { computed, ref, watch } from "vue";
import { RouteLocationRaw } from "vue-router";
import { usePresentationItem } from "../../composable/usePresentationItem";

//Props 
const props = defineProps<{
    /** The emission to display */
    emission: Emission;
    /** When true display the card vertically */
    isVertical?: boolean;
    /** When true also display the description */
    isDescription?: boolean;
}>();

const tags = ref([]);
const { tagsFor, additionalInfoFor } = usePresentationItem();

watch(props.emission, async () => {
    tags.value = await tagsFor(props.emission);
}, { immediate: true });

const route = computed((): RouteLocationRaw => {
    return { name: 'emission', params: { emissionId: props.emission.emissionId } };
});
</script>

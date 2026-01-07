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
  />
</template>

<script setup lang="ts">
import { Emission } from "@/stores/class/general/emission";
import PresentationItem from "../../layouts/PresentationItem.vue";
import { computed } from "vue";
import { RouteLocationRaw } from "vue-router";

//Props 
const props = defineProps<{
  /** The emission to display */
  emission: Emission;
  /** When true display the card vertically */
  isVertical?: boolean;
  /** When true also display the description */
  isDescription?: boolean;
}>();

const route = computed((): RouteLocationRaw => {
  return { name: 'emission', params: { emissionId: props.emission.emissionId } };
});

</script>

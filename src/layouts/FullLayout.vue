<template>
  <TopBar/>
  <main role="main">
    <CategoryFilter v-if="firstDisplayCategoryFilter" />
    <div v-else class="category-filter-no-filter" />
    <router-view />
    <PlayerComponent />
  </main>
  <FooterOctopus />
</template>

<script setup lang="ts">
import TopBar from "@/components/misc/TopBar.vue";
import FooterOctopus from "@/components/misc/FooterSection.vue";
import PlayerComponent from "@/components/misc/player/PlayerComponent.vue";
import { defineAsyncComponent, ref, watch } from "vue";
import { useRoute } from "vue-router";

const CategoryFilter = defineAsyncComponent(
  () => import("@/components/display/categories/CategoryFilter.vue"),
);

//Data 
const firstDisplayCategoryFilter = ref(false);

//Composables
const route = useRoute();

//Watch
watch(route, async () => {
  if (firstDisplayCategoryFilter.value) {
    return;
  }
  const namesRouteWithCategoryFilter = [
    "homePriv",
    "home",
    "podcasts",
    "emissions",
    "participants",
    "playlists",
  ];
  firstDisplayCategoryFilter.value = namesRouteWithCategoryFilter.includes(
    route.name?.toString() ?? "",
  );
}, {immediate: true});

//Methods
</script>

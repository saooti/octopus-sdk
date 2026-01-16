<template>
  <section
    class="page-box page-box-absolute page-not-found"
    :style="backgroundStyle"
  >
    <div class="position-absolute module-box">
      <h1>{{ t("Oops") }}</h1>
      <h2>{{ t("The page you are looking for cannot be found") }}</h2>
      <router-link
        class="btn btn-primary"
        :to="{
          name: 'home',
          query: {
            iabId: filterStore.filterIab?.id,
            rubriquesId: rubriqueQueryParam,
            productor: filterStore.filterOrgaId
          },
        }"
      >
        {{ t("Back to home") }}
      </router-link>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRubriquesFilterComputed } from "../composable/route/useRubriquesFilterComputed";
import { useFilterStore } from "../../stores/FilterStore";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

//Composables
const { rubriqueQueryParam } = useRubriquesFilterComputed();
const filterStore = useFilterStore();
const { t } = useI18n();

//Computed
const backgroundStyle = computed(() => "background-image: url('/img/404.svg');");
</script>

<style lang="scss">
.octopus-app .page-not-found {
  background-size: cover;
  background-position: center;
  background-color: var(--octopus-background);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
}
</style>

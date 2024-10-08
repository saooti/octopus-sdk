<template>
  <div
    class="page-box page-box-absolute page-not-found"
    :style="backgroundStyle"
  >
    <div class="position-absolute module-box">
      <h1>{{ $t("Oops") }}</h1>
      <h2>{{ $t("The page you are looking for cannot be found") }}</h2>
      <router-link
        class="btn btn-primary"
        :to="{
          name: 'home',
          query: {
            productor: filterOrgaId,
            iabId: filterIab?.id,
            rubriquesId: rubriqueQueryParam,
          },
        }"
      >
        {{ $t("Back to home") }}
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { RubriquageFilter } from "@/stores/class/rubrique/rubriquageFilter";
import { useFilterStore } from "../../stores/FilterStore";
import { useGeneralStore } from "../../stores/GeneralStore";
import { mapState } from "pinia";
import { defineComponent } from "vue";
export default defineComponent({
  name: "PageNotFound",
  computed: {
    ...mapState(useGeneralStore, ["metaTitle"]),
    ...mapState(useFilterStore, [
      "filterRubrique",
      "filterIab",
      "filterOrgaId",
    ]),
    rubriqueQueryParam(): string | undefined {
      if (this.filterRubrique?.length) {
        return this.filterRubrique
          .map(
            (value: RubriquageFilter) =>
              value.rubriquageId + ":" + value.rubriqueId,
          )
          .join();
      }
      return undefined;
    },
    backgroundStyle(): string {
      return "background-image: url('/img/404.svg');";
    },
  },
  mounted() {
    document.title = this.metaTitle;
  },
});
</script>
<style lang="scss">
.octopus-app .page-not-found {
  background-size: cover;
  background-position: center;
  background-color: #ebebeb;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
}
</style>

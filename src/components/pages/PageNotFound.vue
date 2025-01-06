<template>
  <section
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
            iabId: filterIab?.id,
            rubriquesId: rubriqueQueryParam,
          },
        }"
      >
        {{ $t("Back to home") }}
      </router-link>
    </div>
  </section>
</template>

<script lang="ts">
import { rubriquesFilterComputed } from "../mixins/routeParam/rubriquesFilterComputed";
import { useFilterStore } from "../../stores/FilterStore";
import { mapState } from "pinia";
import { defineComponent } from "vue";
export default defineComponent({
  name: "PageNotFound",
  mixins: [rubriquesFilterComputed],
  computed: {
    ...mapState(useFilterStore, ["filterIab"]),
    backgroundStyle(): string {
      return "background-image: url('/img/404.svg');";
    },
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

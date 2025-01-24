<template>
  <section
    class="page-box page-box-absolute page-logout"
  >
    <div class="logout-section">
      <h1 class="mb-3">{{ $t("Logout") }}</h1>
      <div class="loader"></div>
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
  },
});
</script>
<style lang="scss">
.octopus-app .page-logout {
  background: linear-gradient(
    90deg,
    var(--octopus-primary) 0%,
    var(--octopus-tertiary) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;

  .logout-section{
    background: var(--octopus-background);
    padding: 3rem;
  }

  .loader {
    width: 100%;
    height: 20px;
    border-radius: 20px;
    background:
    repeating-linear-gradient(135deg,
    oklch(from var(--octopus-primary) calc(l * 1.09) c h) 0 10px,
    oklch(from var(--octopus-tertiary) calc(l * 1.09) c h) 0 20px) 0/0%   no-repeat,
    repeating-linear-gradient(135deg,#ddd    0 10px,#eee    0 20px) 0/100%;
    animation: l3 2s infinite;
  }
  @keyframes l3 {
      100% {background-size:100%}
  }
}
</style>

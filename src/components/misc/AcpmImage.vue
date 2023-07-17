<template>
  <img
    width="44"
    height="44"
    class="acpm_image"
    src="/img/ACPM.webp"
    :title="$t('Octopus is ACPM Podcast accredited')"
    :alt="$t('Octopus is ACPM Podcast accredited')"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "AcpmImage",
});
</script>

<style lang="scss">
.octopus-app {
  .acpm_image {
    width: 44px;
    height: 44px;
  }
}
</style>

<template>
  <img
    width="44"
    height="44"
    class="acpm-image"
    src="/img/ACPM.webp"
    :title="t('Octopus is ACPM Podcast accredited')"
    :alt="t('Octopus is ACPM Podcast accredited')"
  />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
//Composables
const { t } = useI18n();
</script>

<style lang="scss">
.octopus-app {
  .acpm-image {
    width: 44px;
    height: 44px;
  }
}
</style>

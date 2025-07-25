<template>
  <section
    class="page-box page-box-absolute page-logout bg-gradient"
  >
    <div class="logout-section">
      <h1 class="mb-3">{{ t("Logout") }}</h1>
      <div class="loader"></div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";


//Composables
const { t } = useI18n();

</script>
<style lang="scss">
.octopus-app .page-logout {
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
    oklch(from var(--octopus-tertiary) calc(l * 1.09) c h) 0 20px) 0 / 0%   no-repeat,
    repeating-linear-gradient(135deg,var(--octopus-secondary)    0 10px,var(--octopus-secondary-darker)    0 20px) 0 / 100%;
    animation: l3 2s infinite;
  }

  @keyframes l3 {
      100% {background-size:100%}
  }
}
</style>

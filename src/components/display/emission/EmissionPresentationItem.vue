<template>
  <div
    class="emission-item-container emission-presentation-container mt-3"
    :class="isVertical ? 'emission-vertical-item' : ''"
  >
    <router-link
      :to="{
        name: 'emission',
        params: { emissionId: emission.emissionId },
        query: { productor: filterOrgaId },
      }"
      :title="$t('Emission')"
      class="d-flex-column flex-grow-1 text-dark"
      :class="isVertical ? 'flex-column' : ''"
    >
      <img
        v-lazy="proxyImageUrl(emission.imageUrl, isVertical ? '400' : '250')"
        :width="isVertical ? '400' : '250'"
        :height="isVertical ? '400' : '250'"
        :class="isVertical ? 'img-box-bigger' : ''"
        class="img-box"
        :title="$t('Emission name image', { name: emission.name })"
        :alt="$t('Emission name image', { name: emission.name })"
      />
      <div class="emission-item-text">
        <div class="d-flex align-items-center emission-name">
          {{ emission.name }}
        </div>
      </div>
    </router-link>
  </div>
</template>

<script lang="ts">
import { orgaComputed } from "../../mixins/orgaComputed";
import { Emission } from "@/stores/class/general/emission";
import imageProxy from "../../mixins/imageProxy";
import displayMethods from "../../mixins/displayMethods";
import { defineComponent } from "vue";
export default defineComponent({
  name: "EmissionItem",

  mixins: [displayMethods, orgaComputed, imageProxy],

  props: {
    emission: { default: () => ({}), type: Object as () => Emission },
    isVertical: { default: false, type: Boolean },
  },
});
</script>
<style lang="scss">
.octopus-app {
  .emission-presentation-container {
    @media (max-width: 960px) {
      width: 250px !important;
      margin-right: 0.5rem;
    }
  }
  .emission-item-container.emission-vertical-item {
    flex-grow: 0;
    width: 400px;
    flex-shrink: 0;
  }
  .img-box-bigger {
    width: 400px;
    height: 400px;
  }
}
</style>

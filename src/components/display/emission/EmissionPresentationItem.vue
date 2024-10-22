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
        <div class="emission-name mb-2">
          {{ emission.name }}
        </div>
        <div
          v-if="!isPhone && isDescription"
          ref="descriptionEmissionContainer"
          class="emission-description htms-wysiwyg-content"
        >
          <!-- eslint-disable vue/no-v-html -->
          <div
            ref="descriptionEmission"
            v-html="urlify(emission.description || '')"
          />
          <!-- eslint-enable -->
        </div>
      </div>
    </router-link>
  </div>
</template>

<script lang="ts">
import { useFilterStore } from "../../../stores/FilterStore";
import resizePhone from "../../mixins/resizePhone";
import { Emission } from "@/stores/class/general/emission";
import imageProxy from "../../mixins/imageProxy";
import displayMethods from "../../mixins/displayMethods";
import { defineComponent } from "vue";
import { mapState } from "pinia";
export default defineComponent({
  name: "EmissionItem",

  mixins: [displayMethods, imageProxy, resizePhone],

  props: {
    emission: { default: () => ({}), type: Object as () => Emission },
    isVertical: { default: false, type: Boolean },
    isDescription: { default: false, type: Boolean },
  },
  data() {
    return {
      isPhone: false as boolean,
    };
  },
  computed: {
    ...mapState(useFilterStore, ["filterOrgaId"]),
  },
  watch: {
    isPhone: {
      immediate: true,
      handler() {
        this.$nextTick(() => {
          if (!this.isDescription || this.isPhone) {
            return;
          }
          const emissionDesc = this.$refs.descriptionEmission as HTMLElement;
          const emissionDescContainer = this.$refs
            .descriptionEmissionContainer as HTMLElement;
          if (
            emissionDesc &&
            emissionDescContainer &&
            emissionDesc.clientHeight > emissionDescContainer.clientHeight
          ) {
            emissionDescContainer.classList.add("after-emission-description");
          }
        });
      },
    },
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
    .emission-description {
      height: 0;
      flex-grow: 1;
      max-height: unset;
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

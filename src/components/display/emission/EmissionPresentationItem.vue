<template>
  <article
    class="classic-element-container emission-presentation-container mt-3"
    :class="isVertical ? 'emission-vertical-item' : ''"
  >
    <router-link
      :to="{
        name: 'emission',
        params: { emissionId: emission.emissionId },
      }"
      :title="$t('Series name page', { name: emission.name })"
      class="d-flex-column flex-grow-1 text-dark"
      :class="isVertical ? 'flex-column' : ''"
    >
      <img
        v-lazy="useProxyImageUrl(emission.imageUrl, isVertical ? '400' : '250')"
        :width="isVertical ? '400' : '250'"
        :height="isVertical ? '400' : '250'"
        :class="isVertical ? 'img-box-bigger' : ''"
        class="img-box"
        role="presentation"
        
        :title="$t('Emission name image', { name: emission.name })"
      />
      <div class="classic-element-text">
        <div class="element-name mb-2 basic-line-clamp">
          {{ emission.name }}
        </div>
        <div
          v-if="!isPhone && isDescription"
          ref="descriptionEmissionContainer"
          class="element-description htms-wysiwyg-content"
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
  </article>
</template>

<script lang="ts">
import { useFilterStore } from "../../../stores/FilterStore";
import {useResizePhone} from "../../composable/useResizePhone";
import { Emission } from "@/stores/class/general/emission";
import {useImageProxy} from "../../composable/useImageProxy";
import displayHelper from "../../../helper/displayHelper";
import { defineComponent } from "vue";
import { mapState } from "pinia";
export default defineComponent({
  name: "EmissionItem",

  props: {
    emission: { default: () => ({}), type: Object as () => Emission },
    isVertical: { default: false, type: Boolean },
    isDescription: { default: false, type: Boolean },
  },
  setup(){
    const { isPhone } = useResizePhone();
    const { useProxyImageUrl } = useImageProxy();
    return { isPhone, useProxyImageUrl }
  },


  data() {
    return {
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
            emissionDescContainer.classList.add("after-element-description");
          }
        });
      },
    },
  },
  methods:{
    urlify(text:string|undefined){
      return displayHelper.urlify(text);
    },
  }
});
</script>
<style lang="scss">
.octopus-app {
  .emission-presentation-container {
    @media (width <= 960px) {
      width: 250px !important;
      margin-right: 0.5rem;
    }

    .element-description {
      height: 0;
      flex-grow: 1;
      max-height: unset;
    }
  }

  .classic-element-container.emission-vertical-item {
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

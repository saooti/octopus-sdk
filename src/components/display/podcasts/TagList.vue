<template>
  <div
    v-if="undefined !== tagList && 0 !== tagList.length"
    class="tag-list-component d-flex align-items-center flex-wrap comma mb-3 small-text"
  >
    <div class="fw-bold me-3">
      {{ $t("Podcast tags") + " : " }}
    </div>
    <div
      v-for="(tag, index) in tagList"
      :key="tag"
      class="d-flex align-items-center comma-element"
      :class="ouestFranceMainTag === tag ? 'main-of-tag' : ''"
    >
      <template v-if="!isOuestFranceTag(tag)">{{ tag }}</template>
      <template v-else>
        <button
          :id="'tag-list-from-podcast-page' + index"
          class="btn-transparent d-flex align-items-center"
        >
          <img
            width="20"
            height="20"
            class="ouest-france-logo"
            role="presentation"
            alt=""
            src="/img/ouest_france_logo.svg" 
          />
          {{ formateOfTag(tag) }}
        </button>
        <ClassicPopover
          :target="'tag-list-from-podcast-page' + index"
          :content="tag.substring(4, tag.length)"
          relative-class="page-element"
          :is-fixed="true"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from "vue";
const ClassicPopover = defineAsyncComponent(
  () => import("../../misc/ClassicPopover.vue"),
);
import tagOfMixins from "../../mixins/tagOfMixins";
export default defineComponent({
  name: "TagList",
  components: {
    ClassicPopover,
  },
  mixins: [tagOfMixins],
  props: {
    tagList: { default: () => [], type: Array as () => Array<string> },
    podcastAnnotations: {
      default: () => {},
      type: Object as () => {
        [key: string]: string | number | boolean | undefined;
      },
    },
  },
  computed: {
    ouestFranceMainTag(): string | undefined {
      if (this.podcastAnnotations?.["mainOfTag"]) {
        for (const key in this.podcastAnnotations) {
          if (
            this.podcastAnnotations[key] ===
              this.podcastAnnotations["mainOfTag"] &&
            key !== "mainOfTag"
          ) {
            return "[of]" + key;
          }
        }
      }
      return undefined;
    },
  },
});
</script>

<style lang="scss">
.octopus-app {
  .tag-list-component {
    .ouest-france-logo {
      width: 20px;
      height: 20px;
      margin-right: 5px;
    }

    .main-of-tag {
      box-shadow: var(--octopus-shadow) 0 5px 15px;
      font-size: 0.9rem;
    }
  }
}
</style>

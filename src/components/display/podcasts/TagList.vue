<template>
  <div
    v-if="undefined !== tagList && 0 !== tagList.length"
    class="tag-list-component d-flex align-items-center flex-wrap"
  >
    <div>
      {{ $t("Podcast tags") + ": " }}
    </div>
    <div v-for="(tag, index) in tagList" :key="tag" class="tag-list-element">
      <div
        :id="'tag-list-from-podcast-page' + index"
        role="button"
        class="d-flex align-items-center"
      >
        <img
          v-if="isOuestFranceTag(tag)"
          width="20"
          height="20"
          class="ouest-france-logo"
          alt="Ouest France Logo"
          src="/img/ouest_france_logo.svg"
        />
        {{ formateOfTag(tag) }}
      </div>
      <ClassicPopover
        v-if="isOuestFranceTag(tag)"
        :target="'tag-list-from-podcast-page' + index"
        :content="tag.substring(4, tag.length)"
        relative-class="page-element"
        :is-fixed="true"
      />
    </div>
  </div>
</template>

<script lang="ts">
import ClassicPopover from "../../misc/ClassicPopover.vue";
import tagOfMixins from "../../mixins/tagOfMixins";
import { defineComponent } from "vue";
export default defineComponent({
  name: "TagList",
  components: {
    ClassicPopover,
  },
  mixins: [tagOfMixins],
  props: {
    tagList: { default: () => [], type: Array as () => Array<string> },
  },
});
</script>

<style lang="scss">
@import "@scss/_variables.scss";
.octopus-app {
  .tag-list-component {
    .ouest-france-logo {
      width: 20px;
      height: 20px;
      margin-right: 5px;
    }
    .tag-list-element {
      display: flex;
      align-items: center;
      margin: 0.4rem;
      padding: 0.2rem;
      border: 1px solid #999;
      border-radius: $octopus-borderradius;
    }
  }
}
</style>

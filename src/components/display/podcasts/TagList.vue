<template>
  <div
    v-if="undefined !== tagList && 0!==tagList.length"
    class="tag-list-component d-flex align-items-center flex-wrap"
  >
    <div class="fw-bold">
      {{ $t('Podcast tags') + ": " }}
    </div>
    <div
      v-for="(tag, index) in tagList"
      :key="tag"
      class="tag-list-element"
    >
      <div
        :id="'tag-list-from-podcast-page'+index"
        role="button"
      >
        <img
          v-if="isOuestFranceTag(tag)"
          class="ouest-france-logo"
          alt="Ouest France Logo"
          src="/img/ouest_france_logo.svg"
        >
        {{ formateOfTag(tag) }}
      </div>
      <Popover
        v-if="isOuestFranceTag(tag)"
        :target="'tag-list-from-podcast-page'+index"
        triggers="hover"
        :content="tag.substring(4,tag.length)"
        placement="bottom"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Popover from '../../misc/Popover.vue';
import { tagOfMixins } from '../../mixins/tagOfMixins';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'TagList',
  components: {
    Popover
  },
  mixins:[tagOfMixins],
  props: {
    tagList: { default: () => [], type: Array as ()=>Array<string>},
  },
})
</script>

<style lang="scss">
.octopus-app{
.tag-list-component{
  .ouest-france-logo{
    width: 20px;
    height: 20px;
    margin-right: 5px;
  }
  .tag-list-element {
    display: flex;
    margin: 0.4rem;
    padding: 0.2rem;
    border: 1px solid #999;
    border-radius: 0.5rem;
  }
}
}
</style>
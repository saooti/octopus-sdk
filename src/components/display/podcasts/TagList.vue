<template>
  <div
    v-if="undefined !== tagListFiltered && 0 !== tagListFiltered.length"
    class="tag-list-component d-flex align-items-center flex-wrap mb-3 small-text"
  >
    <div class="fw-bold me-3">
      {{ t("Podcast tags") + " : " }}
    </div>
    <router-link
      v-for="(tag, index) in tagListFiltered"
      :key="tag"
      class="d-flex align-items-center border p-1 m-1 text-dark"
      :to="{
        name: 'tag',
        params: { tag },
        query: organisationQuery
      }"
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
            aria-hidden="true"
        alt=""
            title="Ouest France"
            
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
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
const ClassicPopover = defineAsyncComponent(
  () => import("../../misc/ClassicPopover.vue"),
);
import {useTagOf} from "../../composable/useTagOf";
import { useFilterStore } from "../../../stores/FilterStore";
import { useI18n } from "vue-i18n";

//Props 
const props = defineProps({
  tagList: { default: () => [], type: Array as () => Array<string> },
  podcastAnnotations: {
    default: () => {},
    type: Object as () => {
      [key: string]: string | number | boolean | undefined;
    },
  },
  orgaId: {default: "", type: String,},
})


//Composables
const { t } = useI18n()
const { isOuestFranceTag, formateOfTag } = useTagOf();
const filterStore = useFilterStore();

//Computed
const tagListFiltered = computed(() => {
  return props.tagList.filter((tag: string) => {
    return !tag.match(/^\[\[.*\]\]$/);
  });
});
const organisationQuery = computed(() => {
  if(filterStore.filterOrgaId){
    return undefined;
  }
  return { o: props.orgaId };
});
/* const ouestFranceMainTag = computed(() => {
  if (props.podcastAnnotations?.["mainOfTag"]) {
    for (const key in props.podcastAnnotations) {
      if (
        props.podcastAnnotations[key] ===
        props.podcastAnnotations["mainOfTag"] &&
        key !== "mainOfTag"
      ) {
        return "[of]" + key;
      }
    }
  }
  return undefined;
}); */
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

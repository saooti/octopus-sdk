<template>
  <section v-if="isInit" class="page-box">
    <router-link
      v-if="isRolePlaylists && !isPodcastmaker"
      to="/main/priv/edit/playlist"
      class="d-flex justify-content-center my-3"
    >
      <div class="btn btn-primary">
        {{ $t("Create playlist") }}
      </div>
    </router-link>
    <ProductorSearch
      v-model:organisation-id="organisationId"
      v-model:search-pattern="searchPattern"
      type="playlist"
    />
    <PlaylistList
      :show-count="true"
      :first="paginateFirst"
      :size="ps"
      :query="searchMinSize"
      :organisation-id="organisationId"
    />
  </section>
</template>

<script setup lang="ts">
import { useSimplePageParam } from "../composable/route/useSimplePageParam";
import PlaylistList from "../display/playlist/PlaylistList.vue";
import { useAuthStore } from "../../stores/AuthStore";
import { state } from "../../stores/ParamSdkStore";
import {  computed, defineAsyncComponent } from "vue";
const ProductorSearch = defineAsyncComponent(
  () => import("../display/filter/ProductorSearch.vue"),
);
const props = defineProps({
  pr: { default: 0, type: Number },
  ps: { default: 30, type: Number },
  routeOrga: { default: undefined, type: String },
  routeQuery: { default: "", type: String },
});

const {
  searchPattern,
  organisationId,
  searchMinSize,
  paginateFirst,
  isInit
} = useSimplePageParam(props);

const authStore = useAuthStore();

const isPodcastmaker = computed(() =>state.generalParameters.podcastmaker as boolean);
const isRolePlaylists = computed(() =>authStore.isRolePlaylists);

</script>

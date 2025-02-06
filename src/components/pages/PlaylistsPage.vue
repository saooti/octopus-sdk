<template>
  <section class="page-box">
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

<script lang="ts">
import { paginateParamInit } from "../mixins/routeParam/paginateParamInit";
import PlaylistList from "../display/playlist/PlaylistList.vue";
import { useAuthStore } from "../../stores/AuthStore";
import { state } from "../../stores/ParamSdkStore";
import { defineComponent, defineAsyncComponent } from "vue";
import { mapState } from "pinia";
const ProductorSearch = defineAsyncComponent(
  () => import("../display/filter/ProductorSearch.vue"),
);
export default defineComponent({
  components: {
    ProductorSearch,
    PlaylistList,
  },
  mixins: [paginateParamInit],
  props: {
    pr: { default: 0, type: Number },
    ps: { default: 30, type: Number },
    routeOrga: { default: undefined, type: String },
    routeQuery: { default: "", type: String },
  },

  data() {
    return {
      searchPattern: "" as string,
      organisationId: undefined as string | undefined,
    };
  },

  computed: {
    ...mapState(useAuthStore, ["isRolePlaylists"]),
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker as boolean;
    },
  },
});
</script>

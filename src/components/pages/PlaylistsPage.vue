<template>
  <div class="page-box">
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
      :first="first"
      :size="size"
      :query="searchPattern"
      :organisation-id="organisationId"
    />
  </div>
</template>

<script lang="ts">
import PlaylistList from "../display/playlist/PlaylistList.vue";
import { useAuthStore } from "../../stores/AuthStore";
import { useFilterStore } from "../../stores/FilterStore";
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
  props: {
    productor: { default: undefined, type: String },
  },

  data() {
    return {
      first: 0 as number,
      size: 30 as number,
      searchPattern: "" as string,
      organisationId: undefined as string | undefined,
    };
  },

  computed: {
    ...mapState(useFilterStore, ["filterOrgaId"]),
    ...mapState(useAuthStore, ["isRolePlaylists"]),
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker as boolean;
    },
  },

  created() {
    this.organisationId = this.productor ? this.productor : this.filterOrgaId;
  },
});
</script>

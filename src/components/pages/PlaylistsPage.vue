<template>
  <div class="page-box">
    <router-link
      v-if="editRight && !isPodcastmaker"
      to="/main/priv/edit/playlist"
      class="d-flex justify-content-center my-3"
    >
      <div class="btn btn-primary">
        {{ $t("Create playlist") }}
      </div>
    </router-link>
    <ProductorSearch
      v-model:organisationId="organisationId"
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
import { orgaComputed } from "../mixins/orgaComputed";
import PlaylistList from "../display/playlist/PlaylistList.vue";
import { state } from "../../stores/ParamSdkStore";
import { defineComponent, defineAsyncComponent } from "vue";
const ProductorSearch = defineAsyncComponent(
  () => import("../display/filter/ProductorSearch.vue"),
);
export default defineComponent({
  components: {
    ProductorSearch,
    PlaylistList,
  },
  mixins: [orgaComputed],
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
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker as boolean;
    },
    editRight(): boolean {
      return state.generalParameters.isPlaylist ?? false;
    },
  },

  created() {
    this.organisationId = this.productor ? this.productor : this.filterOrgaId;
  },
});
</script>

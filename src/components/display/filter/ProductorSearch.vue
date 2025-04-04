<template>
  <div id="productor-search" class="d-flex-column align-items-center my-3">
    <div
      v-if="!isPodcastmaker && !filterOrgaId"
      class="w-50-responsive pe-3 position-relative"
    >
      <OrganisationChooser
        :defaultanswer="$t('No organisation filter')"
        :orga-id-selected="organisationId"
        @selected="onOrganisationSelected"
      />
      <template  v-if="!authOrgaId ||authOrgaId ===organisationId">
        <ClassicCheckbox
          v-model:text-init="keepOrganisation"
          :class="!!organisationId ? '' : 'invisible'"
          class="m-3"
          :label="
            $t(
              'check this box if you want to keep this filter for the rest of your visit',
            )
          "
          :display-label="false"
          id-checkbox="organisation-checkbox"
          @click-action="onKeepOrganisation"
        />
        <div v-if="showBubble" class="filter-speech-bubble">
          {{
            $t(
              "check this box if you want to keep this filter for the rest of your visit",
            )
          }}
        </div>
      </template>
    </div>
    <ClassicSearch
      :text-init="searchPattern"
      class="w-50-responsive"
      :autofocus="true"
      id-search="productor-search-input"
      :label="searchText"
      @update:text-init="updateSearchPattern"
    />
  </div>
</template>

<script lang="ts">
import { useRouteUpdateParams } from "../../composable/route/useRouteUpdateParams";
import ClassicSearch from "../../form/ClassicSearch.vue";
import { state } from "../../../stores/ParamSdkStore";
import { Organisation } from "@/stores/class/general/organisation";
import { useFilterStore } from "../../../stores/FilterStore";
import { mapState } from "pinia";
import { defineComponent, defineAsyncComponent } from "vue";
import { useAuthStore } from "../../../stores/AuthStore";
const OrganisationChooser = defineAsyncComponent(
  () => import("../organisation/OrganisationChooser.vue"),
);
const ClassicCheckbox = defineAsyncComponent(
  () => import("../../form/ClassicCheckbox.vue"),
);
export default defineComponent({
  components: {
    OrganisationChooser,
    ClassicSearch,
    ClassicCheckbox,
  },

  props: {
    organisationId: { default: undefined, type: String },
    searchPattern: { default: "", type: String },
    type: { default: "podcast", type: String },
  },
  emits: ["update:organisationId", "update:searchPattern"],

  setup(){
    const { updateRouteParam } = useRouteUpdateParams();
    return {updateRouteParam}
  },

  data() {
    return {
      keepOrganisation: false as boolean,
      showBubble: false as boolean,
    };
  },
  computed: {
    ...mapState(useFilterStore, ["filterOrgaId"]),
    ...mapState(useAuthStore, ["authOrgaId"]),
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker as boolean;
    },
    searchText(): string {
      if ("emission" === this.type) return this.$t("Look for emission name");
      if ("participant" === this.type)
        return this.$t("Look for participant name");
      if ("playlist" === this.type) return this.$t("Look for playlist name");
      return this.$t("Look for podcast name");
    },
  },
  watch: {
    filterOrgaId(): void {
      this.keepOrganisation = undefined !== this.filterOrgaId;
      if (this.filterOrgaId) {
        this.$emit("update:organisationId", this.filterOrgaId);
      }else{
        this.updateRouteParam({ o: this.organisationId, productor:undefined});
      }
    },
  },
  created() {
    if (!this.organisationId) return;
    if (this.filterOrgaId === this.organisationId) {
      this.keepOrganisation = true;
    }
  },
  methods: {
    updateSearchPattern(newSearch: string) {
      this.$emit("update:searchPattern", newSearch);
    },
    onOrganisationSelected(organisation: Organisation): void {
      this.updateRouteParam({ o: organisation.id, productor: undefined });
      this.keepOrganisation = false;
      if (!organisation?.id) {
        this.$emit("update:organisationId", undefined);
      }
      this.$emit("update:organisationId", organisation.id);
      if (undefined===this.authOrgaId && "PUBLIC" !== organisation.privacy) {
        this.onKeepOrganisation(organisation.id);
      } else {
        this.showBubble = true;
        setTimeout(() => {
          this.showBubble = false;
        }, 6000);
      }
    },
    async onKeepOrganisation(orgaId: string|undefined = undefined): Promise<void> {
      const orgaToApply= orgaId ?? this.organisationId;
      if (!orgaToApply) {
        return;
      }
      this.$router.push({
        query: { ...this.$route.query, ...{ productor: orgaToApply, o:undefined }},
      });
    },
  },
});
</script>

<style lang="scss">

.octopus-app {
  .filter-speech-bubble {
    position: absolute;
    background: var(--octopus-primary);
    border-radius: var(--octopus-border-radius);
    width: 10rem;
    right: 4rem;
    padding: 5px;
    animation: fadein 1s;
    color: white;
  }

  .filter-speech-bubble::after {
    content: "";
    position: absolute;
    right: 0;
    top: 50%;
    width: 0;
    height: 0;
    border: 18px solid transparent;
    border-left-color: var(--octopus-primary);
    border-right: 0;
    border-bottom: 0;
    margin-top: -9px;
    margin-right: -18px;
    animation: fadein 1s;
  }

  @keyframes fadein {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @keyframes fadein {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @keyframes fadein {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }
}
</style>

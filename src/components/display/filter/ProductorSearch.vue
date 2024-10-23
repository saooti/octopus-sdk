<template>
  <div class="d-flex-column align-items-center my-3">
    <div
      v-if="!isPodcastmaker && !filterOrgaId"
      class="w-50-responsive pe-3 position-relative"
    >
      <OrganisationChooser
        :defaultanswer="$t('No organisation filter')"
        :orga-id-selected="organisationId"
        @selected="onOrganisationSelected"
      />
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
      <div :class="showBubble ? '' : 'invisible'" class="filter-speech-bubble">
        {{
          $t(
            "check this box if you want to keep this filter for the rest of your visit",
          )
        }}
      </div>
    </div>
    <ClassicSearch
      :text-init="searchPattern"
      class="w-50-responsive"
      :autofocus="true"
      id-search="productor-search-input"
      :label="searchText"
      @update:text-init="$emit('update:searchPattern', $event)"
    />
  </div>
</template>

<script lang="ts">
import ClassicSearch from "../../form/ClassicSearch.vue";
import { state } from "../../../stores/ParamSdkStore";
import orgaFilter from "../../mixins/organisationFilter";
import { Organisation } from "@/stores/class/general/organisation";
import { useFilterStore } from "../../../stores/FilterStore";
import { mapState, mapActions } from "pinia";
import { defineComponent, defineAsyncComponent } from "vue";
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
  mixins: [orgaFilter],

  props: {
    organisationId: { default: undefined, type: String },
    searchPattern: { default: "", type: String },
    type: { default: "podcast", type: String },
  },
  emits: ["update:organisationId", "update:searchPattern"],

  data() {
    return {
      keepOrganisation: false as boolean,
      showBubble: false as boolean,
    };
  },
  computed: {
    ...mapState(useFilterStore, ["filterOrgaId"]),
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
    ...mapActions(useFilterStore, ["filterUpdateOrga"]),
    onOrganisationSelected(organisation: Organisation): void {
      if (this.$route.query.productor) {
        this.$router.push({ query: { productor: undefined } });
      }
      this.filterUpdateOrga({ orgaId: undefined });
      this.keepOrganisation = false;
      if (organisation?.id) {
        this.$emit("update:organisationId", organisation.id);
        if ("PUBLIC" !== organisation.privacy) {
          this.$nextTick(() => {
            this.onKeepOrganisation();
          });
        } else {
          this.showBubble = true;
          setTimeout(() => {
            this.showBubble = false;
          }, 6000);
        }
      } else {
        this.$emit("update:organisationId", undefined);
      }
    },
    async onKeepOrganisation(): Promise<void> {
      if (!this.organisationId) {
        return;
      }
      if (!this.keepOrganisation) {
        await this.selectOrganisation(this.organisationId);
        return;
      }
      this.removeSelectedOrga();
    },
  },
});
</script>

<style lang="scss">
@use "@scss/variables" as octopusVariables;
.octopus-app {
  .filter-speech-bubble {
    position: absolute;
    background: octopusVariables.$octopus-primary-color;
    border-radius: octopusVariables.$octopus-borderradius;
    width: 10rem;
    right: 4rem;
    padding: 5px;
    -webkit-animation: fadein 1s;
    -moz-animation: fadein 1s;
    animation: fadein 1s;
    color: white;
  }

  .filter-speech-bubble:after {
    content: "";
    position: absolute;
    right: 0;
    top: 50%;
    width: 0;
    height: 0;
    border: 18px solid transparent;
    border-left-color: octopusVariables.$octopus-primary-color;
    border-right: 0;
    border-bottom: 0;
    margin-top: -9px;
    margin-right: -18px;
    -webkit-animation: fadein 1s;
    -moz-animation: fadein 1s;
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
  @-moz-keyframes fadein {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @-webkit-keyframes fadein {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
}
</style>

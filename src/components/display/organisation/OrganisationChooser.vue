<template>
  <ClassicMultiselect
    v-if="!orgaIdSelected || initLoaded"
    id="organisation-chooser"
    ref="selectOrganisation"
    option-label="name"
    :label="$t('select productor')"
    :max-element="maxElement"
    :width="width"
    :in-modal="inModal"
    :option-chosen="organisationChosen"
    option-custom-templating="optionTemplating"
    option-selected-custom-templating="optionTemplating"
    :no-deselect="noDeselect"
    @on-search="onSearchOrganisation"
    @selected="$emit('selected', $event)"
  >
    <template v-if="isImage" #optionTemplating="{ option }">
      <div
        class="d-flex align-items-center"
        :data-selenium="'organisation-chooser-' + seleniumFormat(option.name)"
      >
        <img
          v-lazy="proxyImageUrl(option.imageUrl, '32')"
          width="32"
          height="32"
          class="me-2"
          :alt="option.name"
        />
        <span>
          {{ option.name }}
        </span>
      </div>
    </template>
  </ClassicMultiselect>
</template>

<script lang="ts">
import { useAuthStore } from "../../../stores/AuthStore";
import { mapActions, mapState } from "pinia";
import imageProxy from "../../mixins/imageProxy";
import selenium from "../../mixins/selenium";
import classicApi from "../../../api/classicApi";
import ClassicMultiselect from "../../form/ClassicMultiselect.vue";
import { defineComponent } from "vue";
import {
  emptyOrgaData,
  Organisation,
} from "@/stores/class/general/organisation";
import { useSaveFetchStore } from "../../../stores/SaveFetchStore";
import { ListClassicReturn } from "@/stores/class/general/listReturn";
export default defineComponent({
  components: {
    ClassicMultiselect,
  },
  mixins: [selenium, imageProxy],
  props: {
    defaultanswer: { default: "", type: String },
    orgaIdSelected: { default: undefined, type: String },
    reset: { default: false, type: Boolean },
    width: { default: "100%", type: String },
    isImage: { default: true, type: Boolean },
    inModal: { default: false, type: Boolean },
    noDeselect: { default: true, type: Boolean },
  },
  emits: ["selected"],
  data() {
    return {
      maxElement: 50 as number,
      organisationChosen: undefined as Organisation | undefined,
      initLoaded: false as boolean,
    };
  },

  computed: {
    ...mapState(useAuthStore, ["authOrganisation", "authOrgaId"]),
    getDefaultOrganisation(): Organisation | undefined {
      if ("" === this.defaultanswer) {
        return undefined;
      }
      return emptyOrgaData(this.defaultanswer);
    },
    myOrganisation(): Organisation | undefined {
      if (!this.authOrgaId) return undefined;
      return {
        ...this.authOrganisation,
        ...{
          name: `${this.$t("Edit my organisation")} (${
            this.authOrganisation.name
          })`,
        },
      };
    },
  },
  watch: {
    orgaIdSelected: {
      immediate: true,
      handler() {
        if (!this.initLoaded && this.orgaIdSelected) {
          this.fetchOrganisation();
        }
      },
    },
    reset(): void {
      this.organisationChosen = this.getDefaultOrganisation;
    },
  },

  created() {
    this.organisationChosen = this.getDefaultOrganisation;
  },
  methods: {
    ...mapActions(useSaveFetchStore, ["getOrgaData"]),
    async onSearchOrganisation(query?: string): Promise<void> {
      const response = await classicApi.fetchData<
        ListClassicReturn<Organisation>
      >({
        api: 0,
        path: "organisation/search",
        parameters: {
          query: query,
          first: 0,
          size: this.maxElement,
        },
      });
      let notNullOrga = response.result.filter((o: Organisation | null) => {
        return null !== o;
      });
      if (this.getDefaultOrganisation) {
        notNullOrga.unshift(this.getDefaultOrganisation);
      }
      if (this.myOrganisation) {
        if (undefined === query) {
          notNullOrga = notNullOrga.filter((obj: Organisation) => {
            return obj.id !== this.authOrgaId;
          });
          notNullOrga.splice(1, 0, this.myOrganisation);
        } else {
          const foundIndex = notNullOrga.findIndex(
            (obj: Organisation) => obj.id === this.authOrgaId,
          );
          if (foundIndex) {
            notNullOrga[foundIndex] = this.myOrganisation;
          }
        }
      }
      (
        this.$refs.selectOrganisation as InstanceType<typeof ClassicMultiselect>
      ).afterSearch(notNullOrga, response.count);
    },
    async fetchOrganisation(): Promise<void> {
      this.organisationChosen = await this.getOrgaData(
        this.orgaIdSelected ?? "",
      );
      this.initLoaded = true;
    },
  },
});
</script>

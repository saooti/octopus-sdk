<template>
  <div class="mt-3 emission-item-container">
    <router-link
      :to="{
        name: 'emission',
        params: { emissionId: emission.emissionId },
      }"
      :title="$t('Series name page', { name: emission.name })"
      class="d-flex flex-grow-1 text-dark"
    >
      <img
        v-lazy="proxyImageUrl(emission.imageUrl, '250')"
        width="250"
        height="250"
        class="img-box"
        role="presentation"
        alt=""
        :title="$t('Emission name image', { name: emission.name })"
      />
      <div class="emission-item-text">
        <div class="d-flex align-items-center emission-name">
          <AlertIcon
            v-if="!activeEmission && !isPodcastmaker && editRight"
            :size="16"
            class="text-danger me-1"
            :title="$t('Emission have not podcasts')"
          />
          {{ emission.name }}
        </div>
        <div
          ref="descriptionEmissionContainer"
          class="emission-description htms-wysiwyg-content"
        >
          <!-- eslint-disable vue/no-v-html -->
          <div
            ref="descriptionEmission"
            v-html="urlify(emission.description || '')"
          />
          <!-- eslint-enable -->
        </div>
        <router-link
          v-if="!isPodcastmaker"
          class="text-dark mt-auto py-1"
          :to="{
            name: 'productor',
            params: { productorId: emission.orga.id },
          }"
        >
          © {{ emission.orga.name }}
        </router-link>
      </div>
    </router-link>
  </div>
</template>

<script lang="ts">
import AlertIcon from "vue-material-design-icons/Alert.vue";
import { orgaComputed } from "../../mixins/orgaComputed";
import { Emission } from "@/stores/class/general/emission";
import classicApi from "../../../api/classicApi";
import imageProxy from "../../mixins/imageProxy";
import displayMethods from "../../mixins/displayMethods";
import { defineComponent } from "vue";
import { Podcast } from "@/stores/class/general/podcast";
import { ListClassicReturn } from "@/stores/class/general/listReturn";
export default defineComponent({
  name: "EmissionItem",
  components: {
    AlertIcon,
  },

  mixins: [displayMethods, orgaComputed, imageProxy],

  props: {
    emission: { default: () => ({}), type: Object as () => Emission },
  },

  data() {
    return {
      activeEmission: true as boolean,
    };
  },

  computed: {
    organisation(): string {
      return this.emission?.publisher?.organisation?.name ?? "";
    },
    editRight(): boolean {
      return this.isEditRights(this.emission.orga.id);
    },
  },

  created() {
    if (!this.editRight) return;
    this.hasPodcast();
  },
  mounted() {
    const emissionDesc = this.$refs.descriptionEmission as HTMLElement;
    const emissionDescContainer = this.$refs
      .descriptionEmissionContainer as HTMLElement;
    if (
      null !== emissionDesc &&
      null !== emissionDescContainer &&
      emissionDesc.clientHeight > emissionDescContainer.clientHeight
    ) {
      emissionDescContainer.classList.add("after-emission-description");
    }
  },
  methods: {
    async hasPodcast(): Promise<void> {
      const data = await classicApi.fetchData<ListClassicReturn<Podcast>>({
        api: 0,
        path: "podcast/search",
        parameters: {
          emissionId: this.emission.emissionId,
          first: 0,
          size: 0,
          includeStatus: ["READY", "PROCESSING"],
        },
        specialTreatement: true,
      });
      if (0 === data.count) {
        this.activeEmission = false;
      }
    },
  },
});
</script>

<template>
  <article class="classic-element-container">
    <router-link
      :to="{
        name: 'emission',
        params: { emissionId: emission.emissionId },
      }"
      :title="t('Series name page', { name: emission.name })"
      class="d-flex flex-grow-1 text-dark"
    >
      <img
        v-lazy="useProxyImageUrl(emission.imageUrl, '250')"
        width="250"
        height="250"
        class="img-box"
        aria-hidden="true"
        alt=""
        :title="t('Emission name image', { name: emission.name })"
      >
      <ClassicImageBanner v-if="!emissionVisible">
        {{ t('Emission - Not available for listeners') }}
      </ClassicImageBanner>

      <div class="classic-element-text">
        <div class="d-flex align-items-center element-name">
          <AlertIcon
            v-if="!activeEmission && !isPodcastmaker && editRight"
            :size="16"
            class="text-danger me-1"
            :title="t('Emission have not podcasts')"
          />
          {{ emission.name }}
        </div>
        <div
          ref="descriptionEmissionContainer"
          class="element-description htms-wysiwyg-content"
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
  </article>
</template>

<script setup lang="ts">
import AlertIcon from "vue-material-design-icons/Alert.vue";
import {useOrgaComputed} from "../../composable/useOrgaComputed";
import { Emission } from "@/stores/class/general/emission";
import classicApi from "../../../api/classicApi";
import {useImageProxy} from "../../composable/useImageProxy";
import displayHelper from "../../../helper/displayHelper";
import { computed, onBeforeMount, onMounted, ref, useTemplateRef } from "vue";
import { Podcast } from "@/stores/class/general/podcast";
import { ListClassicReturn } from "@/stores/class/general/listReturn";

import ClassicImageBanner from '../../misc/ClassicImageBanner.vue';

import { useI18n } from "vue-i18n";

//Props 
const props = defineProps<{
  /** The emission to display */
  emission: Emission;
}>();

//Data 
const activeEmission = ref(true);

//Composables
const { t } = useI18n();
const { useProxyImageUrl } = useImageProxy();
const { isPodcastmaker, isEditRights } = useOrgaComputed();

//Computed
const editRight = computed(() => isEditRights(props.emission.orga.id));
const emissionVisible = computed(() => {
  return props.emission.visible !== false;
});

onBeforeMount(()=>{
  if (!editRight.value) {
    return;
  }
  hasPodcast();
});

onMounted(()=>{
  const emissionDesc = useTemplateRef('descriptionEmission')?.value as HTMLElement;
  const emissionDescContainer = useTemplateRef('descriptionEmissionContainer')?.value as HTMLElement;
  if (
    null !== emissionDesc &&
    null !== emissionDescContainer &&
    emissionDesc.clientHeight > emissionDescContainer.clientHeight
  ) {
    emissionDescContainer.classList.add("after-element-description");
  }
})

//Methods
function urlify(text:string|undefined){
  return displayHelper.urlify(text);
}
async function hasPodcast(): Promise<void> {
  const data = await classicApi.fetchData<ListClassicReturn<Podcast>>({
    api: 0,
    path: "podcast/search",
    parameters: {
      emissionId: props.emission.emissionId,
      first: 0,
      size: 0,
      includeStatus: ["READY", "PROCESSING"],
    },
    specialTreatement: true,
  });
  if (0 === data.count) {
    activeEmission.value = false;
  }
}
</script>

<style scoped lang="scss">
article {
  max-height: 254px;  // Image size + a few pixels for border

  // Adjust display for small screens
  @media (width <= 960px) {
    max-height: 500px;

    a {
      flex-direction: column;
      flex-wrap: nowrap;
    }

    .element-name {
      font-size: 1rem;
    }

    .element-description {
      font-size: 0.7rem;
    }
  }
}
</style>

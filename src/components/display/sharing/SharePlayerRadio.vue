<template>
  <section class="module-box overflow-visible">
    <h2 class="mb-3">
      {{ t("Embed") }}
    </h2>
    <div class="d-flex">
      <iframe
        id="miniplayerIframeRadio"
        title="Miniplayer"
        :src="iFrameSrc"
        width="100%"
        height="140px"
        style="overflow: hidden"
        allow="clipboard-read; clipboard-write; autoplay"
        class="max-iframe mx-3 flex-grow-1"
      />
      <div class="d-flex flex-column">
        <SharePlayerColors v-model:color="color" v-model:theme="theme" />
        <div class="h4 mb-2 mt-3">{{ t("player parameters") }}</div>
        <PlayerCommonParameters
          v-if="displayInsertCode"
          v-model:insert-code="insertCode"
        />
        <ShareModalPlayer
          v-if="isShareModal"
          :embed-link="iFrame"
          :embedly-link="iFrameSrc"
          @close="isShareModal = false"
        />
        <button
          class="btn btn-primary w-fit-content mt-3"
          @click="isShareModal = true"
        >
          {{ t("Share the player") }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useSaveFetchStore } from "../../../stores/SaveFetchStore";
import { useApiStore } from "../../../stores/ApiStore";
import { useAuthStore } from "../../../stores/AuthStore";
import {  defineAsyncComponent, ref, Ref, computed, onBeforeMount } from "vue";
import { Canal } from "@/stores/class/radio/canal";
import { useI18n } from "vue-i18n";
const ShareModalPlayer = defineAsyncComponent(
  () => import("../../misc/modal/ShareModalPlayer.vue"),
);
const SharePlayerColors = defineAsyncComponent(
  () => import("./SharePlayerColors.vue"),
);
const PlayerCommonParameters = defineAsyncComponent(
  () => import("./PlayerCommonParameters.vue"),
);

//Props 
const props = defineProps({
  canal: { default: undefined, type: Object as () => Canal },
  organisationId: { default: undefined, type: String },
})

//Data 
const isShareModal = ref(false);
const color = ref("#40a372");
const theme = ref("#000000");
const insertCode = ref(false);
const orgaAttributes: Ref<{[key: string]: string | number | boolean | undefined }| undefined> = ref(undefined);
  

//Composables
const { t } = useI18n();
const authStore = useAuthStore();
const apiStore = useApiStore();
const saveFetchStore = useSaveFetchStore();


//Computed
const displayInsertCode = computed(() => props.canal?.organisationId === authStore.authOrgaId);
const iFrameSrc = computed(() => {
  let url = `${apiStore.miniplayerUrl}miniplayer/radio/${
    props.canal?.id
  }?distributorId=${props.organisationId}&color=${color.value.substring(
    1,
  )}&theme=${theme.value.substring(1)}`;
  if (insertCode.value) {
    url += "&insertCode=true";
  }
  return url;
});
const iFrame = computed(() => {
  return `<iframe src="${iFrameSrc.value}" width="100%" height="140px" scrolling="no" allow="clipboard-read; clipboard-write; autoplay"></iframe>`;
});


onBeforeMount(()=>initSharePlayer())

//Methods
async function initSharePlayer() {
  orgaAttributes.value = await saveFetchStore.getOrgaAttributes(authStore.authOrgaId ?? "");
  initColor();
}
function initColor(): void {
  if (!orgaAttributes.value) {
    return;
  }
  color.value = Object.hasOwn(orgaAttributes.value, "COLOR")
    ? (orgaAttributes.value.COLOR as string)
    : "#40a372";
  theme.value = Object.hasOwn(orgaAttributes.value, "THEME")
    ? (orgaAttributes.value.THEME as string)
    : "#000000";
}
</script>

<style lang="scss">
@use "../../../style/iframe";
</style>

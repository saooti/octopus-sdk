<template>
  <section v-if="!isLoading && !authStore.isGarRole && (authStore.authOrgaId || !noSharing)" id="share-buttons-podcast-section" class="module-box">
    <h3 class="mb-2">
      {{ t("Share in one click") }}
    </h3>
    <div class="d-flex align-items-center">
      <template v-for="button in arrayShareButtons" :key="button.title">
        <a
          v-if="button.condition"
          rel="noreferrer noopener"
          target="_blank"
          :href="button.url"
          class="btn share-btn mb-2 text-dark me-2"
          :title="t('New window', {text: button.title})"
        >
          <component :is="button.icon" :size="34" />
        </a>
      </template>
      <slot name="additional-buttons"/>
    </div>
  </section>
</template>

<script setup lang="ts">
import XIcon from "../../icons/XIcon.vue";
import BlueSkyIcon from "../../icons/BlueSkyIcon.vue";
import WhatsappIcon from "vue-material-design-icons/Whatsapp.vue";
import LinkedinIcon from "vue-material-design-icons/Linkedin.vue";
import FacebookIcon from "vue-material-design-icons/Facebook.vue";
import { useSaveFetchStore } from "../../../stores/SaveFetchStore";
import { useAuthStore } from "../../../stores/AuthStore";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

//Props 
const props = defineProps({
  organisationId: { default: undefined, type: String },
})

//Data 
const noSharing = ref(true);
const isLoading = ref(true);

//Composables
const { t } = useI18n();
const authStore = useAuthStore();
const saveFetchStore =useSaveFetchStore();

//Computed
const arrayShareButtons = computed(() => {
  return [
  {
    title: "Facebook",
    icon: FacebookIcon,
    url: `https://www.facebook.com/sharer/sharer.php?u=${urlPage.value}`,
    condition: true,
  },
  {
    title: "X",
    icon: XIcon,
    url: `https://twitter.com/intent/tweet?text=${urlPage.value}`,
    condition: true,
  },
  {
    title: "Linkedin",
    icon: LinkedinIcon,
    url: `https://www.linkedin.com/sharing/share-offsite/?url=${urlPage.value}`,
    condition: true,
  },
  {
    title: "Bluesky",
    icon: BlueSkyIcon,
    url: `https://bsky.app/intent/compose?text=${urlPage.value}`,
    condition: true,
  },
  {
    title: "Whatsapp",
    icon: WhatsappIcon,
    url: `whatsapp://send?text=${urlPage.value}`,
    condition: window.matchMedia("(hover: none)").matches,
  },
];
});
const urlPage = computed(() =>window.location.href);

onMounted(()=>initShareButtons())


//Methods
async function initShareButtons() {
  if (!props.organisationId) {
    return;
  }
  const attributes = await saveFetchStore.getOrgaAttributes(props.organisationId);
  noSharing.value = "true" === attributes.noSharing;
  isLoading.value = false;
}
</script>
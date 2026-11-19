<template>
    <section
        v-if="!isLoading && !authStore.isGarRole && (authStore.authOrgaId || !noSharing)"
        id="share-buttons-podcast-section"
        class="module-box"
    >
        <h3 class="mb-2">
            {{ t("Share in one click") }}
        </h3>
        <div class="d-flex align-items-center">
            <ul class="d-flex align-items-center gap-2">
                <li v-for="button in arrayShareButtons" :key="button.title">
                    <a
                        rel="noreferrer noopener"
                        target="_blank"
                        :href="button.url"
                        class="btn share-btn"
                        :title="t('New window', {text: button.title})"
                    >
                        <component :is="button.icon" :size="34" />
                        <span class="visually-hidden">{{ t('New window', {text: button.title}) }}</span>
                    </a>
                </li>
                <!-- Wrapped in a <li>: slot content must not be a direct <ul> child (RGAA 8.2, 9.3).
                     Not rendered when sharing is disabled, as additional share buttons (e.g.
                     ShareAnonymous) hide themselves then, which would leave an empty <li> -->
                <li v-if="$slots['additional-buttons'] && !noSharing">
                    <slot name="additional-buttons" />
                </li>
            </ul>
            <slot name="after-buttons" />
        </div>
    </section>
</template>

<script setup lang="ts">
import XIcon from "../../icons/XIcon.vue";
import BlueSkyIcon from "../../icons/BlueSkyIcon.vue";
import ThreadsIcon from "../../icons/ThreadsIcon.vue";
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
    return [{
        title: "Facebook",
        icon: FacebookIcon,
        url: `https://www.facebook.com/sharer/sharer.php?u=${urlPage.value}`,
        condition: true,
    }, {
        title: "Linkedin",
        icon: LinkedinIcon,
        url: `https://www.linkedin.com/sharing/share-offsite/?url=${urlPage.value}`,
        condition: true,
    }, {
        title: "Threads",
        icon: ThreadsIcon,
        url: `https://www.threads.net/intent/post?text=${urlPage.value}`,
        condition: true,
    }, {
        title: "Bluesky",
        icon: BlueSkyIcon,
        url: `https://bsky.app/intent/compose?text=${urlPage.value}`,
        condition: true,
    }, {
        title: "Whatsapp",
        icon: WhatsappIcon,
        url: `whatsapp://send?text=${urlPage.value}`,
        condition: window.matchMedia("(hover: none)").matches,
    }, {
        title: "X",
        icon: XIcon,
        url: `https://twitter.com/intent/tweet?text=${urlPage.value}`,
        condition: true,
    }].filter((button) => button.condition); // No empty <li> for hidden buttons (RGAA 9.3)
});
// Encoded so that the page's own query string is not mixed with the share URL's
const urlPage = computed(() => encodeURIComponent(window.location.href));

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

<style scoped lang="scss">
ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
}
</style>

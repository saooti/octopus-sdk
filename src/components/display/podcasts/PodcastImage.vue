<!--
  Component to display the image of a podcast.
  May also display additional information, for example when an error occured
  when processing the file (using PodcastPlayButton).
-->
<template>
    <div
        v-if="podcast"
        class="img-box img-box-podcast mb-3 flex-column justify-content-start align-items-start position-relative flex-shrink-0 float-start"
    >
        <!--
        Link is unfocusable to avoid double focusable links with PodcastItemInfo
        -->
        <router-link
            :to="{
                name: 'podcast',
                params: { podcastId: podcast.podcastId },
            }"
            tabindex="-1"
            aria-hidden="true"
        >
            <img
                loading="lazy"
                :src="useProxyImageUrl(podcast.imageUrl, '270')"
                width="270"
                height="270"
                aria-hidden="true"
                alt=""
                class="img-box img-box-podcast"
            >
        </router-link>
        <div
            v-if="state.generalParameters.podcastmaker"
            :class="mainRubrique ? 'mainRubrique' : 'notMainRubrique'"
        />
        <div
            v-if="fetchConference"
            class="live-image-status"
            :class="
                fetchConference && 'null' !== fetchConference && fetchConference.status
                    ? fetchConference.status.toLowerCase() + '-bg'
                    : ''
            "
        >
            {{ statusText }}
        </div>
        <div v-if="isRecordedInLive" class="live-image-status recording-bg">
            {{ t("Recorded in live") }}
        </div>
        <PodcastPlayButton
            :podcast="podcast"
            :hide-play="hidePlay"
            :fetch-conference="fetchConference"
            :show-processing="showProcessing || isAuthenticated"
        />
        <!-- Disclosure button for the description (RGAA 7.1), available on all devices -->
        <button
            v-if="displayDescription"
            :id="descriptionId ? `${descriptionId}-toggle` : undefined"
            type="button"
            class="description-toggle"
            :aria-expanded="descriptionExpanded"
            :aria-controls="descriptionId"
            @click="emit('toggleDescription')"
        >
            <!-- Constant name, the state is given by aria-expanded only -->
            <CloseIcon v-if="descriptionExpanded" aria-hidden="true" />
            <InformationVariantIcon v-else aria-hidden="true" />
            <!-- Visually collapsed at rest but kept in the accessibility tree, revealed on hover/focus -->
            <span class="description-toggle-label">{{ t('PodcastImage - Description') }}</span>
        </button>
    </div>
</template>

<script setup lang="ts">
import CloseIcon from "vue-material-design-icons/Close.vue";
import InformationVariantIcon from "vue-material-design-icons/InformationVariant.vue";
import PodcastPlayButton from "./PodcastPlayButton.vue";
import { state } from "../../../stores/ParamSdkStore";
import { Podcast } from "@/stores/class/general/podcast";
import { Conference } from "@/stores/class/conference/conference";
import {useImageProxy} from "../../composable/useImageProxy";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../../../stores/AuthStore";

//Props 
const props = defineProps({
    podcast: { default: () => ({}), type: Object as () => Podcast },
    hidePlay: { default: false, type: Boolean },
    displayDescription: { default: false, type: Boolean },
    /** Whether the description is currently displayed */
    descriptionExpanded: { default: false, type: Boolean },
    /** Id of the description element controlled by the button */
    descriptionId: { default: undefined, type: String },
    isAnimatorLive: { default: false, type: Boolean },
    fetchConference: { default: undefined, type: Object as () => Conference },
    showProcessing: { default: false, type: Boolean }
})

//Emits
const emit = defineEmits<{
    /** Description button clicked */
    toggleDescription: [];
}>();

//Composables
const { t } = useI18n();
const { useProxyImageUrl } = useImageProxy();
const { isAuthenticated } = useAuthStore();

//Computed
const mainRubrique = computed(() => {
    return (
        undefined !== state.podcastPage.mainRubrique &&
        0 !== state.podcastPage.mainRubrique &&
        (props.podcast?.rubriqueIds?.includes(
            state.podcastPage.mainRubrique,
        ) as boolean)
    );
});
const isRecordedInLive = computed(() => {
    return (
        undefined === props.fetchConference &&
        undefined !== props.podcast.conferenceId &&
        "READY_TO_RECORD" !== props.podcast.processingStatus
    );
});
const statusText = computed(() => {
    if (!props.fetchConference) {
        return "";
    }

    switch (props.fetchConference.status) {
    case "PLANNED":
        return t("live in few time");

    case "PENDING":
        if (props.isAnimatorLive) {
            return t("Open studio");
        } else {
            return t("live upcoming");
        }

    case "RECORDING":
        return t("In live");

    case "DEBRIEFING":
        if ("READY_TO_RECORD" === props.podcast.processingStatus) {
            return t("Not recording");
        } else {
            return t("Debriefing");
        }

    case "ERROR":
        return t("In error");

    case "PUBLISHING":
        return t("Publishing");

    default:
        return "";
    }
});

</script>

<style scoped lang="scss">
.live-image-status {
    text-align: center;
    width: 100%;
    font-size: 0.6rem;
    padding: 0.2rem 0;
    color: white;
    text-transform: uppercase;
    position: absolute;
    top: 0;
  }

.description-toggle {
    position: absolute;
    right: 0;
    bottom: 0;
    z-index: 3;
    margin: 5px;
    display: flex;
    align-items: center;
    height: 1.75rem;
    min-width: 1.75rem;
    padding: 0 0.3125rem;
    border: none;
    border-radius: 0.875rem;

    /* Solid themed colours, and a two-tone ring so the edge is visible on light and dark covers (RGAA 3.3) */
    color: var(--octopus-primary);
    background: var(--octopus-color-on-primary);
    box-shadow: 0 0 0 1px var(--octopus-primary), 0 0 0 2px var(--octopus-color-on-primary);

    font-size: 0.8rem;
    cursor: pointer;

    /* In rem (like the button) so it follows text resizing (RGAA 10.4) */
    :deep(svg) {
        width: 1.125rem;
        height: 1.125rem;
    }
}

.description-toggle-label {
    /* Not display/visibility: the text must remain the accessible name of the button */
    max-width: 0;
    opacity: 0;
    overflow: hidden;
    white-space: nowrap;
}

.img-box:hover .description-toggle,
.description-toggle:focus-visible {
    padding-right: 0.5rem;

    .description-toggle-label {
        max-width: 10rem;
        margin-left: 0.25rem;
        opacity: 1;
    }
}

@media (prefers-reduced-motion: no-preference) {
    .description-toggle,
    .description-toggle-label {
        transition: max-width 0.2s ease, opacity 0.2s ease, padding 0.2s ease, margin 0.2s ease;
    }
}
</style>

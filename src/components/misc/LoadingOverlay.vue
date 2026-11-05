<template>
    <Teleport to=".octopus-app" :disabled="!fullscreen">
        <div
            v-if="visible"
            class="loading-overlay"
            :class="{ fullscreen }"
            aria-hidden="true"
        >
            <div class="loading-wrapper d-flex align-items-center">
                <ClassicSpinner :color="fullscreen ? 'white' : undefined" />
                <span v-if="loadingText" class="h3 mb-0 ms-3">{{ loadingText }}</span>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import ClassicSpinner from "./ClassicSpinner.vue";

/**
 * Loading indicator covering content while it is being refreshed. Hidden from
 * assistive technologies: loading must be announced by a status message of
 * the consumer.
 *
 * Only displayed after `delay` and faded in: fast loads show nothing, which
 * avoids flashes over the content (RGAA 13.7).
 */
const { delay = 250 } = defineProps<{
    /** Cover the whole window instead of the closest positioned parent */
    fullscreen?: boolean;
    /** Text displayed next to the spinner */
    loadingText?: string;
    /** Time in ms before displaying the overlay */
    delay?: number;
}>();

const visible = ref(delay <= 0);
const timeout = visible.value ? undefined : setTimeout(() => {
    visible.value = true;
}, delay);

onBeforeUnmount(() => clearTimeout(timeout));
</script>

<style scoped lang="scss">
.loading-overlay {
    position: absolute;
    inset: 0;
    z-index: 20;

    display: flex;
    justify-content: center;
    align-items: flex-start;
    background-color: rgba(255, 255, 255, 0.8);
    animation: loading-overlay-fade-in 200ms ease-out;

    @media (prefers-reduced-motion: reduce) {
        animation: none;
    }

    .loading-wrapper {
        // Keep the spinner visible on long lists
        position: sticky;
        top: 30vh;
        padding: 1rem 0.5rem;
    }

    &.fullscreen {
        position: fixed;
        align-items: center;
        color: white;
        background-color: rgba(0, 0, 0, 0.5);

        .loading-wrapper {
            position: static;
        }
    }
}

@keyframes loading-overlay-fade-in {
    from {
        opacity: 0;
    }
}
</style>

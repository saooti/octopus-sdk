<template>
    <a
        :href="href"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="ariaLabel ? `${ariaLabel} ${newWindowText}` : undefined"
    >
        <slot />
        <OpenInNewIcon
            v-if="!hideIcon"
            class="external-link-icon"
            :size="iconSize"
            aria-hidden="true"
            :role="null"
        />
        <!-- Space inside the interpolation, the template compiler trims it otherwise -->
        <span class="visually-hidden">{{ ` ${newWindowText}` }}</span>
    </a>
</template>

<script setup lang="ts">
import OpenInNewIcon from "vue-material-design-icons/OpenInNew.vue";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { iconSize = 16 } = defineProps<{
    /** Url of the external page */
    href: string;
    /** Hide the decorative "open in new" icon */
    hideIcon?: boolean;
    /** Size of the icon, in pixels */
    iconSize?: number;
    /**
     * Accessible name, only when the visible content isn't enough. It must
     * start with the visible text (WCAG 2.5.3), the new window warning is
     * appended to it
     */
    ariaLabel?: string;
}>();

const { t } = useI18n();

const newWindowText = computed(() => t("ExternalLink - New window"));
</script>

<style scoped lang="scss">
.external-link-icon {
    margin-left: 0.25rem;
    vertical-align: middle;
}
</style>

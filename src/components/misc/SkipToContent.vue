<template>
    <a :href="`#${target}`" class="visually-hidden-focusable">
        {{ t('Skip to content') }}
    </a>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { target = 'main-content' } = defineProps<{
    /** Id of the main content element to skip to */
    target?: string
}>();

const { t } = useI18n();
</script>

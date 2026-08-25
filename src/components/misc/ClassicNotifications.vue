<!--
    A component to display notifications
-->
<template>
    <MessageModal
        v-if="currentNotification"
        :title="currentNotification.title"
        :message="currentNotification.message"
        :closeable="currentNotification.closeable !== false"
        @close="clearNotification"
    />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useNotificationStore } from '../../stores/NotificationStore';

const MessageModal = defineAsyncComponent(() => import('./modal/MessageModal.vue'));

import { defineAsyncComponent } from 'vue';

const {
    clearNotification
} = useNotificationStore();

const {
    currentNotification,
} = storeToRefs(useNotificationStore());
</script>

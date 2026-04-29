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
import MessageModal from './modal/MessageModal.vue';

const {
    clearNotification
} = useNotificationStore();

const {
    currentNotification,
} = storeToRefs(useNotificationStore());
</script>

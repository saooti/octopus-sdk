<!--
    A component to display notifications
-->
<template>
    <MessageModal
        v-if="notification !== null"
        :title="notification.title"
        :message="notification.message"
        :closeable="notification.closeable !== false"
        @close="clearNotifications"
    />
</template>

<script setup lang="ts">
import MessageModal from './modal/MessageModal.vue';

import { useNotifications } from '../composable/useNotifications';

const {
    notification,
    clearNotifications
} = useNotifications();
</script>

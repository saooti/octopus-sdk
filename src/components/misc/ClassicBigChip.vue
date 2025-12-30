<template>
    <div class="big-chip">
        <div class="title">
            <b>{{ title }}</b>
            <ActionButton
                v-if="removeable"
                action="delete"
                :confirm-modal="confirmModal"
                @click="emit('remove')"
            />
        </div>
            
        <p>{{ content }}</p>
    </div>
</template>

<script setup lang="ts">
import { ActionButton } from '../buttons';
import { ConfirmModalData } from '../buttons/ActionButton.vue';

defineProps<{
    /** The title of the chip */
    title: string;
    /** The content of the chip */
    content: string;
    /** When true, displays an action button for removing this chip */
    removeable?: boolean;
    /** When removeable, allow for a confirmation modal to be shown */
    confirmModal?: ConfirmModalData;
}>();

const emit = defineEmits<{
    /** Called when the remove button is clicked */
    (e: 'remove'): void;
}>();
</script>

<style scoped lang="scss">
.big-chip {
    display: flex;
    flex-direction: column;
    border-radius: 3px;
    background-color: var(--octopus-secondary);
    border: 1px solid var(--octopus-primary);
    padding: 8px 16px;
    margin: 4px;
    width: 335px;
    height: 80px;

    .title {
        display: flex;
        justify-content: space-between;

        b {
            white-space: nowrap;
            overflow-x: hidden;
            text-overflow: ellipsis;
            height: 1rem;

            &:hover {
                background-color: var(--octopus-secondary);
                overflow-x: unset;
                z-index: 1;
            }
        }

        // Limit style to buttons directly in title (to not affect the modal)
        & > div > :deep(button) {
            margin-top: -6px;
            padding: 0;
        }
    }

    p {
        margin: 0;
        overflow: hidden;
        &:hover {
            background-color: var(--octopus-secondary);
            overflow: unset;
            z-index: 1;
        }
    }
}
</style>

<template>
    <div>
        <!-- The button with an icon to trigger the action -->
        <button
            class="btn btn-transparent"
            :title="action"
            @click="onClick"
        >
            <component :is="icon" />
        </button>

        <!-- Modal to ask for confirmation -->
        <MessageModal
            v-if="showModal"
            :title="confirmModal.title"
            :message="confirmModal.message"
            :validatetext="$t('Yes')"
            :canceltext="$t('No')"
            @validate="onConfirmModal"
            @cancel="showModal = false"
            @close="showModal = false"
        />
    </div>
</template>

<script setup lang="ts">
import { type Component, computed, ref } from 'vue';
import MessageModal from '../misc/modal/MessageModal.vue'; 
import Icons from '../icons';

/** Actions available to the button */
enum Action {
    Edit = 'edit',
    Delete = 'delete'
}

export interface ConfirmModalData {
    title: string;
    message: string;
}

const { action, confirmModal } = defineProps<{
    /** The type of action provided by the button */
    action: Action;
    /** When set, clicking on the button will first open a confirm modal */
    confirmModal?: ConfirmModalData;
}>();

const emit = defineEmits<{
    /**
     * Event trigger when the button is clicked, or after confirmation in the
     * modal if `withConfirmModal` is true.
     */
    (e: 'click'): void
}>();

/************************
 * Using button
 ***********************/

/** Method called when clicking on button */
function onClick(): void {
    if (confirmModal === undefined) {
        emit('click');
    } else {
        showModal.value = true;
    }
}

/***********************
 * Modal
 **********************/
/** Display modal when true */
const showModal = ref(false);

/** Method called when the modal is validated */
function onConfirmModal(): void {
    showModal.value = false;
    emit('click');
}

/***********************
 * Button appearance
 **********************/

/** The icon displayed by the button */
const icon = computed((): Component => {
    switch (action) {
        case Action.Edit:
            return Icons.Edit;

        case Action.Delete:
            return Icons.Delete;

        default:
            return;
    }
});
</script>

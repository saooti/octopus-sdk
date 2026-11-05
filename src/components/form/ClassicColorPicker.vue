<template>
    <VSwatches
        ref="picker"
        v-model="color"
        class="classic-color-picker"
        show-fallback
        fallback-input-type="color"
        :popover-x="popoverX"
        :popover-y="popoverY"
        @open="onOpen"
        @close="onClose"
        @keydown="onKeydown"
        @keyup="onKeyup"
    >
        <template #trigger>
            <!-- Toggled by the click handler of the library's trigger wrapper -->
            <button
                ref="trigger"
                type="button"
                class="vue-swatches__trigger classic-color-picker-trigger"
                :style="{ backgroundColor: color }"
                :title="label"
                :aria-label="label"
                :aria-expanded="isOpen"
            />
        </template>
    </VSwatches>
</template>

<script setup lang="ts">
import { VSwatches } from "vue3-swatches";
import "vue3-swatches/dist/style.css";
import { nextTick, ref, useTemplateRef } from "vue";

/**
 * Color picker (swatches and native color input), accessible by keyboard:
 * - the trigger is a button, announced with `label` and its expanded state
 * - opening it focuses the selected swatch
 * - swatches are selected with Enter or Space
 * - Escape closes it, and focus goes back to the trigger after a selection
 */

const color = defineModel<string>({ required: true });

const { popoverX = undefined, popoverY = undefined } = defineProps<{
    /** Accessible name of the trigger */
    label: string;
    /** Horizontal side of the trigger where the swatches open */
    popoverX?: "left" | "right";
    /** Vertical side of the trigger where the swatches open */
    popoverY?: "top" | "bottom";
}>();

const isOpen = ref(false);
const pickerRef = useTemplateRef<InstanceType<typeof VSwatches>>("picker");
const triggerRef = useTemplateRef<HTMLButtonElement>("trigger");

function getRootElement(): HTMLElement | undefined {
    return pickerRef.value?.$el as HTMLElement | undefined;
}
function isSwatch(target: EventTarget | null): target is HTMLElement {
    return target instanceof HTMLElement && target.classList.contains("vue-swatches__swatch");
}

function onOpen(): void {
    isOpen.value = true;
    nextTick(() => {
        const root = getRootElement();
        const swatch = root?.querySelector<HTMLElement>(".vue-swatches__swatch--selected")
            ?? root?.querySelector<HTMLElement>(".vue-swatches__swatch");
        swatch?.focus();
    });
}
function onClose(): void {
    isOpen.value = false;
    // Wait for the focus change: when leaving with Tab, focus stays where it went
    nextTick(() => {
        const active = document.activeElement;
        if (!active || active === document.body || getRootElement()?.contains(active)) {
            triggerRef.value?.focus();
        }
    });
}
function onKeydown(event: KeyboardEvent): void {
    if (" " === event.key && isSwatch(event.target)) {
        // Do not scroll the page, the swatch is selected on keyup like a button
        event.preventDefault();
    } else if ("Escape" === event.key && isOpen.value) {
        // Do not close the modal containing the picker
        event.preventDefault();
        event.stopPropagation();
        triggerRef.value?.click();
    }
}
function onKeyup(event: KeyboardEvent): void {
    if (" " === event.key && isSwatch(event.target)) {
        event.target.click();
    }
}
</script>

<style scoped lang="scss">
.classic-color-picker-trigger {
    display: block;
    width: 42px;
    height: 42px;
    padding: 0;
    cursor: pointer;
}
</style>

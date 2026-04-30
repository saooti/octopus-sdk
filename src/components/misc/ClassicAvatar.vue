<template>
    <div
        class="avatar-container d-flex align-items-center justify-content-center"
        :aria-hidden="!nonDecorative"
        :style="containerStyle"
    >
        <img
            v-if="imageUrl"
            :alt="nonDecorative ? name : ''"
            :width="size"
            :height="size"
            :src="useProxyImageUrl(imageUrl, '' + size)"
        >
        <template v-else>
            {{ name.length > 0 ? name[0].toUpperCase() : '?' }}
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed, type StyleValue } from 'vue';
import { useImageProxy } from '../composable/useImageProxy';
import { colorFromString } from '../../helper/colorFromString';

const props = withDefaults(defineProps<{
    /** Name of the element to display */
    name: string;
    /** URL to the image to be displayed */
    imageUrl?: string;
    /** Size of the avatar */
    size?: number;
    /**
     * Indicates that this element is not decorative.
     * Use this when this element is the only thing to identify a platform.
     * Will use accessibility options to hide this element if true.
     */
    nonDecorative?: boolean;
}>(), {
    imageUrl: undefined,
    size: 24
});

const { useProxyImageUrl } = useImageProxy();

const containerStyle = computed((): StyleValue => {
    const size = `${props.size}px`;
    return {
        'background-color': colorFromString(props.name),
        'font-size': `${props.size / 2}px`,
        height: size,
        width: size
    };
});
</script>

<style scoped lang="scss">
.avatar-container {
    border-radius: 30%;
    font-weight: 800;
    color: black;
}
</style>

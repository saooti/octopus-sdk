<template>
    <div class="page-element-title-container">
        <div class="page-element-title">
            <h1>{{ pageTitle }}</h1>
        </div>
        <div class="page-element-bg" :style="backgroundDisplay" />
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useImageProxy } from "../../composable/useImageProxy";

//Props 
const props = defineProps({
    pageTitle: { default: undefined, type: String },
    imgUrl: { default: undefined, type: String },
})

onMounted(() => {
    const elt = document.querySelector('.page-element-title-container');

    // Retrieve header
    const header = document.getElementsByTagName('header');
    if (header.length) {
        // Get header height
        const height = (header[0] as HTMLElement).offsetHeight;
        // Update PM header position according to header height
        elt.style.setProperty('--top', height + 'px');
    }
});

//Composables
const { useProxyImageUrl } = useImageProxy();

//Computed
const backgroundDisplay = computed(() => {
    if (!props.imgUrl) {
        return "";
    }
    return `background-image: url('${useProxyImageUrl(
        props.imgUrl,
        "250",
    )}');`;
});
</script>

<style lang="scss">
.octopus-app {
    .page-element.page-element-podcastmaker {
        margin-top: 11rem;
    }

    .page-element-title-container {
        --top: 0;

        background: black;
        position: absolute;
        right: 0;
        left: 0;
        top: var(--top);

        .page-element-bg {
            height: 15rem;
            opacity: 0.5;
            filter: blur(8px);
            background-position: center;
            background-repeat: no-repeat;
            background-size: cover;
        }

        .page-element-title {
            position: absolute;
            inset: 0;
            z-index: 2;
            display: flex;
            justify-content: center;
            align-items: center;

            h1 {
                color: white !important;
                font-size: 2rem;
            }
        }
    }
}
</style>

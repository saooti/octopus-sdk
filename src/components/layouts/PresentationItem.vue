<!--
  Component to display an element with its description
-->
<template>
    <article
        class="classic-element-container item-presentation-container mt-3"
        :class="vertical ? 'vertical-item' : ''"
    >
        <router-link
            :to="route"
            class="d-flex-column flex-grow-1 text-dark"
            :class="vertical ? 'flex-column' : ''"
        >
            <div
                class="img-box"
                :class="vertical ? 'img-box-bigger' : ''"
            >
                <img
                    v-lazy="useProxyImageUrl(imageUrl, tailleImage)"
                    :width="tailleImage"
                    :height="tailleImage"
                    aria-hidden="true"
                    :alt="name"
                    :title="name"
                >

                <div class="tags">
                    <span
                        v-for="tag in tags"
                        :key="tag"
                    >
                        {{ tag }}
                    </span>
                </div>

                <slot name="after-image" />
            </div>
      
            <div
                class="classic-element-text pb-0"
                :class="{ 'pt-1': vertical }"
            >
                <div class="element-name mb-2 basic-line-clamp">
                    {{ name }}
                </div>
                <div
                    v-if="!isPhone && (description || additionalInfo)"
                    ref="descriptionItemContainer"
                    class="element-description htms-wysiwyg-content mt-0"
                >
                    <div v-if="additionalInfo" class="mb-2">
                        <div
                            v-for="info, index in additionalInfo"
                            :key="index"
                            class="text-secondary"
                        >
                            {{ info }}
                        </div>
                    </div>
                    <!-- eslint-disable vue/no-v-html -->
                    <div
                        v-if="description"
                        ref="descriptionItem"
                        v-html="urlify(description || '')"
                    />
                    <!-- eslint-enable -->
                </div>
            </div>
        </router-link>
    </article>
</template>

<script setup lang="ts">
import {useResizePhone} from "../composable/useResizePhone";
import {useImageProxy} from "../composable/useImageProxy";
import displayHelper from "../../helper/displayHelper";
import { nextTick, useTemplateRef, watch, computed } from "vue";
import { RouteLocationRaw } from "vue-router";

//Props 
const props = defineProps<{
    /** The route to which to redirect when clicking on element */
    route: RouteLocationRaw|string;
    /** The URL to the image */
    imageUrl: string;
    /** The name of the element */
    name: string;
    /** Tags associated with the element (rubriques, themes, etc) */
    tags?: Array<string>;
    /** Additional info displayed below name */
    additionalInfo?: Array<string>;
    /** The description of the element */
    description?: string;
    /** When true display the card vertically */
    vertical?: boolean;
}>();

//Data
const descriptionItemRef = useTemplateRef('descriptionItem');
const descriptionItemContainerRef = useTemplateRef('descriptionItemContainer');


//Composables
const { isPhone } = useResizePhone();
const { useProxyImageUrl } = useImageProxy();

// Computed
// Calcul de la taille de l'image
const tailleImage = computed(() => {
    // L'élément fait 400 de large à la verticale, mais on prend en compte les bordures
    if (props.vertical) {
        return '396';
    } else if (isPhone.value) {
        return '246';
    } else {
        return '250';
    }
});

//Watch
watch(isPhone, async () => {
    nextTick(() => {
        if (!props.description || isPhone.value) {
            return;
        }
        const itemDesc = descriptionItemRef?.value as HTMLElement;
        const itemDescContainer = descriptionItemContainerRef?.value as HTMLElement;
        if (
            itemDesc &&
            itemDescContainer &&
            itemDesc.clientHeight > itemDescContainer.clientHeight
        ) {
            itemDescContainer.classList.add("after-element-description");
        }
    });
}, { immediate: true });

function urlify(text:string|undefined){
    return displayHelper.urlify(text);
}
</script>

<style scoped lang="scss">
.octopus-app {
    .item-presentation-container {
        @media (width <= 960px) {
            width: 250px !important;
            margin-right: 0.5rem;
        }

        .element-description {
            height: 0;
            flex-grow: 1;
            max-height: unset;

            p:first-child {
                // Prevent unecessary space before first paragraph
                margin-top: 0 !important;
            }
        }
    }

    .classic-element-container.vertical-item {
        flex-grow: 0;
        width: 400px;
        flex-shrink: 0;
    }

    .img-box {
        // Make it relative so that absolute elements associated with the image
        // are positioned within the image box
        position: relative;

        @media (width <= 960px) {
            height: calc(var(--octopus-image-size) - 4);
        }
    }

    .img-box-bigger {
        // L'élément fait 400 de large à la verticale, mais on prend en compte les bordures
        width: 396px;
        height: 396px;
    }

    .tags {
        position: absolute;
        top: 10px;
        left: 10px;

        display: flex;
        gap: 10px;
        flex-wrap: wrap;

        > span {
            background-color: white;
            padding: .25em .75em;
            border-radius: var(--octopus-border-radius);
            font-size: 14px;
            font-weight: bold;
            color: var(--octopus-primary);
        }
    }
}
</style>

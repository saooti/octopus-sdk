<template>
    <div
        v-if="displayIndicator"
        :class="{ inline: inline }"
        title=""
    >
        <RightsWrapper
            v-if="!text"
            v-slot="{ id }"
            v-bind="props"
        >
            <Icon
                :id="id"
                class="rights-indicator-icon"
                :class="{ invisible: hasAccess }"
                aria-hidden="true"
                fill-color="var(--octopus-primary)"
                :size="inline ? 20 : 24"
            />
        </RightsWrapper>
        <div aria-live="polite" aria-atomic="true">
            <ClassicAlert
                v-if="text && !hasAccess"
                type="info"
            >
                <template #icon>
                    <Icon
                        aria-hidden="true"
                        fill-color="var(--octopus-primary)"
                    />
                </template>
                {{ message }}
            </ClassicAlert>
        </div>
    </div>
</template>

<script setup lang="ts">
import ClassicAlert from '../misc/ClassicAlert.vue';
import Icons from '@/components/icons'; 
import RightsWrapper from './RightsWrapper.vue'; 
import { RightsProps, useRightsIndicator } from '../composable/useRightsIndicator';

const Icon = Icons.RightsIndicator;

type PropsBase = RightsProps & {
    /** Display reason as text instead of only tooltip */
    text?: boolean;
    /** Use inline instead of block */
    inline?: boolean;
}

const props = defineProps<PropsBase>();

const { displayIndicator, hasAccess, message } = useRightsIndicator(props);
</script>

<style scoped lang="scss">
div.inline {
    display: inline;
    // Properly align text with it
    vertical-align: top;
}

.inline div {
    display: inline;
}

.inline .rights-indicator-icon {
    display: inline-flex;
    // Propertly align content
    position: relative;
    bottom: -4px;
    // Ensure it doesn't take place in the text
    height: 1px;
}

.inline .invisible {
    display: none;
}

/** Helper class to keep the data accessible for screen readers */
.rights-visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
</style>

<template>
    <div
        class="d-flex flex-wrap border align-items-center rounded px-2"
    >
        <div
            v-for="(tag, index) in tags"
            :key="tag"
            class="vs__selected p-0 my-0 mx-1"
            :class="getClass(tag)"
        >
            <!--<button
                v-if="index !== tagToEdit"-->
            <button
                :id="'display-input-tag-' + index"
                class="btn-transparent d-flex align-items"
                @click="startEditTag(index, tag)"
            >
                <!--<img
                    v-if="isOuestFranceTag(tag)"
                    width="20"
                    height="20"
                    class="ouest-france-logo"
                    title="Ouest France Logo"
                    aria-hidden="true"
                    alt=""
                    src="/img/ouest_france_logo.svg"
                >-->
                <span>{{ tag }}</span>
            </button>
            <!--<input
                v-else
                :id="'form-input-tag-' + index"
                v-model="tagToEditTempValue"
                :title="$t('Edit')"
                @blur="finishEditTag(index)"
                @keydown.enter="finishEditTag(index)"
            >-->

            <button class="btn-transparent" @click="removeTag(index)">
                <CloseIcon />
            </button>
        </div>
        <input
            v-if="editing"
            :id="'form-input-tag'"
            v-model="tagToEditTempValue"
            :title="$t('Edit')"
            @blur="finishEditTag"
            @keydown.enter="finishEditTag"
        >
        <button
            class="btn btn-add-tag m-1"
            :title="$t('Add a tag')"
            @click="createNewTag"
        />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import CloseIcon from "vue-material-design-icons/Close.vue";

const { tags, tagClass } = defineProps<{
    /** Currently selected tags */
    tags: string[];
    /** The class to apply to the tags */
    tagClass?: string|string[]|((tag: string) => string|string[]);
}>();

const emit = defineEmits<{
    /** Update tags */
    (e: 'update:tags', tags: string[]): void
}>();

//const tagToEdit: Ref<number | undefined> = ref(undefined);
const editing = ref(false);
const tagToEditTempValue = ref("");

function getClass(tag: string): string|string[]|undefined {
    if (typeof tagClass === 'function') {
        return tagClass(tag);
    } else {
        return tagClass;
    }
}

function removeTag(index: number): void {
    const newTags = [...tags];
    newTags.splice(index, 1);
    console.log(index, newTags);
    emit('update:tags', newTags);
}

function startEditTag(index: number, tag: string): void {
    //tagToEditTempValue.value = tags[index];
    //tagToEdit.value = index;
    // editing.value = true;
    /*nextTick(() => {
        document.getElementById("form-input-tag-" + index)?.focus();
    });*/
}

function finishEditTag(/*index: number*/): void {
    /*if (index !== tagToEdit.value) {
        return;
    }
    tagToEdit.value = undefined;

    if (tagToEditTempValue.value.length) {
        const newTags = [...tags];
        newTags.splice(
            index,
            1,
            ...tagToEditTempValue.value.split(","),
        );
        emit('update:tags', newTags);
    } else {
        const newTags = [...tags];
        newTags.splice(index, 1);
        emit('update:tags', newTags);
    }*/

    if (tagToEditTempValue.value === '') {
        return;
    }

    const newTags = [...tags, tagToEditTempValue.value];
    tagToEditTempValue.value = '';
    editing.value = false;
    emit('update:tags', newTags);
}

function createNewTag(): void {
    /*const newTags = [...tags, ''];
    emit('update:tags', newTags);
    startEditTag(tags.length - 1, '');*/
    editing.value = true;
}

</script>

<style scoped lang="scss">
.btn-add-tag {
    padding: 4px;
    line-height: 1;

    &::after {
        content: "+";
        color: var(--octopus-primary);
        font-size: 14px;
        font-weight: bold;
    }
}
</style>
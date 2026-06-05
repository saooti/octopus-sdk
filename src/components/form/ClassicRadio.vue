<!--
  Simple component to display radio buttons.

  Available slots:
    `label-{option.value}`: Slot to replace the label of the current option.
                            Binding: `option`: the current option
                                     `selected` : true if the option is selected
    `after-{option.value}`: Slot after the radio button
                            Binding: `option`: the current option
                                     `selected` : true if the option is selected
-->
<template>
    <div
        role="radiogroup"
        class="d-flex"
        :class="isColumn !== false ? 'flex-column' : ''"
    >
        <div
            v-for="option in options"
            :key="option.title"
            class="octopus-form-item"
            :class="isColumn !== false ? 'd-flex flex-nowrap align-items-center' : 'me-2'"
        >
            <input
                :id="computedId + option.value"
                :checked="textInit === option.value"
                type="radio"
                :name="computedId"
                :value="option.value"
                :disabled="isDisabled"
                @input="onChange($event.target.value)"
            >
            <label class="c-hand" :for="computedId + option.value">
                <slot :name="'label-' + option.value" v-bind="slotBindings(option)">{{ option.title }}</slot>
            </label>

            <slot :name="'after-' + option.value" v-bind="slotBindings(option)" />
        </div>
    </div>
</template>

<script setup generic="T extends { title: string; value: string|undefined; }" lang="ts">
import { computed, getCurrentInstance } from 'vue';

//Props 
const { options, textInit, isColumn = true, idRadio } = defineProps<{
    options: Array<T>;
    textInit?: string;
    idRadio?: string;
    isDisabled?: boolean;
    isColumn?: boolean;
}>();

//Emits
const emit = defineEmits<{
    (e: 'update:textInit', value: string): void;
    /** Emitted with update:text-init, containing the selected object */
    (e: 'selected-item', value: T): void;
}>();

const uid = getCurrentInstance()?.uid;
const computedId = computed((): string => {
    if (idRadio !== undefined) {
        return idRadio;
    } else {
        return 'classic-radio-' + uid;
    }
});

//Methods
function onChange(value: string): void {
    emit('update:textInit', value);
    const item = options.find(elt => elt.value === value);
    if (item) {
        emit('selected-item', item);
    }
}

function slotBindings(option: T): { option: T; selected: boolean } {
    return {
        option,
        selected: textInit === option.value
    }
}
</script>

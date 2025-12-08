<!--
    Generic component to display an array of elements

    **Slots** :
    - `item-[header.value]`
      - Replace the default display of a value
      - Parameters :
        - `item`: The item being displayed
        - `value`: The value of the item
    - `item-actions`
      - When defined, add a final column dedicated to action buttons
      - Parameters :
        - `item`: The item being displayed
-->
<template>
    <ListPaginate
        :first="first"
        :size="size"
        :text-count="$t('Number items', { nb: items.length })"
        :total-count="items.length"
        :loading="loading"
        :loading-text="$t('Loading content ...')"
    >
        <template v-if="!loading" #list>
            <table class="w-100">
                <!-- Displays the headers of the table -->
                <thead>
                    <tr>
                        <th v-for="(header, i) in headers" :key="i">
                            {{ header.label }}
                        </th>
                    </tr>
                </thead>

                <!-- Displays the data of the table -->
                <tbody>
                    <tr v-for="(item, i) in items" :key="'item-' + i">
                        <td v-for="(header, j) in headers" :key="'item-' + i + '-' + j">
                            <!-- Slot to allow for customisation of value display -->
                            <slot
                                :name="'item-' + header.value.toString()"
                                :item="item"
                                :value="item[header.value]"
                            >
                                {{ item[header.value] }}
                            </slot>
                        </td>

                        <!-- Slot to display optional actions -->
                        <td v-if="slots['item-actions']" class="actions d-flex">
                            <slot name="item-actions" :item="item" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </template>
    </ListPaginate>
</template>

<script setup lang="ts" generic="T">
import { ref, useSlots } from 'vue';
import ListPaginate from '../display/list/ListPaginate.vue';

/**
 * Header of table
 */
export interface ClassicDataTableHeader<T> {
    /** Label of the header */
    label: string;
    /** Key of the item that will be displayed */
    value: keyof T;
}

const {
    first = 0,
    size = 50
} = defineProps<{
    /** The elements to display in the table */
    items: Array<T>;
    /** The columns to display in the table */
    headers: Array<ClassicDataTableHeader<T>>;
    /** Index of first element in pagination */
    first?: number;
    /** Number of elements in pagination */
    size?: number;
}>();

const slots = useSlots();

/** Indicates that data is loading in the table */
const loading = ref(false);
</script>

<style scoped lang="scss">
table {
    border-collapse: collapse;
}

th {
    text-align: start;
}

tr {
    height: var(--table-line-height);
    min-height: var(--table-line-height);
}

thead, tr/*:not(:last-child)*/ {
    // Display a border between each line
    border-bottom: 1px solid var(--octopus-primary-more-transparent);

    td:first-child, th:first-child {
        padding: 0px 32px;
    }
}

.actions {
    // Right align content
    justify-content: right;
}
</style>

<!--
    Generic component to display an array of elements

    **Slots** :
    - `item.[header.value]`
      - Replace the default display of a value
      - Parameters :
        - `item`: The item being displayed
        - `value`: The value of the item
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
                <thead>
                    <tr>
                        <th v-for="(header, i) in headers" :key="i">
                            {{ header.label }}
                        </th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="(item, i) in items" :key="'item-' + i">
                        <td v-for="(header, j) in headers" :key="'item-' + i + '-' + j">
                            <slot
                                :name="'item.' + header.value.toString()"
                                :item="item"
                                :value="item[header.value]"
                            >
                                {{ item[header.value] }}
                            </slot>
                        </td>

                        <td v-if="slots['item.actions']" class="d-flex">
                            <slot name="item.actions" :item="item" />
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
export interface Header<T> {
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
    headers: Array<Header<T>>;
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
</style>

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
    <ClassicDataTable_Internal 
        v-if="noPagination"
        v-bind="{ ...props, ...$attrs }"
    >
        <template v-for="(_, name) in $slots" v-slot:[name]="scope">
            <slot :name="name" v-bind="{ ...scope }" />
        </template>
    </ClassicDataTable_Internal>
    <ListPaginate
        v-else
        :first="first"
        :size="size"
        :text-count="$t('Number items', { nb: items.length })"
        :total-count="items.length"
        :loading="loading"
        :loading-text="$t('Loading content ...')"
    >
        <template v-if="!loading" #list>
            <ClassicDataTable_Internal 
                v-bind="{ ...props, ...$attrs }"
            >
                <template v-for="(_, name) in $slots" v-slot:[name]="scope">
                    <slot :name="name" v-bind="{ ...scope }" />
                </template>
            </ClassicDataTable_Internal>
        </template>
    </ListPaginate>
</template>

<script setup lang="ts" generic="T">
import ListPaginate from '../display/list/ListPaginate.vue';
import ClassicDataTable_Internal, {
    type ClassicDataTableHeader,
    type ClassicDataTableProps
} from './ClassicDataTable_Internal.vue';

export type { ClassicDataTableHeader };

const {
    first = 0,
    size = 50,
    noPagination = false,
    ...props
} = defineProps<ClassicDataTableProps<T> & {
    /** Index of first element in pagination */
    first?: number;
    /** Number of elements in pagination */
    size?: number;
    /** Disable pagination */
    noPagination?: boolean;
    /** Indicates that data is loading */
    loading?: boolean;
}>();
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

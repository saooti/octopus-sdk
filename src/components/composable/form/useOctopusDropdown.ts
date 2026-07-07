import { computed, getCurrentInstance, nextTick, ref } from 'vue';
import { type MaybeElementRef, onClickOutside } from '@vueuse/core';
import { useI18n } from 'vue-i18n';

export interface OctopusDropdownProps<T> {
    options: T[];
    optionLabel?: keyof T & string;
    optionKey?: keyof T;
    isDisabled?: boolean;
    placeholder?: string;
}

export function useOctopusDropdown<T>(
    props: OctopusDropdownProps<T>,
    emitSearch: (query: string) => void,
    idPrefix: string = 'octopus-dropdown',
    // Extra elements to exclude from the click-outside check.
    // Needed when the dropdown is teleported outside containerRef (e.g. to body):
    // without this, clicking inside the teleported dropdown triggers closeDropdown
    // because it is no longer a DOM descendant of containerRef.
    ignore?: MaybeElementRef[]
) {
    const { t } = useI18n();
    const instance = getCurrentInstance();

    const searchQuery = ref('');
    const isOpen = ref(false);
    const isHovered = ref(false);
    const containerRef = ref<HTMLElement | null>(null);
    const inputRef = ref<HTMLInputElement | null>(null);

    const computedId = computed(() => `${idPrefix}-${instance?.uid}`);

    // vnode.props contains the raw parent-provided props before defineEmits strips them
    // from attrs, so onSearch is present whenever the parent writes @search="...".
    const hasSearchListener = computed(() => !!instance?.vnode.props?.onSearch);

    const displayedOptions = computed((): T[] => {
        if (hasSearchListener.value) {
            return props.options;
        }
        const query = searchQuery.value.toLowerCase();
        if (!query) {
            return props.options;
        }
        return props.options.filter((option) =>
            getLabel(option).toLowerCase().includes(query)
        );
    });

    const inputPlaceholder = computed(() => props.placeholder ?? t('Search'));

    function getLabel(option: T): string {
        if (props.optionLabel) {
            return option[props.optionLabel] as string;
        }
        return option as unknown as string;
    }

    function openDropdown(): void {
        if (props.isDisabled) {
            return;
        }
        isOpen.value = true;
        nextTick(() => {
            inputRef.value?.focus();
        });
    }

    function closeDropdown(): void {
        isOpen.value = false;
        searchQuery.value = '';
    }

    function toggleDropdown(): void {
        if (isOpen.value) {
            closeDropdown();
        } else {
            openDropdown();
        }
    }

    function handleInput(): void {
        if (hasSearchListener.value) {
            emitSearch(searchQuery.value);
        }
    }

    onClickOutside(containerRef, closeDropdown, ignore?.length ? { ignore } : undefined);

    return {
        searchQuery,
        isOpen,
        isHovered,
        containerRef,
        inputRef,
        computedId,
        hasSearchListener,
        displayedOptions,
        inputPlaceholder,
        getLabel,
        openDropdown,
        closeDropdown,
        toggleDropdown,
        handleInput,
    };
}

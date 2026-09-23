<template>
    <div
        id="suborga-list-menu"
        ref="menuNav"
        role="dialog"
        aria-labelledby="suborga-list-menu-title"
        :class="{ shown: open }"
        :inert="!open"
    >
        <button
            type="button"
            class="btn-transparent close-btn"
            @click="close"
        >
            <CloseIcon :title="t('Close')" />
        </button>

        <div class="search">
            <h3 id="suborga-list-menu-title">
                {{ t('RightsScopeMenu - Title') }}
            </h3>
            <ClassicInputText
                v-model:text-init="search"
                :placeholder="t('RightsScopeMenu - Search')"
                can-be-null
            />
        </div>

        <div v-if="showFirstList" class="suborga-list mb-4">
            <h4>{{ t('RightsScopeMenu - First list - Title') }}</h4>
            <span
                v-for="suborga in userSubOrgas"
                :key="suborga.id"
                class="suborga"
                @click="select(suborga)"
            >
                {{ suborga.name }}
            </span>
        </div>

        <div class="suborga-list">
            <h4>{{ secondListTitle }}</h4>

            <div v-if="showLetters" class="letters mt-2">
                <button
                    v-for="letter in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'"
                    :key="letter"
                    type="button"
                    class="letter"
                    :title="subOrgaByLetter.has(letter) ? undefined : t('RightsScopeMenu - Letters - No sub orga for letter')"
                    :disabled="!subOrgaByLetter.has(letter)"
                    @click="scrollToLetter(letter)"
                >
                    {{ letter }}
                </button>
            </div>

            <div
                v-for="[letter, suborgaForLetter] in subOrgaByLetter"
                :key="'suborgas-' + letter"
            >
                <div
                    :id="'suborga-letter-' + letter"
                    class="letter"
                    tabindex="-1"
                >
                    {{ letter }}
                </div>
                <span
                    v-for="suborga in suborgaForLetter"
                    :key="suborga.id"
                    class="suborga"
                    @click="select(suborga)"
                >
                    {{ suborga.name }}
                </span>
            </div>
        </div>

        <p role="status" class="text-indic px-3">
            <template v-if="noResult">
                {{ t('RightsScopeMenu - No result') }}
            </template>
        </p>
    </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, onUnmounted, ref, toRef, useTemplateRef, watch } from 'vue';
import { getClassicInputText, useAuthStore } from '@saooti/octopus-sdk'; 
import { SubOrganisation, useSubOrganisations } from '../composable/useSubOrganisations';
import { useI18n } from 'vue-i18n';
import CloseIcon from 'vue-material-design-icons/Close.vue';

const ClassicInputText = defineAsyncComponent(getClassicInputText);

const { t } = useI18n();

///////////////////////////////
// Menu
///////////////////////////////
const props = defineProps<{
    open?: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:open', open: boolean): void;
}>();

const menuNav = useTemplateRef('menuNav');
let previousFocus: HTMLElement | null = null;

watch(() => props.open, async open => {
    if (open) {
        previousFocus = document.activeElement as HTMLElement | null;
        setTimeout(() => document.addEventListener('click', openOnClick), 200);
        document.addEventListener('keydown', closeOnEscape);
        // Wait for the menu to no longer be inert before focusing
        await nextTick();
        menuNav.value?.querySelector('input')?.focus();
    } else {
        removeListeners();
        // Only give focus back if it would otherwise be lost (inside the
        // closed menu, or on body), to avoid stealing it after a click
        // elsewhere
        const active = document.activeElement;
        if (active === document.body || menuNav.value?.contains(active)) {
            previousFocus?.focus();
        }
    }
});

onUnmounted(removeListeners);

function removeListeners(): void {
    document.removeEventListener('click', openOnClick);
    document.removeEventListener('keydown', closeOnEscape);
}

function close(): void {
    emit('update:open', false);
}

function openOnClick(event: MouseEvent) {
    const menu = menuNav.value;
    if (props.open && event.target && !menu?.contains(event.target as Node)) {
        close();
    }
}

function closeOnEscape(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
        close();
    }
}

function prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

///////////////////////////////
// Display list
///////////////////////////////
const search = ref('');
const authStore = useAuthStore();
const { subOrganisations, selectSubOrganisation } = useSubOrganisations(toRef(authStore, 'authOrgaId'));

function normalize(str: string): string {
    // Separate accented character in letter/diacritic, then remove the
    // diacritic
    return str.toUpperCase().normalize("NFD").replace(/\p{Diacritic}/gu, '');
}

const normalizedSearch = computed((): string => {
    return normalize(search.value);
});

const userSubOrgas = computed((): Array<SubOrganisation> => {
    const userScope = authStore.userScope;
    return subOrganisations.value
        .filter(sub => sub.name.includes(normalizedSearch.value))
        .filter(sub => userScope.includes(sub.id));
});

const showFirstList = computed((): boolean => {
    return userSubOrgas.value.length > 0;
});

const secondListTitle = computed((): string => {
    const userScope = authStore.userScope;
    if (userScope.length === 0) {
        return t('RightsScopeMenu - Second list - Title unscoped');
    } else {
        return t('RightsScopeMenu - Second list - Title scoped');
    }
});

const showLetters = computed((): boolean => {
    return subOrganisations.value.length > 10;
});

const subOrgaByLetter = computed((): Map<string, Array<SubOrganisation>> => {
    const data: Map<string, Array<SubOrganisation>> = new Map();

    const filtered = subOrganisations.value
        .filter(sub => sub.name.includes(normalizedSearch.value))
        .filter(sub => !userSubOrgas.value.includes(sub));

    if (showLetters.value) {
        filtered.forEach((sub: SubOrganisation) => {
            const firstLetter = sub.name[0];
            if (data.has(firstLetter)) {
                const present = data.get(firstLetter);
                present!.push(sub);
            } else {
                data.set(firstLetter, [sub]);
            }
        });
    } else {
        data.set(null, filtered);
    }

    data.values().forEach(ary => ary.sort((a, b) => a.name.localeCompare(b.name)));

    return data;
});

const noResult = computed((): boolean => {
    return !showFirstList.value
        && [...subOrgaByLetter.value.values()].every(ary => ary.length === 0);
});

function scrollToLetter(letter: string): void {
    if (!subOrgaByLetter.value.has(letter)) {
        return;
    }
    const container = menuNav.value;
    const target: HTMLElement | null | undefined = container?.querySelector(`#suborga-letter-${letter}`);
    if (container && target) {
        container.scrollTo({
            top: target.offsetTop,
            behavior: prefersReducedMotion() ? 'auto' : 'smooth'
        });
        target.focus({ preventScroll: true });
    }
}

///////////////////////////////
// Sub orga selection
///////////////////////////////
function select(org: SubOrganisation): void {
    selectSubOrganisation(org);
    emit('update:open', false);
}
</script>

<style scoped lang="scss">
#suborga-list-menu-btn {
    transition: rotate 0.3s ease-out;
    
    &.active {
        rotate: 90deg;
    }
}

#suborga-list-menu {
    z-index: 100;
    
    --width: 30dvw;

    // Positioning
    position: fixed;
    left: 0;
    top: 0;
    width: var(--width);
    height: 100dvh;

    // Margins
    padding: 1.5em 0;

    // Overflow
    overflow-y: auto;

    // Style
    background-color: white;
    //border-radius: 0 var(--octopus-border-radius);
    border-right: 2px solid var(--octopus-primary);

    // Animation
    @media (prefers-reduced-motion: no-preference) {
        transition: left 0.6s ease-out;
    }

    &.shown {
        left: 0;
    }

    &:not(.shown) {
        left: calc(var(--width) * -1);
    }

    @media(width <= 960px) {
        --width: 100dvw;
    }
}

.close-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
}

h4 {
    margin-left: 10px;
    color: var(--octopus-primary);
}

.letter {
    color: var(--pm-accent);
    font-weight: bold;
    font-size: 1em;
    background-color: oklch(from var(--pm-accent) l c h / 15%);
}

.search {
    padding: 0 1rem;

    h3 {
        color: var(--pm-accent);
        text-align: center;
    }
}

.letters {
    display: grid;
    grid-template-columns: repeat(9, 28px);
    width: fit-content;
    margin: auto;

    .letter {
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        color: black;
        margin: 7px 0 8px;
        width: 24px;
        height: 24px;
        border-radius: 8px;
        font-size: 12px;
        padding: 0 !important;
        cursor: pointer;

        &:disabled {
            background-color: #EBF3FE;
            cursor: not-allowed;
        }
    }
}

.suborga-list {
    .letter {
        padding: 0.1rem 1rem;
        color: var(--octopus-primary);
    }

    .suborga {
        display: block;
        padding: 0.5rem 1.4rem;
        cursor: pointer;

        &:not(:last-child) {
            border-bottom: 1px solid var(--octopus-primary-really-transparent);
        }
    }
}
</style>

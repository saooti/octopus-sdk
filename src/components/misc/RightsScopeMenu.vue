<template>
    <div ref="componentRoot">
        <!--
        <MenuIcon
            id="college-list-menu-btn"
            fill-color="white"
            class="me-3"
            :class="{ active: menuOpen }"
            :size="48"
            @click="menuOpen = !menuOpen"
        />
        -->

        <nav
            id="college-list-menu"
            ref="menuNav"
            :class="{ shown: open }"
        >
            <div class="search">
                <h3>Chercher un collège par nom</h3>
                <ClassicInputText
                    v-model:text-init="collegeSearch"
                    placeholder="Nom du collège"
                />
                <div class="letters mb-2">
                    <button
                        v-for="letter in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'"
                        :key="letter"
                        class="letter"
                        :title="collegesByLetter.has(letter) ? undefined : 'Aucun collège pour cette lettre'"
                        :class="{ active: collegesByLetter.has(letter) }"
                        @click="scrollToLetter(letter)"
                    >
                        {{ letter }}
                    </button>
                </div>
            </div>

            <div id="college-list">
                <div
                    v-for="[letter, collegesForLetter] in collegesByLetter"
                    :key="'colleges-' + letter"
                >
                    <div :id="'college-letter-' + letter" class="letter">
                        {{ letter }}
                    </div>
                    <span
                        v-for="college in collegesForLetter"
                        :key="college.id"
                        class="college"
                        @click="select(college)"
                    >
                        <span class="college-name">{{ college.name }}</span>
                        <br>
                        <span class="college-town">{{ college.town }}</span>
                    </span>
                </div>
            </div>
        </nav>
    </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onUnmounted, ref, toRef, useTemplateRef, watch } from 'vue';
import { getClassicInputText, useAuthStore } from '@saooti/octopus-sdk'; 
import { SubOrganisation, useSubOrganisations } from '../composable/useSubOrganisations';

const ClassicInputText = defineAsyncComponent(getClassicInputText);

///////////////////////////////
// Menu
///////////////////////////////
const props = defineProps<{
    open?: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:open', open: boolean): void;
}>();

const componentRoot = useTemplateRef('componentRoot');
const menuNav = useTemplateRef('menuNav');

watch(() => props.open, open => {
    if (open) {
        setTimeout(() => document.addEventListener('click', openOnClick), 200);
    } else {
        document.removeEventListener('click', openOnClick);
    }
})

onUnmounted((): void => {
    document.removeEventListener('click', openOnClick);
});

function openOnClick(event: MouseEvent) {
    const menu = componentRoot.value;
    if (props.open && event.target && !menu?.contains(event.target)) {
        emit('update:open', false);
    }
}

///////////////////////////////
// College list
///////////////////////////////
const collegeSearch = ref('');
const authStore = useAuthStore();
const { subOrganisations, selectSubOrganisation } = useSubOrganisations(toRef(authStore, 'authOrgaId'));

const collegesByLetter = computed((): Map<string, Array<SubOrganisation>> => {
    const data: Map<string, Array<SubOrganisation>> = new Map();
    const search = collegeSearch.value;//normalize(collegeSearch.value);

    subOrganisations.value
        .filter(college => college !== null)
        .filter(college => college.name.includes(search))
        .forEach((college: SubOrganisation) => {
            const firstLetter = college.name[0];
            if (data.has(firstLetter)) {
                const present = data.get(firstLetter);
                present!.push(college);
            } else {
                data.set(firstLetter, [college]);
            }
        });

    data.values().forEach(ary => ary.sort((a, b) => a.name.localeCompare(b.name)));

    return data;
});

function scrollToLetter(letter: string): void {
    if (!collegesByLetter.value.has(letter)) {
        return;
    }
    const container = menuNav.value;
    const target: HTMLElement | null | undefined = container?.querySelector(`#college-letter-${letter}`);
    if (container && target) {
        container.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
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
#college-list-menu-btn {
    transition: rotate 0.3s ease-out;
    
    &.active {
        rotate: 90deg;
    }
}

#college-list-menu {
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
    border-radius: 0 var(--octopus-border-radius);

    // Animation
    transition: left 0.6s ease-out;

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

    .letters {
        display: grid;
        grid-template-columns: 55px 55px 55px 55px 55px 55px 55px;
        width: fit-content;
        margin: auto;

        .letter {
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            color: black;
            margin: 7px 0 8px;
            width: 40px;
            height: 40px;
            border-radius: 8px;

            &:not(.active) {
                background-color: #EBF3FE;
                cursor: not-allowed;
            }

            &.active {
                cursor: pointer;
            }
        }
    }
}

#college-list {
    .letter {
        padding: 0.1rem 1rem;
    }

    .college {
        display: block;
        padding: 0.5rem 1.4rem;
        border-bottom: 1px solid grey;
        cursor: pointer;

        .college-name {
            font-weight: bold;
        }
    }
}
</style>

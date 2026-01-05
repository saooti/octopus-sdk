<template>
  <div
    :class="{
      'multiselect-in-modal': inModal,
      'multiselect-no-deselect': noDeselect,
      'form-margin': displayLabel,
    }"
    :style="{ width: width, height: height }"
  >
    <div class="d-flex align-items-center">
      <label :class="displayLabel ? '' : 'd-none'" :for="id" class="form-label">{{
        label
      }}
      <AsteriskIcon v-if="displayRequired" :size="10" class="ms-1 mb-2" :title="t('Mandatory input')"/>
      </label>
      <template v-if="popover">
        <button
          :id="'popover' + id"
          :title="t('Help')"
          class="btn-transparent"
        >
          <HelpCircleIcon :size="30" />
        </button>
        <ClassicPopover
          :target="'popover' + id"
          popover-class="popover-z-index"
          :relative-class="popoverRelativeClass"
        >
          <!-- eslint-disable vue/no-v-html -->
          <div v-html="popover" />
          <!-- eslint-enable -->
        </ClassicPopover>
      </template>
    </div>
    <vSelect
      v-model="optionSelected"
      :input-id="id"
      :label="optionLabel"
      :multiple="multiple"
      :options="options"
      :disabled="isDisabled"
      :loading="isLoading"
      :placeholder="placeholder"
      :clear-search-on-blur="
        () => {
          return true;
        }
      "
      :filter="fakeSearch"
      :selectable="() => !maxOptionsSelected"
      :style="{height: height }"
      :class="{ 'border border-danger': textDanger?.length }"
      @open="onSearch"
      @search="onSearch"
      @close="onClose"
      @option:selected="onOptionSelected"
      @option:deselected="onOptionDeselect"
    >
      <template v-if="optionCustomTemplating.length" #option="option">
        <slot :name="optionCustomTemplating" :option="option" />
      </template>
      <template
        v-if="optionSelectedCustomTemplating.length"
        #selected-option="option"
      >
        <slot :name="optionSelectedCustomTemplating" :option="option" />
      </template>
      <template #no-options="{ searching }">
        <span v-if="searching">{{
          t("No elements found. Consider changing the search query.")
        }}</span>
        <span v-else>{{ t("List is empty") }}</span>
      </template>
      <template #list-footer>
        <div v-if="remainingElements" class="vs__dropdown-option">
          {{
            t(
              "Count more elements matched your query, please make a more specific search.",
              { count: remainingElements },
            )
          }}
        </div>
      </template>
      <template #list-header>
        <div v-if="maxOptionsSelected" class="vs__dropdown-option">
          {{ t("Multiselect max options", { max: maxOptions }) }}
        </div>
      </template>
      <template #open-indicator="{ attributes }">
        <ChevronDownIcon v-bind="attributes" />
      </template>
    </vSelect>
    <div v-if="textDanger" class="text-danger">
      {{ textDanger }}
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { computed, defineAsyncComponent, ref, Ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import AsteriskIcon from "vue-material-design-icons/Asterisk.vue";
import ChevronDownIcon from "vue-material-design-icons/ChevronDown.vue";
import vSelect from "vue-select";
import HelpCircleIcon from "vue-material-design-icons/HelpCircle.vue";
const ClassicPopover = defineAsyncComponent(
  () => import("../misc/ClassicPopover.vue"),
);

//Props 
const {
  inModal = false, multiple = false, isDisabled = false, width = "100%",
  maxElement = 50, minSearchLength = 3, noDeselect = true, displayLabel = false,
  allowEmpty = true, optionChosen, maxOptions = null,
  optionCustomTemplating = '', optionSelectedCustomTemplating = ''
} = defineProps<{
  id?: string;
  label?: string;
  placeholder?: string;
  optionLabel?: string;
  inModal?: boolean;
  multiple?: boolean;
  isDisabled?: boolean;
  width?: string;
  height?: string;
  maxElement?: number;
  minSearchLength?: number;
  /** Currently chosen option */
  optionChosen?: T|Array<T>;
  noDeselect?: boolean;
  optionCustomTemplating?: string;
  optionSelectedCustomTemplating?: string;
  displayLabel?: boolean;
  maxOptions?: number;
  allowEmpty?: boolean;
  textDanger ?:string;
  displayRequired?: boolean;
  popover?: string;
  popoverRelativeClass?: string;
}>();

//Emits
const emit = defineEmits(["onSearch", "selected", "onClose"]);

//Data 
const optionSelected : Ref<T|T[]>= ref(undefined);
const options : Ref<Array<T>>= ref([]);
const remainingElements = ref(0);
const isLoading = ref(false);
const searchInput = ref("");

//Composables
const { t } = useI18n();


//Computed
const maxOptionsSelected = computed(() => {
  if (maxOptions !== null && multiple) {
    return (
      (optionSelected.value as Array<T>).length >= maxOptions
    );
  }
  return false;
});

//Watch
watch(()=>optionChosen, () => {
  optionSelected.value = optionChosen;
}, {deep: true, immediate: true});
watch(optionSelected, () => {
  if (noDeselect || null !== optionSelected.value) {
    return;
  }
  emit("selected", undefined);
}, {deep: true});

//Methods
function fakeSearch(): Array<unknown> {
  return options.value;
}
function onSearch(search?: string): void {
  if (search && search.length < minSearchLength) {
    return;
  } else if (search) {
    searchInput.value = search;
  }
  isLoading.value = true;
  emit("onSearch", search);
}
function onClose() {
  emit("onClose", searchInput.value);
  searchInput.value = "";
}
function afterSearch(optionsFetched: Array<T>, count: number): void {
  options.value = optionsFetched;
  remainingElements.value = Math.max(0, count - maxElement);
  isLoading.value = false;
}
function onOptionSelected(optionSelected: unknown): void {
  emit("selected", optionSelected);
}
function onOptionDeselect(event: unknown): void {
  if (!multiple) {
    return;
  }
  if (
    !allowEmpty &&
    0 === (optionSelected.value as Array<unknown>).length
  ) {
    (optionSelected.value as Array<unknown>).push(event);
    return;
  }
  emit("selected", optionSelected.value);
}

//Expose
defineExpose({
  afterSearch
});
</script>

<style lang="scss">
@use "vue-select/dist/vue-select.css";
/* stylelint-disable */
:root {
  --vs-dropdown-z-index: 1405;
  --vs-border-radius: 0.2rem;
  --vs-dropdown-option--active-bg: var(--octopus-secondary);
  --vs-dropdown-option--active-color: black;
  --vs-font-size: 0.8rem;
  --vs-border-width: 2px;
  --vs-border-color: var(--octopus-border-default);
}

.octopus-app {
  .vs__dropdown-option {
    white-space: initial;
  }

  .vs--searchable .vs__dropdown-toggle {
    cursor: pointer;
  }

  .vs__dropdown-toggle {
    padding: 0;
    height: 100%;
  }

  .vs__search, .vs__search:focus{
    border: var(--vs-selected-border-width) solid transparent;
  }
  .vs__search:focus {
    min-width: 150px;
  }

  .multiselect-no-deselect .vs__clear {
    display: none;
  }

  .multiselect-transparent {
    --vs-border-color: transparent;
  }

  .multiselect-white {
    --vs-selected-color: white;
    --vs-selected-bg: transparent;
    --vs-dropdown-bg: black;
    --vs-controls-color: white;

    .vs__actions path {
      fill: white;
    }
  }

  .multiselect-in-modal{
    .vs__dropdown-menu{
      position: relative !important;
    }
  }
}
/* stylelint-enable */
</style>

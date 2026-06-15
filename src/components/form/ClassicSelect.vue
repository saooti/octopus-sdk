<template>
  <div class="classic-select" :class="{ 'form-margin': displayLabel }">
    <label v-show="displayLabel" :for="idSelect" :class="classLabel">
      {{ label }}
      <AsteriskIcon v-if="displayRequired" :size="10" class="ms-1 mb-2" :title="t('Mandatory input')"/>
      <slot name="after-label" />
    </label>

    <select
      :id="idSelect"
      :value="textInit"
      :disabled="isDisabled"
      class="c-hand w-100"
      :class="transparent ? 'transparent' : ''"
      :style="getFontFamily"
      :aria-label="label"
      :required="displayRequired"
      @change="onChange($event.target.value)"
    >
      <option
        v-if="placeholder"
        value=""
        disabled
        selected
      >
        {{ placeholder }}
      </option>
      <option
        v-for="option in optionsOrder"
        :key="option.title"
        :value="option.value"
        :data-selenium="'select-option-' + option.value"
        :style="option.fontFamily ? 'font-family:' + option.fontFamily : ''"
      >
        <slot name="option" :option="option">
          {{ option.title }}
        </slot>
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import AsteriskIcon from "vue-material-design-icons/Asterisk.vue";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

export interface SelectOption<T = number|string|undefined> {
  title: string;
  value: T;
  fontFamily?: string;
}

//Props 
const props = defineProps({
  idSelect: { default: "", type: String },
  label: { default: "", type: String },
  displayLabel: { default: true, type: Boolean },
  transparent: { default: false, type: Boolean },
  isDisabled: { default: false, type: Boolean },
  options: {
    default: () => [],
    type: Array as () => Array<SelectOption>,
  },
  /** Option displayed at the top of list */
  topOption: { default: undefined,type: Object as () => SelectOption },
  textInit: { default: undefined, type: [String, Number] },
  classLabel: { default: "form-label", type: String },
  orderOptions: { default: true, type: Boolean},
  placeholder: { default: undefined, type: String},
  displayRequired: { default: false, type: Boolean },
})


//Emits
const emit = defineEmits(["update:textInit"]);

//Composables
const { t } = useI18n();


//Computed
const getFontFamily = computed(() => {
  const item = props.options.find((x) => {
    return props.textInit === x.value;
  });
  if (item?.fontFamily) {
    return "font-family:" + item.fontFamily;
  }
  return "";
});
const optionsOrder = computed(() => {
  const optionsOrdered = Array.from(props.options);
  if(props.orderOptions){
    optionsOrdered.sort((a,b) => {
      if(a.title > b.title){
        return 1;
      }
      return (b.title > a.title) ? -1 : 0
  }); 
  }
  if(props.topOption){
    optionsOrdered.unshift(props.topOption);
  }
  return optionsOrdered;
});

//Methods
function onChange(value:string){
  emit('update:textInit', value)
}
</script>

<style lang="scss">
.octopus-app {
  select option:is(:checked, :hover){
    box-shadow: 0 0 10px 100px var(--octopus-secondary) inset;
  }

  select:focus > option:checked {
    background: var(--octopus-secondary) !important;
  }

  select.transparent {
    background: transparent !important;
    outline-color: transparent !important;
    padding: 0;
    border: 0;
    height: unset;
    appearance: auto !important;
  }
}
</style>

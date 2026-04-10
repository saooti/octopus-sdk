<template>
  <div
    class="d-flex flex-column classic-input-text"
    :class="{ 'form-margin': displayLabel }"
  >
    <div class="d-flex align-items-center">
      <slot name="complementLabel" />
      <component
        :is="isWysiwyg? 'div': 'label'"
        :class="[classLabel, displayLabel ? '' : 'd-none']"
        :for="isWysiwyg ? '': computedInputId"
      >
        {{ label }}
        <AsteriskIcon
          v-if="displayRequired"
          :size="10"
          class="ms-1 mb-2"
          :title="t('Mandatory input')"
        />
      </component>
      <slot name="afterTitle" />
      <template v-if="popover">
        <button
          :id="'popover' + computedInputId"
          :title="t('Help')"
          class="btn-transparent"
        >
          <HelpCircleIcon :size="30" />
        </button>

        <ClassicPopover
          :target="'popover' + computedInputId"
          popover-class="popover-z-index"
          :relative-class="popoverRelativeClass"
        >
          <!-- eslint-disable vue/no-v-html -->
          <div v-html="popover" />
          <!-- eslint-enable -->
        </ClassicPopover>
      </template>
      <slot name="afterHelp" />
    </div>
    <slot name="betweenTitleInput" />
    <input
      v-if="!isWysiwyg && !isTextarea"
      v-show="showField"
      :id="computedInputId"
      ref="focusElement"
      v-model="textValue"
      :type="typeInput"
      class="form-input"
      :placeholder="placeholder"
      :data-selenium="dataSelenium"
      :data-value="textValue"
      :maxlength="inputMaxLengthField"
      :readonly="readonly ? 'readonly' : undefined"
      :class="{
        'border border-danger':
          forceError || (isError && (undefined !== textValue || canBeNull)),
      }"
      :disabled="isDisable || disabled"
      :required="!canBeNull"
      :autocomplete="autocompleteType"
    >
    <textarea
      v-else-if="isTextarea"
      v-show="showField"
      :id="computedInputId"
      ref="focusElement"
      v-model="textValue"
      :data-selenium="dataSelenium"
      :placeholder="placeholder"
      :readonly="readonly ? 'readonly' : undefined"
      class="form-input"
      :class="{
        'border border-danger':
          forceError || (isError && (undefined !== textValue || canBeNull)),
      }"
      :disabled="isDisable || disabled"
      :required="!canBeNull"
    />
    <ClassicWysiwyg
      v-else
      v-show="showField"
      v-model:content="textValue"
      :error-description="
        forceError || (isError && (undefined !== textValue || canBeNull))
      "
      :is-disabled="isDisable || disabled"
    />
    <div class="d-flex">
      <ClassicEmojiPicker
        v-if="isEmojiPicker"
        :popover-relative-class="popoverRelativeClass"
        :is-top-position="true"
        @emoji-selected="addEmojiSelected"
      />
      <div
        v-if="isWysiwyg"
        class="h6"
      >
        {{ t("Characters number calculated over HTML code") }}
      </div>
      <div
        v-else-if="'' !== indicText"
        class="text-indic"
      >
        {{ indicText }}
      </div>
      <div
        v-else-if="
          forceError || (isError && (undefined !== textValue || canBeNull))
        "
        class="text-danger"
      >
        {{ errorText }}
      </div>
      <p
        v-if="0 !== maxLength && showField"
        class="counter-align-right"
        :class="{ 'text-danger': !valueLengthValid }"
      >
        {{ countValue + " / " + maxLength }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import AsteriskIcon from "vue-material-design-icons/Asterisk.vue";
import HelpCircleIcon from "vue-material-design-icons/HelpCircle.vue";
import { computed, defineAsyncComponent, onMounted, Ref, ref, useTemplateRef, watch, getCurrentInstance } from "vue";
import { useI18n } from "vue-i18n";
const ClassicPopover = defineAsyncComponent(
  () => import("../misc/ClassicPopover.vue"),
);
const ClassicWysiwyg = defineAsyncComponent(
  () => import("./ClassicWysiwyg.vue"),
);
const ClassicEmojiPicker = defineAsyncComponent(
  () => import("./ClassicEmojiPicker.vue"),
);

//Props 
const props = defineProps({
  inputId: { default: "", type: String },
  label: { default: "", type: String },
  /** The input's value */
  textInit: { default: undefined, type: String },
  maxLength: { default: 0, type: Number },
  errorText: { default: "", type: String },
  isTextarea: { default: false, type: Boolean },
  isWysiwyg: { default: false, type: Boolean },
  /** A regex checked against the input, if the input doesn't match mark it with error */
  regex: { default: undefined, type: RegExp },
  canBeNull: { default: false, type: Boolean },
  inputMaxLengthField: { default: undefined, type: Number },
  errorVariable: { default: true, type: Boolean },
  /**
   * Disable the text input
   * @deprecated Use `disabled` instead
   */
  isDisable: { default: false, type: Boolean },
  /**
   * Disable the text input
   */
  disabled: { default: false, type: Boolean },
  indicText: { default: "", type: String },
  dataSelenium: { default: "", type: String },
  placeholder: { default: "", type: String },
  popover: { default: undefined, type: String },
  /**
   * Display content but do not allow changes
   */
  readonly: { default: false, type: Boolean },
  forceError: { default: false, type: Boolean },
  displayLabel: { default: true, type: Boolean },
  focus: { default: false, type: Boolean },
  isEmojiPicker: { default: false, type: Boolean },
  popoverRelativeClass: { default: undefined, type: String },
  forceReload: { default: false, type: Boolean },
  typeInput: { default: "text", type: String },
  displayRequired: { default: false, type: Boolean },
  classLabel: { default: "form-label", type: String },
  showField: { default: true, type: Boolean },
  autocompleteType: { default: "off", type: String },
})

//Emits
const emit = defineEmits(["update:textInit", "update:errorVariable"]);

//Data 
const textValue : Ref<string | undefined>= ref(undefined);
const focusElementRef = useTemplateRef('focusElement');

//Composables 
const { t } = useI18n();

//Computed
const computedInputId = computed(() => props.inputId || 'input-' + getCurrentInstance()?.uid);
const isError = computed(() => !valueTrimValid.value || !valueLengthValid.value || !valueRegexValid.value);
const countValue = computed(() => {
  if (textValue.value) {
    return textValue.value.length;
  }
  return 0;
});
const valueTrimValid = computed(() => {
  if (!props.canBeNull) {
    if (!textValue.value) {
      return false;
    }
    return 0 !== textValue.value.trim().length;
  }
  return true;
});
const valueLengthValid = computed(() => {
  if (0 === props.maxLength) {
    return true;
  }
  return props.maxLength >= countValue.value;
});
const valueRegexValid = computed(() => {
  if (props.regex === undefined) {
    return true;
  }
  if (!textValue.value || "" === textValue.value) {
    return props.canBeNull;
  }
  return textValue.value.match(props.regex) !== null;
});
  
//Watch
watch(()=>props.forceReload, () => {
  if (props.textInit !== textValue.value) {
    textValue.value = props.textInit;
  }
});
watch(isError, () => {
  emit("update:errorVariable", isError.value);
});
watch(textValue, () => {
  if (props.textInit !== textValue.value) {
    emit("update:textInit", textValue.value);
  }
});
watch(()=>props.textInit, () => {
  if (props.textInit !== textValue.value) {
    textValue.value = props.textInit;
  }
});


onMounted(()=>{
  if (props.focus) {
    (focusElementRef?.value as HTMLElement)?.focus();
  }
  textValue.value = props.textInit;
  if (props.errorVariable !== isError.value) {
    emit("update:errorVariable", isError.value);
  }

  if (props.isTextarea) {
    // Delay a scroll back to the top of the text area
    setTimeout(() => {
      const textArea = document.getElementById(computedInputId.value);
      if (textArea) {
        textArea.scrollTop = 0;
      }
    }, 100);
  }
});
 
//Methods
function addEmojiSelected(emoji: string) {
  textValue.value = (textValue.value ?? "") + emoji;
}
</script>

<style lang="scss">
.octopus-app .classic-input-text {
  .text-indic {
    font-style: italic;
    font-size: 0.7rem;
    color: var(--octopus-gray-text);
  }

  textarea {
    height: auto;
    min-height: 120px;
  }
}
</style>

<template>
  <div class="d-flex flex-column classic-input-text">
    <div class="d-flex">
      <label
        class="form-label"
        :for="inputId"
        :class="displayLabel ? '' : 'd-none'"
        >{{ label }}</label
      >
      <template v-if="popover">
        <span
          :id="'popover' + inputId"
          role="button"
          class="saooti-help m-0"
          tabindex="0"
          :title="$t('Help')"
        />
        <ClassicPopover :target="'popover' + inputId">
          <!-- eslint-disable vue/no-v-html -->
          <div v-html="popover" />
          <!-- eslint-enable -->
        </ClassicPopover>
      </template>
    </div>
    <input
      v-if="!isWysiwyg && !isTextarea"
      :id="inputId"
      v-model="textValue"
      type="text"
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
      :disabled="isDisable"
    />
    <textarea
      v-else-if="isTextarea"
      :id="inputId"
      v-model="textValue"
      :data-selenium="dataSelenium"
      :placeholder="placeholder"
      :readonly="readonly ? 'readonly' : undefined"
      class="form-input"
      :class="{
        'border border-danger':
          forceError || (isError && (undefined !== textValue || canBeNull)),
      }"
      :disabled="isDisable"
    />
    <ClassicWysiwyg
      v-else
      v-model:content="textValue"
      :error-description="
        forceError || (isError && (undefined !== textValue || canBeNull))
      "
      :is-disabled="isDisable"
    />
    <div class="d-flex justify-content-between">
      <div v-if="isWysiwyg" class="h6">
        {{ $t("Characters number calculated over HTML code") }}
      </div>
      <div v-else-if="'' !== indicText" class="text-indic">
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
        v-if="0 !== maxLength"
        class="counter-align-right"
        :class="{ 'text-danger': !valueLengthValid }"
      >
        {{ countValue + " / " + maxLength }}
      </p>
    </div>
  </div>
</template>
<script lang="ts">
import { defineAsyncComponent, defineComponent } from "vue";
const ClassicPopover = defineAsyncComponent(
  () => import("../misc/ClassicPopover.vue"),
);
const ClassicWysiwyg = defineAsyncComponent(
  () => import("./ClassicWysiwyg.vue"),
);
export default defineComponent({
  components: {
    ClassicWysiwyg,
    ClassicPopover,
  },
  props: {
    inputId: { default: "", type: String },
    label: { default: "", type: String },
    textInit: { default: undefined, type: String },
    maxLength: { default: 0, type: Number },
    errorText: { default: "", type: String },
    isTextarea: { default: false, type: Boolean },
    isWysiwyg: { default: false, type: Boolean },
    regex: { default: undefined, type: RegExp },
    canBeNull: { default: false, type: Boolean },
    inputMaxLengthField: { default: undefined, type: Number },
    errorVariable: { default: true, type: Boolean },
    isDisable: { default: false, type: Boolean },
    indicText: { default: "", type: String },
    dataSelenium: { default: "", type: String },
    placeholder: { default: "", type: String },
    popover: { default: undefined, type: String },
    readonly: { default: false, type: Boolean },
    forceError: { default: false, type: Boolean },
    displayLabel: { default: true, type: Boolean },
  },
  emits: ["update:textInit", "update:errorVariable"],
  data() {
    return {
      textValue: undefined as string | undefined,
    };
  },
  computed: {
    isError(): boolean {
      return (
        !this.valueTrimValid || !this.valueLengthValid || !this.valueRegexValid
      );
    },
    countValue(): number {
      if (this.textValue) {
        return this.textValue.length;
      }
      return 0;
    },
    valueTrimValid(): boolean {
      if (!this.canBeNull) {
        if (!this.textValue) {
          return false;
        }
        return 0 !== this.textValue.trim().length;
      }
      return true;
    },
    valueLengthValid(): boolean {
      if (0 === this.maxLength) {
        return true;
      }
      return this.maxLength >= this.countValue;
    },
    valueRegexValid(): boolean {
      if (this.regex === undefined) {
        return true;
      }
      if (!this.textValue || "" === this.textValue) {
        return this.canBeNull;
      }
      return this.regex.exec(this.textValue) !== null;
    },
  },
  watch: {
    isError() {
      this.$emit("update:errorVariable", this.isError);
    },
    textValue() {
      if (this.textInit !== this.textValue) {
        this.$emit("update:textInit", this.textValue);
      }
    },
    textInit() {
      if (this.textInit !== this.textValue) {
        this.textValue = this.textInit;
      }
    },
  },
  mounted() {
    this.textValue = this.textInit;
    if (this.errorVariable !== this.isError) {
      this.$emit("update:errorVariable", this.isError);
    }
  },
});
</script>
<style lang="scss">
.octopus-app .classic-input-text {
  .text-indic {
    font-style: italic;
    font-size: 0.7rem;
    color: #666;
  }
  textarea {
    height: auto;
    min-height: 120px;
  }
}
</style>

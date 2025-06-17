<template>
  <div class="position-relative input-search-page static-height">
    <input
      :id="idSearch"
      ref="search"
      :value="textInit"
      type="search"
      class="search-input w-100 p-2"
      :placeholder="label"
      :autofocus="autofocus"
      @input="onChange($event.target.value)"
    />
    <label :for="idSearch" :title="label" />
    <button
      class="btn-transparent search-icon-container"
      :disabled="!textInit"
      :title="!textInit ? t('Search') : t('Clear search')"
      @click="onChange('')"
    >
      <MagnifyIcon v-if="!textInit" />
      <WindowCloseIcon v-else />
    </button>
  </div>
</template>

<script setup lang="ts">
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";
import WindowCloseIcon from "vue-material-design-icons/WindowClose.vue";
import { useI18n } from "vue-i18n";

//Props 
defineProps({
  idSearch: { default: "", type: String },
  label: { default: "", type: String },
  textInit: { default: "", type: String },
  autofocus: { default: false, type: Boolean },
})

//Emits
const emit = defineEmits(["update:textInit"]);

//Composables
const { t } = useI18n();

//Methods
function onChange(value:string){
  emit('update:textInit', value)
}

</script>
<style lang="scss">


.octopus-app {
  .input-search-page {
    input {
      border: 2px solid var(--octopus-border-default);
      border-radius: var(--octopus-border-radius);
      margin: 0 !important;
      height: 48px;
    }

    input[type="search"]::-webkit-search-cancel-button {
      display: none;
    }
    
    .search-icon-container {
      position: absolute;
      inset-block:0;
      right: 0;
      display: flex;
      align-items: center;
      margin: 10px;
    }
  }
}
</style>

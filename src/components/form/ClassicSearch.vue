<template>
  <div class="position-relative champs-searchPage static-height">
    <input
      :id="idSearch"
      ref="search"
      :value="textInit"
      type="text"
      class="search-input w-100 p-2"
      :placeholder="label"
      :autofocus="autofocus"
      @input="$emit('update:textInit', $event.target.value)"
    />
    <label :for="idSearch" :title="label" />
    <div v-if="!textInit" class="saooti-search search-icon-container" />
    <div
      v-else
      class="saooti-remove search-icon-container c-hand"
      @click="$emit('update:textInit', '')"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "ClassicSearch",
  props: {
    idSearch: { default: "", type: String },
    label: { default: "", type: String },
    textInit: { default: "", type: String },
    autofocus: { default: false, type: Boolean },
  },

  emits: ["update:textInit"],
});
</script>
<style lang="scss">
@use "@scss/variables" as octopusVariables;
.octopus-app {
  .champs-searchPage {
    input {
      border: 2px solid #dee2e6;
      border-radius: octopusVariables.$octopus-borderradius;
      margin: 0 !important;
      height: 48px;
    }
    .saooti-search,
    .saooti-remove {
      font-size: 1rem;
    }
    .search-icon-container {
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      display: flex;
      align-items: center;
      margin: 1rem;
    }
  }
}
</style>

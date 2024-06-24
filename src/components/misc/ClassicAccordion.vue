<template>
  <div
    class="my-4"
    :class="[
      displayAccordion ? 'octopus-accordion' : '',
      isOpen ? 'octopus-accordion-open' : '',
    ]"
  >
    <template v-if="displayAccordion">
      <button
        :id="'accordion-' + idComposer"
        class="w-100 py-2 text-start d-flex flex-nowrap align-items-center"
        @click="isOpen = !isOpen"
      >
        <span v-if="icon" class="img-accordion text-primary" :class="icon" />
        <img
          v-if="imageUrl"
          width="30"
          height="30"
          class="img-accordion"
          :src="imageUrl"
          :alt="title"
        />
        <span class="flex-grow-1">{{ title }}</span>
        <span :class="isOpen ? 'saooti-up' : 'saooti-down'" />
      </button>
      <div v-show="isOpen" class="body p-2">
        <slot />
      </div>
    </template>
    <slot v-else />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "ClassicAccordion",
  props: {
    title: { default: "", type: String },
    idComposer: { default: "", type: String },
    icon: { default: undefined, type: String },
    imageUrl: { default: undefined, type: String },
    displayAccordion: { default: true, type: Boolean },
    initOpen: { default: false, type: Boolean },
  },
  emits: ["open"],
  data() {
    return {
      isOpen: false as boolean,
    };
  },
  watch: {
    isOpen() {
      this.$emit("open");
    },
  },
  created(){
    this.isOpen= this.initOpen;
  }
});
</script>
<style lang="scss">
@import "@scss/_variables.scss";
.octopus-accordion {
  > button {
    background: white;
    min-height: 50px;
    color: $octopus-primary-color;
    font-size:0.9rem;
    border: 1px solid transparent;
    border-bottom-color: #b8b8b8;
    font-weight: bold;
    &:hover {
      border-bottom-color: #535353;
    }
  }
  &.octopus-accordion-open {
    border-radius: $octopus-borderradius;
    border: 1px solid #e0e0e0;
    > button {
      border-radius: $octopus-borderradius 0 0;
      background: #e9e9e9;
      border-color: transparent;
      color: black;
    }
  }
  .img-accordion {
    width: 30px;
    height: 30px;
    margin-right: 1rem;
    font-size: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>

<template>
  <div
    class="my-4"
    :class="[
      displayAccordion ? 'octopus-accordion' : '',
      isOpen ? 'octopus-accordion-open border' : '',
    ]"
  >
    <template v-if="displayAccordion">
      <button
        :id="'accordion-' + idComposer"
        class="w-100 py-2 text-start d-flex flex-nowrap align-items-center"
        @click="isOpen = !isOpen"
      >
        <AlertIcon v-if="isWarning" class="text-danger" />
        <img
          v-if="imageUrl"
          width="30"
          height="30"
          class="img-accordion"
          :src="imageUrl"
          aria-hidden="true"
          alt=""
        />
        <span>{{ title }}</span>
        <slot name="afterTitle"/>
        <ChevronDownIcon class="ms-auto" :class="{ 'arrow-transform': isOpen }" />
      </button>
      <div v-show="isOpen" class="body p-2">
        <slot />
      </div>
    </template>
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
import ChevronDownIcon from "vue-material-design-icons/ChevronDown.vue";
import { defineAsyncComponent, onMounted, ref, watch } from "vue";
const AlertIcon = defineAsyncComponent(
  () => import("vue-material-design-icons/Alert.vue"),
);

//Props
const props = defineProps({
  title: { default: "", type: String },
  idComposer: { default: "", type: String },
  isWarning: { default: false, type: Boolean },
  imageUrl: { default: undefined, type: String },
  displayAccordion: { default: true, type: Boolean },
  initOpen: { default: false, type: Boolean },
});

//Emits
const emit = defineEmits(["open"]);

//Data
const isOpen = ref(false);

//Watch
watch(isOpen, () => emit("open"));

onMounted(()=>{
  isOpen.value = props.initOpen;
})

</script>
<style lang="scss">


.octopus-accordion {
  > button {
    min-height: 50px;
    color: var(--octopus-primary);
    font-size: 0.9rem;
    border: 1px solid transparent;
    border-bottom-color: var(--octopus-secondary-darker);
    font-weight: bold;

    &:hover {
      border-bottom-color: var(--octopus-color-text);
    }
  }

  &:not(.octopus-accordion-open) > button {
    background: transparent;
  }

  .body {
    background: var(--octopus-background);
  }

  &.octopus-accordion-open {
    border-radius: var(--octopus-border-radius);

    > button {
      border-radius: var(--octopus-border-radius) 0 0;
      background: var(--octopus-border-default);
      border-color: transparent;
      color: var(--octopus-color-text);
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

<template>
  <div
    :id="idModal"
    class="octopus-modal octopus-modal-in-body"
    :class="onlyHeader ? 'octopus-only-header-modal' : ''"
  >
    <div class="octopus-modal-backdrop" />
    <div class="octopus-modal-dialog">
      <div class="octopus-modal-content">
        <div class="octopus-modal-header">
          <h5 cclass="octopus-modal-title">
            {{ titleModal }}
          </h5>
          <div class="d-flex align-items-center">
            <button
              v-if="canBeReduced"
              class="btn-transparent text-light"
              :title="onlyHeader ? t('Enlarge') : t('Reduce')"
              @click="onlyHeader = !onlyHeader"
            >
              <ChevronDownIcon :class="{ 'arrow-transform': !onlyHeader }" />
            </button>
            <button
              v-if="closable"
              :ref="closable ? 'focusElement' : ''"
              type="button"
              class="btn-transparent text-light"
              :title="t('Close')"
              @click="closePopup"
            >
              <WindowCloseIcon />
            </button>
          </div>
        </div>
        <div v-show="!onlyHeader" class="octopus-modal-body">
          <slot name="body" />
        </div>
        <div v-show="!onlyHeader" class="octopus-modal-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChevronDownIcon from "vue-material-design-icons/ChevronDown.vue";
import WindowCloseIcon from "vue-material-design-icons/WindowClose.vue";
import { onMounted, ref, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";

//Props 
defineProps({
  idModal: { default: undefined, type: String },
  titleModal: { default: undefined, type: String },
  closable: { default: true, type: Boolean },
  canBeReduced: { default: false, type: Boolean },
})

//Emits
const emit = defineEmits(["close"]);

//Data 
const onlyHeader = ref(false);
const focusElementRef = useTemplateRef('focusElement');

//Composables
const { t } = useI18n();

onMounted(()=>{
  (focusElementRef?.value as HTMLElement)?.focus();
})

//Methods
function closePopup(): void {
  emit("close");
}

</script>
<style lang="scss">
.octopus-app .octopus-modal.octopus-modal-in-body{
  position: fixed;
  top: 0;
  left: 0;
  display: block;
  z-index: 1400;
  width: 100%;
  height: 100%;
  overflow: hidden auto;
  outline: 0;

  .octopus-modal-backdrop {
    opacity: 0.5;
    z-index: 0;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: black;
  }

  &.octopus-only-header-modal .octopus-modal-backdrop {
    opacity: 0.1;
  }

  .octopus-modal-dialog {
    position: relative;
    pointer-events: none;
    margin: 1.75rem auto;
    max-width: 80vw;
    max-height: 90dvh;
    width: 100%;
    display: flex;
    color: var(--octopus-color-text) !important;

    @media (width <= 500px) {
      width: 95%;
    }
  }

  .octopus-modal-body {
    flex: 1 1 auto;
    padding: 1rem;
    overflow-x: auto;

    .scroller-vertical {
      min-height: 200px;
      height: 200px;
    }
  }

  .octopus-modal-header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    border: 0;
    border-radius: var(--octopus-border-radius) var(--octopus-border-radius) 0 0;
    background: var(--octopus-primary);
    color: white;
    padding: 1rem;
  }

  .octopus-modal-content {
    display: flex;
    flex-direction: column;
    pointer-events: auto;
    width: 100%;
    background-color: white;
    background-clip: padding-box;
    border: 0;
    outline: 0;
    height: auto !important;
    max-height: initial !important;
    border-radius: var(--octopus-border-radius);
    box-shadow: 0 0.2rem 0.5rem var(--octopus-shadow);
  }

  &:not(.octopus-only-header-modal) .octopus-modal-dialog,
  &:not(.octopus-only-header-modal) .octopus-modal-content {
    min-height: 300px;
  }


  .octopus-modal-footer {
    display: flex;
    flex-shrink: 0;
    border: 0;
    flex-wrap: initial;
    align-items: center;
    justify-content: flex-end;
    padding: 1rem;

    button {
      margin: 0.1rem;
    }
  }
}
</style>
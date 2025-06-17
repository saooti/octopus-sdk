<template>
  <dialog
    :id="idModal"
    ref="modal"
    class="octopus-modal octopus-modal-top-layer"
    :class="onlyHeader ? 'octopus-only-header-modal' : ''"
  >
    <div class="octopus-modal-header">
      <h5 class="octopus-modal-title">
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
          autofocus
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
  </dialog>
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
const modalRef = useTemplateRef('modal');


//Composables
const { t } = useI18n();


onMounted(()=>{
  const dialog = modalRef?.value as HTMLDialogElement;
  dialog.showModal();
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    emit("close");
  });
})

//Methods
function closePopup(): void {
  emit("close");
}
</script>
<style lang="scss">

.octopus-app .octopus-modal.octopus-modal-top-layer{
  &::backdrop {
    opacity: 0.5;
    background-color: black;
  }

  &.octopus-only-header-modal::backdrop{
    opacity: 0.1;
  }

  display: flex;
  flex-direction: column;
  padding: 0;
  border: 0;
  border-radius: var(--octopus-border-radius);
  box-shadow: 0 0.2rem 0.5rem var(--octopus-shadow);
  color: var(--octopus-color-text) !important;
  margin-top: 2rem;
  width: 80vw;
  max-height: 90dvh;
  overflow: hidden;

  @media (width <= 500px) {
    width: 95vw;
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
    border-radius: var(--octopus-border-radius)
      var(--octopus-border-radius) 0 0;
    background: var(--octopus-primary);
    color: white;
    padding: 1rem;
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

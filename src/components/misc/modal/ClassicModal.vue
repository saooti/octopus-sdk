<template>
  <div
    :id="idModal"
    class="octopus-modal"
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
              :class="onlyHeader ? 'saooti-down' : 'saooti-up'"
              :title="onlyHeader ? $t('Enlarge') : $t('Reduce')"
              @click="onlyHeader = !onlyHeader"
            />
            <button
              v-if="closable"
              :ref="closable ? 'focusElement' : ''"
              type="button"
              class="btn-transparent text-light saooti-remove"
              :title="$t('Close')"
              @click="$emit('close')"
            />
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

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "ClassicModal",
  props: {
    idModal: { default: undefined, type: String },
    titleModal: { default: undefined, type: String },
    closable: { default: true, type: Boolean },
    canBeReduced: { default: false, type: Boolean },
  },
  emits: ["close"],
  data() {
    return {
      onlyHeader: false as boolean,
    };
  },
  mounted() {
    (this.$refs.focusElement as HTMLElement)?.focus();
  },
});
</script>
<style lang="scss">
@import "@scss/_variables.scss";
.octopus-app {
  .octopus-modal {
    position: fixed;
    top: 0;
    left: 0;
    display: block;
    z-index: 1055;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    outline: 0;
  }
  .octopus-modal-backdrop {
    opacity: 0.5;
    z-index: 0;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: black;
  }
  .octopus-modal.octopus-only-header-modal .octopus-modal-backdrop {
    opacity: 0.1;
  }

  .octopus-modal-dialog {
    position: relative;
    pointer-events: none;
    margin: 1.75rem auto;
    max-width: 800px;
    max-height: 90vh;
    width: 100%;
    display: flex;
    color: #353535 !important;
    @media (max-width: 500px) {
      width: 95%;
      margin: 2.5% !important;
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
    border-radius: $octopus-borderradius $octopus-borderradius 0 0;
    background: $octopus-primary-color;
    color: white;
    padding: 1rem;
  }

  .octopus-modal:not(.octopus-only-header-modal) .octopus-modal-dialog,
  .octopus-modal:not(.octopus-only-header-modal) .octopus-modal-content {
    min-height: 300px;
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
    border-radius: $octopus-borderradius;
    box-shadow: 0 0.2rem 0.5rem rgba(40, 40, 40, 0.3);
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

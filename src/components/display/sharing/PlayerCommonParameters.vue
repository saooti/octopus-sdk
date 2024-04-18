<template>
  <ClassicCheckbox
    :text-init="insertCode"
    id-checkbox="insert-code-checkbox"
    :label="$t('Insert custom code')"
    @update:text-init="$emit('update:insertCode', $event)"
  />
</template>

<script lang="ts">
import ClassicCheckbox from "../../form/ClassicCheckbox.vue";
import { defineComponent } from "vue";
export default defineComponent({
  components: {
    ClassicCheckbox,
  },
  props: {
    insertCode: { default: false, type: Boolean },
  },
  emits: ["update:insertCode"],
});
</script>

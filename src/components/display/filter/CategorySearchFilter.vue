<template>
  <div class="d-flex mt-3 align-items-center">
    <ClassicCheckbox
      v-model:text-init="isCategory"
      class="flex-shrink-0 me-2"
      id-checkbox="search-category-checkbox"
      :label="$t('By category')"
    />
    <CategoryChooser
      :category-selected="iabIdIntern"
      width="100%"
      :defaultanswer="$t('No category filter')"
      @update:category-selected="updateIabId"
    />
  </div>
</template>

<script lang="ts">
import ClassicCheckbox from "../../form/ClassicCheckbox.vue";
import CategoryChooser from "../categories/CategoryChooser.vue";
import { defineComponent } from "vue";
export default defineComponent({
  components: {
    CategoryChooser,
    ClassicCheckbox,
  },
  props: {
    iabId: { default: undefined, type: Number },
  },
  emits: ["update:iabId"],
  data() {
    return {
      isCategory: false as boolean,
      iabIdIntern: 0 as number,
    };
  },
  watch: {
    iabId: {
      immediate: true,
      handler() {
        this.isCategory = undefined !== this.iabId;
        if (this.iabId && this.iabId !== this.iabIdIntern) {
          this.iabIdIntern = this.iabId;
        }
      },
    },
    isCategory(): void {
      const value = this.isCategory ? this.iabIdIntern : undefined;
      if (value !== this.iabId) {
        this.$emit("update:iabId", value);
      }
    },
  },

  methods: {
    updateIabId(iabId: number) {
      this.iabIdIntern = iabId;
      if (this.isCategory) {
        this.$emit("update:iabId", this.iabIdIntern);
      } else {
        this.isCategory = true;
      }
    },
  },
});
</script>

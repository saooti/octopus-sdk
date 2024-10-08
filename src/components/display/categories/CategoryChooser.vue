<template>
  <ClassicMultiselect
    :id="idClassicMultiselect"
    ref="selectCategory"
    :option-chosen="model"
    option-label="name"
    :label="$t('By category')"
    :placeholder="$t('Type string to filter by categories')"
    :max-element="maxElement"
    :in-modal="inModal"
    :multiple="multiple"
    :min-search-length="1"
    :width="width"
    :is-disabled="isDisabled"
    :no-deselect="noDeselect"
    @on-search="onSearchCategory"
    @selected="onCategorySelected"
  />
</template>

<script lang="ts">
import { useGeneralStore } from "../../../stores/GeneralStore";
import { mapState } from "pinia";
import ClassicMultiselect from "../../form/ClassicMultiselect.vue";
import { Category } from "@/stores/class/general/category";
import { defineComponent } from "vue";
export default defineComponent({
  components: {
    ClassicMultiselect,
  },
  props: {
    defaultanswer: { default: "", type: String },
    width: { default: "100%", type: String },
    multiple: { default: false, type: Boolean },
    isDisabled: { default: false, type: Boolean },
    initCategories: {
      default: undefined,
      type: Array as () => Array<Category>,
    },
    displayAllCategories: { default: false, type: Boolean },
    categorySelected: { default: undefined, type: Number },
    categorySelectedArray: {
      default: undefined,
      type: Array as () => Array<number>,
    },
    inModal: { default: false, type: Boolean },
    noDeselect: { default: true, type: Boolean },
  },
  emits: [
    "update:categorySelected",
    "update:categorySelectedArray",
    "selected",
  ],
  data() {
    return {
      maxElement: 50 as number,
      category: undefined as Category | undefined,
      categoryForArray: [] as Array<Category> | undefined,
    };
  },

  computed: {
    ...mapState(useGeneralStore, ["storedCategories"]),
    categoriesChosen(): Array<Category> {
      if (this.initCategories) {
        return this.initCategories;
      }
      return this.storedCategories;
    },
    categoriesOrdered(): Array<Category> {
      let allCategoriesOrdered = [...this.categoriesChosen].sort(
        (a: Category, b: Category) => (a.name > b.name ? 1 : -1),
      );
      if (!this.displayAllCategories) {
        allCategoriesOrdered = allCategoriesOrdered.filter((c: Category) => {
          return c.podcastCount;
        });
      }
      if (this.getDefaultCategory) {
        allCategoriesOrdered.unshift(this.getDefaultCategory);
      }
      return allCategoriesOrdered;
    },
    getDefaultCategory(): Category | undefined {
      if ("" === this.defaultanswer) {
        return undefined;
      }
      return { id: 0, name: this.defaultanswer };
    },
    idClassicMultiselect(): string {
      if (this.multiple) return "categoryChooser" + this.multiple;
      return "categoryChooser";
    },

    model: {
      get(): Category | Array<Category> | undefined {
        return this.multiple ? this.categoryForArray : this.category;
      },
      set(value: Category | Array<Category> | undefined): void {
        if (!this.multiple) {
          this.category = value as Category | undefined;
          return;
        }
        this.categoryForArray = value as Array<Category> | undefined;
      },
    },
  },
  watch: {
    categorySelected: {
      immediate: true,
      handler() {
        if (this.categorySelected) {
          this.initCategorySelected();
        } else {
          this.category = this.getDefaultCategory;
        }
      },
    },
  },

  mounted() {
    this.initCategoryArray();
  },
  methods: {
    async onSearchCategory(query?: string): Promise<void> {
      let categories = this.categoriesOrdered;
      if (query) {
        categories = categories.filter((item: Category) => {
          return item.name.toUpperCase().includes(query.toUpperCase());
        });
      }
      (
        this.$refs.selectCategory as InstanceType<typeof ClassicMultiselect>
      ).afterSearch(categories, categories.length);
    },
    onCategorySelected(category: Category | Array<Category>): void {
      if (undefined !== this.categorySelected) {
        this.$emit("update:categorySelected", (category as Category).id);
      } else if (undefined !== this.categorySelectedArray) {
        const idsArray: Array<number> = [];
        (category as Array<Category>).forEach((el: Category) => {
          idsArray.push(el.id);
        });
        this.$emit("update:categorySelectedArray", idsArray);
      } else {
        this.$emit("selected", category);
      }
    },
    initCategorySelected(): void {
      this.category =
        this.categoriesChosen.find((el: Category) => {
          return el.id === this.categorySelected;
        }) ?? this.getDefaultCategory;
    },
    initCategoryArray(): void {
      if (!this.categoryForArray || !this.categorySelectedArray) {
        return;
      }
      this.categoryForArray.length = 0;
      this.categorySelectedArray.forEach((element: number) => {
        const item = this.categoriesChosen.find((el: Category) => {
          return el.id === element;
        });
        if (this.categoryForArray && item) {
          this.categoryForArray.push(item);
        }
      });
    },
  },
});
</script>

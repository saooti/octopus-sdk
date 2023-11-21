<template>
  <div
    v-if="categories.length"
    class="d-inline-flex w-100 mb-3 ps-3 pe-3 category-list"
  >
    <div ref="categoryListContainer" class="category-list-container">
      <button
        v-for="category in categories"
        :ref="'category' + category.id"
        :key="category.id"
        class="btn btn-primary btn-on-dark m-1"
        @click="checkIfFilter(category)"
      >
        {{ category.name }}
      </button>
    </div>
    <button
      v-show="hidenCategories.length"
      id="categories-dropdown"
      class="btn btn-primary btn-on-dark m-1 saooti-more"
      :title="$t('See more')"
    />
    <ClassicPopover
      target="categories-dropdown"
      :only-click="true"
      :is-fixed="true"
      :left-pos="true"
    >
      <button
        v-for="category in hidenCategories"
        :key="category.id"
        class="me-3 octopus-dropdown-item"
        @mousedown="checkIfFilter(category)"
      >
        {{ category.name }}
      </button>
    </ClassicPopover>
  </div>
</template>

<script lang="ts">
import octopusApi from "@saooti/octopus-api";
import { state } from "../../../stores/ParamSdkStore";
import ClassicPopover from "../../misc/ClassicPopover.vue";
import { Category } from "@/stores/class/general/category";
import { useFilterStore } from "@/stores/FilterStore";
import { useGeneralStore } from "@/stores/GeneralStore";
import { mapState, mapActions } from "pinia";
import { defineComponent } from "vue";
export default defineComponent({
  name: "CategoryList",
  components: {
    ClassicPopover,
  },

  props: {
    isFilter: { default: false, type: Boolean },
    isDisplay: { default: false, type: Boolean },
  },
  emits: ["categoriesLength"],

  data() {
    return {
      hidenCategories: [] as Array<Category>,
    };
  },

  computed: {
    ...mapState(useGeneralStore, ["storedCategories", "storedCategoriesOrga"]),
    ...mapState(useFilterStore, ["filterOrgaId"]),
    isPodcastmaker(): boolean {
      return state.generalParameters.podcastmaker as boolean;
    },
    categories(): Array<Category> {
      let arrayCategories: Array<Category> = [];
      if (this.filterOrgaId) {
        arrayCategories = this.storedCategoriesOrga.filter((c: Category) => {
          return c.podcastOrganisationCount;
        });
      } else {
        arrayCategories = this.storedCategories.filter((c: Category) => {
          if (this.isPodcastmaker) return c.podcastOrganisationCount;
          return c.podcastCount;
        });
      }
      this.$emit("categoriesLength", arrayCategories.length);
      return arrayCategories;
    },
    watchVariable(): string {
      return `${this.isDisplay}|${this.categories}`;
    },
    reloadVariable(): string {
      return `${this.filterOrgaId}|${this.storedCategories}`;
    },
  },
  watch: {
    watchVariable: {
      deep: true,
      immediate: true,
      handler() {
        this.$nextTick(() => {
          this.resizeWindow();
        });
      },
    },
    reloadVariable: {
      deep: true,
      immediate: true,
      handler() {
        if (this.filterOrgaId) {
          this.fetchCategories(this.filterOrgaId);
        }
      },
    },
  },
  mounted() {
    window.addEventListener("resize", this.resizeWindow);
  },
  beforeUnmount(): void {
    window.removeEventListener("resize", this.resizeWindow);
  },

  methods: {
    ...mapActions(useFilterStore, ["filterUpdateIab"]),
    ...mapActions(useGeneralStore, ["storedUpdateCategoriesOrga"]),
    checkIfFilter(category: Category): void {
      if (!this.isFilter) {
        this.$router.push({
          name: "category",
          params: { iabId: category.id.toString() },
          query: { productor: this.filterOrgaId },
        });
        return;
      }
      const queries = this.$route.query;
      if (
        !queries.iabId ||
        ("string" === typeof queries.iabId &&
          parseInt(queries.iabId, 10) !== category.id)
      ) {
        this.$router.replace({
          query: { ...queries, ...{ iabId: category.id.toString() } },
        });
      }
      this.filterUpdateIab(category);
    },
    resizeWindow(): void {
      const categoryList = this.$refs.categoryListContainer as HTMLElement;
      if (null === categoryList || !categoryList) {
        return;
      }
      categoryList.style.justifyContent = "flex-start";
      this.hidenCategories.length = 0;
      this.categories.forEach((element: Category) => {
        const el = (
          this.$refs["category" + element.id] as Array<HTMLElement>
        )[0];
        if (!el) return;
        if (el.classList.contains("hid")) {
          el.classList.remove("hid");
        }
      });
      this.categories.forEach((element: Category) => {
        const el = (
          this.$refs["category" + element.id] as Array<HTMLElement>
        )[0];
        if (!el) return;
        const parent = el.parentElement;
        if (
          parent &&
          el.offsetLeft + el.clientWidth <= parent.clientWidth - 20
        ) {
          return;
        }
        this.hidenCategories.push(element);
        if (!el.classList.contains("hid")) {
          el.className += " hid";
        }
      });
      if (!this.hidenCategories.length) {
        categoryList.style.justifyContent = "center";
      }
    },
    async fetchCategories(organisationId: string): Promise<void> {
      const data = await octopusApi.fetchDataWithParams<Array<Category>>(
        0,
        `iab/list/${organisationId}`,
        {
          lang: this.$i18n.locale,
        },
      );
      this.storedUpdateCategoriesOrga(data);
    },
  },
});
</script>
<style lang="scss">
@import "@scss/_variables.scss";
.octopus-app {
  .category-list-container {
    display: inline-flex;
    justify-content: flex-start;
    overflow: hidden;
    flex-grow: 1;
    width: 0;
  }
}
</style>

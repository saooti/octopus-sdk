<template>
  <ClassicMultiselect
    :id="idClassicMultiselect"
    ref="selectRubrique"
    :option-chosen="model"
    option-label="name"
    :label="$t('By rubric')"
    :placeholder="$t('Type string to filter by categories')"
    :max-element="maxElement"
    :multiple="multiple"
    :min-search-length="1"
    :width="width"
    :in-modal="inModal"
    :is-disabled="isDisabled"
    :no-deselect="noDeselect"
    @on-search="onSearchRubrique"
    @selected="onRubriqueSelected"
  />
</template>

<script lang="ts">
import selenium from "../../mixins/selenium";
import { Rubrique } from "@/stores/class/rubrique/rubrique";
import ClassicMultiselect from "../../form/ClassicMultiselect.vue";
import { defineComponent } from "vue";
export default defineComponent({
  components: {
    ClassicMultiselect,
  },
  mixins: [selenium],
  props: {
    defaultanswer: { default: "", type: String },
    width: { default: "100%", type: String },
    multiple: { default: false, type: Boolean },
    reset: { default: false, type: Boolean },
    allRubriques: { default: () => [], type: Array as () => Array<Rubrique> },
    rubriqueSelected: { default: undefined, type: Number },
    rubriqueSelectedArray: {
      default: undefined,
      type: Object as () => Array<number>,
    },
    rubriquageId: { default: undefined, type: Number },
    withoutRubrique: { default: false, type: Boolean },
    isDisabled: { default: false, type: Boolean },
    noDeselect: { default: true, type: Boolean },
    inModal: { default: false, type: Boolean },
  },
  emits: [
    "update:rubriqueSelected",
    "update:rubriqueSelectedArray",
    "selected",
  ],

  data() {
    return {
      maxElement: 250 as number,
      rubrique: undefined as Rubrique | undefined,
      rubriqueForArray: [] as Array<Rubrique> | undefined,
      withoutItem: { name: this.$t("Without rubric"), rubriqueId: -1 } as {
        name: string;
        rubriqueId: number;
      },
    };
  },
  computed: {
    idClassicMultiselect(): string {
      return this.rubriquageId
        ? "rubriqueChooser" + this.rubriquageId
        : "rubriqueChooser";
    },
    getDefaultRubrique(): Rubrique | undefined {
      if ("" === this.defaultanswer) {
        return undefined;
      }
      return { name: this.defaultanswer, rubriqueId: 0 };
    },
    rubriques(): Array<Rubrique> {
      let rubriques = this.allRubriques;
      if (!this.getDefaultRubrique) {
        return rubriques;
      }
      if (this.withoutRubrique) {
        rubriques.unshift(this.withoutItem);
      }
      rubriques.unshift(this.getDefaultRubrique);

      return rubriques;
    },
    model: {
      get(): Rubrique | Array<Rubrique> | undefined {
        return !this.multiple ? this.rubrique : this.rubriqueForArray;
      },
      set(value: Rubrique | Array<Rubrique> | undefined): void {
        if (!this.multiple) {
          this.rubrique = value as Rubrique | undefined;
          return;
        }
        this.rubriqueForArray = value as Array<Rubrique>;
      },
    },
  },
  watch: {
    rubriqueSelected: {
      immediate: true,
      handler() {
        if (this.rubriqueSelected) {
          this.initRubriqueSelected();
        } else {
          this.rubrique = this.getDefaultRubrique;
        }
      },
    },
    reset(): void {
      this.rubrique = this.getDefaultRubrique;
    },
  },
  mounted() {
    this.initRubriqueArray();
  },
  methods: {
    onSearchRubrique(query: string): void {
      let rubriques = this.rubriques;
      if (query) {
        rubriques = rubriques.filter((item: Rubrique) => {
          return item.name.toUpperCase().includes(query.toUpperCase());
        });
      }
      (
        this.$refs.selectRubrique as InstanceType<typeof ClassicMultiselect>
      ).afterSearch(rubriques, rubriques.length);
    },
    onRubriqueSelected(rubrique: Rubrique | Array<Rubrique>): void {
      if (undefined !== this.rubriqueSelected) {
        this.$emit(
          "update:rubriqueSelected",
          (rubrique as Rubrique).rubriqueId,
        );
      } else if (undefined !== this.rubriqueSelectedArray) {
        const idsArray: Array<number> = [];
        (rubrique as Array<Rubrique>).forEach((el: Rubrique) => {
          idsArray.push(el.rubriqueId ?? 0);
        });
        this.$emit("update:rubriqueSelectedArray", idsArray);
      } else {
        this.$emit("selected", rubrique);
      }
    },
    initRubriqueSelected(): void {
      this.rubrique =
        this.rubriques.find((el: Rubrique) => {
          return el.rubriqueId === this.rubriqueSelected;
        }) ?? this.getDefaultRubrique;
    },

    initRubriqueArray(): void {
      if (!this.rubriqueForArray || !this.rubriqueSelectedArray) {
        return;
      }
      this.rubriqueForArray.length = 0;
      this.rubriqueSelectedArray.forEach((element: number) => {
        const item = this.rubriques.find((el: Rubrique) => {
          return el.rubriqueId === element;
        });
        if (this.rubriqueForArray && item) {
          this.rubriqueForArray.push(item);
        }
      });
    },
  },
});
</script>

<template>
  <div class="d-flex align-items-center mb-2">
    <ClassicSelect
      :text-init="rubriquageIdSelected"
      id-select="rubrique-choice-select"
      :label="$t('Topics')"
      :display-label="false"
      class="flex-shrink-0"
      :options="rubriquageDisplayForSelect"
      @update:text-init="onRubriquageSelected(parseInt($event, 10))"
    />
    <template v-if="rubriquageIdSelected">
      <div class="ms-3 flex-shrink-0">
        {{ $t("By rubric") }}
      </div>
      <RubriqueChooser
        v-if="getRubriquesLength(rubriquageIdSelected)"
        :id="'rubrique-chooser'+rubriquageIdSelected"
        class="ms-2"
        :multiple="false"
        :rubrique-selected="
          0 !== rubriqueIdSelected ? rubriqueIdSelected : undefined
        "
        :all-rubriques="getRubriques(rubriquageIdSelected)"
        :defaultanswer="$t('No rubric filter')"
        :reset="reset"
        :without-rubrique="true"
        @selected="onRubriqueSelected"
      />
    </template>
    <button
      v-if="index"
      class="btn admin-button ms-1"
      title="delete"
      @click="deleteRubriquage"
    >
      <TrashCanIcon />
    </button>
  </div>
</template>

<script lang="ts">
import ClassicSelect from "../../form/ClassicSelect.vue";
import TrashCanIcon from "vue-material-design-icons/TrashCan.vue";
import { Rubriquage } from "@/stores/class/rubrique/rubriquage";
import { Rubrique } from "@/stores/class/rubrique/rubrique";
import { defineComponent, defineAsyncComponent } from "vue";
const RubriqueChooser = defineAsyncComponent(
  () => import("../rubriques/RubriqueChooser.vue"),
);
export default defineComponent({
  components: {
    RubriqueChooser,
    TrashCanIcon,
    ClassicSelect
  },
  props: {
    rubriquageDisplay: {
      default: () => [],
      type: Array as () => Array<Rubriquage>,
    },
    rubriquageIdSelected: { default: 0, type: Number },
    rubriqueIdSelected: { default: 0, type: Number },
    index: { default: 0, type: Number },
  },
  emits: ["deleteRubriqueChoice", "updateRubrique", "updateRubriquage"],

  data() {
    return {
      reset: false as boolean,
    };
  },
  computed:{
    rubriquageDisplayForSelect(){
      return this.rubriquageDisplay.map((rubriquage) => {
        return { title: rubriquage.title, value: rubriquage.rubriquageId };
      });
    }
  },


  methods: {
    deleteRubriquage() {
      this.$emit("deleteRubriqueChoice");
    },
    getRubriquesLength(rubriquageId: number): number {
      return this.getRubriques(rubriquageId).length;
    },
    getRubriques(rubriquageId: number): Array<Rubrique> {
      const topicIndex = this.rubriquageDisplay.findIndex(
        (element: Rubriquage) => element.rubriquageId === rubriquageId,
      );
      return -1 !== topicIndex
        ? this.rubriquageDisplay[topicIndex].rubriques
        : [];
    },
    onRubriqueSelected(rubrique: Rubrique): void {
      if (rubrique.rubriqueId === this.rubriqueIdSelected) return;
      this.$emit("updateRubrique", {
        rubriqueId: rubrique.rubriqueId,
        index: this.index,
      });
    },
    onRubriquageSelected(newRubriquage: number): void {
      this.reset = !this.reset;
      this.$emit("updateRubriquage", {
        rubriquageId: newRubriquage,
        rubriqueId:0,
        index: this.index,
      });
    },
  },
});
</script>

<template>
  <section class="page-box">
    <template v-if="0 === rubriquageFilter.length">
      <ClassicLazy
        v-for="(c, index) in categories"
        :key="c.id"
        :min-height="0"
        :init-render-delay="2 < index ? 1000 : 0"
      >
        <PodcastInlineList
          style="min-height: 650px"
          :iab-id="c.id"
          :title="c.name"
          :button-text="$t('All podcast button', { name: c.name })"
        />
        <template #preview>
          <div style="min-height: 650px"></div>
        </template>
      </ClassicLazy>
    </template>
    <template v-else>
      <ClassicLazy
        v-for="(r, index) in rubriqueToShow"
        :key="r.rubriqueId"
        :min-height="0"
        :init-render-delay="2 < index ? 1000 : 0"
      >
        <PodcastInlineList
          style="min-height: 650px"
          :rubrique-id="rubriqueId.concat(r.rubriqueId)"
          :title="r.name"
          :href="rubriqueMorePath? rubriqueMorePath+r.rubriqueId: undefined"
          :button-text="$t('All podcast button', { name: r.name })"
        />
        <template #preview>
          <div style="min-height: 650px"></div>
        </template>
      </ClassicLazy>
      <template v-if="rubriqueDisplay && rubriqueDisplay.length > 0">
        <router-link
          v-if="rubriqueDisplay.length >= rubriqueMaxDisplay"
          :to="{
            name: 'podcasts',
            query: {
              iabId: filterIab?.id,
              rubriquesId: rubriqueQueryParam,
            },
          }"
          class="btn btn-primary align-self-center width-fit-content mt-5 m-auto"
        >
          {{ $t("See more") }}
        </router-link>
        <PodcastInlineList
          v-else-if="displayWithoutRubriques"
          :no-rubriquage-id="[rubriqueDisplay[0].rubriquageId]"
          :rubrique-id="rubriqueId"
          :title="$t('Without rubric')"
          :button-text="
            $t('All podcast button', { name: $t('Without rubric') })
          "
        />
      </template>
    </template>
  </section>
</template>

<script lang="ts">
import { rubriquesFilterComputed } from "../mixins/routeParam/rubriquesFilterComputed";
import PodcastInlineList from "../display/podcasts/PodcastInlineList.vue";
import ClassicLazy from "../misc/ClassicLazy.vue";
import { state } from "../../stores/ParamSdkStore";
import { Rubriquage } from "@/stores/class/rubrique/rubriquage";
import { Rubrique } from "@/stores/class/rubrique/rubrique";
import { useFilterStore } from "../../stores/FilterStore";
import { useGeneralStore } from "../../stores/GeneralStore";
import { mapState } from "pinia";
import { defineComponent } from "vue";
import { Category } from "@/stores/class/general/category";
export default defineComponent({
  name: "HomePage",
  components: {
    PodcastInlineList,
    ClassicLazy,
  },
  mixins: [rubriquesFilterComputed],
  props: {
    displayWithoutRubriques: { default: true, type: Boolean },
    rubriqueMorePath: { default: undefined, type: String },
  },
  emits: ["categoriesLength"],
  data() {
    return {
      rubriqueId: [] as Array<number>,
      rubriqueMaxDisplay: 20 as number,
    };
  },
  computed: {
    ...mapState(useGeneralStore, ["storedCategories", "storedCategoriesOrga"]),
    ...mapState(useFilterStore, [
      "filterRubriquage",
      "filterOrgaId",
      "filterRubrique",
      "filterRubriqueDisplay",
      "filterIab",
    ]),
    rubriqueDisplay(): Array<Rubrique> {
      return this.filterRubriqueDisplay.filter(
        (rubrique: Rubrique) => 0 !== rubrique.podcastCount,
      );
    },
    rubriqueToShow(): Array<Rubrique> {
      if (
        !this.rubriqueDisplay ||
        this.rubriqueDisplay.length < this.rubriqueMaxDisplay
      ) {
        return this.rubriqueDisplay ?? [];
      }
      return this.rubriqueDisplay.slice(0, this.rubriqueMaxDisplay);
    },
    rubriquageFilter(): Array<Rubriquage> {
      return this.filterOrgaId ? this.filterRubriquage : [];
    },
    categories(): Array<Category> {
      let arrayCategories: Array<Category> = [];
      if (this.filterIab) {
        return [this.filterIab];
      }
      if (this.filterOrgaId) {
        arrayCategories = this.storedCategoriesOrga.filter((c: Category) => {
          return c.podcastOrganisationCount;
        });
      } else {
        arrayCategories = this.storedCategories.filter((c: Category) => {
          if (state.generalParameters.podcastmaker)
            return c.podcastOrganisationCount;
          return c.podcastCount;
        });
      }
      this.$emit("categoriesLength", arrayCategories.length);
      return arrayCategories;
    },
  },
  watch: {
    filterRubrique: {
      deep: true,
      immediate: true,
      handler() {
        this.updateRubriquageFilter();
      },
    },
  },
  methods: {
    updateRubriquageFilter() {
      const length = this.filterRubrique.length;
      const rubriqueId: Array<number> = [];
      for (let index = 0; index < length; index++) {
        if (0 < this.filterRubrique[index].rubriqueId) {
          rubriqueId.push(this.filterRubrique[index].rubriqueId);
        }
      }
      this.rubriqueId = rubriqueId;
    },
  },
});
</script>

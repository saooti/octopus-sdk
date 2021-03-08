<template>
  <div class="default-multiselect-width" :style="{ width: width }">
    <label :for="id" class="d-inline" aria-label="select rubrique"></label>
    <Multiselect
      v-model="rubrique"
      :id="id"
      :disabled="isDisabled"
      class="rubriqueChooser"
      label="name"
      track-by="rubriqueId"
      :placeholder="$t('Type string to filter by rubrics')"
      ref="multiselectRef"
      :options="rubriques"
      :multiple="multiple"
      :searchable="true"
      :loading="isLoading"
      :internal-search="false"
      :clear-on-select="false"
      :close-on-select="true"
      :options-limit="200"
      :max-height="600"
      :show-no-results="true"
      :hide-selected="true"
      :show-labels="false"
      @open="clearAll"
      @search-change="onSearchRubrique"
      @close="onClose"
      @select="onRubriqueSelected"
    >
      <template v-slot:singleLabel="props" >
        <div class="multiselect-octopus-proposition">
          <span class="option__title">
            {{ props.option.name }}
          </span>
        </div>
      </template>
      <template v-slot:option="props" >
        <div
          class="multiselect-octopus-proposition"
          :class="props.option.rubriqueId <= 0 ? 'primary-dark' : ''"
          :data-selenium="'rubric-chooser-' + seleniumFormat(props.option.name)"
        >
          <span class="option__title">{{ props.option.name }}</span>
        </div>
      </template>
      <template v-slot:noOptions>{{ $t('List is empty') }}</template>
      <template v-slot:noResult>
      <span>
        {{ $t('No elements found. Consider changing the search query.') }}
      </span></template>
      <template v-slot:caret>
      <span
        class="saooti-arrow_down octopus-arrow-down octopus-arrow-down-top"
      ></span></template>
    </Multiselect>
  </div>
</template>

<style lang="scss"></style>
<script>
import { selenium } from '../../mixins/functions';
import Multiselect from 'vue-multiselect';

const getDefaultRubrique = defaultName => {
  if (undefined !== defaultName) return { name: defaultName, rubriqueId: 0 };
  return '';
};

export default {
  components: {
    Multiselect,
  },

  props: {
    width: { default: '100%' },
    defaultanswer: { default: undefined },
    rubriqueSelected: { default: undefined },
    multiple: { default: false },
    rubriqueArray: { default: undefined },
    rubriquageId: { default: undefined },
    allRubriques: { default: [] },
    reset: { default: false },
    withoutRubrique: { default: false },
    isDisabled: { default: false },
  },
  mixins: [selenium],

  data() {
    return {
      rubriques: [],
      rubrique: getDefaultRubrique(this.defaultanswer),
      isLoading: false,
      withoutItem: { name: this.$t('Without rubric'), rubriqueId: -1 },
    };
  },

  mounted() {
    if (undefined !== this.rubriqueSelected) {
      this.initRubriqueSelected(this.rubriqueSelected);
    }
    if (undefined !== this.rubriqueArray) {
      this.initRubriqueArray(this.rubriqueArray);
    }
  },
  computed: {
    id() {
      if (this.rubriquageId) return 'rubriqueChooser' + this.rubriquageId;
      return 'rubriqueChooser';
    },
  },

  methods: {
    clearAll() {
      this.$refs.multiselectRef.$refs.search.setAttribute(
        'autocomplete',
        'off'
      );
      if (undefined === this.rubriqueArray) {
        this.rubrique = '';
      }
      if (undefined === this.defaultanswer) {
        this.rubriques = this.allRubriques;
        return;
      }
      if (this.withoutRubrique) {
        this.rubriques = [
          getDefaultRubrique(this.defaultanswer),
          this.withoutItem,
        ].concat(this.allRubriques);
      } else {
        this.rubriques = [getDefaultRubrique(this.defaultanswer)].concat(
          this.allRubriques
        );
      }
    },

    onClose() {
      if (this.rubrique || undefined !== this.rubriqueArray) return;
      if (undefined !== this.defaultanswer) {
        this.rubrique = getDefaultRubrique(this.defaultanswer);
      } else {
        this.rubrique = '';
      }
      this.onRubriqueSelected(this.rubrique);
    },

    onSearchRubrique(query) {
      this.isLoading = true;
      let list;
      if (undefined !== this.defaultanswer) {
        if (this.withoutRubrique) {
          list = [
            getDefaultRubrique(this.defaultanswer),
            this.withoutItem,
          ].concat(this.allRubriques);
        } else {
          list = [getDefaultRubrique(this.defaultanswer)].concat(
            this.allRubriques
          );
        }
      } else {
        list = this.allRubriques;
      }
      this.rubriques = list.filter(item => {
        return item.name.toUpperCase().includes(query.toUpperCase());
      });
      this.isLoading = false;
    },

    onRubriqueSelected(rubrique) {
      if (undefined !== this.rubriqueSelected) {
        this.$emit('update:rubrique', rubrique.rubriqueId);
      } else if (undefined === this.rubriqueArray) {
        this.$emit('selected', rubrique);
      }
    },
    initRubriqueSelected(val) {
      this.rubrique = this.allRubriques.find(el => {
        return el.rubriqueId === val;
      });
    },
    initRubriqueArray(val) {
      this.rubrique.length = 0;
      val.forEach(element => {
        let item = this.allRubriques.find(el => {
          return el.rubriqueId === element;
        });
        this.rubrique.push(item);
      });
    },
  },
  watch: {
    rubriqueSelected(newVal) {
      this.initRubriqueSelected(newVal);
    },
    rubrique(newVal) {
      if (undefined === this.rubriqueArray) return;

      let idsArray = [];
      newVal.forEach(el => {
        idsArray.push(el.rubriqueId);
      });
      this.$emit('selected', idsArray);
    },
    reset() {
      this.rubrique = getDefaultRubrique(this.defaultanswer);
    },
  },
};
</script>

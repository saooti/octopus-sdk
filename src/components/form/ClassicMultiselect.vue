<template>
  <div 
    class="default-multiselect-width"
    :class="{'multiselect-in-modal' : inModal,
             'multiselect-no-deselect': noDeselect}"
    :style="{ width: width }"
  >
    <label
      :for="id"
      :title="label"
    />
    <vSelect
      :id="id"
      v-model="optionSelected"
      :label="optionLabel"
      :append-to-body="inModal"
      :multiple="multiple"
      :options="options"
      :disabled="isDisabled"
      :loading="isLoading"
      :placeholder="placeholder"
      @open="onSearch"
      @search="onSearch"
      @option:selected="onOptionSelected"
    >
      <template
        v-if="optionCustomTemplating"
        #option="option"
      >
        <slot
          name="optionTemplating"
          :option="option"
        />
      </template>
      <template
        v-if="optionCustomTemplating"
        #selected-option="option"
      >
        <slot
          name="optionTemplating"
          :option="option"
        />
      </template>
      <template #no-options="{ searching }">
        <span v-if="searching">{{ $t('No elements found. Consider changing the search query.') }}</span>
        <span v-else>{{ $t('List is empty') }}</span>
      </template>
      <template #list-footer>
        <li
          v-if="remainingElements"
          class="vs__dropdown-option"
        >
          {{
            $t('Count more elements matched your query, please make a more specific search.',{ count: remainingElements })
          }}
        </li>
      </template>
    </vSelect>
  </div>
</template>

<script lang="ts">
import vSelect from "vue-select";
  export default {
    components: {
      vSelect,
    },
    props: {
      id:{default: '', type: String},
      label:{default: '', type: String},
      placeholder:{default: '', type: String},
      optionLabel:{default: '', type: String},
      inModal:{default: false, type: Boolean},
      multiple:{default: false, type: Boolean},
      isDisabled:{default: false, type: Boolean},
      width: { default: '100%', type: String },
      maxElement: { default: 50, type: Number },
      minSearchLength: { default: 3, type: Number },
      optionChosen: { default: undefined, type: Object as ()=>unknown},
      noDeselect:{default: false, type: Boolean},
      optionCustomTemplating:{default: false, type: Boolean},
    },

    emits: ['onSearch','selected'],

    data() {
      return {
        optionSelected: undefined as unknown|undefined,
        options: [] as Array<unknown>,
        remainingElements: 0 as number,
        isLoading: false as boolean,
      };
    },

    watch: {
      optionChosen: {
        deep: true,
        immediate:true,
        handler(){
          this.optionSelected = this.optionChosen;
        }
      }
    },
    
    methods:{
      onSearch(search: string): void{
        if(search && search.length < this.minSearchLength){return;}
        this.isLoading = true;
        this.$emit('onSearch', search);
      },
      afterSearch(optionsFetched: Array<unknown>, count: number):void{
        this.options = optionsFetched;
        this.remainingElements = Math.max(0, count - this.maxElement);
        this.isLoading = false;
      },
      onOptionSelected(optionSelected: unknown):void{
        this.$emit('selected', optionSelected);
      }
    }
  }
</script>
<style lang="scss">
@import "vue-select/dist/vue-select.css";
.octopus-app{
  --vs-border-radius: 0.2rem;
  --vs-dropdown-option--active-bg: #ddd;
  --vs-dropdown-option--active-color: black;
  .default-multiselect-width {
    width: 100%;
    font-size: 1rem;
  }
  .vs__dropdown-option{
    white-space: initial;
  }
  .vs__search:focus{
    min-width: 150px;
  }
  .multiselect-in-modal .vs__dropdown-menu{
    z-index: 9999;
  }
  .multiselect-no-deselect .vs__clear{
    display: none;
  }
  .multiselect-transparent{
    --vs-border-color: transparent;
  }
  .multiselect-white{
    --vs-selected-color: white;
    --vs-dropdown-bg: black;
    .vs__actions path{
      fill: white;
    }
  }
}
</style>
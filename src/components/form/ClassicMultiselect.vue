<template>
  <div 
    :class="{'multiselect-in-modal' : inModal,
             'multiselect-no-deselect': noDeselect}"
    :style="{ width: width }"
  >
    <label
      :class="displayLabel? '':'d-none'"
      :for="id"
      class="form-label"
    >{{ label }}</label>
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
      :selectable="()=>!maxOptionsSelected"
      @open="onSearch"
      @search="onSearch"
      @option:selected="onOptionSelected"
      @option:deselected="onOptionDeselect"
    >
      <template
        v-if="optionCustomTemplating.length"
        #option="option"
      >
        <slot
          :name="optionCustomTemplating"
          :option="option"
        />
      </template>
      <template
        v-if="optionSelectedCustomTemplating.length"
        #selected-option="option"
      >
        <slot
          :name="optionSelectedCustomTemplating"
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
      <template #list-header>
        <li
          v-if="maxOptionsSelected"
          class="vs__dropdown-option"
        >
          {{
            $t('Multiselect max options', {max:maxOptions})
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
      noDeselect:{default: true, type: Boolean},
      optionCustomTemplating:{default: "", type: String},
      optionSelectedCustomTemplating:{default: "", type: String},
      displayLabel:{default: false, type: Boolean},
      maxOptions: { default: null, type: Number },
      allowEmpty: { default: true, type: Boolean },
    },

    emits: ['onSearch','selected'],

    data() {
      return {
        optionSelected: undefined as unknown|undefined,
        options: [] as Array<unknown>,
        remainingElements: 0 as number,
        isLoading: false as boolean,
        nbOptionsSelected: 0 as number,
      };
    },
    computed:{
      maxOptionsSelected(): boolean{
        if(this.maxOptions !== null && this.multiple){
          return (this.optionSelected as Array<unknown>).length >= this.maxOptions;
        }
        return false;
      }
    },

    watch: {
      optionChosen: {
        deep: true,
        immediate:true,
        handler(){
          this.optionSelected = this.optionChosen;
        }
      },
      optionSelected: {
        deep: true,
        handler(){
          if(this.noDeselect || null!==this.optionSelected){ return; }
          this.$emit('selected', undefined);
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
      },
      onOptionDeselect(event: unknown):void{
        if(!this.multiple){ return; }
        if(!this.allowEmpty && 1>=(this.optionSelected as Array<unknown>).length){
          (this.optionSelected as Array<unknown>).push(event);
          return;
        }
        this.$emit('selected', this.optionSelected);
      }
    }
  }
</script>
<style lang="scss">
@import "vue-select/dist/vue-select.css";
:root{
  --vs-dropdown-z-index:1060;
  --vs-border-radius: 0.2rem;
  --vs-dropdown-option--active-bg: #ddd;
  --vs-dropdown-option--active-color: black;
  --vs-font-size:0.8rem;
  --vs-border-width: 2px;
  --vs-border-color: #dee2e6;
}
.octopus-app{
  .vs__dropdown-option{
    white-space: initial;
  }
  .vs__search:focus{
    min-width: 150px;
  }
  .multiselect-no-deselect .vs__clear{
    display: none;
  }
  .multiselect-transparent{
    --vs-border-color: transparent;
  }
  .multiselect-white{
    --vs-selected-color: white;
    --vs-selected-bg: transparent;
    --vs-dropdown-bg: black;
    --vs-controls-color:white;
    .vs__actions path{
      fill: white;
    }
  }
}
</style>
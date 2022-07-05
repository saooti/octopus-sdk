<template>
  <div
    :id="id"
    class="d-flex flex-column align-items-center"
  >
    <ClassicLoading
      :loading-text="loadingText"
      :error-text="errorText"
    />
    <template v-if="!loading">
      <div class="paginate-section mb-2 page-box">
        <div class="text-secondary">
          <template v-if="textCount && (windowWidth > 1300 || windowWidth<=960)">
            {{ textCount }}
          </template>
        </div>
        <Paginate 
          v-if="!isPhone"
          :first="first"
          :rows-per-page="rowsPerPage"
          :total-count="totalCount"
          :range-size="rangeSize"
          @update:first="changeFirst"
          @update:rowsPerPage="changeSize"
        />
      </div>
    </template>
    <slot name="list" />
    <button
      v-show="((first+rowsPerPage) < totalCount) && isPhone"
      :disabled="loading"
      class="btn"
      :class="buttonPlus ? 'btn-primary align-self-center width-fit-content m-4' : 'btn-more'"
      :title="$t('See more')"
      @click="fetchMore"
    >
      <template v-if="buttonPlus">
        {{ $t('See more') }}
      </template>
      <div
        :class="buttonPlus?'ms-1':''"
        class="saooti-more"
      />
    </button>
  </div>
</template>

<script lang="ts">
import domHelper from '../../../helper/dom';
import ClassicLoading from '../../form/ClassicLoading.vue';
import { state } from '../../../store/paramStore';
import Paginate from './Paginate.vue';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'ListPaginate',
  components: {
    Paginate,
    ClassicLoading
  },
  props: {
    first: { default: 0, type: Number},
    rowsPerPage: { default: 30, type: Number},
    totalCount: { default: 0, type: Number},
    textCount: { default: undefined, type: String},
    id: {default: '', type: String},
    loadingText:{ default: undefined, type: String},
    errorText:{ default: undefined, type: String},
    loading: { default: false, type:Boolean},
    isMobile: { default: false, type: Boolean}
  },

  emits: ['update:first', 'update:rowsPerPage', 'update:isMobile'],
  data() {
    return {
      windowWidth: window.innerWidth as number,
		};
  },
  computed:{
    buttonPlus(): boolean {
      return (state.generalParameters.buttonPlus as boolean);
    },
    isPhone(){
      return 960 >= this.windowWidth;
    },
    rangeSize(){
      if(this.windowWidth > 1600){
        return 3;
      }else if(this.windowWidth > 1530){
        return 2;
      }
      return 1;
    },
  },
  watch:{
    isPhone:{
      immediate:true,
      handler(){
        this.$emit('update:isMobile', this.isPhone);
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize);
    })
  },
  beforeUnmount() { 
    window.removeEventListener('resize', this.onResize); 
  },
  methods:{
    onResize() {
      this.windowWidth = window.innerWidth;
    },
    fetchMore(){
      this.$emit('update:first', this.first + this.rowsPerPage);
    },
    changeFirst(firstValue: number){
      this.scrollToTop();
      this.$emit('update:first', firstValue);
    },
    changeSize(sizeValue: number){
      this.scrollToTop();
      this.$emit('update:rowsPerPage', sizeValue)
    },
    scrollToTop(){
      const element = document.getElementById(this.id);
      if(!element || element.getBoundingClientRect().top > 0){return;}
      const y = element.getBoundingClientRect().top + window.pageYOffset - domHelper.convertRemToPixels(3.5);
      window.scrollTo({top: y, behavior: 'smooth'});
    }
	}
})
</script>
<style lang="scss">
.octopus-app .page-box.paginate-section{
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 99vw;
  position: sticky;
  top: 3.5rem;
  z-index: 9;
  padding-bottom: 1rem;
  padding-top: 1rem;
  @media (max-width: 960px) {
    position: initial;
    justify-content:center;
  }
}
</style>
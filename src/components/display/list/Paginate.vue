<template>
  <div
    v-if="totalCount > 0"
    class="paginate"
  >
    <div class="d-flex align-items-center justify-content-center">
      <label for="rows-per-page-select">{{ $t('Items per page :') }}</label>
      <select
        id="rows-per-page-select"
        v-model="rowsPerPageIntern"
        class="c-hand p-1 mx-2"
      >
        <option
          v-for="option in optionsRowsPerPage"
          :key="option"
          :value="option"
        >
          {{ option }}
        </option>
      </select>
      <div class="mx-2">
        {{ $t('Showing items number', {page: (page+1), totalPage: totalPage}) }}
      </div>
      <div class="d-flex flex-nowrap">
        <button
          v-for="paginateButton in buttonsLeft"
          :key="paginateButton.title"
          class="btn"
          :title="paginateButton.title"
          :disabled="paginateButton.disabled"
          @click="paginateButton.action"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              :d="paginateButton.path"
            />
          </svg>
        </button>
        <div
          v-for="pageNumber in pagination"
          :key="pageNumber"
        >
          <span
            v-if="null === pageNumber"
            class="btn"
          >
            ...
          </span>
          <button
            v-else
            class="btn"
            :class="{ 'active': page === (pageNumber-1) }"
            @click="changeFirst((pageNumber-1)*rowsPerPageIntern)"
          >
            {{ pageNumber }}
          </button>
        </div>
        <button
          v-for="paginateButton in buttonsRight"
          :key="paginateButton.title"
          class="btn"
          :title="paginateButton.title"
          :disabled="paginateButton.disabled"
          @click="paginateButton.action"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              :d="paginateButton.path"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: "Paginate",
  components: {
  },
	props: {
    totalCount: { default: 0, type: Number },
    first: { default: 0, type: Number },
		rowsPerPage:{ default:0, type:Number},
    rangeSize:{default:1, type: Number}
  },
	emits:['update:first', 'update:rowsPerPage'],
  data() {
    return {
			rowsPerPageIntern: 30 as number,
			optionsRowsPerPage: [5, 10, 15, 20, 25 , 30, 50] as Array<number>,
		};
  },
	computed:{
    buttonsLeft(){
      return [{
        title: this.$t('Go to first page'), disabled: 0===this.first, action: ()=>{this.changeFirst(0)}, path:"M11.854 3.646a.5.5 0 0 1 0 .708L8.207 8l3.647 3.646a.5.5 0 0 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 0 1 .708 0zM4.5 1a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 1 0v-13a.5.5 0 0 0-.5-.5z"},
        {title: this.$t('Go to previous page'), disabled: 0===this.first, action: ()=>{this.changeFirst(this.first - this.rowsPerPage)}, path:"M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"},]
    },
    buttonsRight(){
      return [
        {title: this.$t('Go to next page'), disabled: this.lastFirst===this.first, action: ()=>{this.changeFirst(this.first + this.rowsPerPage)}, path:"M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"},
        {title: this.$t('Go to last page'), disabled: this.lastFirst===this.first, action: ()=>{this.changeFirst(this.lastFirst)}, path:"M4.146 3.646a.5.5 0 0 0 0 .708L7.793 8l-3.647 3.646a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708 0zM11.5 1a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-1 0v-13a.5.5 0 0 1 .5-.5z"}]
    },
    page(){
      return Math.floor(this.first/this.rowsPerPage);
    },
    totalPage(){
      return Math.ceil(this.totalCount/this.rowsPerPage);
    },
    pagination(): (number | null)[] {
      if(-1===this.rangeSize){return[];}
      const res = [];
      const minPaginationElems = 5 + this.rangeSize * 2;
      let rangeStart = this.totalPage <= minPaginationElems ? 1 : (this.page + 1) - this.rangeSize;
      let rangeEnd =this.totalPage <= minPaginationElems ? this.totalPage : (this.page + 1)+ this.rangeSize;
      rangeEnd = rangeEnd > this.totalPage ? this.totalPage : rangeEnd;
      rangeStart = rangeStart < 1 ? 1 : rangeStart;
      if (this.totalPage > minPaginationElems) {
        const isStartBoundaryReached = rangeStart - 1 < 3;
        const isEndBoundaryReached = this.totalPage - rangeEnd < 3;
        if (isStartBoundaryReached) {
          rangeEnd = minPaginationElems - 2;
          for (let i = 1; i < rangeStart; i++) {
            res.push(i);
          }
        } else {
          res.push(1);
          res.push(null);
        }
        if (isEndBoundaryReached) {
          rangeStart = this.totalPage - (minPaginationElems - 3);
          for (let i = rangeStart; i <= this.totalPage; i++) {
            res.push(i);
          }
        } else {
          for (let i = rangeStart; i <= rangeEnd; i++) {
            res.push(i);
          }
          res.push(null);
          res.push(this.totalPage);
        }
      } else {
        for (let i = rangeStart; i <= rangeEnd; i++) {
          res.push(i);
        }
      }
      return res;
    },
		lastFirst(): number{
			return (this.totalPage-1)*this.rowsPerPage;
		}
	},
	watch: {
    rowsPerPageIntern(){
			if(this.rowsPerPage !== this.rowsPerPageIntern){
				this.$emit('update:rowsPerPage', this.rowsPerPageIntern);
			}
		},
		rowsPerPage(){
			if(this.rowsPerPage !== this.rowsPerPageIntern){
				this.rowsPerPageIntern =this.rowsPerPage;
			}
		}
  },
	created(){
		this.initRowsPerPage();
	},
 
	methods:{
    initRowsPerPage(){
      if(!this.optionsRowsPerPage.includes(this.rowsPerPage)){
        this.optionsRowsPerPage.push(this.rowsPerPage);
        this.optionsRowsPerPage.sort((a,b)=>a-b);
      }
      this.rowsPerPageIntern = this.rowsPerPage;
    },
		changeFirst(newFirst: number){
			this.$emit('update:first', newFirst);
		},
	}
});
</script>
<style lang="scss">
@import '../../../sass/_variables.scss';
.octopus-app .paginate{
	display: flex;
	justify-content: flex-end;
	select{
		border-top: 0;
		border-right: 0;
		border-left: 0;
		background: transparent !important;
		outline-width: 0;
	}
  .btn{
    border-radius: 0;
    &.active{
      background: rgba($octopus-primary-color, 0.3) ;
    }
  }
}
</style>
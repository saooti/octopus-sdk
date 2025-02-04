<template>
  <div class="d-flex align-items-center flex-wrap">
    <span class="flex-shrink-0">{{ $t("Show") }}</span>
    <input
      id="number-input"
      v-model="internNumber"
      type="number"
      min="1"
      max="50"
      class="input-share-player border text-center m-2"
      :title="$t('Number of player podcasts')"
    />
    <span class="flex-shrink-0">{{ $t("Last podcasts") }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    episodesNumber: { default: 3, type: Number },
  },
  emits: [
    "updateNumber",
  ],

  data() {
    return {
      internNumber: 3 as number
    };
  },
  watch:{
    internNumber(){
      if (this.internNumber < 1) {
        this.$emit("updateNumber", 1);
      }else if(this.internNumber > 50){
        this.$emit("updateNumber", 50);
      }else{
        this.$emit("updateNumber", this.internNumber);
      }
    }
  },

  created(){
    this.internNumber = this.episodesNumber;
  }

});
</script>

<style lang="scss">
.octopus-app {
  .input-share-player {
    border-radius: 50px;
    width: 60px;
  }
}
</style>

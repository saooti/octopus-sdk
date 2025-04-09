<template>
  <div>
    <button
      :class="classBtn"
      @click="onCopyCode(afterCopy)"
    >
      {{ textDisplayed }}
    </button>
    <SnackBar 
      v-if="lazyLoadingSnackbar" 
      ref="snackbar" 
      position="bottom-left"
    />
  </div>
</template>

<script lang="ts">
import SnackBar from "../misc/SnackBar.vue";
import displayHelper from "../../helper/displayHelper";
import { defineComponent } from "vue";
export default defineComponent({
  name: "ClassicCopyButton",

  components: {
    SnackBar,
  },

  props: {
    text: { default: undefined, type: String },
    textAfterCopy: { default: undefined, type: String },
    dataToCopy: { default: undefined, type: String },
    snackbarText: { default: undefined, type: String },
    classBtn: { default: "btn btn-primary w-fit-content my-3", type: String },
  },
  data() {
    return {
      hasBeenCopied: false as boolean,
      lazyLoadingSnackbar: false as boolean,
    };
  },
  computed:{
    textDisplayed(){
      return this.hasBeenCopied ? this.textAfterCopy : this.text;
    }
  },
  methods: {
    onCopyCode(callback: () => void){
      displayHelper.onCopyCode(this.dataToCopy??"", callback);
    },
    afterCopy(): void {
      this.hasBeenCopied = true;
      if (!this.lazyLoadingSnackbar) {
        this.lazyLoadingSnackbar = true;
        setTimeout(() => {
          this.afterCopy();
        }, 500);
      } else {
        (this.$refs.snackbar as InstanceType<typeof SnackBar>).open(
          this.snackbarText ?? this.$t("Data in clipboard"),
        );
      }
    },
  },
});
</script>

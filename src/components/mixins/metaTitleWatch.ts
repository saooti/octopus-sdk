import { mapState } from "pinia";
import { defineComponent } from "vue";
import { useGeneralStore } from "../../stores/GeneralStore";
export default defineComponent({
  computed: {
    ...mapState(useGeneralStore, ["metaTitle"]),
  },
  watch: {
    $route: {
      immediate: true,
      async handler() {
        if(""!==this.$route.meta.title){
          document.title = this.$route.meta.title ? this.$t(this.$route.meta.title) +' - '+ this.metaTitle: this.metaTitle;
        }
      }
    },
  },
});

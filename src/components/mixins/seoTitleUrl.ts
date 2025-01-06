import { mapState } from 'pinia';
import { useGeneralStore } from '../../stores/GeneralStore';
import { defineComponent } from 'vue';
export const seoTitleUrl = defineComponent({
  computed:{
    ...mapState(useGeneralStore, ["metaTitle"]),
  },
  methods: {
    updatePathParams(text: string) {
      const seoText = this.stringUrlEncode(text);
      if(seoText !== this.$route.params.title){
        this.$router.replace({ params: { ...this.$route.params, ...{title:seoText}}, query: this.$route.query});
      }
      document.title = text + " - "+ this.metaTitle;
    },
    stringUrlEncode(text: string): string {
      if(!text.length){
        return "";
      }
      const withoutSpecialChar = text.replaceAll(
        /[!"`'#%&,:;<>=\-_@{}~$.()*+/\\?[\]^|]+/gm, ' ');
      const trimText = withoutSpecialChar.trim();
      return "-"+trimText.replaceAll(/\s+/gm, '-');
    },
  },
});
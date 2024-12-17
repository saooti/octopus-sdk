import { defineComponent } from 'vue';
export const seoTitleUrl = defineComponent({
  methods: {
    updatePathParams(text: string) {
      document.title = text;
      const seoText = this.stringUrlEncode(text);
      if(seoText !== this.$route.params.title){
        this.$router.replace({ params: { ...this.$route.params, ...{title:seoText}}, query: this.$route.query});
      }
    },
    stringUrlEncode(text: string): string {
      if(!text.length){
        return "";
      }
      const withoutSpecialChar = text.replaceAll(
        /[!"`'#%&,:;<>=\-_@{}~\$\.\(\)\*\+\/\\\?\[\]\^\|]+/gm, ' ');
      const trimText = withoutSpecialChar.trim();
      return "-"+trimText.replaceAll(/\s+/gm, '-');
    },
  },
});
import { mapState } from "pinia";
import { useApiStore } from "../../stores/ApiStore";
import { defineComponent } from "vue";
export default defineComponent({
  computed: {
    ...mapState(useApiStore, ["imageUrl"]),
  },
  methods: {
    proxyImageUrl(url: string|undefined, width: string, height?: string): string {
      if (!url) {
        return "";
      }
      if (this.imageUrl && url.includes("http")) {
        const size = height ? "height=" + height : "width=" + width;
        const encode = btoa(url).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        return (
          this.imageUrl +
          "image/" +
          encode +
          "?" +
          size +
          "&useWebp=true"
        );
      }
      return url;
    },
  },
});

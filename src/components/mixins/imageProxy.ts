import { state } from "../../stores/ParamSdkStore";
export default {
  methods: {
    proxyImageUrl(url: string|undefined, width: string, height?: string): string {
      if (!url) {
        return "";
      }
      if (state.octopusApi.imageUrl && url.includes("http")) {
        const size = height ? "height=" + height : "width=" + width;
        const encode = btoa(url).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        return (
          state.octopusApi.imageUrl +
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
};

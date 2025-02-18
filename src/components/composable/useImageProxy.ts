import { useApiStore } from "../../stores/ApiStore";
export const useImageProxy = ()=>{

  const apiStore = useApiStore();

  function useProxyImageUrl(url: string|undefined, width: string, height?: string): string {
    if (!url) {
      return "";
    }
    if (apiStore.imageUrl && url.includes("http")) {
      const size = height ? "height=" + height : "width=" + width;
      const encode = btoa(url).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      return (
        apiStore.imageUrl +
        "image/" +
        encode +
        "?" +
        size +
        "&useWebp=true"
      );
    }
    return url;
  }

	return {
    useProxyImageUrl
	}
}
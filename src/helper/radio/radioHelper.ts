import { MediaRadio } from "@/stores/class/general/player";

export default {
    displayTitle(metadata: MediaRadio): string {
        let title = "";
        if (metadata.title) {
          title += metadata.title;
        }
        if (metadata.artist) {
          title += " - " + metadata.artist;
        }
        return title;
      }
};
  
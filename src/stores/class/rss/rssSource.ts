import { Emission, emptyEmissionData } from "../general/emission";
import { Participant } from "../general/participant";

export interface RssSource {
  animators: Array<Participant>;
  email: string;
  emission: Emission;
  guests: Array<Participant>;
  saootiRssFeed: boolean;
  sourceId: number;
  synchroEnabled: string;
  urlFeed: string;
}
export function emptyRssSource(): RssSource {
  return {
    animators: [],
    email: "",
    emission: emptyEmissionData(),
    guests: [],
    saootiRssFeed: true,
    sourceId: -1,
    synchroEnabled: "SYNCHRONIZED",
    urlFeed: "",
  };
}

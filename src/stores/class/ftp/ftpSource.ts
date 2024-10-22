import { Emission, emptyEmissionData } from "../general/emission";
import { Participant } from "../general/participant";
import { emptyFtpParam, FtpParam } from "./ftpParam";

export interface TestFtpSource {
  validePodcast?: number;
  tooLong?: number;
  spoilPodcast?: number;
  names: { [key: string]: string };
}
export interface FtpData {
  firstMatchFtpFile?: RegExpMatchArray;
  files: Array<string>;
}

export interface FtpSource {
  animators: Array<Participant>;
  email: string;
  emission: Emission;
  ftpParameters: {
    directory: string;
    formatDate: string;
    formatDescription: string;
    formatTitre: string;
    importType: string;
    parsingDate: string;
    regexp: string;
    importedPublishDate?: string;
  };
  guests: Array<Participant>;
  organisationId: string;
  server: FtpParam;
  sourceId: number;
  synchroEnabled?: string;
  count?: TestFtpSource;
  tags: Array<string>;
  visibility: boolean;
  /* video:boolean; */
}
export function emptyFtpSource(): FtpSource {
  return {
    animators: [],
    email: "",
    emission: emptyEmissionData(),
    ftpParameters: {
      directory: "",
      formatDate: "",
      formatDescription: "",
      formatTitre: "",
      importType: "standard",
      parsingDate: "",
      regexp: "",
      importedPublishDate: "true",
    },
    guests: [],
    organisationId: "",
    server: emptyFtpParam(),
    sourceId: 0,
    synchroEnabled: "SYNCHRONIZED",
    count: {
      names: {},
      spoilPodcast: 0,
      tooLong: 0,
      validePodcast: 0,
    },
    tags: [],
    visibility: true,
    /* video:false, */
  };
}

export function emptyFtpData(): FtpData {
  return {
    files: [],
    firstMatchFtpFile: undefined,
  };
}

export interface FtpEmission {
  email: string;
  serverId: number | undefined;
  emissionId: number | undefined;
  regexp: string;
  directory: string;
  formatDescription: string;
  formatTitre: string;
  rubriqueIds: Array<number>;
  guests: Array<number>;
  formatDate: string;
  parsingDate: string;
  visibility: boolean;
  commentable: string;
  animators: Array<number>;
  tags: Array<string>;
  importType: string;
  validePodcast?: number;
  tooLong?: number;
  spoilPodcast?: number;
}
export function emptyFtpEmission(): FtpEmission {
  return {
    email: "",
    serverId: undefined,
    emissionId: undefined,
    regexp: "",
    directory: "",
    formatDescription: "",
    formatTitre: "",
    rubriqueIds: [],
    guests: [],
    formatDate: "",
    parsingDate: "",
    visibility: true,
    commentable: "INHERIT",
    animators: [],
    tags: [],
    importType: "standard",
  };
}

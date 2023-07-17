import { Podcast } from "./podcast";
export interface AudioView {
  audioStorageUrl: string;
  creationParam: Podcast;
  logs: Array<string>;
  sendSuccess: boolean;
  publisherId: string;
  creation: Date;
  creationPod: string;
  duration: number;
  id: number;
  immediate: boolean;
  localUrl: string;
  notifiedEmail: string;
  originalName: string;
  original: Int8Array;
  size: number;
  status: string;
  tags: { [key: string]: string };
  priority: string;
}

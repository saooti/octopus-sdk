export interface Conference {
  album?: string;
  artist?: string;
  conferenceId: number;
  conferenceUrlIdentifier?: string;
  date?: string;
  debriefingDate?: string;
  deletionAttempts?: number;
  directCode?: string;
  externalRtmpUrl?: ExternalRtmpUrl;
  hostname?: string;
  jingleDuration?: number;
  jingleFilePath?: string;
  jingleId?: number;
  mediaId?: number;
  maxEndOfDebriefing?: string;
  maxStopRecordDate?: string;
  organisationId?: string;
  participants?: Array<{
    conferenceGuestId: number;
    fullName: string;
    keycloakId: string;
    kind: string;
    sipIdentifier: string;
  }>;
  phone?: string;
  podcastId?: number;
  prefix?: { [key: string]: string };
  queueCode?: string;
  radioMapping?: {
    canalId: number;
    occurenceId: number;
  };
  recordDate?: string;
  recordingPort?: number;
  status?: string;
  title: string;
  token?: string;
  orderStatus?: number;
  websocket?: string;
  interval?: ReturnType<typeof setTimeout>;
  duration?: number;
  videoProfile?: string;
  videoLayout?: string;
}

export function getEmptyConference(): Conference {
  return {
    title: "",
    token: "",
    hostname: "",
    conferenceId: 0,
    status: "PLANNED",
    videoLayout: "overlaps",
  };
}
export interface ConferencePublicInfo {
  status: string;
  videoProfile: string;
}

export interface ExternalRtmpUrl {
  baseUrl: string | null;
  key: string | null;
}
export function getEmptyExternalRtmpUrl(): ExternalRtmpUrl {
  return {
    baseUrl: "",
    key: "",
  };
}

export interface IndividualizedStat {
  channelId: number;
  country: string;
  duration: number;
  id: number;
  lastUpdate: number;
  listenerId: string;
  organisationId: string;
  origin: string;
  referer: string;
  sessionId: string;
  start: number;
  userAgent: string;
}
export function emptyIndividualizedStat(): IndividualizedStat {
  return {
    channelId: 0,
    country: "",
    duration: 0,
    id: 0,
    lastUpdate: 0,
    listenerId: "",
    organisationId: "",
    origin: "",
    referer: "",
    sessionId: "",
    start: 0,
    userAgent: "",
  };
}

import { FetchParam } from "../general/fetchParam";
import dayjs from "dayjs";

export function defaultStatParams(orgaId: string): FetchParam {
  return {
    start: dayjs().subtract(10, "days").startOf("day").format(),
    end: dayjs().add(1, "days").startOf("day").format(),
    role: "PRODUCTEUR",
    emissionId: undefined,
    podcastId: undefined,
    includeNotValid: false,
    excludeAcpm: [],
    listening: ["PODCAST"],
    organisationId: [orgaId],
    browser: [],
    country: [],
    customInfo: [],
    notCustomInfo: [],
    device: [],
    distribution: [],
    notBrowser: [],
    notCountry: [],
    notDevice: [],
    notDistribution: [],
    notOrigin: [],
    notPlatform: [],
    notRefererhost: [],
    origin: [],
    platform: [],
    refererhost: [],
  };
}

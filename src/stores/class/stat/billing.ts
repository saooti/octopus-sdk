import dayjs from "dayjs";
export interface BillingReceivedFromApi {
  [key: string]: {
    stt?: BillingValue;
    tts?: BillingValue;
    download?: BillingValue;
    openAiIn?: BillingValue;
    openAiOut?: BillingValue;
  };
}
export interface Billing {
  date?: string;
  stt?: BillingValue;
  tts?: BillingValue;
  download?: BillingValue;
  openAiIn?: BillingValue;
  openAiOut?: BillingValue;
}
export interface BillingValue {
  consummation: number;
  price: number;
}

export interface BillingContract {
  contratTrancheViews: Array<BillingSlice>;
  service: string; // stt tts download
  orgaId: string;
  from: string;
  to: string | null;
}
export interface BillingSlice {
  aaffine: number;
  baffine: number;
  min: number;
  max: number;
  service: string; // stt tts download
  id?: number;
}

export function emptyBillingSlice(service?: string): BillingSlice {
  return {
    aaffine: 0,
    baffine: 0,
    min: 0,
    max: 0,
    service: service ?? "stt",
  };
}
export function emptyBillingContract(
  service: string,
  orgaId: string,
): BillingContract {
  return {
    contratTrancheViews: [],
    service: service,
    orgaId: orgaId,
    from: dayjs(0).toISOString(),
    to: null,
  };
}

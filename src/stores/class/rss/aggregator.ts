export interface Aggregator {
  aggregatorId: number;
  createdBy: string;
  image?: string;
  matchers: Array<Matcher>;
  name: string;
}
export interface Matcher {
  ip?: string;
  ipRange?: string;
  matchDisplayname?: boolean;
  matcherId?: number;
  uaRegexp?: string;
}
export interface RuleRss {
  ruleId: number;
  aggregatorIds: Array<number>;
  emissionId?: number;
  organisationId?: string;
  parameters: Array<ParamRss>;
}
export interface ParamRss {
  forbid: boolean;
  maxAge: string;
  maxItem: number;
  minAge: string;
  parameterId: number;
}

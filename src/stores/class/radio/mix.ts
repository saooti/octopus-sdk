export interface Mix {
  mixId?: number;
  color: string;
  description: string;
  name: string;
  organisationId: string;
  samplings: Array<MediaSampling>;
}

export interface MediaSampling {
  mediaSamplingId?: number;
  number: number;
  armb?: string;
  playlistId?: number;
  criterions: Array<Criterion>;
}

export interface Criterion {
  criterionId?: number;
  criterionValue?: string;
  criterionType?: string;
  mediaField?: string;
}

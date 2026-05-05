export interface Mix {
  mixId?: number;
  color: string;
  description: string;
  name: string;
  organisationId: string;
  samplings: Array<MediaSampling>;
  /** ID of the user that created this mix */
  ownerId?: string;
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

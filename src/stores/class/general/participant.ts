import { Organisation } from "./organisation";

export interface Participant {
  [x: string]: boolean;
  annotations?: { [key: string]: string | number | boolean | undefined };
  imageUrl?: string;
  description?: string;
  firstName: string;
  lastName: string;
  orga?: Organisation;
  participantId: number | undefined;
  score?: number;
  uid?: string;
}

export function emptyParticipantData(): Participant {
  return {
    firstName: "",
    lastName: "",
    participantId: 0,
  };
}

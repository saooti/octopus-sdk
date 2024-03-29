import { Organisation } from "./organisation";

export interface Participant {
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

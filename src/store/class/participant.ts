import { Organisation } from "./organisation";

export interface Participant{
  imageUrl: string;
  description: string;
  firstName: string;
  lastName: string;
  orga: Organisation;
  participantId: number;
  score?: number;
  uid: string;
}
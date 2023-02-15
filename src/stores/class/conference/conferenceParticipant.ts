import { Conference } from './conference';

export interface ConferenceParticipant {
  conference?: Conference;
  conferenceGuestId?: number;
  fullName: string;
  keycloakId?: string;
  kind?: string;
  sipIdentifier?: string;
  sipPassword?: string;
  muted?: boolean;
  talking?: boolean;
  memberId?: number;
  callerNumber?: string;
  callerName?: string;
  gain?: number;
  img?: string;
}

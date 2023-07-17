import { Conference } from "./conference";

export interface ConferenceMessage {
  conference?: Conference;
  date: string;
  message: string;
  messageId?: number;
  userId: string;
  username: string;
}

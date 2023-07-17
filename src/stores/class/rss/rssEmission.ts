export interface RssEmission {
  authorId: number;
  description: string | null;
  email: string;
  emissionId: number;
  forSaooti: boolean;
  guids: Array<string>;
  id: number;
  orgaId: string;
  title: string;
  urlFeed: string;
  userId: string;
  version: number;
}

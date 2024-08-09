export interface CommentPodcast {
  abuse: number;
  answerTo?: number;
  commentId: number;
  content: string;
  date: string;
  dislikes:number;
  likes:number;
  podcastId: number;
  poster:{
    userName: string;
  },
  responses:Array<number>;
  state: string; //VALIDATED,NOT_VALID,PENDING
}
export interface CommentCreate {
  answerTo?: number;
  content: string;
  name: string;
  podcastId: number;
  state: string;
  uuid:string;
}
export interface CommentFeelings{
  dislikesCount: number;
  feeling: string;
  likesCount:  number;
}

export function emptyComment(): CommentPodcast {
  return {
    abuse:0,
    likes:0,
    dislikes:0,
    date:"",
    commentId: -1,
    content: "",
    podcastId: 0,
    poster:{
      userName: "Fake",
    },
    responses: [],
    state: "VALIDATED"
  };
}



/* 
export interface CommentPodcast {
  comId?: number;
  content: string;
  name: string;
  organisationId?: string;
  userId?: string;
  podcastId?: number;
  commentIdReferer?: number;
  timeline?: number;
  status?: string;
  certified?: boolean;
  phase?: string;
  date?: string;
  relatedComments?: number;
  relatedValidComments?: number;
}
 */

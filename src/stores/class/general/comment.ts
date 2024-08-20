export interface CommentPodcast {
  abuse: number;
  answerTo?: number;
  commentId: number;
  content: string;
  date: string;
  dislikes:number;
  likes:number;
  podcastId: number;
  poster: {
    authenticated: boolean;
    userName: string;
    uuid: string; 
  };
  responses:Array<number>;
  state: string; //VALIDATED,NOT_VALID,PENDING,
  timeline?: number;
}
export interface CommentCreate {
  answerTo?: number;
  content: string;
  name: string;
  podcastId: number;
  state?: string;
  uuid:string;
  timeline?: number;
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
      authenticated: false,
      userName: "Fake",
      uuid:""
    },
    responses: [],
    state: "VALIDATED",
    timeline:0,
  };
}


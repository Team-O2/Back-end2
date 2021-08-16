import { commentDTO } from ".";

namespace challengeDTO {
  export interface postChallengeReqDTO {
    good: string;
    bad: string;
    learn: string;
    interest: string[];
    generation: number;
  }

  export interface postChallengeResDTO {
    id: number;
    good: string;
    bad: string;
    learn: string;
    interest: string[];
    generation: number;
    likeNum: number;
    scrapNum: number;
    isDeleted: Boolean;
    userID: number;
    nickname: string;
    img: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface getChallengeAllResDTO {
    id: number;
    generation: number;
    createdAt: Date;
    updatedAt: Date;
    userID: number;
    nickname: string;
    img: string;
    good: string;
    bad: string;
    learn: string;
    interest: string[];
    likeNum: number;
    scrapNum: number;
    commentNum: number;
    comment: commentDTO.IComment[];
    isLike?: Boolean;
    isScrap?: Boolean;
  }
}

export default challengeDTO;

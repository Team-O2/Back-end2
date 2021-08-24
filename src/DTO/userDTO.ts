import { DateDataType } from "sequelize/types";
import { commentDTO } from ".";

namespace userDTO {
  // 합치면 challengeDTO 및 concertDTO 에서 받아와서 써도 될 듯!
  // 일단 여기 써놓고 씁니다아
  export interface challengeResDTO {
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

  export interface challengeScrapResDTO {
    mypageChallengeScrap: challengeResDTO[];
    totalScrapNum: number;
  }

  export interface concertResDTO {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    userID: number;
    nickname: string;
    authorNickname: string;
    title: string;
    videoLink: string;
    img: string;
    imgThumbnail: string;
    text: string;
    interest: string[];
    hashtag: string[];
    isDeleted: Boolean;
    isNotice: Boolean;
    likeNum: number;
    scrapNum: number;
    commentNum: number;
    comment: commentDTO.IComment[];
    isLike?: Boolean;
    isScrap?: Boolean;
  }

  export interface concertScrapResDTO {
    mypageConcertScrap: concertResDTO[];
    totalScrapNum: number;
  }

  export interface commentResDTO {
    id: number;
    text: string;
    post: string;
    createdAt: Date;
  }

  export interface myCommentsResDTO {
    comments: commentResDTO[];
    commentNum: number;
  }

  export interface newPwReqDTO {
    password: string;
    newPassword: string;
  }

  export interface deleteCommentsReqDTO {
    commentID: number[];
  }

  export interface registerReqDTO {
    challengeNum: number;
  }

  export interface userInfoReqDTO {
    nickname: string;
    interest: string[];
    isMarketing: Boolean;
    img?: File;
  }

  export interface mypageInfoChallengeResDTO {
    percent: number;
    totalNum: number;
    completeNum: number;
    startDT: Date;
    endDT: Date;
    generation: number;
  }

  export interface mypageInfoConcertResDTO {
    id: number;
    title: string;
  }

  export interface mypageInfoBadgeResDTO {
    welcomeBadge: Boolean;
    firstJoinBadge: Boolean;
    firstWriteBadge: Boolean;
    oneCommentBadge: Boolean;
    fiveCommentBadge: Boolean;
    oneLikeBadge: Boolean;
    fiveLikeBadge: Boolean;
    loginBadge: Boolean;
    marketingBadge: Boolean;
    learnMySelfScrapBadge: Boolean;
    firstReplyBadge: Boolean;
    concertScrapBadge: Boolean;
    challengeBadge: number;
  }

  export interface mypageInfoResDTO {
    nickname: string;
    learnMyselfAchieve: mypageInfoChallengeResDTO | null;
    shareTogether: mypageInfoConcertResDTO[] | null;
    couponBook: mypageInfoBadgeResDTO;
  }

  export interface userInfoResDTO {
    interest: string[];
    isMarketing: Boolean;
    img: string;
    id: number;
    email: string;
    nickname: string;
  }

  export interface mypageConcertResDTO {}
}

export default userDTO;

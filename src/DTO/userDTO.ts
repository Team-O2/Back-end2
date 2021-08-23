import { DateDataType } from "sequelize/types";
import { commentDTO } from ".";

namespace userDTO {
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

  
  export interface IMypageUser {
    nickname: string;
    isAdmin: Boolean;
  }

  export interface IMyPageLearnMySelf {
    conditionNum: number;
    writingNum: number;
    challengeStartDT: Date;
    challengeEndDT: Date;
    generation: number;
  }

  export interface ILearnMySelfAchieve {
    percent: number;
    totalNum: number;
    completeNum: number;
    startDT: Date;
    endDT: Date;
    generation: number;
  }

  export interface IShareTogether {
    id: number;
    title: string;
  }

  export interface ICouponBook {
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

  export interface IBadge {
    id: number;
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
    learnMyselfAchieve: ILearnMySelfAchieve | null;
    shareTogether: IShareTogether[] | null;
    couponBook: ICouponBook;
  }



  export interface userInfoResDTO {
    interest: string[];
    isMarketing: Boolean;
    img: string;
    id: number;
    email: string;
    nickname: string;
  }
  
  
  export interface mypageConcertResDTO {

  }
}

export default userDTO;


// import mongoose, { Document } from "mongoose";
// import { IComment } from "../interfaces/IComment";
// import { IUser } from "../interfaces/IUser";
// import { IConcert } from "../interfaces/IConcert";
// import { IChallenge } from "../interfaces/IChallenge";
// import { IChallengeDTO } from "./challengeDTO";
// import { IConcertDTO } from "./concertDTO";

// export interface userHeaderDTO {
//   _id?: mongoose.Schema.Types.ObjectId;
//   nickname?: string;
//   img?: string;
// }

// export interface registerReqDTO {
//   challengeCNT: number;
// }

// export interface ILearnMySelfAchieve {
//   percent: number;
//   totalNum: number;
//   completeNum: number;
//   startDT: Date;
//   endDT: Date;
//   generation: Number;
// }

// export interface IShareTogether {
//   _id: mongoose.Schema.Types.ObjectId;
//   title: string;
// }

// export interface ICouponBook {
//   welcomeBadge: Boolean;
//   firstJoinBadge: Boolean;
//   firstWriteBadge: Boolean;
//   oneCommentBadge: Boolean;
//   fiveCommentBadge: Boolean;
//   oneLikeBadge: Boolean;
//   fiveLikeBadge: Boolean;
//   loginBadge: Boolean;
//   marketingBadge: Boolean;
//   learnMySelfScrapBadge: Boolean;
//   firstReplyBadge: Boolean;
//   concertScrapBadge: Boolean;
//   challengeBadge: Number;
// }

// export interface mypageInfoResDTO {
//   nickname?: string;
//   learnMyselfAchieve: ILearnMySelfAchieve | null;
//   shareTogether: IShareTogether[] | null;
//   couponBook: ICouponBook;
// }
// export interface userInfoResDTO {
//   interest: string[];
//   marpolicy: Boolean;
//   img?: string;
//   _id: mongoose.Schema.Types.ObjectId;
//   email: string;
//   nickname?: string;
// }

// export interface userInfoReqDTO {
//   interest: string;
//   marpolicy: string;
//   img?: File;
//   nickname?: string;
// }

// export interface concertScrapResDTO {
//   mypageConcertScrap: IConcertDTO[];
//   totalScrapNum: number;
// }

// export interface challengeScrapResDTO {
//   mypageChallengeScrap: IChallengeDTO[];
//   totalScrapNum: number;
// }

// export interface myWritingsResDTO {
//   mypageChallengeScrap: (IChallenge &
//     Document<IUser, mongoose.Schema.Types.ObjectId> &
//     Document<IComment, mongoose.Schema.Types.ObjectId>)[];
//   totalScrapNum: number;
// }

// export interface myCommentsResDTO {
//   comments: IComment[];
//   commentNum: number;
// }

// export interface delMyCommentReqDTO {
//   userID: { id: mongoose.Schema.Types.ObjectId };
//   commentID: mongoose.Schema.Types.ObjectId[];

// export interface newPwReqDTO {
//   password: string;
//   newPassword: string;
//   userID: { id: mongoose.Schema.Types.ObjectId };
// }

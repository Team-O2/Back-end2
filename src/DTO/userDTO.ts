import mongoose, { Document } from "mongoose";
import { IComment } from "../interfaces/IComment";
import { IUser } from "../interfaces/IUser";
import { IConcert } from "../interfaces/IConcert";
import { IChallenge } from "../interfaces/IChallenge";
import { IChallengeDTO } from "./challengeDTO";
import { IConcertDTO } from "./concertDTO";

export interface userHeaderDTO {
  _id?: mongoose.Schema.Types.ObjectId;
  nickname?: string;
  img?: string;
}

export interface registerReqDTO {
  challengeCNT: number;
}

export interface ILearnMySelfAchieve {
  percent: number;
  totalNum: number;
  completeNum: number;
  startDT: Date;
  endDT: Date;
  generation: Number;
}

export interface IShareTogether {
  _id: mongoose.Schema.Types.ObjectId;
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
  challengeBadge: Number;
}

export interface mypageInfoResDTO {
  nickname?: string;
  learnMyselfAchieve: ILearnMySelfAchieve | null;
  shareTogether: IShareTogether[] | null;
  couponBook: ICouponBook;
}

export interface concertScrapResDTO {
  mypageConcertScrap: IConcertDTO[];
  totalScrapNum: number;
}

export interface challengeScrapResDTO {
  mypageChallengeScrap: IChallengeDTO[];
  totalScrapNum: number;
}

export interface myWritingsResDTO {
  mypageChallengeScrap: (IChallenge &
    Document<IUser, mongoose.Schema.Types.ObjectId> &
    Document<IComment, mongoose.Schema.Types.ObjectId>)[];
  totalScrapNum: number;
}

export interface myCommentsResDTO {
  comments: IComment[];
  commentNum: number;
}

export interface delMyCommentReqDTO {
  userID: { id: mongoose.Schema.Types.ObjectId };
  commentID: mongoose.Schema.Types.ObjectId[];
}

export interface userInfoResDTO {
  interest: string[];
  marpolicy: Boolean;
  img?: string;
  _id: mongoose.Schema.Types.ObjectId;
  email: string;
  nickname?: string;
  gender: number;
}

export interface userInfoReqDTO {
  interest: string;
  marpolicy: string;
  img?: File;
  nickname?: string;
  gender: string;
}

export interface newPwReqDTO {
  password: string;
  newPassword: string;
  userID: { id: mongoose.Schema.Types.ObjectId };
}

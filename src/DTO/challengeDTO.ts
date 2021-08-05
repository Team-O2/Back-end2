import mongoose from "mongoose";
import { userHeaderDTO } from "./userDTO";

export interface IChallengeDTO {
  _id?: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  user: userHeaderDTO;
  good: string;
  learn: string;
  bad: string;
  likes: number | Number;
  commentNum: number | Number;
  scrapNum: number | Number;
  generation: number | Number;
  interest: string[];
  isDeleted?: Boolean;
  comments?: typeof mongoose.Schema.Types.ObjectId[];
  isLike?: boolean;
  isScrap?: boolean;
}

export interface challengeWriteReqDTO {
  good: string;
  bad: string;
  learn: string;
  interest: string[];
}

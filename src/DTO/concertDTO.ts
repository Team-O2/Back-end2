import mongoose from "mongoose";
import { userHeaderDTO } from "./userDTO";
import { commentResDTO } from "./commentDTO";

export interface IConcertDTO {
  _id?: mongoose.Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  user?: userHeaderDTO;
  title?: string;
  videoLink?: string;
  imgThumbnail?: string;
  text?: string;
  likes?: Number;
  interest?: [string];
  hashtag?: [string];
  isDeleted?: Boolean;
  isNotice?: Boolean;
  authorNickname?: string;
  commentNum?: number;
  scrapNum?: number;
  generation?: number;
  comments?: commentResDTO[];
  isLike?: boolean;
  isScrap?: boolean;
}

export interface IConcertDetailDTO {
  _id?: mongoose.Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  user?: userHeaderDTO;
  title?: string;
  videoLink?: string;
  imgThumbnail?: string;
  text?: string;
  likes?: Number;
  interest?: [string];
  hashtag?: [string];
  isDeleted?: Boolean;
  isNotice?: Boolean;
  authorNickname?: string;
  commentNum?: number;
  scrapNum?: number;
  generation?: number;
  comments?: typeof mongoose.Schema.Types.ObjectId[];
}

export interface concertResDTO {
  concerts: IConcertDTO[];
  totalConcertNum?: number;
}

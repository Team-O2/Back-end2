import { userHeaderDTO } from "./userDTO";
import { commentResDTO } from "./commentDTO";
import mongoose from "mongoose";

export interface INotice {
  _id: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  user: userHeaderDTO;
  title: string;
  videoLink?: string;
  imgThumbnail?: string;
  text?: string;
  likes?: Number;
  interest?: [string];
  hashtag?: [string];
  isDeleted: Boolean;
  isNotice: Boolean;
  authorNickname?: string;
  commentNum: number;
  scrapNum: number;
  generation?: number;
  comments?: commentResDTO[];
}

export interface noticesResDTO {
  notices: INotice[];
  totalNoticeNum?: number;
}
export interface noticeResDTO {
  noticeOne: INotice;
}

export interface noticeSearchResDTO {
  searchData: INotice[];
  totalNoticeSearchNum?: number;
}

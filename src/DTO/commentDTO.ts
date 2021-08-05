import mongoose from "mongoose";
import { userHeaderDTO } from "./userDTO";

export interface commentResDTO {
  postModel: String;
  post: mongoose.Schema.Types.ObjectId;
  userID: userHeaderDTO;
  parentComment: commentResDTO;
  childrenComment: commentResDTO[];
  text: string;
  isDeleted: Boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface commentReqDTO {
  parentID?: string;
  text: string;
}

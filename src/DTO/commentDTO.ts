namespace commentDTO {
  export interface IComment {
    id: number;
    userID: number;
    nickname: string;
    img: string;
    text: string;
    children?: IComment[];
    isDeleted: Boolean;
  }

  export interface postCommentReqDTO {
    parentID?: number;
    text: string;
  }

  export interface postCommentResDTO {
    id: number;
    userID: number;
    nickname: string;
    img: string;
    text: string;
    createdAt: Date;
    updatedAt: Date;
  }
}

export default commentDTO;

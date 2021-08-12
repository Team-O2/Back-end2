namespace challengeDTO {
  // export interface IChallengeDTO {
  //   id: number;
  //   createdAt?: Date;
  //   updatedAt?: Date;
  //   userID: number;
  //   nickname: string;
  //   img: string;
  //   // user: userHeaderDTO;
  //   good: string;
  //   learn: string;
  //   bad: string;
  //   likes: number | Number;
  //   commentNum: number | Number;
  //   scrapNum: number | Number;
  //   generation: number | Number;
  //   interest: string[];
  //   isDeleted?: Boolean;
  //   comments?: typeof mongoose.Schema.Types.ObjectId[];
  //   isLike?: boolean;
  //   isScrap?: boolean;
  // }

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

export default challengeDTO;

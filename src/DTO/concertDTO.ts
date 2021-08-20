import { commentDTO } from ".";

namespace concertDTO {
  export interface getConcertResDTO {
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
    isLike?: boolean;
    isScrap?: boolean;
  }

  export interface concertDetailDTO {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    userID: number;
    nickname: string;
    authorNickname: string;
    title: string;
    videoLink: string;
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
    isLike?: boolean;
    isScrap?: boolean;
  }

  export interface concertAllResDTO {
    concerts: getConcertResDTO[];
    totalConcertNum: number;
  }
}
export default concertDTO;

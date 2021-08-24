namespace adminDTO {
  export interface IAdmin {
    title: String;
    registerStartDT: Date;
    registerEndDT: Date;
    challengeStartDT: Date;
    challengeEndDT: Date;
    generation: Number;
    limitNum: Number;
    img: string;
    createdDT: Date;
    applyNum: Number;
  }

  interface Admin {
    registerStartDT: Date;
    registerEndDT: Date;
    challengeStartDT: Date;
    challengeEndDT: Date;
    generation: number;
    createdDT: Date;
    applyNum: number;
    participants: number;
    postNum: number;
    img: string;
  }
  export interface adminResDTO {
    offsetAdmin: Admin[];
    totalAdminNum?: number;
  }

  export interface adminRegistReqDTO {
    title: string;
    registerStartDT: string;
    registerEndDT: string;
    challengeStartDT: string;
    challengeEndDT: string;
    limitNum: number;
  }

  export interface adminRegistResDTO {
    img: string;
    title: String;
    registerStartDT: Date;
    registerEndDT: Date;
    challengeStartDT: Date;
    challengeEndDT: Date;
    generation: Number;
  }

  export interface adminWriteReqDTO {
    title: string;
    text: string;
    authorNickname?: string;
    interest: string;
    hashtag: string;
  }
}

export default adminDTO;

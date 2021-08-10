export interface signupReqDTO {
  email: string;
  password: string;
  nickname?: string;
  interest?: [string];
  isMarketing?: Boolean;
  gender?: number;
}

export interface signinReqDTO {
  email: string;
  password: string;
}

export interface signinResDTO {
  userState: number;
  progressGeneration?: number;
  registGeneration?: number;
  totalGeneration?: number;
}

export interface hamburgerResDTO {
  progressGeneration?: number;
  registGeneration?: Number;
}

export interface pwReqDTO {
  email: string;
  password: string;
}

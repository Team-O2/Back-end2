export interface signupReqDTO {
  email: string;
  password: string;
  nickname?: string;
  interest?: [string];
  marpolicy?: Boolean;
  gender?: number;
}

export interface signinReqDTO {
  email: string;
  password: string;
}

export interface signinResDTO {
  userState: number;
  progressGeneration?: number;
  registGeneration?: Number;
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

namespace authDTO {
  export interface signupReqDTO {
    email: string;
    password: string;
    nickname?: string;
    interest?: [string];
    isMarketing?: Boolean;
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

  export interface emailReqDTO {
    email: string;
  }

  export interface codeReqDTO {
    email: string;
    emailCode: string;
  }

  export interface codeResDTO {
    isOkay: boolean;
  }

  export interface passwordReqDTO {
    email: string;
    password: string;
  }
}

export default authDTO;

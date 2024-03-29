import { Request, Response } from "express";
import { validationResult } from "express-validator";
// libraries
import { response, returnCode } from "../library";
// services
import { authService } from "../service";
//DTO
import { authDTO } from "../DTO";

/**
 *  @회원가입
 *  @route Post auth/signup
 *  @access public
 */

const signupController = async (req: Request, res: Response) => {
  // 이메일 형식이 잘못된 경우
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return response.basicResponse(
      res,
      returnCode.BAD_REQUEST,
      "요청 값이 올바르지 않습니다"
    );
  }

  try {
    const reqData: authDTO.signupReqDTO = req.body;
    const data = await authService.postSignup(reqData);

    // 요청 바디가 부족할 경우
    if (data === -1) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "요청 값이 올바르지 않습니다"
      );
    } // 이미 존재하는 아이디
    else if (data === -2) {
      response.basicResponse(res, returnCode.CONFLICT, "중복된 아이디 입니다");
    }
    // 중복된 닉네임
    else if (data === -3) {
      response.basicResponse(res, returnCode.CONFLICT, "중복된 닉네임 입니다");
    }
    // 회원가입 성공
    else {
      const { user, token } = data;
      response.tokenResponse(res, returnCode.CREATED, "회원가입 성공", token);
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @로그인
 *  @route Post auth/signin
 *  @desc Authenticate user & get token
 *  @access public
 */

const signinController = async (req: Request, res: Response) => {
  // 이메일 형식이 잘못된 경우
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return response.basicResponse(
      res,
      returnCode.BAD_REQUEST,
      "요청 값이 올바르지 않습니다"
    );
  }

  try {
    const reqData: authDTO.signinReqDTO = req.body;
    const data = await authService.postSignin(reqData);

    // 요청 바디가 부족할 경우
    if (data == -1) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "요청 값이 올바르지 않습니다"
      );
    }
    // email이 DB에 없을 경우
    else if (data == -2) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "아이디가 존재하지 않습니다"
      );
    }
    // password가 틀렸을 경우
    else if (data == -3) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "비밀번호가 틀렸습니다"
      );
    }
    // 로그인 성공
    else {
      const { userData, token } = data;
      response.dataTokenResponse(
        res,
        returnCode.OK,
        "로그인 성공",
        userData,
        token
      );
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @이메일_인증번호_전송
 *  @route Post auth/email
 *  @desc post email code for certification
 *  @access Public
 */

const postEmailController = async (req: Request, res: Response) => {
  // 이메일 형식이 잘못된 경우
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return response.basicResponse(
      res,
      returnCode.BAD_REQUEST,
      "요청 값이 올바르지 않습니다"
    );
  }

  try {
    const reqData: authDTO.emailReqDTO = req.body;
    const resData: undefined | -1 | -2 | -3 = await authService.postEmail(
      reqData
    );

    // 요청 바디가 부족할 경우
    if (resData === -1) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "요청 값이 올바르지 않습니다"
      );
    }
    // email이 DB에 없을 경우
    else if (resData === -2) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "아이디가 존재하지 않습니다"
      );
    }
    // 이메일 전송이 실패한 경우
    else if (resData === -3) {
      response.basicResponse(
        res,
        returnCode.SERVICE_UNAVAILABLE,
        "이메일 전송이 실패하였습니다"
      );
    }
    // 성공
    else {
      response.basicResponse(res, returnCode.NO_CONTENT, "인증번호 전송 성공");
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @인증번호_확인
 *  @route Post auth/code
 *  @desc check the certification code
 *  @access Public
 */

const postCodeController = async (req: Request, res: Response) => {
  // 이메일 형식이 잘못된 경우
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return response.basicResponse(
      res,
      returnCode.BAD_REQUEST,
      "요청 값이 올바르지 않습니다"
    );
  }

  try {
    const reqData: authDTO.codeReqDTO = req.body;
    const resData: undefined | -1 | -2 | -3 = await authService.postCode(
      reqData
    );

    // 요청 바디가 부족할 경우
    if (resData === -1) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "요청 값이 올바르지 않습니다"
      );
    }
    // email이 DB에 없을 경우
    if (resData === -2) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "아이디가 존재하지 않습니다"
      );
    }
    // 인증번호가 올바르지 않은 경우
    if (resData === -3) {
      response.dataResponse(res, returnCode.OK, "인증번호 인증 실패", {
        isOkay: false,
      });
    }
    // 인증번호 인증 성공
    response.dataResponse(res, returnCode.OK, "인증번호 인증 성공", {
      isOkay: true,
    });
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @비밀번호_변경
 *  @route Patch auth/pw
 *  @desc change password
 *  @access Public
 */

const patchPasswordController = async (req: Request, res: Response) => {
  // 이메일 형식 또는 비밀번호 형식이 잘못된 경우
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return response.basicResponse(
      res,
      returnCode.BAD_REQUEST,
      "요청 값이 올바르지 않습니다"
    );
  }

  try {
    const reqData: authDTO.passwordReqDTO = req.body;
    const data: undefined | -1 | -2 = await authService.patchPassword(reqData);

    // 요청 바디가 부족할 경우
    if (data === -1) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "요청 값이 올바르지 않습니다"
      );
    }
    // email이 DB에 없을 경우
    else if (data === -2) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "아이디가 존재하지 않습니다"
      );
    }
    // 성공
    else {
      response.basicResponse(res, returnCode.NO_CONTENT, "비밀번호 변경 성공");
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @햄버거바
 *  @route Post auth/hamburger
 *  @desc
 *  @access public
 */

const hamburgerController = async (req: Request, res: Response) => {
  try {
    const data: authDTO.hamburgerResDTO = await authService.getHamburger();

    // 조회 성공
    response.dataResponse(res, returnCode.OK, "햄버거바 조회 성공", data);
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

const authController = {
  signinController,
  signupController,
  hamburgerController,
  postEmailController,
  postCodeController,
  patchPasswordController,
};

export default authController;

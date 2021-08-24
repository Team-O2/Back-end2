import { Request, Response } from "express";
import { check, validationResult } from "express-validator";
// libraries
import { response, returnCode } from "../library";
// services
import { userService } from "../service";
//DTO
import { userDTO } from "../DTO";

/**
 *  @User_마이페이지_Info
 *  @route Get user/mypage/info
 *  @access private
 */

const getMypageInfoController = async (req: Request, res: Response) => {
  try {
    const data: userDTO.mypageInfoResDTO = await userService.getMypageInfo(
      req.body.userID.id
    );
    response.dataResponse(
      res,
      returnCode.OK,
      "마이페이지 유저정보 검색 성공",
      data
    );
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @마이페이지_회원정보_조회
 *  @route Get user/userInfo
 *  @access private
 */

const getUserInfoController = async (req: Request, res: Response) => {
  try {
    const data: userDTO.userInfoResDTO = await userService.getUserInfo(
      req.body.userID.id
    );

    // 유저정보 조회 성공
    response.dataResponse(res, returnCode.OK, "유저정보 조회 성공", data);
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @User_마이페이지_콘서트_스크랩
 *  @route GET user/mypage/concert?offset=@&limit=
 *  @access private
 *  @error
 *    1. no Limit
 *    2. no content
 */

const getConcertScrapController = async (req: Request, res: Response) => {
  try {
    const data: userDTO.concertScrapResDTO | -1 | -2 =
      await userService.getConcertScrap(
        req.body.userID.id,
        Number(req.query.offset),
        Number(req.query.limit)
      );

    // 1. No limit
    if (data === -1) {
      response.basicResponse(
        res,
        returnCode.NOT_FOUND,
        "요청 경로가 올바르지 않습니다"
      );
    }
    // 2. No content
    else if (data == -2) {
      response.basicResponse(
        res,
        returnCode.NO_CONTENT,
        "스크랩한 Share Together가 없습니다."
      );
    }
    // 마이페이지 콘서트 조회 성공
    else {
      response.dataResponse(
        res,
        returnCode.OK,
        "Share Together 스크랩 조회 성공",
        data
      );
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @User_마이페이지_회고_스크랩
 *  @route Get user/mypage/challenge
 *  @access Private
 */

const getChallengeScrapController = async (req: Request, res: Response) => {
  try {
    const data: userDTO.challengeScrapResDTO | -1 | -2 =
      await userService.getChallengeScrap(
        req.body.userID.id,
        Number(req.query.offset),
        Number(req.query.limit)
      );

    // 1. No limit
    if (data === -1) {
      response.basicResponse(
        res,
        returnCode.NOT_FOUND,
        "요청 경로가 올바르지 않습니다"
      );
    }
    // 2. No content
    else if (data == -2) {
      response.basicResponse(
        res,
        returnCode.NO_CONTENT,
        "스크랩한 learn Myself가 없습니다."
      );
    }
    // 마이페이지 콘서트 조회 성공
    else {
      response.dataResponse(
        res,
        returnCode.OK,
        "learn Myself 스크랩 조회 성공",
        data
      );
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @마이페이지_내가_쓴_글
 *  @route Get user/mypage/write/:userID
 *  @access Private
 */

const getMyWritingsController = async (req: Request, res: Response) => {
  try {
    const data: userDTO.challengeResDTO[] | -1 | -2 =
      await userService.getMyWritings(
        req.body.userID.id,
        Number(req.query.offset),
        Number(req.query.limit)
      );

    // 1. No limit
    if (data === -1) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "요청 값이 올바르지 않습니다."
      );
    }

    // 2. No content
    else if (data == -2) {
      response.basicResponse(
        res,
        returnCode.NO_CONTENT,
        "작성한 learn Myself가 없습니다."
      );
    }

    response.dataResponse(res, returnCode.OK, "내가 쓴 글 가져오기 성공", data);
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @마이페이지_내가_쓴_댓글
 *  @route Get user/mypage/comment?postModel=@&offset=@&limit=
 *  @access Private
 *  @error
 *    1. No limit / No postModel
 *    2. Wrong postModel
 *    3. 작성한 댓글이 없을 때
 */

const getMyCommentsController = async (req: Request, res: Response) => {
  try {
    const data: userDTO.myCommentsResDTO | -1 | -2 | -3 | -4 =
      await userService.getMyComments(
        req.body.userID.id,
        String(req.query.postModel),
        Number(req.query.offset),
        Number(req.query.limit)
      );

    // 1. No limit
    if (data === -1) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "요청 값이 올바르지 않습니다."
      );
    }
    // 2. Wrong postModel
    else if (data === -2) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "잘못된 postModel 값입니다."
      );
    }
    // 3. 작성한 댓글이 없을 때
    else if (data === -3) {
      response.basicResponse(
        res,
        returnCode.NO_CONTENT,
        "작성한 댓글이 없습니다."
      );
    }
    // 4. 내가 쓴 댓글 조회 성공
    else {
      response.dataResponse(
        res,
        returnCode.OK,
        "내가 쓴 댓글 가져오기 성공",
        data
      );
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @마이페이지_비밀번호_수정
 *  @route Patch user/password
 *  @access private
 *  @error
 *    1. 요청 바디 부족
 *    2. 현재 비밀번호와 일치하지 않음
 */

const patchPWController = async (req: Request, res: Response) => {
  try {
    const body: userDTO.newPwReqDTO = req.body;
    const data = await userService.patchPW(req.body.userID.id, body);

    // 1. 요청 바디가 부족
    if (data === -1) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "요청 값이 올바르지 않습니다."
      );
    }
    // 2. 현재 비밀번호와 일치하지 않음
    else if (data === -2) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "현재 비밀번호가 일치하지 않습니다."
      );
    } else {
      response.basicResponse(res, returnCode.OK, "비밀번호 수정 성공");
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @마이페이지_내가_쓴_댓글_삭제
 *  @route Patch user/mypage/comment
 *  @access Private
 *  @error
 *    1. 요청 바디가 부족할 경우
 *    2. comment ID가 잘못된 경우
 *    3. 해당 유저가 작성한 댓글이 아닐 경우
 *    4. 삭제하려는 댓글이 이미 isDeleted = true 인 경우
 */

const deleteMyCommentsController = async (req: Request, res: Response) => {
  try {
    const body: userDTO.deleteCommentsReqDTO = req.body;

    const data = await userService.deleteMyComments(req.body.userID.id, body);

    console.log("data", data);

    // 1. 요청 바디가 부족할 경우
    if (data === -1) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "요청 값이 올바르지 않습니다."
      );
    }
    // 2. comment ID가 잘못된 경우
    else if (data === -2) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "잘못된 commentID 입니다."
      );
    }
    // 3. 해당 유저가 작성한 댓글이 아닐 경우
    else if (data === -3) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "삭제 권한이 없습니다."
      );
    }
    // 4. 삭제하려는 댓글이 이미 isDeleted = true 인 경우
    else if (data === -4) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "이미 삭제된 댓글입니다."
      );
    } else {
      response.basicResponse(res, returnCode.OK, "내가 쓴 댓글 삭제 성공");
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @User_마이페이지_회고_스크랩_취소토글
 *  @route Delete user/mypage/challenge/:challengeID
 *  @access private
 *  @error
 *    1. no challengeID
 *    2. challengeID 잘못됨
 *    3. 스크랩 하지 않은 challenge
 */

const deleteChallengeScrapController = async (req: Request, res: Response) => {
  try {
    const data = await userService.deleteChallengeScrap(
      req.body.userID.id,
      Number(req.params.challengeID)
    );

    // response.dataResponse(res, returnCode.OK, "스크랩 취소 성공", data);

    // 1. no challengeID
    if (data === -1) {
      response.basicResponse(
        res,
        returnCode.NOT_FOUND,
        "요청 경로가 올바르지 않습니다."
      );
    }
    // 2. challengeID 잘못됨
    else if (data === -2) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "잘못된 challengeID 입니다."
      );
    }
    // 3. 스크랩 하지 않은 challenge
    else if (data === -3) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "스크랩 하지 않은 글입니다."
      );
    }
    // 마이페이지 회고 스크랩 취소
    else {
      response.basicResponse(res, returnCode.OK, "스크랩 취소 성공");
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @User_챌린지_신청하기
 *  @route Post user/register
 *  @body challengeNum: number
 *  @access private
 *  @error
 *    1. 요청 바디 부족
 *    2. 유저 id가 관리자 id임
 *    3. 신청 기간이 아님
 *    4. 이미 신청이 완료된 사용자
 *    5. 신청 인원 초과
 */

const postRegisterController = async (req: Request, res: Response) => {
  try {
    const body: userDTO.registerReqDTO = req.body;
    const data = await userService.postRegister(req.body.userID.id, body);
    // 1. 요청 바디 부족
    if (data === -1) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "요청 값이 올바르지 않습니다."
      );
    }
    // 2. 유저 id가 관리자 id임
    else if (data === -2) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "관리자 아이디는 신청할 수 없습니다"
      );
    }
    // 3. 신청 기간이 아님
    else if (data === -3) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "신청 기간이 아닙니다."
      );
    }
    // 4. 이미 신청이 완료된 사용자
    else if (data == -4) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "이미 신청이 완료된 사용자."
      );
    }
    // 5. 신청 인원 초과
    else if (data === -5) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "신청 인원이 초과되었습니다"
      );
    }
    // 챌린지 신청 성공
    else {
      response.basicResponse(res, returnCode.OK, "챌린지 신청 성공");
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @마이페이지_회원정보_수정
 *  @route Patch user/userInfo
 *  @access private
 *  @error
 *    1. 요청 바디 부족
 *    2. 닉네임 중복
 */

const patchUserInfoController = async (req: Request, res: Response) => {
  try {
    const url = {
      img: (req as any).files.img ? (req as any).files.img[0].location : "",
    };
    const data = await userService.patchUserInfo(
      req.body.userID.id,
      req.body,
      url
    );

    // 1. 요청 바디 부족
    if (data === -1) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "요청 값이 올바르지 않습니다."
      );
    }
    // 2. 닉네임 중복
    else if (data === -2) {
      response.basicResponse(res, returnCode.CONFLICT, "중복된 닉네임 입니다.");
    }
    // 회원정보 수정 성공
    else {
      response.dataResponse(res, returnCode.OK, "회원정보 수정 성공", data);
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

const userController = {
  getMypageInfoController,
  getUserInfoController,
  getConcertScrapController,
  getChallengeScrapController,
  getMyWritingsController,
  getMyCommentsController,
  patchPWController,
  deleteMyCommentsController,
  deleteChallengeScrapController,
  postRegisterController,
  patchUserInfoController,
};

export default userController;

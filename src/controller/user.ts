import { Router, Request, Response } from "express";
// libraries
import { returnCode } from "../library/returnCode";
import { response, dataResponse } from "../library/response";
// middlewares
import auth from "../middleware/auth";
import publicAuth from "../middleware/publicAuth";
// modules
const upload = require("../modules/upload");
// services
import {
  postRegister,
  getMypageConcert,
  getMypageChallenge,
  deleteMypageChallenge,
  getMypageInfo,
  getMyWritings,
  getMyComments,
  deleteMyComments,
  getUserInfo,
  patchInfo,
  patchPW,
} from "../service/userService";
// DTO
import mongoose, { Document } from "mongoose";
import {
  challengeScrapResDTO,
  concertScrapResDTO,
  myCommentsResDTO,
  mypageInfoResDTO,
  newPwReqDTO,
  registerReqDTO,
  userInfoResDTO,
} from "../DTO/userDTO";
import { IChallengeDTO } from "../DTO/challengeDTO";
// interface
import { IUser } from "../interfaces/IUser";
import { IComment } from "../interfaces/IComment";
import { IChallenge } from "../interfaces/IChallenge";

const router = Router();

/**
 *  @User_챌린지_신청하기
 *  @route Post user/register
 *  @access Public
 */

router.post("/register", auth, async (req: Request, res: Response) => {
  try {
    const body: registerReqDTO = req.body;
    const data = await postRegister(req.body.userID.id, body);

    // 요청 바디가 부족할 경우
    if (data === -1) {
      response(res, returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다");
    }
    // 유저 id가 관리자 아이디임
    else if (data === -2) {
      response(
        res,
        returnCode.BAD_REQUEST,
        "관리자 아이디는 신청할 수 없습니다"
      );
    } else if (data === -3) {
      response(res, returnCode.BAD_REQUEST, "신청 기간이 아닙니다.");
    }
    // 이미 신청된 아이디일 경우
    else if (data == -4) {
      response(res, returnCode.BAD_REQUEST, "이미 신청이 완료된 사용자.");
    }
    // 신청 인원이 초과되었을 경우
    else if (data === -5) {
      response(res, returnCode.BAD_REQUEST, "신청 인원이 초과되었습니다");
    }

    // 챌린지 신청 성공
    else {
      response(res, returnCode.OK, "챌린지 신청 성공");
    }
  } catch (err) {
    console.error(err.message);
    response(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
});

/**
 *  @마이페이지_회원정보_조회
 *  @route Get user/userInfo
 *  @access private
 */
router.get("/userInfo", auth, async (req: Request, res: Response) => {
  try {
    const data: userInfoResDTO = await getUserInfo(req.body.userID.id);

    // 유저정보 조회 성공
    dataResponse(res, returnCode.OK, "유저정보 조회 성공", data);
  } catch (err) {
    console.error(err.message);
    response(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
});

/**
 *  @마이페이지_회원정보_수정
 *  @route Patch user
 *  @access private
 */
router.patch(
  "/userInfo",
  upload.fields([{ name: "img", maxCount: 1 }]),
  auth,
  async (req: Request, res: Response) => {
    try {
      const url = {
        img: (req as any).files.img ? (req as any).files.img[0].location : "",
      };
      const data = await patchInfo(req.body.userID.id, req.body, url);

      // 요청 바디가 부족할 경우
      if (data === -1) {
        response(res, returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다.");
      } else if (data === -2) {
        response(res, returnCode.CONFLICT, "중복된 닉네임 입니다");
      }

      dataResponse(res, returnCode.OK, "회원정보 수정 성공", data);
    } catch (err) {
      console.error(err.message);
      response(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
  }
);

/**
 *  @마이페이지_비밀번호_수정
 *  @route Patch user/pw
 *  @access private
 */

router.patch("/password", auth, async (req: Request, res: Response) => {
  try {
    const body: newPwReqDTO = req.body;
    const data = await patchPW(body);

    // 요청 바디가 부족할 경우
    if (data === -1) {
      response(res, returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다");
    }
    // 현재 password와 맞지 않을 경우
    if (data === -2) {
      response(
        res,
        returnCode.BAD_REQUEST,
        "현재 비밀번호가 일치하지 않습니다"
      );
    }

    response(res, returnCode.OK, "비밀번호 수정 성공");
  } catch (err) {
    console.error(err.message);
    response(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
});

/**
 *  @User_마이페이지_콘서트_스크랩
 *  @route Get user/mypage/concert
 *  @access Public
 */

router.get("/mypage/concert", auth, async (req: Request, res: Response) => {
  try {
    const data: concertScrapResDTO | -1 | -2 = await getMypageConcert(
      req.body.userID.id,
      req.query.offset,
      req.query.limit
    );

    // 1. no content
    if (data == -1) {
      response(
        res,
        returnCode.NO_CONTENT,
        "스크랩한 Share Together가 없습니다."
      );
    }

    // 2. limit 없을 때
    if (data === -2) {
      response(res, returnCode.NOT_FOUND, "요청 경로가 올바르지 않습니다");
    }

    // 마이페이지 콘서트 조회 성공
    else {
      dataResponse(res, returnCode.OK, "Share Together 스크랩 조회 성공", data);
    }
  } catch (err) {
    console.error(err.message);
    response(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
});

/**
 *  @User_마이페이지_회고_스크랩
 *  @route Get user/mypage/challenge
 *  @access Public
 */

router.get("/mypage/challenge", auth, async (req: Request, res: Response) => {
  try {
    const data: challengeScrapResDTO | -1 | -2 = await getMypageChallenge(
      req.body.userID.id,
      req.query.offset,
      req.query.limit
    );

    // 1. no content
    if (data == -1) {
      response(res, returnCode.NO_CONTENT, "스크랩한 learn Myself가 없습니다.");
    }

    // 2. limit 없을 때
    if (data === -2) {
      response(res, returnCode.NOT_FOUND, "요청 경로가 올바르지 않습니다");
    }

    // 마이페이지 콘서트 조회 성공
    else {
      dataResponse(res, returnCode.OK, "learn Myself 스크랩 조회 성공", data);
    }
  } catch (err) {
    console.error(err.message);
    response(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
});

/**
 *  @User_마이페이지_Info
 *  @route Get user/mypage/info
 *  @access private
 */
router.get("/mypage/info", auth, async (req: Request, res: Response) => {
  try {
    const data: mypageInfoResDTO = await getMypageInfo(req.body.userID.id);

    // 유저정보 조회 성공
    dataResponse(res, returnCode.OK, "마이페이지 유저정보 검색 성공", data);
  } catch (err) {
    console.error(err.message);
    response(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
});

/**
 *  @User_마이페이지_회고_스크랩_취소토글
 *  @route Delete user/mypage/challenge/:challengeID
 *  @access private
 */

router.delete(
  "/mypage/challenge/:id",
  auth,
  async (req: Request, res: Response) => {
    try {
      const data = await deleteMypageChallenge(
        req.body.userID.id,
        req.params.id
      );
      // 회고 id가 잘못된 경우
      if (data === -1) {
        response(res, returnCode.NOT_FOUND, "요청 경로가 올바르지 않습니다");
      }
      // 스크랩 하지 않은 글일 경우
      if (data === -2) {
        response(res, returnCode.BAD_REQUEST, "스크랩 하지 않은 글입니다");
      }
      // 마이페이지 회고 스크랩 취소
      response(res, returnCode.OK, "스크랩 취소 성공");
    } catch (err) {
      console.error(err.message);
      response(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
  }
);

/**
 *  @마이페이지_내가_쓴_글
 *  @route Get user/mypage/write/:userID
 *  @access Private
 */

router.get("/mypage/write", auth, async (req: Request, res: Response) => {
  try {
    const data: IChallengeDTO[] | -1 = await getMyWritings(
      req.body.userID.id,
      req.query.offset,
      req.query.limit
    );

    // limit 없을 때
    if (data === -1) {
      response(res, returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다.");
    }

    dataResponse(res, returnCode.OK, "내가 쓴 글 가져오기 성공", data);
  } catch (err) {
    console.error(err.message);
    response(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
});

/**
 *  @마이페이지_내가_쓴_댓글
 *  @route Get user/mypage/comment
 *  @access Private
 */

router.get("/mypage/comment", auth, async (req: Request, res: Response) => {
  try {
    const data: myCommentsResDTO | -1 = await getMyComments(
      req.body.userID.id,
      req.query.postModel,
      req.query.offset,
      req.query.limit
    );

    // limit 없을 때
    if (data === -1) {
      response(res, returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다.");
    }

    dataResponse(res, returnCode.OK, "내가 쓴 댓글 가져오기 성공", data);
  } catch (err) {
    console.error(err.message);
    response(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
});

/**
 *  @마이페이지_내가_쓴_댓글_삭제
 *  @route Delete user/mypage/comment
 *  @access Private
 */

router.delete("/mypage/comment", auth, async (req: Request, res: Response) => {
  try {
    const data = await deleteMyComments(req.body);

    // 요청 바디가 부족할 경우
    if (data === -1) {
      response(res, returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다.");
    }

    dataResponse(res, returnCode.OK, "내가 쓴 댓글 삭제 성공", data);
  } catch (err) {
    console.error(err.message);
    response(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
});

module.exports = router;

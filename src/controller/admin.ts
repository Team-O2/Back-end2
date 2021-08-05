import { Router, Request, Response } from "express";
// libraries
import { returnCode } from "../library/returnCode";
import { response, dataResponse } from "../library/response";
//middlewares
import auth from "../middleware/auth";
const upload = require("../modules/upload");
// interfaces
import { IAdmin } from "../interfaces/IAdmin";
import { IConcert } from "../interfaces/IConcert";
//services
import {
  postAdminList,
  postAdminChallenge,
  postAdminConcert,
  postAdminNotice,
  getAdminRegist,
} from "../service/adminService";

// DTO
import {
  adminResDTO,
  adminRegistReqDTO,
  adminWriteReqDTO,
  adminRegistResDTO,
} from "../DTO/adminDTO";

const router = Router();

/**
 *  @관리자_페이지_조회
 *  @route Get admin
 *  @access private
 */
router.get("/", auth, async (req: Request, res: Response) => {
  try {
    const data: adminResDTO | -1 | -2 = await postAdminList(
      req.body.userID.id,
      req.query.offset,
      req.query.limit
    );

    // limit 없을 때
    if (data === -1) {
      response(res, returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다");
    }

    // 유저 id가 관리자가 아님
    if (data === -2) {
      response(res, returnCode.NOT_FOUND, "관리자 아이디가 아닙니다");
    }
    // 관리자 챌린지 조회 성공
    else {
      dataResponse(res, returnCode.OK, "관리자 페이지 조회 성공", data);
    }
  } catch (err) {
    console.error(err.message);
    response(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
});

/**
 *  @관리자_챌린지_등록
 *  @route Post admin/challenge
 *  @access private
 */
router.post<unknown, unknown, IAdmin>(
  "/challenge",
  upload.fields([{ name: "img", maxCount: 1 }]),
  auth,

  async (req: Request, res: Response) => {
    try {
      const url = {
        img: (req as any).files.img
          ? (req as any).files.img[0].location
          : "https://o2-server.s3.ap-northeast-2.amazonaws.com/origin/default_img_100%403x.jpg",
      };
      const reqData: adminRegistReqDTO = req.body;
      const data = await postAdminChallenge(req.body.userID.id, reqData, url);

      // 요청 바디가 부족할 경우
      if (data === -1) {
        response(res, returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다");
      }
      // 유저 id가 관리자가 아님
      else if (data === -2) {
        response(res, returnCode.NOT_FOUND, "관리자 아이디가 아닙니다");
      }
      // 챌린지 기간이 신청 기간보다 빠른 경우 or 기간 입력이 잘못된 경우
      else if (data === -3) {
        response(res, returnCode.BAD_REQUEST, "잘못된 기간을 입력하셨습니다");
      }

      // 관리자 챌린지 등록 성공
      else {
        response(res, returnCode.OK, "관리자 챌린지 등록 성공");
      }
    } catch (err) {
      console.error(err.message);
      response(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
  }
);

/**
 *  @관리자_챌린지_신청페이지
 *  @route Get admin/regist
 *  @access private
 */
router.get("/regist", async (req: Request, res: Response) => {
  try {
    const data: adminRegistResDTO | -1 | -2 = await getAdminRegist();

    // 현재 진행중인 기수가 없음
    if (data === -1) {
      response(res, returnCode.BAD_REQUEST, "현재 신청 기간인 기수가 없습니다");
    }
    // 챌린지 신청 페이지 조회 성공
    else {
      dataResponse(res, returnCode.OK, "신청 페이지 조회 성공", data);
    }
  } catch (err) {
    console.error(err.message);
    response(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
});

/**
 *  @관리자_오픈콘서트_등록
 *  @route Post admin/concert
 *  @access private
 */

router.post<unknown, unknown, IConcert>(
  "/concert",
  upload.fields([
    { name: "videoLink", maxCount: 1 },
    { name: "imgThumbnail", maxCount: 1 },
  ]),
  auth,
  async (req: Request, res: Response) => {
    try {
      const url = {
        videoLink: (req as any).files.videoLink
          ? (req as any).files.videoLink[0].location
          : "",
        imgThumbnail: (req as any).files.imgThumbnail
          ? (req as any).files.imgThumbnail[0].location
          : "https://o2-server.s3.ap-northeast-2.amazonaws.com/origin/default_img_100%403x.jpg",
      };
      const reqData: adminWriteReqDTO = req.body;
      const data = await postAdminConcert(req.body.userID.id, reqData, url);

      // 요청 바디가 부족할 경우
      if (data === -1) {
        response(res, returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다");
      }
      // 유저 id가 관리자가 아님
      else if (data === -2) {
        response(res, returnCode.BAD_REQUEST, "관리자 아이디가 아닙니다");
      }

      // 관리자 챌린지 등록 성공
      else {
        response(res, returnCode.OK, "관리자 오투콘서트 등록 성공");
      }
    } catch (err) {
      console.error(err.message);
      response(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
  }
);

/**
 *  @관리자_공지사항_등록
 *  @route Post admin/notice
 *  @access private
 */

router.post<unknown, unknown, IConcert>(
  "/notice",
  upload.fields([
    { name: "videoLink", maxCount: 1 },
    { name: "imgThumbnail", maxCount: 1 },
  ]),
  auth,
  async (req: Request, res: Response) => {
    try {
      const url = {
        videoLink: (req as any).files.videoLink
          ? (req as any).files.videoLink[0].location
          : "",
        imgThumbnail: (req as any).files.imgThumbnail
          ? (req as any).files.imgThumbnail[0].location
          : "https://o2-server.s3.ap-northeast-2.amazonaws.com/origin/default_img_100%403x.jpg",
      };

      const reqData: adminWriteReqDTO = req.body;
      const data = await postAdminNotice(
        req.body.userID.id,
        reqData,
        // JSON.parse(req.body.json),
        url
      );

      // 요청 바디가 부족할 경우
      if (data === -1) {
        response(res, returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다");
      }
      // 유저 id가 관리자가 아님
      else if (data === -2) {
        response(res, returnCode.BAD_REQUEST, "관리자 아이디가 아닙니다");
      }

      // 관리자 공지사항 등록 성공
      else {
        response(res, returnCode.OK, "관리자 공지사항 등록 성공");
      }
    } catch (err) {
      console.error(err.message);
      response(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
  }
);

module.exports = router;

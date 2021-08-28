import { Request, Response } from "express";
// libraries
import { response, returnCode } from "../library";
// services
import { adminService } from "../service";
// DTO
import { adminDTO, commentDTO } from "../DTO";

/**
 *  @관리자_페이지_조회
 *  @route Get /admin?offset=&limit=
 *  @access private
 */
const getAdminListController = async (req: Request, res: Response) => {
  try {
    const resData: adminDTO.adminResDTO | -1 | -2 =
      await adminService.getAdminList(
        Number(req.body.userID.id),
        Number(req.query.offset),
        Number(req.query.limit)
      );

    // limit 없을 때
    if (resData === -1) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "요청 값이 올바르지 않습니다"
      );
    }

    // 유저 id가 관리자가 아님
    else if (resData === -2) {
      response.basicResponse(
        res,
        returnCode.NOT_FOUND,
        "관리자 아이디가 아닙니다"
      );
    }
    // 관리자 챌린지 조회 성공
    else {
      response.dataResponse(
        res,
        returnCode.OK,
        "관리자 페이지 조회 성공",
        resData
      );
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @관리자_챌린지_등록
 *  @route Post admin/challenge
 *  @access private
 */

const postAdminChallengeController = async (req: Request, res: Response) => {
  try {
    const url = {
      img: (req as any).files.img
        ? (req as any).files.img[0].location
        : "https://o2-server.s3.ap-northeast-2.amazonaws.com/origin/default_img_100%403x.jpg",
    };
    const reqData: adminDTO.adminRegistReqDTO = req.body;
    const data = await adminService.postAdminChallenge(
      req.body.userID.id,
      reqData,
      url
    );

    // 요청 바디가 부족할 경우
    if (data === -1) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "요청 값이 올바르지 않습니다"
      );
    }
    // 유저 id가 관리자가 아님
    else if (data === -2) {
      response.basicResponse(
        res,
        returnCode.NOT_FOUND,
        "관리자 아이디가 아닙니다"
      );
    }
    // 챌린지 기간이 신청 기간보다 빠른 경우 or 기간 입력이 잘못된 경우
    else if (data === -3) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "잘못된 기간을 입력하셨습니다"
      );
    }

    // 관리자 챌린지 등록 성공
    else {
      response.basicResponse(res, returnCode.OK, "관리자 챌린지 등록 성공");
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @관리자_챌린지_신청페이지
 *  @route Get admin/regist
 *  @access public
 */
const getAdminRegistController = async (req: Request, res: Response) => {
  try {
    const resData: adminDTO.adminRegistResDTO | -1 | -2 =
      await adminService.getAdminRegist();

    // 현재 진행중인 기수가 없음
    if (resData === -1) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "현재 신청 기간인 기수가 없습니다"
      );
    }
    // 챌린지 신청 페이지 조회 성공
    else {
      response.dataResponse(
        res,
        returnCode.OK,
        "신청 페이지 조회 성공",
        resData
      );
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @관리자_콘서트_등록
 *  @route Post admin/concert
 *  @access private
 */

const postAdminConcertController = async (req: Request, res: Response) => {
  try {
    const url = {
      videoLink: (req as any).files.videoLink
        ? (req as any).files.videoLink[0].location
        : "",
      imgThumbnail: (req as any).files.imgThumbnail
        ? (req as any).files.imgThumbnail[0].location
        : "https://o2-server.s3.ap-northeast-2.amazonaws.com/origin/default_img_100%403x.jpg",
    };
    const reqData: adminDTO.adminWriteReqDTO = req.body;
    const resData = await adminService.postAdminConcert(
      Number(req.body.userID.id),
      reqData,
      url
    );

    // 요청 바디가 부족할 경우
    if (resData === -1) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "요청 값이 올바르지 않습니다"
      );
    }
    // 유저 id가 관리자가 아님
    else if (resData === -2) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "관리자 아이디가 아닙니다"
      );
    }

    // 관리자 챌린지 등록 성공
    else {
      response.basicResponse(
        res,
        returnCode.CREATED,
        "관리자 오투콘서트 등록 성공"
      );
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @관리자_공지사항_등록
 *  @route Post admin/notice
 *  @access private
 */

const postAdminNoticeController = async (req: Request, res: Response) => {
  try {
    const url = {
      videoLink: (req as any).files.videoLink
        ? (req as any).files.videoLink[0].location
        : "",
      imgThumbnail: (req as any).files.imgThumbnail
        ? (req as any).files.imgThumbnail[0].location
        : "https://o2-server.s3.ap-northeast-2.amazonaws.com/origin/default_img_100%403x.jpg",
    };

    const reqData: adminDTO.adminWriteReqDTO = req.body;
    const data = await adminService.postAdminNotice(
      Number(req.body.userID.id),
      reqData,
      url
    );

    // 요청 바디가 부족할 경우
    if (data === -1) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "요청 값이 올바르지 않습니다"
      );
    }
    // 유저 id가 관리자가 아님
    else if (data === -2) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "관리자 아이디가 아닙니다"
      );
    }

    // 관리자 공지사항 등록 성공
    else {
      response.basicResponse(
        res,
        returnCode.CREATED,
        "관리자 공지사항 등록 성공"
      );
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

const adminController = {
  getAdminListController,
  getAdminRegistController,
  postAdminConcertController,
  postAdminNoticeController,
  postAdminChallengeController,
};
export default adminController;

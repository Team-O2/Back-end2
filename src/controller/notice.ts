import { Request, Response } from "express";
// libraries
import { response, returnCode } from "../library";
// services
import { noticeService } from "../service";
// DTO
import { concertDTO, commentDTO } from "../DTO";

/**
 *  @오투공지사항_전체_가져오기
 *  @route Get /notice?offset=@&limit=
 *  @access public
 */

const getNoticeAllController = async (req: Request, res: Response) => {
  try {
    const resData: concertDTO.noticeAllResDTO | -1 =
      await noticeService.getNoticeAll(
        req.body.userID?.id,
        Number(req.query.offset),
        Number(req.query.limit)
      );

    // 요청 데이터가 부족할 때
    if (resData === -1) {
      response.basicResponse(
        res,
        returnCode.NOT_FOUND,
        "요청 데이터가 부족합니다."
      );
    } else {
      // 회고 전체 불러오기 성공
      response.dataResponse(
        res,
        returnCode.OK,
        "공지사항 전체 불러오기 성공",
        resData
      );
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @오투공지사항_검색_또는_필터
 *  @route Get /notice/search?offset=&limit=&tag=&keyword=
 *  @access public
 */

const getNoticeSearchController = async (req: Request, res: Response) => {
  try {
    const resData: concertDTO.noticeAllResDTO | -1 =
      await noticeService.getNoticeSearch(
        Number(req.query.offset),
        Number(req.query.limit),
        req.body.userID?.id,
        req.query.tag ? String(req.query.tag) : undefined,
        req.query.keyword ? String(req.query.keyword) : undefined
      );

    // limit 없을 때
    if (resData === -1) {
      response.basicResponse(
        res,
        returnCode.NOT_FOUND,
        "요청 경로가 올바르지 않습니다"
      );
    } else {
      // 검색 불러오기 성공
      response.dataResponse(res, returnCode.OK, "검색 성공", resData);
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @오투공지사항_Detail
 *  @route Get /notice/:noticeID
 *  @access public
 *  @error
 *    1. 올바르지 않은 게시글
 */
const getNoticeDetailController = async (req: Request, res: Response) => {
  try {
    const resData: concertDTO.concertDetailDTO | -1 =
      await noticeService.getNoticeOne(
        req.body.userID?.id,
        Number(req.params.noticeID)
      );

    if (resData === -1) {
      response.basicResponse(
        res,
        returnCode.NOT_FOUND,
        "존재하지 않는 게시글입니다"
      );
    } else {
      response.dataResponse(
        res,
        returnCode.OK,
        "해당 공지사항 게시글 불러오기 성공",
        resData
      );
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @공지사항_댓글_등록
 *  @route Post /notice/comment/:noticeID
 *  @access private
 */

const postNoticeCommentController = async (req: Request, res: Response) => {
  try {
    const reqData: commentDTO.postCommentReqDTO = req.body;
    const resData = await noticeService.postNoticeComment(
      Number(req.params.noticeID),
      req.body.userID.id,
      reqData
    );

    // 회고 id가 잘못된 경우
    if (resData === -1) {
      response.basicResponse(
        res,
        returnCode.NOT_FOUND,
        "요청 경로가 올바르지 않습니다"
      );
    }
    //  요청 바디가 부족한 경우
    else if (resData === -2) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "요청 값이 올바르지 않습니다"
      );
    }
    // 부모 댓글 id가 잘못된 경우
    else if (resData === -3) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "부모 댓글 id가 올바르지 않습니다"
      );
    } else {
      // 댓글 등록 성공
      response.basicResponse(res, returnCode.CREATED, "댓글 등록 성공");
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

const concertController = {
  getNoticeAllController,
  getNoticeDetailController,
  getNoticeSearchController,
  postNoticeCommentController,
};
export default concertController;

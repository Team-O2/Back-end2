import { Request, Response } from "express";
// libraries
import { response, returnCode } from "../library";
// services
import { concertService } from "../service";
// DTO
import { concertDTO, commentDTO } from "../DTO";

/**
 *  @오투콘서트_전체_가져오기
 *  @route Get /concert?offset=@&limit=
 *  @access public
 */

const getConcertAllController = async (req: Request, res: Response) => {
  try {
    const resData: concertDTO.concertAllResDTO | -1 =
      await concertService.getConcertAll(
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
        "콘서트 전체 불러오기 성공",
        resData
      );
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @오투콘서트_검색_또는_필터
 *  @route Get /concert/search?offset=&limit=&tag=&keyword=
 *  @access public
 */

const getConcertSearchController = async (req: Request, res: Response) => {
  try {
    const data: concertDTO.concertAllResDTO | -1 =
      await concertService.getConcertSearch(
        Number(req.query.offset),
        Number(req.query.limit),
        req.body.userID?.id,
        req.query.tag ? String(req.query.tag) : undefined,
        req.query.keyword ? String(req.query.keyword) : undefined
      );

    // limit 없을 때
    if (data === -1) {
      response.basicResponse(
        res,
        returnCode.NOT_FOUND,
        "요청 경로가 올바르지 않습니다"
      );
    } else {
      // 검색 불러오기 성공
      const concertSearch = data;
      response.dataResponse(res, returnCode.OK, "검색 성공", concertSearch);
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @오투콘서트_Detail
 *  @route Get /concert/:concertID
 *  @access public
 *  @error
 *    1. 올바르지 않은 게시글
 */
const getConcertDetailController = async (req: Request, res: Response) => {
  try {
    const concert: concertDTO.concertDetailDTO | -1 =
      await concertService.getConcertOne(
        req.body.userID?.id,
        Number(req.params.concertID)
      );

    if (concert === -1) {
      response.basicResponse(
        res,
        returnCode.NOT_FOUND,
        "존재하지 않는 게시글입니다"
      );
    } else {
      response.dataResponse(
        res,
        returnCode.OK,
        "해당 콘서트 게시글 불러오기 성공",
        concert
      );
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @콘서트_댓글_등록
 *  @route Post /concert/comment/:concertID
 *  @access private
 */

const postConcertCommentController = async (req: Request, res: Response) => {
  try {
    const reqData: commentDTO.postCommentReqDTO = req.body;
    const data = await concertService.postConcertComment(
      Number(req.params.concertID),
      req.body.userID.id,
      reqData
    );

    // 회고 id가 잘못된 경우
    if (data === -1) {
      response.basicResponse(
        res,
        returnCode.NOT_FOUND,
        "요청 경로가 올바르지 않습니다"
      );
    }
    //  요청 바디가 부족한 경우
    else if (data === -2) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "요청 값이 올바르지 않습니다"
      );
    }
    // 부모 댓글 id가 잘못된 경우
    else if (data === -3) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "부모 댓글 id가 올바르지 않습니다"
      );
    } else {
      // 댓글 등록 성공
      response.basicResponse(res, returnCode.OK, "댓글 등록 성공");
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @오투콘서트_좋아요_등록
 *  @route Post /concert/like/:concertID
 *  @access private
 */

const postConcertLikeController = async (req: Request, res: Response) => {
  try {
    const data = await concertService.postConcertLike(
      Number(req.params.concertID),
      req.body.userID.id
    );

    // 회고 id가 잘못된 경우
    if (data === -1) {
      response.basicResponse(
        res,
        returnCode.NOT_FOUND,
        "요청 경로가 올바르지 않습니다"
      );
    }
    // 이미 좋아요 한 글일 경우
    else if (data === -2) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "이미 좋아요 한 글입니다"
      );
    } else {
      // 좋아요 등록 성공
      response.basicResponse(res, returnCode.OK, "좋아요 등록 성공");
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @오투콘서트_좋아요_삭제하기
 *  @route Delete /concert/like/:concertID
 *  @access private
 */

const deleteConcertLikeController = async (req: Request, res: Response) => {
  try {
    const data = await concertService.deleteConcertLike(
      Number(req.params.concertID),
      Number(req.body.userID.id)
    );

    // 콘서트 id가 잘못된 경우
    if (data === -1) {
      response.basicResponse(
        res,
        returnCode.NOT_FOUND,
        "요청 경로가 올바르지 않습니다"
      );
    } // 좋아요 한 개수가 0인 경우
    else if (data === -2) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "해당 게시글을 좋아요하지 않았습니다"
      );
    } else {
      // 좋아요 삭제 성공
      response.basicResponse(res, returnCode.OK, "좋아요 삭제 성공");
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @유저_챌린지_회고_스크랩하기
 *  @route Post /concert/scrap/:concertID
 *  @access private
 */
const postConcertScrapController = async (req: Request, res: Response) => {
  try {
    const data = await concertService.postConcertScrap(
      Number(req.params.concertID),
      Number(req.body.userID.id)
    );

    // 회고 id가 잘못된 경우
    if (data === -1) {
      response.basicResponse(
        res,
        returnCode.NOT_FOUND,
        "요청 경로가 올바르지 않습니다"
      );
    }
    // 이미 유저가 스크랩한 글일 경우
    else if (data === -2) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "이미 스크랩 된 글입니다"
      );
    }

    //자신의 회고인 경우
    else if (data === -3) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "자신의 글은 스크랩 할 수 없습니다"
      );
    } else {
      // 회고 스크랩 성공
      response.basicResponse(res, returnCode.OK, "콘서트 스크랩 성공");
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @오투콘서트_회고_스크랩_취소하기
 *  @route Delete /concert/scrap/:concertID
 *  @access private
 */
const deleteConcertScrapController = async (req: Request, res: Response) => {
  try {
    const data = await concertService.deleteConcertScrap(
      Number(req.params.concertID),
      Number(req.body.userID.id)
    );

    // 콘서트 id가 잘못된 경우
    if (data === -1) {
      response.basicResponse(
        res,
        returnCode.NOT_FOUND,
        "요청 경로가 올바르지 않습니다"
      );
    }
    // 스크랩 하지 않은 글일 경우
    else if (data === -2) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "스크랩 하지 않은 글입니다"
      );
    } else {
      // 스크랩 취소 성공
      response.basicResponse(res, returnCode.OK, "콘서트 스크랩 취소 성공");
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

const concertController = {
  getConcertAllController,
  getConcertDetailController,
  getConcertSearchController,
  postConcertCommentController,
  postConcertLikeController,
  deleteConcertLikeController,
  postConcertScrapController,
  deleteConcertScrapController,
};
export default concertController;

import { Request, Response } from "express";
// libraries
import { response, returnCode } from "../library";
// services
import { challengeService } from "../service";
// DTO
import { challengeDTO, commentDTO } from "../DTO";

/**
 *  @챌린지_회고_등록
 *  @route Post /
 *  @desc 회고 등록
 *  @access private
 */

const postChallengeController = async (req: Request, res: Response) => {
  try {
    const reqData: challengeDTO.postChallengeReqDTO = req.body;
    const resData: challengeDTO.postChallengeResDTO | -1 | -2 =
      await challengeService.postChallenge(req.body.userID.id, reqData);

    // 요청 바디가 부족할 경우
    if (resData === -1) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "요청 값이 올바르지 않습니다"
      );
    }
    // 유저 id 잘못된 경우
    else if (resData === -2) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "존재하지 않는 사용자입니다"
      );
    }
    // 회고 등록 성공
    else {
      response.dataResponse(
        res,
        returnCode.CREATED,
        "챌린지 등록 성공",
        resData
      );
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @챌린지_회고_댓글_등록
 *  @route Post /comment/:challengeID
 *  @desc 챌린치 댓글 달기
 *  @access private
 */

const postCommentController = async (req: Request, res: Response) => {
  try {
    const reqData: commentDTO.postCommentReqDTO = req.body;
    const resData: commentDTO.postCommentResDTO | -1 | -2 | -3 =
      await challengeService.postComment(
        Number(req.params.challengeID),
        req.body.userID.id,
        reqData
      );

    // 회고 id가 잘못된 경우
    if (resData === -1) {
      response.basicResponse(
        res,
        returnCode.NOT_FOUND,
        "회고 id가 올바르지 않습니다"
      );
    }
    // 요청 바디가 부족한 경우
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
    }
    // 댓글 등록 성공
    else {
      response.dataResponse(res, returnCode.CREATED, "댓글 등록 성공", resData);
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @챌린지_회고_좋아요_등록
 *  @route Post /:challengeID/like
 *  @desc 챌린치 좋아요 등록하기
 *  @access private
 */

const postLikeController = async (req: Request, res: Response) => {
  try {
    const resData: -1 | -2 | undefined = await challengeService.postLike(
      Number(req.params.challengeID),
      req.body.userID.id
    );

    // 회고 id가 잘못된 경우
    if (resData === -1) {
      response.basicResponse(
        res,
        returnCode.NOT_FOUND,
        "회고 id가 올바르지 않습니다"
      );
    }
    // 이미 좋아요 한 글일 경우
    else if (resData === -2) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "이미 좋아요 한 글입니다"
      );
    }
    // 좋아요 등록 성공
    else {
      response.basicResponse(res, returnCode.NO_CONTENT, "좋아요 등록 성공");
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @유저_챌린지_회고_스크랩하기
 *  @route Post /:challengeID/scrap
 *  @desc 챌린치 좋아요 등록하기
 *  @access private
 */
const postScrapController = async (req: Request, res: Response) => {
  try {
    const resData: -1 | -2 | -3 | undefined = await challengeService.postScrap(
      Number(req.params.challengeID),
      req.body.userID.id
    );

    // 회고 id가 잘못된 경우
    if (resData === -1) {
      response.basicResponse(
        res,
        returnCode.NOT_FOUND,
        "회고 id가 올바르지 않습니다"
      );
    }
    // 이미 유저가 스크랩한 글일 경우
    else if (resData === -2) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "이미 스크랩 한 글입니다"
      );
    }
    // 자신의 회고인 경우
    else if (resData === -3) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "자신의 글은 스크랩 할 수 없습니다"
      );
    }
    // 회고 스크랩 성공
    else {
      response.basicResponse(res, returnCode.NO_CONTENT, "회고 스크랩 성공");
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @챌린지_회고_전체_가져오기
 *  @route Get ?offset=&limit=&generation=
 *  @access public
 */

const getChallengeAllController = async (req: Request, res: Response) => {
  try {
    const resData: challengeDTO.getChallengeResDTO[] | -1 | -2 =
      await challengeService.getChallengeAll(
        req.body.userID?.id,
        Number(req.query.generation),
        Number(req.query.offset),
        Number(req.query.limit)
      );

    // limit 없을 때
    if (resData === -1) {
      response.basicResponse(
        res,
        returnCode.NOT_FOUND,
        "잘못된 limit 값입니다"
      );
    }
    // generation 없을 때
    else if (resData === -2) {
      response.basicResponse(
        res,
        returnCode.NOT_FOUND,
        "잘못된 generation 값입니다"
      );
    }
    // 회고 전체 불러오기 성공
    else {
      response.dataResponse(
        res,
        returnCode.OK,
        "회고 전체 불러오기 성공",
        resData
      );
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @챌린지_회고_검색_또는_필터
 *  @route Get /search?offset=&limit=&generation=&tag=&keyword=&isMine=
 *  @access public
 */

const getChallengeSearchController = async (req: Request, res: Response) => {
  try {
    const resData: challengeDTO.getChallengeResDTO[] | -1 | -2 | -3 =
      await challengeService.getChallengeSearch(
        Number(req.query.offset),
        Number(req.query.limit),
        Number(req.query.generation),
        req.body.userID?.id,
        req.query.tag ? String(req.query.tag) : undefined,
        Boolean(req.query.isMine),
        req.query.keyword ? String(req.query.keyword) : undefined
      );

    // limit 없을 때
    if (resData === -1) {
      response.basicResponse(
        res,
        returnCode.NOT_FOUND,
        "잘못된 limit 값입니다"
      );
    }
    // generation 없을 때
    else if (resData === -2) {
      response.basicResponse(
        res,
        returnCode.NOT_FOUND,
        "잘못된 generation 값입니다"
      );
    }
    // userID가 없을 때
    else if (resData === -3) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "user id가 존재하지 않습니다"
      );
    }
    // 회고 전체 불러오기 성공
    else {
      response.dataResponse(
        res,
        returnCode.OK,
        "회고 검색/필터링 성공",
        resData
      );
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @챌린지_회고_가져오기
 *  @route Get /:challengeID
 *  @access private
 */

const getChallengeOneController = async (req: Request, res: Response) => {
  try {
    const resData: challengeDTO.getChallengeResDTO | -1 =
      await challengeService.getChallengeOne(Number(req.params.challengeID));

    // challengeID가 없을 때
    if (resData === -1) {
      response.basicResponse(
        res,
        returnCode.NOT_FOUND,
        "존재하지 않는 회고입니다"
      );
    }
    // 회고 불러오기 성공
    else {
      response.dataResponse(res, returnCode.OK, "회고 불러오기 성공", resData);
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @챌린지_회고_수정
 *  @route Patch /:challengeId
 *  @access private
 */

const patchChallengeController = async (req: Request, res: Response) => {
  try {
    const reqData: challengeDTO.patchChallengeReqDTO = req.body;
    const resData: challengeDTO.patchChallengeResDTO | -1 | -2 =
      await challengeService.patchChallenge(
        Number(req.params.challengeID),
        reqData
      );

    // 요청 바디가 부족한 경우
    if (resData === -1) {
      response.basicResponse(
        res,
        returnCode.BAD_REQUEST,
        "요청 값이 올바르지 않습니다"
      );
    }
    // 회고 id가 잘못된 경우
    else if (resData === -2) {
      response.basicResponse(
        res,
        returnCode.NOT_FOUND,
        "회고 id가 존재하지 않습니다"
      );
    }
    //회고 수정 성공
    else {
      response.dataResponse(res, returnCode.OK, "회고 수정 성공", resData);
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @챌린지_회고_삭제
 *  @route Delete /challenge/:challengeId
 *  @access private
 */

const deleteChallengeController = async (req: Request, res: Response) => {
  try {
    const resData: number | undefined = await challengeService.deleteChallenge(
      Number(req.params.challengeID)
    );

    // 회고 id가 잘못된 경우
    if (resData === -1) {
      response.basicResponse(
        res,
        returnCode.NOT_FOUND,
        "회고 id가 존재하지 않습니다"
      );
    }
    // 회고 삭제 성공
    else {
      response.basicResponse(res, returnCode.NO_CONTENT, "회고 삭제 성공");
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @챌린지_회고_좋아요_삭제
 *  @route Delete /challenge/like/:challengeID
 *  @access private
 */

const deleteLikeController = async (req: Request, res: Response) => {
  try {
    const resData: number | undefined = await challengeService.deleteLike(
      Number(req.params.challengeID),
      Number(req.body.userID.id)
    );

    // 회고 id가 잘못된 경우
    if (resData === -1) {
      response.basicResponse(
        res,
        returnCode.NOT_FOUND,
        "회고 id가 존재하지 않습니다"
      );
    }
    // 좋아요 삭제 성공
    else {
      response.basicResponse(res, returnCode.NO_CONTENT, "좋아요 취소 성공");
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

/**
 *  @챌린지_회고_스크랩_삭제
 *  @route Delete /challenge/:challengeID/scrap
 *  @access private
 */

const deleteScrapController = async (req: Request, res: Response) => {
  try {
    const data: number | undefined = await challengeService.deleteScrap(
      Number(req.params.challengeID),
      Number(req.body.userID.id)
    );

    // 회고 id가 잘못된 경우
    if (data === -1) {
      response.basicResponse(
        res,
        returnCode.NOT_FOUND,
        "회고 id가 존재하지 않습니다"
      );
    }
    // 스크랩 취소 성공
    else {
      response.basicResponse(
        res,
        returnCode.NO_CONTENT,
        "회고 스크랩 취소 성공"
      );
    }
  } catch (err) {
    console.error(err.message);
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
};

const challengeController = {
  postChallengeController,
  postCommentController,
  postLikeController,
  postScrapController,
  getChallengeAllController,
  getChallengeSearchController,
  getChallengeOneController,
  patchChallengeController,
  deleteChallengeController,
  deleteLikeController,
  deleteScrapController,
};

export default challengeController;

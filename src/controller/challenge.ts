import { Router, Request, Response } from "express";
// libraries
import { returnCode } from "../library/returnCode";
import { response, dataResponse } from "../library/response";
// middlewares
import auth from "../middleware/auth";
import publicAuth from "../middleware/publicAuth";

// services
import {
  getChallengeAll,
  getChallengeSearch,
  postChallenge,
  patchChallenge,
  deleteChallenge,
  postChallengeComment,
  postChallengeLike,
  deleteChallengeLike,
  postChallengeScrap,
  deleteChallengeScrap,
  getChallengeOne,
} from "../service/challengeService";

// DTO
import { IChallengeDTO, challengeWriteReqDTO } from "../DTO/challengeDTO";
import { commentReqDTO } from "../DTO/commentDTO";

const router = Router();

/**
 *  @챌린지_회고_전체_가져오기
 *  @route Get /challenge
 *  @access public
 */

router.get("/", publicAuth, async (req: Request, res: Response) => {
  try {
    const data: IChallengeDTO[] | -1 = await getChallengeAll(
      req.body.userID,
      req.query.generation,
      req.query.offset,
      req.query.limit
    );

    // limit 없을 때
    if (data === -1) {
      response(res, returnCode.NOT_FOUND, "요청 경로가 올바르지 않습니다");
    }
    // 회고 전체 불러오기 성공
    const challengeAll = data;
    dataResponse(res, returnCode.OK, "회고 전체 불러오기 성공", challengeAll);
  } catch (err) {
    console.error(err.message);
    response(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
});

/**
 *  @챌린지_회고_검색_또는_필터
 *  @route Get /challenge/search
 *  @access public
 */

router.get("/search", publicAuth, async (req: Request, res: Response) => {
  try {
    const data: IChallengeDTO[] | -1 = await getChallengeSearch(
      req.query.tag,
      req.query.ismine,
      req.query.keyword,
      req.query.offset,
      req.query.limit,
      req.query.generation,
      req.body.userID
    );

    // limit 없을 때
    if (data === -1) {
      response(res, returnCode.NOT_FOUND, "요청 경로가 올바르지 않습니다");
    }

    // 회고 전체 불러오기 성공
    const challengeSearch = data;
    dataResponse(res, returnCode.OK, "검색 성공", challengeSearch);
  } catch (err) {
    console.error(err.message);
    response(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
});

/**
 *  @챌린지_회고_가져오기
 *  @route Get /challenge/:challengeID
 *  @access public
 */

router.get("/:id", publicAuth, async (req: Request, res: Response) => {
  try {
    const data: IChallengeDTO[] | -1 = await getChallengeOne(
      req.body.userID,
      req.params.id
    );

    // challengeID가 이상할 때
    if (data === -1) {
      response(res, returnCode.NOT_FOUND, "요청 경로가 올바르지 않습니다");
    }

    dataResponse(res, returnCode.OK, "회고 불러오기 성공", data);
  } catch (err) {
    console.error(err.message);
    response(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
});

/**
 *  @챌린지_회고_등록
 *  @route Post /challenge/:userId
 *  @access private
 */

router.post("/", auth, async (req: Request, res: Response) => {
  try {
    const reqData: challengeWriteReqDTO = req.body;
    const data = await postChallenge(req.body.userID.id, reqData);

    // 요청 바디가 부족할 경우
    if (data === -1) {
      response(res, returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다");
    }
    // 유저 id 잘못된 경우
    if (data === -2) {
      response(res, returnCode.NOT_FOUND, "요청 경로가 올바르지 않습니다");
    }
    // 회고 등록 성공
    const challenge = data;
    dataResponse(res, returnCode.OK, "회고 등록 성공", challenge);
  } catch (err) {
    console.error(err.message);
    response(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
});

/**
 *  @챌린지_회고_수정
 *  @route Patch /challenge/:challengeId
 *  @access private
 */

router.patch("/:id", auth, async (req: Request, res: Response) => {
  try {
    const reqData: challengeWriteReqDTO = req.body;
    const data = await patchChallenge(req.params.id, reqData);

    // 회고 id가 잘못된 경우
    if (data === -1) {
      response(res, returnCode.NOT_FOUND, "요청 경로가 올바르지 않습니다");
    }
    // 요청 바디가 부족한 경우
    if (data === -2) {
      response(res, returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다");
    }
    //회고 수정 성공
    const challenge = data;
    dataResponse(res, returnCode.OK, "회고 수정 성공", challenge);
  } catch (err) {
    console.error(err.message);
    response(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
});

/**
 *  @챌린지_회고_삭제
 *  @route Delete /challenge/:challengeId
 *  @access private
 */

router.delete("/:id", auth, async (req: Request, res: Response) => {
  try {
    const data = await deleteChallenge(req.body.userID.id, req.params.id);

    // 회고 id가 잘못된 경우
    if (data === -1) {
      response(res, returnCode.NOT_FOUND, "요청 경로가 올바르지 않습니다");
    }
    // 회고 삭제 성공
    const challengeID = data;
    dataResponse(res, returnCode.OK, "회고 삭제 성공", challengeID);
  } catch (err) {
    console.error(err.message);
    response(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
});

/**
 *  @챌린지_회고_댓글_등록
 *  @route Post /challenge/comment/:challengeID
 *  @access private
 */

router.post("/comment/:id", auth, async (req: Request, res: Response) => {
  try {
    const reqData: commentReqDTO = req.body;
    const data = await postChallengeComment(
      req.params.id,
      req.body.userID.id,
      reqData
    );

    // 회고 id가 잘못된 경우
    if (data === -1) {
      response(res, returnCode.NOT_FOUND, "요청 경로가 올바르지 않습니다");
    }
    //  요청 바디가 부족한 경우
    if (data === -2) {
      response(res, returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다");
    }
    // 부모 댓글 id가 잘못된 경우
    if (data === -3) {
      response(res, returnCode.BAD_REQUEST, "부모 댓글 id가 올바르지 않습니다");
    }
    // 댓글 등록 성공
    const challengeID = data;
    dataResponse(res, returnCode.OK, "댓글 등록 성공", challengeID);
  } catch (err) {
    console.error(err.message);
    response(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
});

/**
 *  @챌린지_회고_좋아요_등록
 *  @route Post /challenge/like/:challengeID
 *  @access private
 */

router.post("/like/:id", auth, async (req: Request, res: Response) => {
  try {
    const data = await postChallengeLike(req.params.id, req.body.userID.id);

    // 회고 id가 잘못된 경우
    if (data === -1) {
      response(res, returnCode.NOT_FOUND, "요청 경로가 올바르지 않습니다");
    }
    // 이미 좋아요 한 글일 경우
    if (data === -2) {
      response(res, returnCode.BAD_REQUEST, "이미 좋아요 한 글입니다");
    }
    // 좋아요 등록 성공
    const challengeID = data;
    dataResponse(res, returnCode.OK, "좋아요 등록 성공", challengeID);
  } catch (err) {
    console.error(err.message);
    response(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
});

/**
 *  @챌린지_회고_좋아요_삭제하기
 *  @route Delete /challenge/like/:challengeID
 *  @access private
 */

router.delete("/like/:id", auth, async (req: Request, res: Response) => {
  try {
    const data = await deleteChallengeLike(req.params.id, req.body.userID.id);

    // 회고 id가 잘못된 경우
    if (data === -1) {
      response(res, returnCode.NOT_FOUND, "요청 경로가 올바르지 않습니다");
    } // 좋아요 한 개수가 0인 경우
    if (data === -2) {
      response(res, returnCode.BAD_REQUEST, "좋아요 개수가 0");
    }
    // 좋아요 삭제 성공
    const challengeID = data;
    dataResponse(res, returnCode.OK, "좋아요 삭제 성공", challengeID);
  } catch (err) {
    console.error(err.message);
    response(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
});

/**
 *  @유저_챌린지_회고_스크랩하기
 *  @route Post /challenge/scrap/:challengeID
 *  @access private
 */
router.post("/scrap/:id", auth, async (req: Request, res: Response) => {
  try {
    const data = await postChallengeScrap(req.params.id, req.body.userID.id);

    // 회고 id가 잘못된 경우
    if (data === -1) {
      response(res, returnCode.NOT_FOUND, "요청 경로가 올바르지 않습니다");
    }
    // 이미 유저가 스크랩한 글일 경우
    if (data === -2) {
      response(res, returnCode.BAD_REQUEST, "이미 스크랩 된 글입니다");
    }

    // 자신의 회고인 경우
    if (data === -3) {
      response(
        res,
        returnCode.BAD_REQUEST,
        "자신의 글은 스크랩 할 수 없습니다"
      );
    }
    // 회고 스크랩 성공
    dataResponse(res, returnCode.OK, "회고 스크랩 성공", data);
  } catch (err) {
    console.error(err.message);
    response(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
});

/**
 *  @유저_챌린지_회고_스크랩_취소하기
 *  @route Delete /challenge/scrap/:challengeID
 *  @access private
 */
router.delete("/scrap/:id", auth, async (req: Request, res: Response) => {
  try {
    const data = await deleteChallengeScrap(req.params.id, req.body.userID.id);

    // 회고 id가 잘못된 경우
    if (data === -1) {
      response(res, returnCode.NOT_FOUND, "요청 아이디가 올바르지 않습니다");
    }
    // 스크랩 하지 않은 글일 경우
    if (data === -2) {
      response(res, returnCode.BAD_REQUEST, "스크랩 하지 않은 글입니다");
    }
    // 스크랩 취소 성공
    dataResponse(res, returnCode.OK, "회고 스크랩 취소 성공", data);
  } catch (err) {
    console.error(err.message);
    response(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
});

module.exports = router;

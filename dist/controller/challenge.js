"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// libraries
const library_1 = require("../library");
// services
const service_1 = require("../service");
/**
 *  @챌린지_회고_등록
 *  @route Post /
 *  @desc 회고 등록
 *  @access private
 */
const postChallengeController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reqData = req.body;
        const resData = yield service_1.challengeService.postChallenge(req.body.userID.id, reqData);
        // 요청 바디가 부족할 경우
        if (resData === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다");
        }
        // 유저 id 잘못된 경우
        else if (resData === -2) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "존재하지 않는 사용자입니다");
        }
        // 회고 등록 성공
        else {
            library_1.response.dataResponse(res, library_1.returnCode.CREATED, "챌린지 등록 성공", resData);
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
/**
 *  @챌린지_회고_댓글_등록
 *  @route Post /comment/:challengeID
 *  @desc 챌린치 댓글 달기
 *  @access private
 */
const postCommentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reqData = req.body;
        const resData = yield service_1.challengeService.postComment(Number(req.params.challengeID), req.body.userID.id, reqData);
        // 회고 id가 잘못된 경우
        if (resData === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.NOT_FOUND, "회고 id가 올바르지 않습니다");
        }
        // 요청 바디가 부족한 경우
        else if (resData === -2) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다");
        }
        // 부모 댓글 id가 잘못된 경우
        else if (resData === -3) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "부모 댓글 id가 올바르지 않습니다");
        }
        // 댓글 등록 성공
        else {
            library_1.response.basicResponse(res, library_1.returnCode.CREATED, "댓글 등록 성공");
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
/**
 *  @챌린지_회고_좋아요_등록
 *  @route Post /:challengeID/like
 *  @desc 챌린치 좋아요 등록하기
 *  @access private
 */
const postLikeController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resData = yield service_1.challengeService.postLike(Number(req.params.challengeID), req.body.userID.id);
        // 회고 id가 잘못된 경우
        if (resData === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.NOT_FOUND, "회고 id가 올바르지 않습니다");
        }
        // 이미 좋아요 한 글일 경우
        else if (resData === -2) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "이미 좋아요 한 글입니다");
        }
        // 좋아요 등록 성공
        else {
            library_1.response.basicResponse(res, library_1.returnCode.NO_CONTENT, "좋아요 등록 성공");
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
/**
 *  @유저_챌린지_회고_스크랩하기
 *  @route Post /:challengeID/scrap
 *  @desc 챌린치 좋아요 등록하기
 *  @access private
 */
const postScrapController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resData = yield service_1.challengeService.postScrap(Number(req.params.challengeID), req.body.userID.id);
        // 회고 id가 잘못된 경우
        if (resData === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.NOT_FOUND, "회고 id가 올바르지 않습니다");
        }
        // 이미 유저가 스크랩한 글일 경우
        else if (resData === -2) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "이미 스크랩 한 글입니다");
        }
        // 자신의 회고인 경우
        else if (resData === -3) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "자신의 글은 스크랩 할 수 없습니다");
        }
        // 회고 스크랩 성공
        else {
            library_1.response.basicResponse(res, library_1.returnCode.NO_CONTENT, "회고 스크랩 성공");
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
/**
 *  @챌린지_회고_전체_가져오기
 *  @route Get ?offset=&limit=&generation=
 *  @access public
 */
const getChallengeAllController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const resData = yield service_1.challengeService.getChallengeAll((_a = req.body.userID) === null || _a === void 0 ? void 0 : _a.id, Number(req.query.generation), Number(req.query.offset), Number(req.query.limit));
        // limit 없을 때
        if (resData === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.NOT_FOUND, "잘못된 limit 값입니다");
        }
        // generation 없을 때
        else if (resData === -2) {
            library_1.response.basicResponse(res, library_1.returnCode.NOT_FOUND, "잘못된 generation 값입니다");
        }
        // 회고 전체 불러오기 성공
        else {
            library_1.response.dataResponse(res, library_1.returnCode.OK, "회고 전체 불러오기 성공", resData);
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
/**
 *  @챌린지_회고_검색_또는_필터
 *  @route Get /search?offset=&limit=&generation=&tag=&keyword=&isMine=
 *  @access public
 */
const getChallengeSearchController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const resData = yield service_1.challengeService.getChallengeSearch(Number(req.query.offset), Number(req.query.limit), Number(req.query.generation), (_b = req.body.userID) === null || _b === void 0 ? void 0 : _b.id, req.query.tag ? String(req.query.tag) : undefined, Boolean(req.query.ismine), req.query.keyword ? String(req.query.keyword) : undefined);
        // limit 없을 때
        if (resData === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.NOT_FOUND, "잘못된 limit 값입니다");
        }
        // generation 없을 때
        else if (resData === -2) {
            library_1.response.basicResponse(res, library_1.returnCode.NOT_FOUND, "잘못된 generation 값입니다");
        }
        // userID가 없을 때
        else if (resData === -3) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "user id가 존재하지 않습니다");
        }
        // 회고 전체 불러오기 성공
        else {
            library_1.response.dataResponse(res, library_1.returnCode.OK, "회고 검색/필터링 성공", resData);
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
/**
 *  @챌린지_회고_가져오기
 *  @route Get /:challengeID
 *  @access private
 */
const getChallengeOneController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resData = yield service_1.challengeService.getChallengeOne(Number(req.params.challengeID), Number(req.body.userID.id));
        // challengeID가 없을 때
        if (resData === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.NOT_FOUND, "존재하지 않는 회고입니다");
        }
        // 회고 불러오기 성공
        else {
            library_1.response.dataResponse(res, library_1.returnCode.OK, "회고 불러오기 성공", resData);
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
/**
 *  @챌린지_회고_수정
 *  @route Patch /:challengeId
 *  @access private
 */
const patchChallengeController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reqData = req.body;
        const resData = yield service_1.challengeService.patchChallenge(Number(req.params.challengeID), reqData);
        // 요청 바디가 부족한 경우
        if (resData === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다");
        }
        // 회고 id가 잘못된 경우
        else if (resData === -2) {
            library_1.response.basicResponse(res, library_1.returnCode.NOT_FOUND, "회고 id가 존재하지 않습니다");
        }
        //회고 수정 성공
        else {
            library_1.response.dataResponse(res, library_1.returnCode.OK, "회고 수정 성공", resData);
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
/**
 *  @챌린지_회고_삭제
 *  @route Delete /challenge/:challengeId
 *  @access private
 */
const deleteChallengeController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resData = yield service_1.challengeService.deleteChallenge(Number(req.params.challengeID));
        // 회고 id가 잘못된 경우
        if (resData === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.NOT_FOUND, "회고 id가 존재하지 않습니다");
        }
        // 회고 삭제 성공
        else {
            library_1.response.basicResponse(res, library_1.returnCode.NO_CONTENT, "회고 삭제 성공");
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
/**
 *  @챌린지_회고_좋아요_삭제
 *  @route Delete /challenge/like/:challengeID
 *  @access private
 */
const deleteLikeController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resData = yield service_1.challengeService.deleteLike(Number(req.params.challengeID), Number(req.body.userID.id));
        // 회고 id가 잘못된 경우
        if (resData === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.NOT_FOUND, "회고 id가 존재하지 않습니다");
        }
        // 좋아요 삭제 성공
        else {
            library_1.response.basicResponse(res, library_1.returnCode.NO_CONTENT, "좋아요 취소 성공");
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
/**
 *  @챌린지_회고_스크랩_삭제
 *  @route Delete /challenge/:challengeID/scrap
 *  @access private
 */
const deleteScrapController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield service_1.challengeService.deleteScrap(Number(req.params.challengeID), Number(req.body.userID.id));
        // 회고 id가 잘못된 경우
        if (data === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.NOT_FOUND, "회고 id가 존재하지 않습니다");
        }
        // 스크랩 취소 성공
        else {
            library_1.response.basicResponse(res, library_1.returnCode.NO_CONTENT, "회고 스크랩 취소 성공");
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
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
exports.default = challengeController;
//# sourceMappingURL=challenge.js.map
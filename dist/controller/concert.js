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
 *  @오투콘서트_전체_가져오기
 *  @route Get /concert?offset=@&limit=
 *  @access public
 */
const getConcertAllController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const resData = yield service_1.concertService.getConcertAll((_a = req.body.userID) === null || _a === void 0 ? void 0 : _a.id, Number(req.query.offset), Number(req.query.limit));
        // 요청 데이터가 부족할 때
        if (resData === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.NOT_FOUND, "요청 데이터가 부족합니다.");
        }
        else {
            // 회고 전체 불러오기 성공
            library_1.response.dataResponse(res, library_1.returnCode.OK, "콘서트 전체 불러오기 성공", resData);
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
/**
 *  @오투콘서트_검색_또는_필터
 *  @route Get /concert/search?offset=&limit=&tag=&keyword=
 *  @access public
 */
const getConcertSearchController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const resData = yield service_1.concertService.getConcertSearch(Number(req.query.offset), Number(req.query.limit), (_b = req.body.userID) === null || _b === void 0 ? void 0 : _b.id, req.query.tag ? String(req.query.tag) : undefined, req.query.keyword ? String(req.query.keyword) : undefined);
        // limit 없을 때
        if (resData === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.NOT_FOUND, "요청 경로가 올바르지 않습니다");
        }
        else {
            // 검색 불러오기 성공
            library_1.response.dataResponse(res, library_1.returnCode.OK, "검색 성공", resData);
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
/**
 *  @오투콘서트_Detail
 *  @route Get /concert/:concertID
 *  @access public
 *  @error
 *    1. 올바르지 않은 게시글
 */
const getConcertDetailController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const resData = yield service_1.concertService.getConcertOne((_c = req.body.userID) === null || _c === void 0 ? void 0 : _c.id, Number(req.params.concertID));
        if (resData === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.NOT_FOUND, "존재하지 않는 게시글입니다");
        }
        else {
            library_1.response.dataResponse(res, library_1.returnCode.OK, "해당 콘서트 게시글 불러오기 성공", resData);
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
/**
 *  @콘서트_댓글_등록
 *  @route Post /concert/comment/:concertID
 *  @access private
 */
const postConcertCommentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reqData = req.body;
        const resData = yield service_1.concertService.postConcertComment(Number(req.params.concertID), req.body.userID.id, reqData);
        // 회고 id가 잘못된 경우
        if (resData === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.NOT_FOUND, "요청 경로가 올바르지 않습니다");
        }
        //  요청 바디가 부족한 경우
        else if (resData === -2) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다");
        }
        // 부모 댓글 id가 잘못된 경우
        else if (resData === -3) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "부모 댓글 id가 올바르지 않습니다");
        }
        else {
            // 댓글 등록 성공
            library_1.response.basicResponse(res, library_1.returnCode.CREATED, "댓글 등록 성공");
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
/**
 *  @오투콘서트_좋아요_등록
 *  @route Post /concert/like/:concertID
 *  @access private
 */
const postConcertLikeController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resData = yield service_1.concertService.postConcertLike(Number(req.params.concertID), req.body.userID.id);
        // 회고 id가 잘못된 경우
        if (resData === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.NOT_FOUND, "요청 경로가 올바르지 않습니다");
        }
        // 이미 좋아요 한 글일 경우
        else if (resData === -2) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "이미 좋아요 한 글입니다");
        }
        else {
            // 좋아요 등록 성공
            library_1.response.basicResponse(res, library_1.returnCode.CREATED, "좋아요 등록 성공");
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
/**
 *  @오투콘서트_좋아요_삭제하기
 *  @route Delete /concert/like/:concertID
 *  @access private
 */
const deleteConcertLikeController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resData = yield service_1.concertService.deleteConcertLike(Number(req.params.concertID), Number(req.body.userID.id));
        // 콘서트 id가 잘못된 경우
        if (resData === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.NOT_FOUND, "요청 경로가 올바르지 않습니다");
        } // 좋아요 한 개수가 0인 경우
        else if (resData === -2) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "해당 게시글을 좋아요하지 않았습니다");
        }
        else {
            // 좋아요 삭제 성공
            library_1.response.basicResponse(res, library_1.returnCode.OK, "좋아요 삭제 성공");
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
/**
 *  @유저_챌린지_회고_스크랩하기
 *  @route Post /concert/scrap/:concertID
 *  @access private
 */
const postConcertScrapController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resData = yield service_1.concertService.postConcertScrap(Number(req.params.concertID), Number(req.body.userID.id));
        // 회고 id가 잘못된 경우
        if (resData === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.NOT_FOUND, "요청 경로가 올바르지 않습니다");
        }
        // 이미 유저가 스크랩한 글일 경우
        else if (resData === -2) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "이미 스크랩 된 글입니다");
        }
        //자신의 회고인 경우
        else if (resData === -3) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "자신의 글은 스크랩 할 수 없습니다");
        }
        else {
            // 회고 스크랩 성공
            library_1.response.basicResponse(res, library_1.returnCode.CREATED, "콘서트 스크랩 성공");
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
/**
 *  @오투콘서트_회고_스크랩_취소하기
 *  @route Delete /concert/scrap/:concertID
 *  @access private
 */
const deleteConcertScrapController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resData = yield service_1.concertService.deleteConcertScrap(Number(req.params.concertID), Number(req.body.userID.id));
        // 콘서트 id가 잘못된 경우
        if (resData === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.NOT_FOUND, "요청 경로가 올바르지 않습니다");
        }
        // 스크랩 하지 않은 글일 경우
        else if (resData === -2) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "스크랩 하지 않은 글입니다");
        }
        else {
            // 스크랩 취소 성공
            library_1.response.basicResponse(res, library_1.returnCode.OK, "콘서트 스크랩 취소 성공");
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
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
exports.default = concertController;
//# sourceMappingURL=concert.js.map
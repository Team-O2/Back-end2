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
 *  @오투공지사항_전체_가져오기
 *  @route Get /notice?offset=@&limit=
 *  @access public
 */
const getNoticeAllController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const resData = yield service_1.noticeService.getNoticeAll((_a = req.body.userID) === null || _a === void 0 ? void 0 : _a.id, Number(req.query.offset), Number(req.query.limit));
        // 요청 데이터가 부족할 때
        if (resData === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.NOT_FOUND, "요청 데이터가 부족합니다.");
        }
        else {
            // 회고 전체 불러오기 성공
            library_1.response.dataResponse(res, library_1.returnCode.OK, "공지사항 전체 불러오기 성공", resData);
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
/**
 *  @오투공지사항_검색_또는_필터
 *  @route Get /notice/search?offset=&limit=&tag=&keyword=
 *  @access public
 */
const getNoticeSearchController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const resData = yield service_1.noticeService.getNoticeSearch(Number(req.query.offset), Number(req.query.limit), (_b = req.body.userID) === null || _b === void 0 ? void 0 : _b.id, req.query.tag ? String(req.query.tag) : undefined, req.query.keyword ? String(req.query.keyword) : undefined);
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
 *  @오투공지사항_Detail
 *  @route Get /notice/:noticeID
 *  @access public
 *  @error
 *    1. 올바르지 않은 게시글
 */
const getNoticeDetailController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const resData = yield service_1.noticeService.getNoticeOne((_c = req.body.userID) === null || _c === void 0 ? void 0 : _c.id, Number(req.params.noticeID));
        if (resData === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.NOT_FOUND, "존재하지 않는 게시글입니다");
        }
        else {
            library_1.response.dataResponse(res, library_1.returnCode.OK, "해당 공지사항 게시글 불러오기 성공", resData);
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
/**
 *  @공지사항_댓글_등록
 *  @route Post /notice/comment/:noticeID
 *  @access private
 */
const postNoticeCommentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reqData = req.body;
        const resData = yield service_1.noticeService.postNoticeComment(Number(req.params.noticeID), req.body.userID.id, reqData);
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
const noticeController = {
    getNoticeAllController,
    getNoticeDetailController,
    getNoticeSearchController,
    postNoticeCommentController,
};
exports.default = noticeController;
//# sourceMappingURL=notice.js.map
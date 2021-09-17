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
 *  @관리자_페이지_조회
 *  @route Get /admin?offset=&limit=
 *  @access private
 */
const getAdminListController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resData = yield service_1.adminService.getAdminList(Number(req.body.userID.id), Number(req.query.offset), Number(req.query.limit));
        // limit 없을 때
        if (resData === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다");
        }
        // 유저 id가 관리자가 아님
        else if (resData === -2) {
            library_1.response.basicResponse(res, library_1.returnCode.NOT_FOUND, "관리자 아이디가 아닙니다");
        }
        // 관리자 챌린지 조회 성공
        else {
            library_1.response.dataResponse(res, library_1.returnCode.OK, "관리자 페이지 조회 성공", resData);
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
/**
 *  @관리자_챌린지_등록
 *  @route Post admin/challenge
 *  @access private
 */
const postAdminChallengeController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = {
            img: req.files.img
                ? req.files.img[0].location
                : "https://o2-server.s3.ap-northeast-2.amazonaws.com/default_O2_Logo%403x.png",
        };
        const reqData = req.body;
        const data = yield service_1.adminService.postAdminChallenge(req.body.userID.id, reqData, url);
        // 요청 바디가 부족할 경우
        if (data === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다");
        }
        // 유저 id가 관리자가 아님
        else if (data === -2) {
            library_1.response.basicResponse(res, library_1.returnCode.NOT_FOUND, "관리자 아이디가 아닙니다");
        }
        // 챌린지 기간이 신청 기간보다 빠른 경우 or 기간 입력이 잘못된 경우
        else if (data === -3) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "잘못된 기간을 입력하셨습니다");
        }
        // 관리자 챌린지 등록 성공
        else {
            library_1.response.basicResponse(res, library_1.returnCode.OK, "관리자 챌린지 등록 성공");
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
/**
 *  @관리자_챌린지_신청페이지
 *  @route Get admin/regist
 *  @access public
 */
const getAdminRegistController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resData = yield service_1.adminService.getAdminRegist();
        // 현재 진행중인 기수가 없음
        if (resData === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "현재 신청 기간인 기수가 없습니다");
        }
        // 챌린지 신청 페이지 조회 성공
        else {
            library_1.response.dataResponse(res, library_1.returnCode.OK, "신청 페이지 조회 성공", resData);
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
/**
 *  @관리자_콘서트_등록
 *  @route Post admin/concert
 *  @access private
 */
const postAdminConcertController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = {
            videoLink: req.files.videoLink
                ? req.files.videoLink[0].location
                : "",
            imgThumbnail: req.files.imgThumbnail
                ? req.files.imgThumbnail[0].location
                : "https://o2-server.s3.ap-northeast-2.amazonaws.com/default_O2_Logo%403x.png",
        };
        const reqData = req.body;
        const resData = yield service_1.adminService.postAdminConcert(Number(req.body.userID.id), reqData, url);
        // 요청 바디가 부족할 경우
        if (resData === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다");
        }
        // 유저 id가 관리자가 아님
        else if (resData === -2) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "관리자 아이디가 아닙니다");
        }
        // 관리자 챌린지 등록 성공
        else {
            library_1.response.basicResponse(res, library_1.returnCode.CREATED, "관리자 오투콘서트 등록 성공");
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
/**
 *  @관리자_공지사항_등록
 *  @route Post admin/notice
 *  @access private
 */
const postAdminNoticeController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = {
            videoLink: req.files.videoLink
                ? req.files.videoLink[0].location
                : "",
            imgThumbnail: req.files.imgThumbnail
                ? req.files.imgThumbnail[0].location
                : "https://o2-server.s3.ap-northeast-2.amazonaws.com/default_O2_Logo%403x.png",
        };
        const reqData = req.body;
        const data = yield service_1.adminService.postAdminNotice(Number(req.body.userID.id), reqData, url);
        // 요청 바디가 부족할 경우
        if (data === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다");
        }
        // 유저 id가 관리자가 아님
        else if (data === -2) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "관리자 아이디가 아닙니다");
        }
        // 관리자 공지사항 등록 성공
        else {
            library_1.response.basicResponse(res, library_1.returnCode.CREATED, "관리자 공지사항 등록 성공");
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
const adminController = {
    getAdminListController,
    getAdminRegistController,
    postAdminConcertController,
    postAdminNoticeController,
    postAdminChallengeController,
};
exports.default = adminController;
//# sourceMappingURL=admin.js.map
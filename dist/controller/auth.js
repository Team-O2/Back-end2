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
const express_validator_1 = require("express-validator");
// libraries
const library_1 = require("../library");
// services
const service_1 = require("../service");
/**
 *  @회원가입
 *  @route Post auth/signup
 *  @access public
 */
const signupController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 이메일 형식이 잘못된 경우
    const errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
        return library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다");
    }
    try {
        const reqData = req.body;
        const data = yield service_1.authService.postSignup(reqData);
        // 요청 바디가 부족할 경우
        if (data === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다");
        } // 이미 존재하는 아이디
        else if (data === -2) {
            library_1.response.basicResponse(res, library_1.returnCode.CONFLICT, "중복된 아이디 입니다");
        }
        // 중복된 닉네임
        else if (data === -3) {
            library_1.response.basicResponse(res, library_1.returnCode.CONFLICT, "중복된 닉네임 입니다");
        }
        // 회원가입 성공
        else {
            const { user, token } = data;
            library_1.response.tokenResponse(res, library_1.returnCode.CREATED, "회원가입 성공", token);
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
/**
 *  @로그인
 *  @route Post auth/signin
 *  @desc Authenticate user & get token
 *  @access public
 */
const signinController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 이메일 형식이 잘못된 경우
    const errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
        return library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다");
    }
    try {
        const reqData = req.body;
        const data = yield service_1.authService.postSignin(reqData);
        // 요청 바디가 부족할 경우
        if (data == -1) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다");
        }
        // email이 DB에 없을 경우
        else if (data == -2) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "아이디가 존재하지 않습니다");
        }
        // password가 틀렸을 경우
        else if (data == -3) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "비밀번호가 틀렸습니다");
        }
        // 로그인 성공
        else {
            const { userData, token } = data;
            library_1.response.dataTokenResponse(res, library_1.returnCode.OK, "로그인 성공", userData, token);
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
/**
 *  @이메일_인증번호_전송
 *  @route Post auth/email
 *  @desc post email code for certification
 *  @access Public
 */
const postEmailController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 이메일 형식이 잘못된 경우
    const errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
        return library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다");
    }
    try {
        const reqData = req.body;
        const resData = yield service_1.authService.postEmail(reqData);
        // 요청 바디가 부족할 경우
        if (resData === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다");
        }
        // email이 DB에 없을 경우
        else if (resData === -2) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "아이디가 존재하지 않습니다");
        }
        // 이메일 전송이 실패한 경우
        else if (resData === -3) {
            library_1.response.basicResponse(res, library_1.returnCode.SERVICE_UNAVAILABLE, "이메일 전송이 실패하였습니다");
        }
        // 성공
        else {
            library_1.response.basicResponse(res, library_1.returnCode.NO_CONTENT, "인증번호 전송 성공");
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
/**
 *  @인증번호_확인
 *  @route Post auth/code
 *  @desc check the certification code
 *  @access Public
 */
const postCodeController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 이메일 형식이 잘못된 경우
    const errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
        return library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다");
    }
    try {
        const reqData = req.body;
        const resData = yield service_1.authService.postCode(reqData);
        // 요청 바디가 부족할 경우
        if (resData === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다");
        }
        // email이 DB에 없을 경우
        if (resData === -2) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "아이디가 존재하지 않습니다");
        }
        // 인증번호가 올바르지 않은 경우
        if (resData === -3) {
            library_1.response.dataResponse(res, library_1.returnCode.OK, "인증번호 인증 실패", {
                isOkay: false,
            });
        }
        // 인증번호 인증 성공
        library_1.response.dataResponse(res, library_1.returnCode.OK, "인증번호 인증 성공", {
            isOkay: true,
        });
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
/**
 *  @비밀번호_변경
 *  @route Patch auth/pw
 *  @desc change password
 *  @access Public
 */
const patchPasswordController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 이메일 형식 또는 비밀번호 형식이 잘못된 경우
    const errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
        return library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다");
    }
    try {
        const reqData = req.body;
        const data = yield service_1.authService.patchPassword(reqData);
        // 요청 바디가 부족할 경우
        if (data === -1) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "요청 값이 올바르지 않습니다");
        }
        // email이 DB에 없을 경우
        else if (data === -2) {
            library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "아이디가 존재하지 않습니다");
        }
        // 성공
        else {
            library_1.response.basicResponse(res, library_1.returnCode.NO_CONTENT, "비밀번호 변경 성공");
        }
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
/**
 *  @햄버거바
 *  @route Post auth/hamburger
 *  @desc
 *  @access public
 */
const hamburgerController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield service_1.authService.getHamburger();
        // 조회 성공
        library_1.response.dataResponse(res, library_1.returnCode.OK, "햄버거바 조회 성공", data);
    }
    catch (err) {
        console.error(err.message);
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
});
const authController = {
    signinController,
    signupController,
    hamburgerController,
    postEmailController,
    postCodeController,
    patchPasswordController,
};
exports.default = authController;
//# sourceMappingURL=auth.js.map
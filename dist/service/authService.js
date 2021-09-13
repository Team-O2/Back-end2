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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchPassword = exports.postCode = void 0;
// models
const models_1 = require("../models");
// library
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = __importDefault(require("../config"));
const library_1 = require("../library");
const ejs_1 = __importDefault(require("ejs"));
const sequelize_1 = __importDefault(require("sequelize"));
/**
 *  @회원가입
 *  @route Post /auth/signup
 *  @body email,password, nickname, marpolicy, interest
 *  @access public
 *  @error
 *      1. 요청 바디 부족
 *      2. 아이디 중복
 */
const postSignup = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, nickname, isMarketing, interest } = data;
    // 1. 요청 바디 부족
    if (!email || !password || !nickname || !interest) {
        return -1;
    }
    // 2. 아이디 중복
    const existUser = yield models_1.User.findOne({ where: { email: email } });
    if (existUser) {
        return -2;
    }
    // 3. 닉네임 중복
    const checkNickname = yield models_1.User.findOne({ where: { nickname: nickname } });
    if (checkNickname) {
        return -3;
    }
    // password 암호화
    const salt = yield bcryptjs_1.default.genSalt(10);
    const hashPassword = yield bcryptjs_1.default.hash(password, salt);
    // User 생성
    const user = yield models_1.User.create({
        email,
        password: hashPassword,
        nickname,
        isMarketing,
        interest: interest.join(","),
    });
    // Badge 생성
    const badge = yield models_1.Badge.create({
        id: user.id,
    });
    // 마케팅 동의(isMarketing == true) 시 뱃지 발급
    if (user.isMarketing) {
        badge.marketingBadge = true;
        yield badge.save();
    }
    // Return jsonwebtoken
    const payload = {
        user: {
            id: user.id,
        },
    };
    // access 토큰 발급
    // 유효기간 14일
    let token = jsonwebtoken_1.default.sign(payload, config_1.default.jwtSecret, { expiresIn: "14d" });
    return { user, token };
});
/**
 *  @로그인
 *  @route Post auth/siginin
 *  @body email,password
 *  @error
 *      1. 요청 바디 부족
 *      2. 아이디가 존재하지 않음
 *      3. 패스워드가 올바르지 않음
 *  @response
 *      0: 비회원,
 *      1: 챌린지안하는유저 (기간은 신청기간 중)
 *      2: 챌린지 안하는 유저 (기간은 신청기간이 아님)
 *      3: 챌린지 하는 유저 (기간은 챌린지 중)
 *      4: 관리자
 */
function postSignin(reqData) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password } = reqData;
        // 1. 요청 바디 부족
        if (!email || !password) {
            return -1;
        }
        // 2. email이 DB에 존재하지 않음
        const user = yield models_1.User.findOne({ where: { email: email } });
        if (!user) {
            return -2;
        }
        // 3. password가 올바르지 않음
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return -3;
        }
        yield user.save();
        const payload = {
            user: {
                id: user.id,
            },
        };
        // access 토큰 발급
        // 유효기간 14일
        let token = jsonwebtoken_1.default.sign(payload, config_1.default.jwtSecret, { expiresIn: "14d" });
        let userState = 0;
        // 신청 진행 중 기수(generation)를 확인하여 오투콘서트에 삽입
        let dateNow = new Date();
        const gen = yield models_1.Admin.findOne({
            where: {
                [sequelize_1.default.Op.and]: {
                    registerStartDT: { [sequelize_1.default.Op.lte]: dateNow },
                    registerEndDT: { [sequelize_1.default.Op.gte]: dateNow },
                },
            },
        });
        const progressGen = yield models_1.Admin.findOne({
            where: {
                [sequelize_1.default.Op.and]: {
                    challengeStartDT: { [sequelize_1.default.Op.lte]: dateNow },
                    challengeEndDT: { [sequelize_1.default.Op.gte]: dateNow },
                },
            },
        });
        let registGeneration = gen ? gen.generation : null;
        let progressGeneration = null;
        if (progressGen) {
            progressGeneration = progressGen.generation;
        }
        // UserState 등록
        // 4-관리자
        if (user.isAdmin === true) {
            userState = 4;
            registGeneration = null;
        }
        // 챌린지 안하는 유저
        else if (!user.isChallenge) {
            // 1- 해당 날짜에 신청 가능한 기수가 있음
            if (gen) {
                userState = 1;
            }
            // 2- 해당 날짜에 신청 가능한 기수가 없음
            else {
                userState = 2;
            }
        }
        // 3- 챌린지 중인 유저
        else {
            userState = 3;
        }
        let totalGeneration = yield (yield models_1.Admin.findAndCountAll({})).count;
        const userData = {
            userState,
            progressGeneration,
            registGeneration,
            totalGeneration,
        };
        return { userData, token };
    });
}
/**
 *  @햄버거바
 *  @route Post auth/hamburger
 *  @desc
 *  @access public
 */
const getHamburger = () => __awaiter(void 0, void 0, void 0, function* () {
    // 신청 진행 중 기수(generation)를 확인하여 오투콘서트에 삽입
    let dateNow = new Date();
    const gen = yield models_1.Admin.findOne({
        where: {
            [sequelize_1.default.Op.and]: {
                registerStartDT: { [sequelize_1.default.Op.lte]: dateNow },
                registerEndDT: { [sequelize_1.default.Op.gte]: dateNow },
            },
        },
    });
    const progressGen = yield models_1.Admin.findOne({
        where: {
            [sequelize_1.default.Op.and]: {
                challengeStartDT: { [sequelize_1.default.Op.lte]: dateNow },
                challengeEndDT: { [sequelize_1.default.Op.gte]: dateNow },
            },
        },
    });
    var registGeneration = gen ? gen.generation : null;
    var progressGeneration = null;
    if (progressGen) {
        progressGeneration = progressGen.generation;
    }
    const resData = {
        progressGeneration,
        registGeneration,
    };
    return resData;
});
/**
 *  @이메일_인증번호_전송
 *  @route Post auth/email
 *  @body email
 *  @error
 *      1. 요청 바디 부족
 *      2. 이매일이 DB에 존재하지 않음
 *      3. 이메일 전송 실패
 */
const postEmail = (body) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = body;
    // 1. 요청 바디 부족
    if (!email) {
        return -1;
    }
    // 2. email이 DB에 존재하지 않음
    const user = yield models_1.User.findOne({ where: { email } });
    if (!user) {
        return -2;
    }
    // 인증번호를 user에 저장 -> 제한 시간 설정하기!
    const authNum = Math.random().toString().substr(2, 6);
    user.emailCode = authNum;
    yield user.save();
    let emailTemplate;
    ejs_1.default.renderFile("src/library/emailTemplete.ejs", { authCode: authNum }, (err, data) => {
        if (err) {
            console.log(err);
        }
        emailTemplate = data;
    });
    const mailOptions = {
        front: process.env.EMAIL_ADDRESS,
        to: email,
        subject: "O2 이메일 인증번호입니다.",
        text: "O2 이메일 인증번호 입니다.",
        html: emailTemplate,
    };
    library_1.emailSender.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return -3;
        }
        else {
            console.log("success");
        }
        library_1.emailSender.close();
    });
    return undefined;
});
/**
 *  @인증번호_인증
 *  @route Post auth/code
 *  @body email, emailCode
 *  @error
 *      1. 요청 바디 부족
 *      2. 유저가 존재하지 않음
 *      3. 인증번호 인증 실패
 */
function postCode(body) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, emailCode } = body;
        // 1. 요청 바디 부족
        if (!email || !emailCode) {
            return -1;
        }
        // 2. 유저가 존재하지 않음
        // isDeleted = false 인 유저를 찾아야함
        // 회원 탈퇴했다가 다시 가입한 경우 생각하기
        const user = yield models_1.User.findOne({ where: { email } });
        if (!user) {
            return -2;
        }
        if (emailCode !== user.emailCode) {
            // 인증번호가 일치하지 않음
            return -3;
        }
        // 인증번호 일치
        return undefined;
    });
}
exports.postCode = postCode;
/**
 *  @비밀번호_재설정
 *  @route Patch auth/pw
 *  @body email, password
 *  @error
 *      1. 요청 바디 부족
 *      2. 아이디가 존재하지 않음
 */
function patchPassword(reqData) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password } = reqData;
        // 1. 요청 바디 부족
        if (!email || !password) {
            return -1;
        }
        // 2. email이 DB에 존재하지 않음
        const user = yield models_1.User.findOne({ where: { email } });
        if (!user) {
            return -2;
        }
        // 비밀번호 변경 로직
        // Encrpyt password
        const salt = yield bcryptjs_1.default.genSalt(10);
        user.password = yield bcryptjs_1.default.hash(password, salt);
        yield user.save();
        return;
    });
}
exports.patchPassword = patchPassword;
const authService = {
    postSignup,
    postSignin,
    getHamburger,
    postEmail,
    postCode,
    patchPassword,
};
exports.default = authService;
//# sourceMappingURL=authService.js.map
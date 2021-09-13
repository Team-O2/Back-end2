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
exports.postAdminNotice = exports.postAdminConcert = exports.getAdminRegist = exports.postAdminChallenge = exports.getAdminList = void 0;
const sequelize_1 = __importDefault(require("sequelize"));
// models
const models_1 = require("../models");
// library
const library_1 = require("../library");
/**
 *  @관리자_페이지_조회
 *  @route Get /admin?offset=&limit=
 *  @body
 *  @error
 *      1. 유저 id가 관리자가 아님
 */
const getAdminList = (userID, offset, limit) => __awaiter(void 0, void 0, void 0, function* () {
    // isDelete = true 인 애들만 가져오기
    // offset 뒤에서 부터 가져오기
    // 최신순으로 정렬
    // 댓글, 답글 최신순으로 정렬
    if (!offset) {
        offset = 0;
    }
    // 1. 요청 부족
    if (!limit) {
        return -1;
    }
    // 2. 유저 id가 관리자가 아님
    const user = yield models_1.User.findOne({
        where: { id: userID },
        attributes: ["isAdmin", "nickName"],
    });
    if (user.isAdmin === false) {
        return -2;
    }
    const admins = yield models_1.Admin.findAll({
        order: [["generation", "DESC"]],
        limit,
        offset,
    });
    const adminList = yield Promise.all(admins.map((admin) => __awaiter(void 0, void 0, void 0, function* () {
        // 해당 기수 글 작성자
        const participantList = yield models_1.Post.findAll({
            where: { generation: admin.generation },
            include: [
                {
                    model: models_1.Challenge,
                    required: true,
                },
            ],
            attributes: [[sequelize_1.default.fn("count", sequelize_1.default.col("userID")), "count"]],
        });
        // 해당 기수 글 개수
        const postNum = yield models_1.Post.findAll({
            where: { generation: admin.generation },
            include: [
                {
                    model: models_1.Challenge,
                    required: true,
                },
            ],
        });
        let returnData = {
            registerStartDT: admin.registerStartDT,
            registerEndDT: admin.registerEndDT,
            challengeStartDT: admin.challengeStartDT,
            challengeEndDT: admin.challengeEndDT,
            generation: admin.generation,
            createdAT: admin.createdAT,
            applyNum: admin.applyNum,
            participants: participantList.length,
            postNum: postNum.length,
            img: admin.img,
        };
        return returnData;
    })));
    const totalAdmin = yield models_1.Admin.findAll();
    const resData = {
        offsetAdmin: adminList,
        totalAdminNum: totalAdmin.length,
    };
    return resData;
});
exports.getAdminList = getAdminList;
/**
 *  @관리자_챌린지_등록
 *  @route Post admin/challenge
 *  @body registerStartDT, registerEndDT, challengeStartDT, challengeEndDT, limitNum, img
 *  @access private
 *  @error
 *      1. 요청 바디 부족
 *      2. 유저 id가 관리자가 아님
 *      3. 챌린지 기간이 잘못됨
 */
const postAdminChallenge = (userID, reqData, url) => __awaiter(void 0, void 0, void 0, function* () {
    const img = url.img;
    const { title, registerStartDT, registerEndDT, challengeStartDT, challengeEndDT, limitNum, } = reqData;
    // 1. 요청 바디 부족
    if (!title ||
        !registerStartDT ||
        !registerEndDT ||
        !challengeStartDT ||
        !challengeEndDT ||
        !limitNum) {
        return -1;
    }
    // 2. 유저 id가 관리자가 아님
    const user = yield models_1.User.findOne({
        where: { id: userID },
        attributes: ["isAdmin", "nickName"],
    });
    if (user.isAdmin === false) {
        return -2;
    }
    //기수 증가
    const changeGen = (yield (yield models_1.Admin.findAll()).length) + 1;
    yield models_1.Admin.create({
        title,
        registerStartDT: library_1.date.stringToDate(registerStartDT),
        registerEndDT: library_1.date.stringToEndDate(registerEndDT),
        challengeStartDT: library_1.date.stringToDate(challengeStartDT),
        challengeEndDT: library_1.date.stringToEndDate(challengeEndDT),
        generation: changeGen,
        limitNum,
        img,
    });
    // 3. 챌린지 기간이 잘못됨
    // 신청 마감날짜가 신청 시작 날짜보다 빠름
    if (registerEndDT < registerStartDT) {
        return -3;
    }
    // 챌린지 끝나는 날짜가 챌린지 시작하는 날짜보다 빠름
    else if (challengeEndDT < challengeStartDT) {
        return -3;
    }
    // 챌린지가 시작하는 날짜가 신청 마감 날짜보다 빠름
    else if (challengeStartDT < registerEndDT) {
        return -3;
    }
    return 1;
});
exports.postAdminChallenge = postAdminChallenge;
/**
 *  @관리자_챌린지_신청페이지
 *  @route Get admin/regist
 *  @access public
 */
const getAdminRegist = () => __awaiter(void 0, void 0, void 0, function* () {
    // 신청 기간을 확인 현재 진행중인 기수를 가져옴
    let dateNow = new Date();
    const admin = yield models_1.Admin.findOne({
        where: {
            [sequelize_1.default.Op.and]: {
                registerStartDT: { [sequelize_1.default.Op.lte]: dateNow },
                registerEndDT: { [sequelize_1.default.Op.gte]: dateNow },
            },
        },
    });
    // 현재 진행중인 기수가 없음
    if (!admin) {
        return -1;
    }
    const resData = {
        img: admin.img,
        title: admin.title,
        registerStartDT: admin.registerStartDT,
        registerEndDT: admin.registerEndDT,
        challengeStartDT: admin.challengeStartDT,
        challengeEndDT: admin.challengeEndDT,
        generation: admin.generation,
    };
    return resData;
});
exports.getAdminRegist = getAdminRegist;
/**
 *  @관리자_콘서트_등록
 *  @route Post admin/concert
 *  @access private
 *  @error
 *      1. 요청 바디 부족
 *      2. 유저 id가 관리자가 아님
 *      3. 해당 날짜에 진행되는 기수가 없음
 */
const postAdminConcert = (userID, reqData, url) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, text, authorNickname } = reqData;
    let interest = library_1.array.stringToInterest(reqData.interest);
    let hashtag = library_1.array.stringToHashtag(reqData.hashtag);
    // 1. 요청 바디 부족
    if (!title || !text || !interest || !hashtag || !authorNickname) {
        return -1;
    }
    // 2. 유저 id가 관리자가 아님
    const user = yield models_1.User.findOne({
        where: { id: userID },
        attributes: ["isAdmin", "nickName"],
    });
    if (user.isAdmin === false) {
        return -2;
    }
    // 해당 닉네임을 가진 유저를 찾음
    const authorUser = yield models_1.User.findOne({
        where: { nickname: authorNickname },
    });
    // 원글 작성자 아이디
    let authorID;
    // 해당 닉네임을 가진 유저가 있음
    if (authorUser) {
        // 해당 닉네임을 가진 유저의 id를 넣음
        authorID = authorUser.id;
    }
    else {
        // 해당 닉네임을 가진 유저가 없음
        // 아이디는 관리자 아이디를 사용, 닉네임은 그 자체(authorNickname)를 사용
        authorID = userID;
    }
    // Concert 등록
    const newPost = yield models_1.Post.create({
        userID,
        interest,
    });
    yield models_1.Concert.create({
        id: newPost.id,
        userID: authorID,
        title,
        videoLink: url.videoLink,
        imgThumbnail: url.imgThumbnail,
        text,
        isNotice: false,
        authorNickname,
        hashtag,
    });
    return 1;
});
exports.postAdminConcert = postAdminConcert;
/**
 *  @관리자_공지사항_등록
 *  @route Post admin/notice
 *  @body
 *  @error
 *      1. 요청 바디 부족
 *      2. 유저 id가 관리자가 아님
 */
const postAdminNotice = (userID, reqData, url) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, text } = reqData;
    let interest = library_1.array.stringToInterest(reqData.interest);
    let hashtag = library_1.array.stringToHashtag(reqData.hashtag);
    // 1. 요청 바디 부족
    if (!title || !text) {
        return -1;
    }
    // 2. 유저 id가 관리자가 아님
    const user = yield models_1.User.findOne({
        where: { id: userID },
        attributes: ["isAdmin", "nickName"],
    });
    if (user.isAdmin === false) {
        return -2;
    }
    // Notice 등록
    const newPost = yield models_1.Post.create({
        userID,
        interest,
    });
    yield models_1.Concert.create({
        id: newPost.id,
        userID,
        title,
        videoLink: url.videoLink,
        imgThumbnail: url.imgThumbnail,
        text,
        isNotice: true,
        hashtag,
    });
    return 1;
});
exports.postAdminNotice = postAdminNotice;
const adminService = {
    getAdminList: exports.getAdminList,
    getAdminRegist: exports.getAdminRegist,
    postAdminConcert: exports.postAdminConcert,
    postAdminNotice: exports.postAdminNotice,
    postAdminChallenge: exports.postAdminChallenge,
};
exports.default = adminService;
//# sourceMappingURL=adminService.js.map
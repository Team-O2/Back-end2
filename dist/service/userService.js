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
// models
const models_1 = require("../models");
const date_1 = __importDefault(require("../library/date"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const library_1 = require("../library");
const ejs_1 = __importDefault(require("ejs"));
const sequelize_1 = require("sequelize");
const moment_1 = __importDefault(require("moment"));
const week = ["일", "월", "화", "수", "목", "금", "토"];
/**
 *  @User_마이페이지_Info
 *  @route Get user/mypage/info
 *  @access private
 */
const getMypageInfo = (userID) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield models_1.User.findOne({
        where: { id: userID },
        attributes: ["nickname", "isAdmin"],
    });
    let learnMyselfAchieve = null;
    const challenge = yield models_1.Admin.findOne({
        where: {
            challengeStartDT: {
                [sequelize_1.Op.lte]: moment_1.default().toDate(),
            },
            challengeEndDT: {
                [sequelize_1.Op.gte]: moment_1.default().toDate(),
            },
        },
        include: [
            {
                model: models_1.Generation,
                where: {
                    userID,
                },
                required: true,
            },
        ],
        attributes: ["generation", "challengeStartDT", "challengeEndDT"],
    });
    // 현재 기수 참여 X or 관리자 -> learnMySelf : null
    if (challenge) {
        let term = yield date_1.default.period(challenge.challengeStartDT, challenge.challengeEndDT);
        if (term < 1) {
            term = 1;
        }
        // 내림을 취해서 최대한 많은 %를 달성할 수 있도록 한다
        let totalNum = challenge.generations[0].conditionNum * Math.floor(term / 7);
        if (totalNum < 1) {
            totalNum = 1;
        }
        // 퍼센트 올림을 취함
        var percent = Math.ceil((challenge.generations[0].writingNum / totalNum) * 100);
        if (percent > 100) {
            percent = 100;
        }
        learnMyselfAchieve = {
            percent,
            totalNum,
            completeNum: challenge.generations[0].writingNum,
            startDT: challenge.challengeStartDT,
            endDT: challenge.challengeEndDT,
            generation: challenge.generation,
        };
    }
    let shareTogether = null;
    const concerts = yield models_1.Post.findAll({
        order: [["createdAt", "DESC"]],
        include: [
            {
                model: models_1.Concert,
                required: true,
                where: { userID, isNotice: false },
                attributes: ["title"],
            },
        ],
        where: {
            isDeleted: false,
        },
        attributes: ["id"],
        offset: 0,
        limit: 5,
    });
    if (concerts.length) {
        shareTogether = [];
        concerts.map((concert) => {
            shareTogether.push({
                id: concert.id,
                title: concert.concert.title,
            });
        });
    }
    const couponBook = yield models_1.Badge.findOne({
        where: { id: userID },
        attributes: {
            exclude: ["id"],
        },
    });
    const resData = {
        nickname: user.nickname,
        learnMyselfAchieve,
        shareTogether,
        couponBook,
    };
    return resData;
});
/**
 *  @마이페이지_회원정보_조회
 *  @route Get user/userInfo
 *  @access private
 */
const getUserInfo = (userID) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield models_1.User.findOne({
        where: {
            id: userID,
        },
        attributes: ["isMarketing", "img", "id", "email", "nickname", "interest"],
    });
    const resData = {
        interest: user.interest.split(","),
        isMarketing: user.isMarketing,
        img: user.img,
        id: user.id,
        email: user.email,
        nickname: user.nickname,
    };
    return resData;
});
/**
 *  @User_마이페이지_콘서트_스크랩
 *  @route GET user/mypage/concert?offset=@&limit=
 *  @access private
 *  @error
 *    1. no Limit
 *    2. no content
 */
const getConcertScrap = (userID, offset, limit) => __awaiter(void 0, void 0, void 0, function* () {
    if (!offset) {
        offset = 0;
    }
    // 1. No limit
    if (!limit) {
        return -1;
    }
    const concerts = yield models_1.Post.findAll({
        order: [["createdAt", "DESC"]],
        include: [
            { model: models_1.Scrap, attributes: ["userID"], required: true, as: "scraps" },
            {
                model: models_1.Scrap,
                attributes: ["userID"],
                where: { userID },
                required: true,
                as: "userScraps",
            },
            { model: models_1.Concert, where: { isNotice: false }, required: true },
            {
                model: models_1.Comment,
                as: "comments",
                where: { level: 0 },
                required: false,
                include: [
                    models_1.User,
                    {
                        model: models_1.Comment,
                        as: "children",
                        separate: true,
                        required: false,
                        order: [["id", "DESC"]],
                        include: [models_1.User],
                    },
                ],
            },
            { model: models_1.User, attributes: ["id", "img", "nickname"] },
            { model: models_1.Like, attributes: ["userID"], required: false, as: "likes" },
            {
                model: models_1.Like,
                attributes: ["userID"],
                where: { userID },
                required: false,
                as: "userLikes",
            },
        ],
        where: {
            isDeleted: false,
        },
        offset,
        limit,
    });
    // 2. 스크랩한 글이 없을 때
    if (!concerts.length) {
        return -2;
    }
    const scrapConcerts = yield models_1.Post.findAll({
        include: [
            {
                model: models_1.Scrap,
                as: "userScraps",
                where: { userID },
                required: true,
            },
            {
                model: models_1.Concert,
                where: { isNotice: false },
                required: true,
            },
        ],
        where: {
            isDeleted: false,
        },
    });
    const totalScrapNum = scrapConcerts.length;
    const mypageConcertScrap = concerts.map((concert) => {
        // 댓글 형식 변환
        let comment = [];
        concert.comments.forEach((c) => {
            const children = c.children.map((child) => ({
                id: child.id,
                userID: child.userID,
                nickname: child.user.nickname,
                img: child.user.img,
                text: child.text,
                isDeleted: child.isDeleted,
            }));
            comment.push({
                id: c.id,
                userID: c.userID,
                nickname: c.user.nickname,
                img: c.user.img,
                text: c.text,
                children,
                isDeleted: c.isDeleted,
            });
        });
        const returnData = {
            id: concert.id,
            createdAt: concert.createdAt,
            updatedAt: concert.updatedAt,
            userID: concert.userID,
            nickname: concert.user.nickname,
            authorNickname: concert.concert.authorNickname,
            title: concert.concert.title,
            videoLink: concert.concert.videoLink,
            img: concert.user.img,
            imgThumbnail: concert.concert.imgThumbnail,
            text: concert.concert.text,
            interest: concert.interest.split(","),
            hashtag: concert.concert.hashtag
                ? concert.concert.hashtag.slice(1).split("#")
                : undefined,
            likeNum: concert.likes.length,
            scrapNum: concert.scraps.length,
            commentNum: concert.comments.length,
            comment,
            isDeleted: concert.isDeleted,
            isNotice: concert.concert.isNotice,
            isLike: concert.userLikes.length ? true : false,
            isScrap: true,
        };
        return returnData;
    });
    const resData = {
        mypageConcertScrap,
        totalScrapNum,
    };
    return resData;
});
/**
 *  @User_마이페이지_회고_스크랩
 *  @route Post user/mypage/challenge
 *  @access private
 *  @error
 *    1. no limit
 *    2. no content
 */
const getChallengeScrap = (userID, offset, limit) => __awaiter(void 0, void 0, void 0, function* () {
    if (!offset) {
        offset = 0;
    }
    // 1. No limit
    if (!limit) {
        return -1;
    }
    const challenges = yield models_1.Post.findAll({
        order: [["createdAt", "DESC"]],
        include: [
            { model: models_1.Scrap, attributes: ["userID"], required: true, as: "scraps" },
            {
                model: models_1.Scrap,
                attributes: ["userID"],
                where: { userID },
                required: true,
                as: "userScraps",
            },
            { model: models_1.Challenge, required: true },
            {
                model: models_1.Comment,
                as: "comments",
                where: { level: 0 },
                required: false,
                include: [
                    models_1.User,
                    {
                        model: models_1.Comment,
                        as: "children",
                        separate: true,
                        required: false,
                        order: [["id", "DESC"]],
                        include: [models_1.User],
                    },
                ],
            },
            { model: models_1.User, attributes: ["id", "img", "nickname"], required: false },
            { model: models_1.Like, attributes: ["userID"], required: false, as: "likes" },
            {
                model: models_1.Like,
                attributes: ["userID"],
                where: { userID },
                required: false,
                as: "userLikes",
            },
        ],
        where: {
            isDeleted: false,
        },
        offset,
        limit,
    });
    // 2. 스크랩한 글이 없을 때
    if (!challenges.length) {
        return -2;
    }
    const scrapChallenges = yield models_1.Post.findAll({
        include: [
            {
                model: models_1.Scrap,
                as: "userScraps",
                where: { userID },
                required: true,
            },
            {
                model: models_1.Challenge,
                required: true,
            },
        ],
        where: {
            isDeleted: false,
        },
    });
    const totalScrapNum = scrapChallenges.length;
    const mypageChallengeScrap = challenges.map((challenge) => {
        // 댓글 형식 변환
        let comment = [];
        challenge.comments.forEach((c) => {
            const children = c.children.map((child) => ({
                id: child.id,
                userID: child.userID,
                nickname: child.user.nickname,
                img: child.user.img,
                text: child.text,
                isDeleted: child.isDeleted,
            }));
            comment.push({
                id: c.id,
                userID: c.userID,
                nickname: c.user.nickname,
                img: c.user.img,
                text: c.text,
                children,
                isDeleted: c.isDeleted,
            });
        });
        const returnData = {
            id: challenge.id,
            generation: challenge.generation,
            createdAt: challenge.createdAt,
            updatedAt: challenge.updatedAt,
            userID: challenge.userID,
            nickname: challenge.user.nickname,
            img: challenge.user.img,
            good: challenge.challenge.good,
            bad: challenge.challenge.bad,
            learn: challenge.challenge.learn,
            interest: challenge.interest.split(","),
            likeNum: challenge.likes.length,
            scrapNum: challenge.scraps.length,
            commentNum: challenge.comments.length,
            comment,
            isLike: challenge.userLikes.length ? true : false,
            isScrap: true,
        };
        return returnData;
    });
    const resData = {
        mypageChallengeScrap,
        totalScrapNum,
    };
    return resData;
});
/**
 *  @마이페이지_내가_쓴_글
 *  @route Get user/mypage/write
 *  @access private
 *  @error
 *    1. no limit
 *    2. no content
 */
const getMyWritings = (userID, offset, limit) => __awaiter(void 0, void 0, void 0, function* () {
    if (!offset) {
        offset = 0;
    }
    // 1. No limit
    if (!limit) {
        return -1;
    }
    const challenges = yield models_1.Post.findAll({
        order: [["createdAt", "DESC"]],
        include: [
            { model: models_1.Scrap, attributes: ["userID"], required: false, as: "scraps" },
            {
                model: models_1.Scrap,
                attributes: ["userID"],
                where: { userID },
                required: false,
                as: "userScraps",
            },
            { model: models_1.Challenge, required: true },
            {
                model: models_1.Comment,
                as: "comments",
                where: { level: 0 },
                required: false,
                include: [
                    models_1.User,
                    {
                        model: models_1.Comment,
                        as: "children",
                        separate: true,
                        required: false,
                        order: [["id", "DESC"]],
                        include: [models_1.User],
                    },
                ],
            },
            { model: models_1.User, attributes: ["id", "img", "nickname"] },
            { model: models_1.Like, attributes: ["userID"], required: false, as: "likes" },
            {
                model: models_1.Like,
                attributes: ["userID"],
                where: { userID },
                required: false,
                as: "userLikes",
            },
        ],
        where: {
            userID,
            isDeleted: false,
        },
        offset,
        limit,
    });
    // 2. 작성한 글이 없을 떄
    if (!challenges.length) {
        // console.log(challengeList.length);
        return -2;
    }
    const resData = challenges.map((challenge) => {
        // 댓글 형식 변환
        let comment = [];
        challenge.comments.forEach((c) => {
            const children = c.children.map((child) => ({
                id: child.id,
                userID: child.userID,
                nickname: child.user.nickname,
                img: child.user.img,
                text: child.text,
                isDeleted: child.isDeleted,
            }));
            comment.push({
                id: c.id,
                userID: c.userID,
                nickname: c.user.nickname,
                img: c.user.img,
                text: c.text,
                children,
                isDeleted: c.isDeleted,
            });
        });
        const returnData = {
            id: challenge.id,
            generation: challenge.generation,
            createdAt: challenge.createdAt,
            updatedAt: challenge.updatedAt,
            userID: challenge.userID,
            nickname: challenge.user.nickname,
            img: challenge.user.img,
            good: challenge.challenge.good,
            bad: challenge.challenge.bad,
            learn: challenge.challenge.learn,
            interest: challenge.interest.split(","),
            likeNum: challenge.likes.length,
            scrapNum: challenge.scraps.length,
            commentNum: challenge.comments.length,
            comment,
            isLike: challenge.userLikes.length ? true : false,
            isScrap: challenge.userScraps.length ? true : false,
        };
        return returnData;
    });
    return resData;
});
/**
 *  @마이페이지_내가_쓴_댓글
 *  @route Get user/mypage/comment?postModel=@&offset=@&limit=
 *  @error
 *    1. No limit / No postModel
 *    2. Wrong postModel
 *    3. 작성한 댓글이 없을 때
 */
const getMyComments = (userID, postModel, offset, limit) => __awaiter(void 0, void 0, void 0, function* () {
    if (!offset) {
        offset = 0;
    }
    // 1. No limit / No postModel
    if (!limit || !postModel) {
        return -1;
    }
    let commentList;
    if (postModel === "Challenge") {
        commentList = yield models_1.Comment.findAll({
            order: [["createdAt", "DESC"]],
            where: {
                userID,
                isDeleted: false,
            },
            include: [
                {
                    model: models_1.Post,
                    where: { isDeleted: false },
                    include: [
                        {
                            model: models_1.Challenge,
                            required: true,
                            attributes: [],
                        },
                    ],
                    attributes: ["id"],
                    required: true,
                },
            ],
            attributes: ["id", "text", "createdAt"],
            offset,
            limit,
        });
    }
    else if (postModel === "Concert") {
        commentList = yield models_1.Comment.findAll({
            order: [["createdAt", "DESC"]],
            where: {
                userID,
                isDeleted: false,
            },
            include: [
                {
                    model: models_1.Post,
                    where: { isDeleted: false },
                    include: [
                        {
                            model: models_1.Concert,
                            where: {
                                isNotice: false,
                            },
                            required: true,
                            attributes: [],
                        },
                    ],
                    attributes: ["id"],
                    required: true,
                },
            ],
            attributes: ["id", "text", "createdAt"],
            offset,
            limit,
        });
    }
    else if (postModel === "Notice") {
        commentList = yield models_1.Comment.findAll({
            order: [["createdAt", "DESC"]],
            where: {
                userID,
                isDeleted: false,
            },
            include: [
                {
                    model: models_1.Post,
                    where: { isDeleted: false },
                    include: [
                        {
                            model: models_1.Concert,
                            where: {
                                isNotice: true,
                            },
                            required: true,
                            attributes: [],
                        },
                    ],
                    attributes: ["id"],
                    required: true,
                },
            ],
            attributes: ["id", "text", "createdAt"],
            offset,
            limit,
        });
    }
    else {
        commentList = null;
    }
    // 2. Wrong postModel
    if (!commentList) {
        return -2;
    }
    // // 3. 작성한 댓글이 없을 떄
    // else if (!commentList.length) {
    //   // console.log(challengeList.length);
    //   return -3;
    // }
    const commentNum = commentList.length;
    const comments = yield Promise.all(commentList.map((comment) => __awaiter(void 0, void 0, void 0, function* () {
        const returnData = {
            id: comment.id,
            text: comment.text,
            post: comment.post.id,
            createdAt: comment.createdAt,
        };
        return returnData;
    })));
    const resData = {
        comments,
        commentNum,
    };
    return resData;
});
/**
 *  @마이페이지_비밀번호_수정
 *  @route Patch user/password
 *  @access private
 *  @error
 *    1. 요청 바디 부족
 *    2. 현재 비밀번호와 일치하지 않음
 */
const patchPW = (userID, body) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, newPassword } = body;
    // 1. 요청 바디 부족
    if (!newPassword || !password || !userID) {
        return -1;
    }
    const user = yield models_1.User.findOne({
        where: { id: userID },
        attributes: ["password"],
    });
    // Encrpyt password
    const salt = yield bcryptjs_1.default.genSalt(10);
    const currentEncrpytPW = yield bcryptjs_1.default.hash(password, salt);
    // 2. 현재 비밀번호와 일치하지 않음
    const isMatch = yield bcryptjs_1.default.compare(password, user.password);
    if (!isMatch) {
        return -2;
    }
    // Encrpyt password
    const encrpytPW = yield bcryptjs_1.default.hash(newPassword, salt);
    yield models_1.User.update({ password: encrpytPW }, { where: { id: userID } });
    return;
});
/**
 *  @마이페이지_내가_쓴_댓글_삭제
 *  @route Patch user/mypage/comment
 *  @error
 *    1. 요청 바디가 부족할 경우
 *    2. comment ID가 잘못된 경우
 *    3. 해당 유저가 작성한 댓글이 아닐 경우
 *    4. 삭제하려는 댓글이 이미 isDeleted = true 인 경우
 */
const deleteMyComments = (userID, comments) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. 요청 바디가 부족할 경우
    if (!comments || !comments.commentID.length) {
        return -1;
    }
    comments.commentID.map((commentID) => __awaiter(void 0, void 0, void 0, function* () {
        const comment = yield models_1.Comment.findOne({
            where: { id: commentID },
            attributes: ["userID", "isDeleted"],
        });
        // 2. comment ID가 잘못된 경우
        if (!comment) {
            return -2;
        }
        // 3. 해당 유저가 작성한 댓글이 아닐 경우
        else if (comment.userID !== userID) {
            return -3;
        }
        // 4. 삭제하려는 댓글이 이미 isDeleted = true 인 경우
        else if (comment.isDeleted) {
            return -4;
        }
    }));
    comments.commentID.map((commentID) => __awaiter(void 0, void 0, void 0, function* () {
        yield models_1.Comment.update({ isDeleted: true }, { where: { id: commentID, userID } });
    }));
    return;
});
/**
 *  @User_마이페이지_회고_스크랩_취소토글
 *  @route Delete user/mypage/challenge/:challengeID
 *  @access private
 *  @error
 *    1. no challengeID
 *    2. challengeID 잘못됨
 *    3. 스크랩 하지 않은 challenge
 */
const deleteChallengeScrap = (userID, challengeID) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. no challengeID
    if (!challengeID) {
        return -1;
    }
    const challenge = yield models_1.Post.findOne({
        where: { id: challengeID, isDeleted: false },
        include: [
            { model: models_1.Scrap, as: "userScraps", required: false, where: { userID } },
            { model: models_1.Challenge, required: true },
        ],
        attributes: ["id"],
    });
    // 2. challengeID 잘못됨
    if (!challenge) {
        return -2;
    }
    // 3. 스크랩 하지 않은 challenge
    else if (!challenge.userScraps.length) {
        return -3;
    }
    else {
        yield models_1.Scrap.destroy({
            where: { postID: challengeID, userID: userID },
        });
    }
    return;
});
/**
 *  @User_챌린지_신청하기
 *  @route Post user/register
 *  @body challengeNum :number
 *  @access private
 *  @error
 *    1. 요청 바디 부족
 *    2. 유저 id가 관리자 id임
 *    3. 신청 기간이 아님
 *    4. 이미 신청이 완료된 사용자
 *    5. 신청 인원 초과
 */
const postRegister = (userID, body) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. 요청 바디 부족
    if (!body.challengeNum) {
        return -1;
    }
    const user = yield models_1.User.findOne({
        where: { id: userID },
        attributes: ["isAdmin", "email", "nickname"],
    });
    // 2. 유저 id가 관리자 id임
    if (user.isAdmin) {
        return -2;
    }
    // 신청 기간 확인
    const admin = yield models_1.Admin.findOne({
        where: {
            registerStartDT: {
                [sequelize_1.Op.lte]: moment_1.default().toDate(),
            },
            registerEndDT: {
                [sequelize_1.Op.gte]: moment_1.default().toDate(),
            },
        },
    });
    // 3. 신청 기간이 아님
    if (!admin) {
        return -3;
    }
    const generation = yield models_1.Generation.findOne({
        where: { generation: admin.id, userID },
    });
    // 4. 이미 신청이 완료된 사용자
    if (generation) {
        return -4;
    }
    yield models_1.Admin.update({ applyNum: admin.applyNum + 1 }, { where: { id: admin.id } });
    // 5. 신청 인원 초과
    if (admin.applyNum > admin.limitNum) {
        return -5;
    }
    // email 전송
    let emailTemplate;
    ejs_1.default.renderFile("src/library/emailRegister.ejs", {
        nickname: user.nickname,
        generation: admin.id === 1
            ? "1st"
            : admin.id === 2
                ? "2nd"
                : String(admin.id) + "th",
        startM: admin.challengeStartDT.getMonth() + 1,
        startD: admin.challengeStartDT.getDate(),
        startDay: week[admin.challengeStartDT.getDay()],
        endM: admin.challengeEndDT.getMonth() + 1,
        endD: admin.challengeEndDT.getDate(),
        endDay: week[admin.challengeEndDT.getDay()],
        challengeNum: body.challengeNum,
    }, (err, data) => {
        if (err) {
            console.log(err);
        }
        emailTemplate = data;
    });
    const mailOptions = {
        front: process.env.EMAIL_ADDRESS,
        to: user.email,
        subject: "O2 챌린지 신청내역입니다.",
        text: "",
        html: emailTemplate,
    };
    library_1.emailSender.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return -6;
        }
        else {
            console.log("success");
        }
        library_1.emailSender.close();
    });
    yield models_1.Generation.create({
        generation: admin.id,
        userID,
        challengeNum: body.challengeNum,
    });
    yield models_1.Badge.update({ firstJoinBadge: true }, { where: { id: userID } });
    return;
});
/**
 *  @마이페이지_회원정보_수정
 *  @route Patch user/userInfo
 *  @access private
 *  @error
 *    1. 요청 바디 부족
 *    2. 닉네임 중복
 */
const patchUserInfo = (userID, body, url) => __awaiter(void 0, void 0, void 0, function* () {
    let { nickname, isMarketing } = body;
    let interest = library_1.array.stringToInterest(body.interest);
    // 1. 요청 바디 부족
    if (nickname === undefined ||
        interest === undefined ||
        isMarketing === undefined) {
        return -1;
    }
    const nicknameUser = yield models_1.User.findOne({
        where: { nickname, id: { [sequelize_1.Op.ne]: userID } },
    });
    // 2. 닉네임 중복
    if (nicknameUser) {
        return -2;
    }
    // 이미지 변경이 존재하는 경우
    if (url && url.img !== "") {
        yield models_1.User.update({
            nickname,
            interest,
            isMarketing,
            img: url.img,
        }, { where: { id: userID } });
    }
    else {
        yield models_1.User.update({
            nickname,
            interest: interest,
            isMarketing,
        }, {
            where: { id: userID },
            returning: true,
        });
    }
    const user = yield models_1.User.findOne({
        where: {
            id: userID,
        },
        attributes: ["img", "email"],
    });
    if (isMarketing) {
        yield models_1.Badge.update({ marketingBadge: true }, { where: { id: userID } });
    }
    const resData = {
        interest: interest.split(","),
        isMarketing,
        img: user.img,
        id: userID,
        email: user.email,
        nickname,
    };
    return resData;
});
const userService = {
    getMypageInfo,
    getUserInfo,
    getConcertScrap,
    getChallengeScrap,
    getMyWritings,
    getMyComments,
    patchPW,
    deleteMyComments,
    deleteChallengeScrap,
    postRegister,
    patchUserInfo,
};
exports.default = userService;
//# sourceMappingURL=userService.js.map
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const sequelize_1 = __importStar(require("sequelize"));
// models
const models_1 = require("../models");
/**
 *  @챌린지_회고_등록
 *  @route Post /
 *  @body author, good, bad, learn, interest, generation
 *  @error
 *      1. 요청 바디 부족
 *      2. 유저 id 잘못됨
 */
const postChallenge = (userID, reqData) => __awaiter(void 0, void 0, void 0, function* () {
    const { good, bad, learn, interest, generation } = reqData;
    // 1. 요청 바디 부족
    if (!good || !bad || !learn || !interest || !generation) {
        return -1;
    }
    const user = yield models_1.User.findOne({ where: { id: userID } });
    // 2. 유저 id 잘못됨
    if (!user) {
        return -2;
    }
    // challenge 생성
    const newPost = yield models_1.Post.create({
        userID,
        generation,
        interest: interest.join(),
    });
    yield models_1.Challenge.create({
        id: newPost.id,
        good: good,
        bad: bad,
        learn: learn,
    });
    // 유저의 writingCNT 증가
    yield models_1.Generation.increment("writingNum", { by: 1, where: { userID } });
    // 첫 챌린지 회고 작성 시 배지 추가
    yield models_1.Badge.update({ firstWriteBadge: true }, { where: { id: userID, firstWriteBadge: false } });
    // table join
    const challenge = yield models_1.Post.findOne({
        where: {
            id: newPost.id,
        },
        include: [
            models_1.Challenge,
            {
                model: models_1.User,
                attributes: ["nickname", "img"],
            },
            { model: models_1.Like, as: "likes", required: false },
            { model: models_1.Scrap, as: "scraps", required: false },
        ],
    });
    // data 형식에 맞게 변경
    const resData = {
        id: challenge.id,
        good: challenge.challenge.good,
        bad: challenge.challenge.bad,
        learn: challenge.challenge.learn,
        interest: challenge.interest.split(","),
        generation: challenge.generation,
        likeNum: challenge.likes.length,
        scrapNum: challenge.scraps.length,
        isDeleted: challenge.isDeleted,
        userID: challenge.userID,
        nickname: challenge.user.nickname,
        img: challenge.user.img,
        createdAt: challenge.createdAt,
        updatedAt: challenge.updatedAt,
    };
    return resData;
});
/**
 *  @챌린지_회고_댓글_등록
 *  @route POST /:challengeID/comment
 *  @body parentID, text
 *  @error
 *      1. 챌린지 id 잘못됨
 *      2. 요청 바디 부족
 *      3. 부모 댓글 id 값이 유효하지 않을 경우
 */
const postComment = (challengeID, userID, reqData) => __awaiter(void 0, void 0, void 0, function* () {
    const { parentID, text } = reqData;
    // 1. 회고록 id 잘못됨
    const challenge = yield models_1.Challenge.findOne({
        where: { id: challengeID },
        include: [models_1.Post],
    });
    if (!challenge || challenge.post.isDeleted) {
        return -1;
    }
    // 2. 요청 바디 부족
    if (!text) {
        return -2;
    }
    // 대댓글인 경우
    if (parentID) {
        const parentComment = yield models_1.Comment.findOne({
            where: { id: parentID, isDeleted: false },
        });
        // 3. 부모 댓글 id 값이 유효하지 않을 경우
        if (!parentComment) {
            return -3;
        }
        // 대댓글 생성
        yield models_1.Comment.create({
            userID,
            postID: challengeID,
            parentID,
            text,
            level: 1,
        });
        // 첫 답글 작성 시 뱃지 추가
        yield models_1.Badge.update({ firstReplyBadge: true }, {
            where: { id: userID, firstReplyBadge: false },
        });
    }
    else {
        // 댓글인 경우
        yield models_1.Comment.create({
            userID,
            postID: challengeID,
            text,
        });
    }
    // 댓글 1개 작성 시 뱃지 추가
    const badge = yield models_1.Badge.findOne({
        where: { id: userID },
        include: [{ model: models_1.User, include: [models_1.Comment] }],
    });
    if (!badge.oneCommentBadge) {
        badge.oneCommentBadge = true;
        yield badge.save();
    }
    // 댓글 5개 작성 시 뱃지 추가
    if (!badge.fiveCommentBadge && badge.user.comments.length > 4) {
        badge.fiveCommentBadge = true;
        yield badge.save();
    }
    return undefined;
});
/**
 *  @챌린지_회고_좋아요_등록
 *  @route /:challengeID/like
 *  @error
 *      1. 챌린지 id 잘못됨
 *      2. 이미 좋아요 한 글일 경우
 */
const postLike = (challengeID, userID) => __awaiter(void 0, void 0, void 0, function* () {
    const challenge = yield models_1.Challenge.findOne({
        where: { id: challengeID },
        include: [models_1.Post],
    });
    // 1. 회고록 id 잘못됨
    if (!challenge || challenge.post.isDeleted) {
        return -1;
    }
    const like = yield models_1.Like.findOne({ where: { postID: challengeID, userID } });
    // 2. 이미 좋아요 한 글일 경우
    if (like) {
        return -2;
    }
    // 좋아요 등록
    yield models_1.Like.create({
        postID: challengeID,
        userID,
    });
    // 좋아요 1개 누를 시 뱃지 추가
    const badge = yield models_1.Badge.findOne({
        where: { id: userID },
        include: [{ model: models_1.User, include: [models_1.Like] }],
    });
    if (!badge.oneLikeBadge) {
        badge.oneLikeBadge = true;
        yield badge.save();
    }
    // 좋아요 5개 누를 시 뱃지 추가
    if (!badge.fiveLikeBadge && badge.user.likes.length > 4) {
        badge.fiveLikeBadge = true;
        yield badge.save();
    }
    return;
});
/**
 *  @유저_챌린지_회고_스크랩하기
 *  @route Post /:challengeID/scrap
 *  @error
 *      1. 챌린지 id 잘못됨
 *      2. 이미 스크랩 한 글일 경우
 *      3. 자신이 작성한 글인 경우
 */
const postScrap = (challengeID, userID) => __awaiter(void 0, void 0, void 0, function* () {
    const challenge = yield models_1.Challenge.findOne({
        where: { id: challengeID },
        include: [models_1.Post],
    });
    // 1. 챌린지 id 잘못됨
    if (!challenge || challenge.post.isDeleted) {
        return -1;
    }
    const scrap = yield models_1.Scrap.findOne({ where: { postID: challengeID, userID } });
    // 2. 이미 스크랩 한 글인 경우
    if (scrap) {
        return -2;
    }
    // 3. 자신의 글인 경우
    if (challenge.post.userID === userID) {
        return -3;
    }
    yield models_1.Scrap.create({
        postID: challengeID,
        userID,
    });
    // 게시글 첫 스크랩 시 배지 추가
    yield models_1.Badge.update({ learnMySelfScrapBadge: true }, { where: { id: userID, learnMySelfScrapBadge: false } });
    return;
});
/**
 *  @챌린지_전체_가져오기
 *  @route Get ?offset=&limit=&generation=
 *  @error
 *    1. limit이 없는 경우
 *    2. generation이 없는 경우
 */
const getChallengeAll = (userID, generation, offset, limit) => __awaiter(void 0, void 0, void 0, function* () {
    // isDelete = false 인 애들만 가져오기
    // offset 뒤에서 부터 가져오기
    // 최신순으로 정렬
    // 댓글, 답글 최신순으로 정렬
    // public인 경우 isLike, isScrap 없음
    // 1. limit이 없는 경우
    if (!limit) {
        return -1;
    }
    // 2. generation이 없는 경우
    if (!generation) {
        return -2;
    }
    if (!offset) {
        offset = 0;
    }
    let include = [
        { model: models_1.Challenge, required: true },
        models_1.User,
        {
            model: models_1.Comment,
            as: "comments",
            required: false,
            where: { level: 0 },
            include: [
                models_1.User,
                {
                    model: models_1.Comment,
                    as: "children",
                    separate: true,
                    order: [["id", "DESC"]],
                    include: [models_1.User],
                },
            ],
        },
        { model: models_1.Like, as: "likes", required: false },
        { model: models_1.Scrap, as: "scraps", required: false },
    ];
    // userID가 있는 경우
    if (userID)
        include = [
            ...include,
            { model: models_1.Like, as: "userLikes", where: { userID }, required: false },
            { model: models_1.Scrap, as: "userScraps", where: { userID }, required: false },
        ];
    const challengeList = yield models_1.Post.findAll({
        order: [
            ["createdAt", "DESC"],
            ["comments", "id", "DESC"],
        ],
        where: {
            isDeleted: false,
            generation,
        },
        include,
        limit,
        offset,
    });
    const resData = challengeList.map((challenge) => {
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
        let returnData = {
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
        };
        // userID가 있는 경우
        if (userID)
            returnData = Object.assign(Object.assign({}, returnData), { isLike: challenge.userLikes.length ? true : false, isScrap: challenge.userScraps.length ? true : false });
        return returnData;
    });
    return resData;
});
/**
 *  @챌린지_회고_검색_또는_필터
 *  @route Get /search?offset=&limit=&generation=&tag=&keyword=&isMine=
 *  @error
 *    1. limit이 없는 경우
 *    2. generation이 없는 경우
 *    3. isMine=true 인데 user id가 없는 경우
 */
const getChallengeSearch = (offset, limit, generation, userID, tag, ismine, keyword) => __awaiter(void 0, void 0, void 0, function* () {
    // isDelete = false 인 애들만 가져오기
    // offset 뒤에서 부터 가져오기
    // 최신순으로 정렬
    // 댓글, 답글 최신순으로 정렬
    // public인 경우 isLike, isScrap 없음
    // tag 검사
    // keyword 검사
    // 내 글 여부 검사
    // 1. limit이 없는 경우
    if (!limit) {
        return -1;
    }
    // 2. generation이 없는 경우
    if (!generation) {
        return -2;
    }
    // 3. ismine=true 인데 user id가 없는 경우
    if (ismine && !userID) {
        return -3;
    }
    if (!offset) {
        offset = 0;
    }
    // where option
    let where = {
        isDeleted: false,
        generation,
    };
    // tag 여부에 따라 query 적용
    if (tag && tag !== "전체")
        where = Object.assign(Object.assign({}, where), { interest: { [sequelize_1.Op.like]: `%${tag}%` } });
    // keyword 여부에 따라 query 적용
    if (keyword)
        where = Object.assign(Object.assign({}, where), { [sequelize_1.Op.or]: [
                { "$challenge.good$": { [sequelize_1.Op.like]: `%${keyword}%` } },
                { "$challenge.bad$": { [sequelize_1.Op.like]: `%${keyword}%` } },
                { "$challenge.learn$": { [sequelize_1.Op.like]: `%${keyword}%` } },
            ] });
    // isMine, user id 여부에 따라 query 적용
    if (ismine && userID)
        where = Object.assign(Object.assign({}, where), { 
            //@ts-ignore
            "$user.id$": { [sequelize_1.Op.eq]: userID } });
    // include option
    let include = [
        { model: models_1.Challenge, required: true },
        { model: models_1.User, required: true },
        {
            model: models_1.Comment,
            as: "comments",
            required: false,
            where: { level: 0 },
            include: [
                models_1.User,
                {
                    model: models_1.Comment,
                    as: "children",
                    separate: true,
                    order: [["id", "DESC"]],
                    include: [models_1.User],
                },
            ],
        },
        { model: models_1.Like, as: "likes", required: false },
        { model: models_1.Scrap, as: "scraps", required: false },
    ];
    // userID 있는 경우
    if (userID)
        include = [
            ...include,
            { model: models_1.Like, as: "userLikes", where: { userID }, required: false },
            { model: models_1.Scrap, as: "userScraps", where: { userID }, required: false },
        ];
    const challengeList = yield models_1.Post.findAll({
        order: [
            ["createdAt", "DESC"],
            ["comments", "id", "DESC"],
        ],
        where,
        include,
        limit,
        offset,
    });
    const resData = challengeList.map((challenge) => {
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
        let returnData = {
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
        };
        // userID 있는 경우
        if (userID)
            returnData = Object.assign(Object.assign({}, returnData), { isLike: challenge.userLikes.length ? true : false, isScrap: challenge.userScraps.length ? true : false });
        return returnData;
    });
    return resData;
});
/**
 *  @챌린지_Detail
 *  @route Get /challenge/:challengeID
 *  @error
 *    1. challenge id가 없을 때
 */
const getChallengeOne = (challengeID, userID) => __awaiter(void 0, void 0, void 0, function* () {
    // isDelete = fasle 인 애들만 가져오기
    const challenge = yield models_1.Post.findOne({
        where: { isDeleted: false, "$challenge.id$": challengeID },
        order: [["comments", "id", "DESC"]],
        include: [
            { model: models_1.Challenge, required: true },
            models_1.User,
            {
                model: models_1.Comment,
                as: "comments",
                required: false,
                where: { level: 0 },
                include: [
                    models_1.User,
                    {
                        model: models_1.Comment,
                        as: "children",
                        separate: true,
                        order: [["id", "DESC"]],
                        include: [models_1.User],
                    },
                ],
            },
            { model: models_1.Like, as: "likes", required: false },
            { model: models_1.Like, as: "userLikes", where: { userID }, required: false },
            { model: models_1.Scrap, as: "scraps", required: false },
            { model: models_1.Scrap, as: "userScraps", where: { userID }, required: false },
        ],
    });
    // challenge ID가 없을 때
    if (!challenge) {
        return -1;
    }
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
        isLike: challenge.userLikes.length ? true : false,
        isScrap: challenge.userScraps.length ? true : false,
        commentNum: challenge.comments.length,
        comment,
    };
    return returnData;
});
/**
 *  @챌린지_회고_수정
 *  @route PATCH challenge/:challengeId
 *  @body good, bad, learn, interest
 *  @error
 *    1. 요청 바디 부족
 *    2. 회고록 id 잘못됨
 */
const patchChallenge = (challengeID, reqData) => __awaiter(void 0, void 0, void 0, function* () {
    const { good, bad, learn, interest } = reqData;
    // 1. 요청 바디 부족
    if (!good || !bad || !learn || !interest) {
        return -1;
    }
    const challenge = yield models_1.Post.findOne({
        where: { isDeleted: false, "$challenge.id$": challengeID },
        include: [
            { model: models_1.Challenge, required: true },
            models_1.User,
            { model: models_1.Like, as: "likes", required: false },
            { model: models_1.Scrap, as: "scraps", required: false },
        ],
    });
    // 2. 회고록 id 잘못됨
    if (!challenge) {
        return -2;
    }
    // 데이터 업데이트
    challenge.interest = interest.join();
    yield challenge.save();
    yield models_1.Challenge.update({ good, bad, learn }, {
        where: { id: challengeID },
    });
    const returnData = {
        id: challenge.id,
        good,
        bad,
        learn,
        interest: challenge.interest.split(","),
        generation: challenge.generation,
        likeNum: challenge.likes.length,
        scrapNum: challenge.scraps.length,
        isDeleted: challenge.isDeleted,
        userID: challenge.userID,
        nickname: challenge.user.nickname,
        img: challenge.user.img,
        createdAt: challenge.createdAt,
        updatedAt: challenge.updatedAt,
    };
    return returnData;
});
/**
 *  @챌린지_회고_삭제
 *  @route DELETE /challenge/:challengeId
 *  @error
 *      1. 회고록 id 잘못됨
 */
const deleteChallenge = (challengeID) => __awaiter(void 0, void 0, void 0, function* () {
    const challenge = yield models_1.Post.findOne({ where: { id: challengeID } });
    // 1. 회고록 id 잘못됨
    if (!challenge || challenge.isDeleted) {
        return -1;
    }
    challenge.isDeleted = true;
    yield challenge.save();
    // 유저의 writingNum 감소
    yield models_1.Generation.update({ writingNum: sequelize_1.default.literal("writingNum - 1") }, { where: { userID: challenge.userID, generation: challenge.generation } });
    return undefined;
});
/**
 *  @챌린지_회고_좋아요_삭제
 *  @route DELETE /challenge/:challengeID/like
 *  @error
 *      1. 회고록 id 잘못됨
 */
const deleteLike = (challengeID, userID) => __awaiter(void 0, void 0, void 0, function* () {
    const like = yield models_1.Like.destroy({
        where: { postID: challengeID, userID },
    });
    // 1. 회고록 id 잘못됨
    if (!like) {
        return -1;
    }
    return undefined;
});
/**
 *  @챌린지_회고_스크랩_삭제
 *  @route Delete /challenge/:challengeID
 *  @error
 *      1. 회고록 id 잘못됨
 */
const deleteScrap = (challengeID, userID) => __awaiter(void 0, void 0, void 0, function* () {
    const scrap = yield models_1.Scrap.destroy({
        where: { postID: challengeID, userID },
    });
    // 1. 회고록 id 잘못됨
    if (!scrap) {
        return -1;
    }
    return undefined;
});
const challengeService = {
    postChallenge,
    postComment,
    postLike,
    postScrap,
    getChallengeAll,
    getChallengeSearch,
    getChallengeOne,
    patchChallenge,
    deleteChallenge,
    deleteLike,
    deleteScrap,
};
exports.default = challengeService;
//# sourceMappingURL=challengeService.js.map
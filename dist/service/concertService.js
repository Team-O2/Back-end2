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
exports.deleteConcertScrap = exports.postConcertScrap = exports.deleteConcertLike = exports.postConcertLike = exports.postConcertComment = exports.getConcertSearch = exports.getConcertOne = exports.getConcertAll = void 0;
const sequelize_1 = require("sequelize");
// models
const models_1 = require("../models");
/**
 *  @오투콘서트_전체_가져오기
 *  @route Get /concert?offset=@&limit=
 *  @access public
 *  @error
 *    1. limit이 없는 경우
 */
const getConcertAll = (userID, offset, limit) => __awaiter(void 0, void 0, void 0, function* () {
    // isDelete = true 인 애들만 가져오기
    // offset 뒤에서 부터 가져오기
    // 최신순으로 정렬
    // 댓글, 답글 최신순으로 정렬
    // public인 경우 isLike, isScrap 없음
    // 1. 요청 부족
    if (!limit) {
        return -1;
    }
    if (!offset) {
        offset = 0;
    }
    let include = [
        { model: models_1.Concert, required: true, where: { isNotice: false } },
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
    const concertList = yield models_1.Post.findAll({
        order: [
            ["createdAt", "DESC"],
            ["comments", "id", "DESC"],
        ],
        where: {
            isDeleted: false,
        },
        include,
        limit,
        offset,
    });
    const concerts = concertList.map((concert) => {
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
        let returnData = {
            id: concert.id,
            createdAt: concert.createdAt,
            updatedAt: concert.updatedAt,
            userID: concert.userID,
            nickname: concert.user.nickname,
            img: concert.user.img,
            authorNickname: concert.concert.authorNickname,
            title: concert.concert.title,
            videoLink: concert.concert.videoLink,
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
        };
        // userID가 있는 경우
        if (userID)
            returnData = Object.assign(Object.assign({}, returnData), { isLike: concert.userLikes.length ? true : false, isScrap: concert.userScraps.length ? true : false });
        return returnData;
    });
    const totalConcertNum = yield models_1.Post.count({
        where: {
            isDeleted: false,
        },
        include: [{ model: models_1.Concert, required: true, where: { isNotice: false } }],
    });
    const resData = {
        concerts,
        totalConcertNum,
    };
    return resData;
});
exports.getConcertAll = getConcertAll;
/**
 *  @오투콘서트_Detail
 *  @route Get /concert/:concertID
 *  @access public
 *  @error
 *    1. concertID가 없을 경우
 */
const getConcertOne = (userID, concertID) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. concertID가 없을 경우
    if (!concertID) {
        return -1;
    }
    let include = [
        { model: models_1.Concert, required: true, where: { isNotice: false } },
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
    // 댓글, 답글 join
    // isDeleted = false
    // isNotice = false
    const concert = yield models_1.Post.findOne({
        where: { isDeleted: false, "$concert.id$": concertID },
        order: [["comments", "id", "DESC"]],
        include,
    });
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
    let resData = {
        id: concert.id,
        createdAt: concert.createdAt,
        updatedAt: concert.updatedAt,
        userID: concert.userID,
        nickname: concert.user.nickname,
        img: concert.user.img,
        authorNickname: concert.concert.authorNickname,
        title: concert.concert.title,
        videoLink: concert.concert.videoLink,
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
    };
    // userID가 있는 경우
    if (userID)
        resData = Object.assign(Object.assign({}, resData), { isLike: concert.userLikes.length ? true : false, isScrap: concert.userScraps.length ? true : false });
    return resData;
});
exports.getConcertOne = getConcertOne;
/**
 *  @오투콘서트_검색_또는_필터
 *  @route Get /concert/search?offset=&limit=&tag=&keyword=
 *  @error
 *    1. limit이 없는 경우
 */
const getConcertSearch = (offset, limit, userID, tag, keyword) => __awaiter(void 0, void 0, void 0, function* () {
    // isDelete = true 인 애들만 가져오기
    // offset 뒤에서 부터 가져오기
    // 최신순으로 정렬
    // 댓글, 답글 populate
    // tag 검사
    // keyword 검사
    if (!limit) {
        return -1;
    }
    if (!offset) {
        offset = 0;
    }
    // where
    let where = {
        isDeleted: false,
    };
    if (tag && tag !== "전체") {
        where = Object.assign(Object.assign({}, where), { interest: { [sequelize_1.Op.like]: `%${tag}%` } });
    }
    if (keyword) {
        where = Object.assign(Object.assign({}, where), { [sequelize_1.Op.or]: [
                { "$concert.text$": { [sequelize_1.Op.like]: `%${keyword}%` } },
                { "$concert.title$": { [sequelize_1.Op.like]: `%${keyword}%` } },
                { "$concert.hashtag$": { [sequelize_1.Op.like]: `%${keyword}%` } },
            ] });
    }
    // include
    let include = [
        { model: models_1.Concert, required: true, where: { isNotice: false } },
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
    const concertList = yield models_1.Post.findAll({
        order: [["createdAt", "DESC"]],
        where,
        include,
        limit,
        offset,
    });
    const concerts = concertList.map((concert) => {
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
        let returnData = {
            id: concert.id,
            createdAt: concert.createdAt,
            updatedAt: concert.updatedAt,
            userID: concert.userID,
            nickname: concert.user.nickname,
            img: concert.user.img,
            authorNickname: concert.concert.authorNickname,
            title: concert.concert.title,
            videoLink: concert.concert.videoLink,
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
        };
        // userID가 있는 경우
        if (userID)
            returnData = Object.assign(Object.assign({}, returnData), { isLike: concert.userLikes.length ? true : false, isScrap: concert.userScraps.length ? true : false });
        return returnData;
    });
    const totalConcertNum = yield models_1.Post.count({
        where,
        include: [{ model: models_1.Concert, required: true, where: { isNotice: false } }],
    });
    const resData = {
        concerts,
        totalConcertNum,
    };
    return resData;
});
exports.getConcertSearch = getConcertSearch;
/**
 *  @콘서트_댓글_등록
 *  @route Post /concert/comment/:concertID
 *  @access private
 *  @error
 *      1. 회고록 id 잘못됨
 *      2. 요청 바디 부족
 *      3. 부모 댓글 id 값이 유효하지 않을 경우
 */
const postConcertComment = (concertID, userID, reqData) => __awaiter(void 0, void 0, void 0, function* () {
    const { parentID, text } = reqData;
    // 1. 회고록 id 잘못됨
    const concert = yield models_1.Post.findOne({
        where: {
            "$concert.id$": concertID,
            isDeleted: false,
        },
        include: [{ model: models_1.Concert, required: true, where: { isNotice: false } }],
    });
    if (!concert || concert.isDeleted) {
        return -1;
    }
    // 2. 요청 바디 부족
    if (!text) {
        return -2;
    }
    // 답글인 경우
    if (parentID) {
        const parentComment = yield models_1.Comment.findOne({
            where: { id: parentID, isDeleted: false },
        });
        // 3. 부모 댓글 id 값이 유효하지 않을 경우
        if (!parentComment) {
            return -3;
        }
        yield models_1.Comment.create({
            userID,
            postID: concertID,
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
            postID: concertID,
            text,
        });
        // 댓글 1개 작성 시 뱃지 추가
        const badge = yield models_1.Badge.findOne({ where: { id: userID } });
        if (!badge.oneCommentBadge) {
            badge.oneCommentBadge = true;
            yield badge.save();
        }
        // 댓글 5개 작성 시 뱃지 추가
        const user = yield models_1.User.findOne({
            where: { id: userID },
            include: [models_1.Comment],
        });
        // 댓글 5개 작성 시 뱃지 추가
        if (!badge.fiveCommentBadge && user.comments.length > 4) {
            badge.fiveCommentBadge = true;
            yield badge.save();
        }
        return 1;
    }
});
exports.postConcertComment = postConcertComment;
/**
 *  @오투콘서트_좋아요_등록
 *  @route Post /concert/like/:concertID
 *  @access private
 *  @error
 *      1. 콘서트 id 잘못됨
 *      2. 이미 좋아요 한 글일 경우
 */
const postConcertLike = (concertID, userID) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. 콘서트 id 잘못됨
    const concert = yield models_1.Post.findOne({
        where: {
            "$concert.id$": concertID,
            isDeleted: false,
        },
        include: [{ model: models_1.Concert, required: true, where: { isNotice: false } }],
    });
    if (!concert || concert.isDeleted) {
        return -1;
    }
    const like = yield models_1.Like.findOne({ where: { postID: concertID, userID } });
    // 2. 이미 좋아요 한 글일 경우
    if (like) {
        return -2;
    }
    // 좋아요
    yield models_1.Like.create({
        postID: concertID,
        userID,
    });
    // 좋아요 1개 누를 시 뱃지 추가
    const badge = yield models_1.Badge.findOne({ where: { id: userID } });
    if (!badge.oneLikeBadge) {
        badge.oneLikeBadge = true;
        yield badge.save();
    }
    // 좋아요 5개 누를 시 뱃지 추가
    // 댓글 5개 작성 시 뱃지 추가
    const user = yield models_1.User.findOne({
        where: { id: userID },
        include: [models_1.Like],
    });
    // 댓글 5개 작성 시 뱃지 추가
    if (!badge.fiveLikeBadge && user.likes.length > 4) {
        badge.fiveLikeBadge = true;
        yield badge.save();
    }
    return 1;
});
exports.postConcertLike = postConcertLike;
/**
 *  @오투콘서트_좋아요_삭제
 *  @route Delete /concert/like/:concertID
 *  @access private
 *  @error
 *      1. 콘서트 id 잘못됨
 *      2. 좋아요 개수가 0
 */
const deleteConcertLike = (concertID, userID) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. 콘서트 id 잘못됨
    const concert = yield models_1.Post.findOne({
        where: {
            "$concert.id$": concertID,
            isDeleted: false,
        },
        include: [
            { model: models_1.Concert, required: true, where: { isNotice: false } },
            { model: models_1.Like, as: "likes", required: false },
        ],
    });
    if (!concert || concert.isDeleted) {
        return -1;
    }
    // 2. 좋아요 개수가 0
    if (concert.likes.length === 0) {
        return -2;
    }
    // 콘서트 글의 like 1 감소
    yield models_1.Like.destroy({
        where: { postID: concertID, userID },
    });
    return 1;
});
exports.deleteConcertLike = deleteConcertLike;
/**
 *  @오투콘서트_스크랩하기
 *  @route Post /concert/:concertID/scrap
 *  @access private
 *  @error
 *      1. 콘서트 id 잘못됨
 *      2. 이미 스크랩 한 회고일 경우
 */
const postConcertScrap = (concertID, userID) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. 콘서트 id 잘못됨
    const concert = yield models_1.Post.findOne({
        where: {
            "$concert.id$": concertID,
            isDeleted: false,
        },
        include: [{ model: models_1.Concert, required: true, where: { isNotice: false } }],
    });
    if (!concert || concert.isDeleted) {
        return -1;
    }
    // 2. 이미 스크랩 한 회고인 경우
    const scrap = yield models_1.Scrap.findOne({ where: { postID: concertID, userID } });
    if (scrap) {
        return -2;
    }
    // 3. 자신의 회고인 경우
    if (concert.concert.userID === userID) {
        return -3;
    }
    yield models_1.Scrap.create({
        postID: concertID,
        userID,
    });
    // 첫 스크랩이면 뱃지 발급
    yield models_1.Badge.update({ concertScrapBadge: true }, { where: { id: userID, concertScrapBadge: false } });
    return 1;
});
exports.postConcertScrap = postConcertScrap;
/**
 *  @유저_콘서트_스크랩_취소하기
 *  @route Delete /user/concert/:concertID
 *  @access private
 *  @error
 *      1. 콘서트 id 잘못됨
 *      2. 스크랩 하지 않은 글일 경우
 */
const deleteConcertScrap = (concertID, userID) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. 콘서트 id 잘못됨
    const concert = yield models_1.Post.findOne({
        where: {
            "$concert.id$": concertID,
            isDeleted: false,
        },
        include: [{ model: models_1.Concert, required: true, where: { isNotice: false } }],
    });
    if (!concert || concert.isDeleted) {
        return -1;
    }
    // 2. 스크랩하지 않은 글일 경우
    let scrap = yield models_1.Scrap.findOne({ where: { postID: concertID, userID } });
    if (!scrap) {
        return -2;
    }
    yield models_1.Scrap.destroy({ where: { postID: concertID, userID } });
    return 1;
});
exports.deleteConcertScrap = deleteConcertScrap;
const concertService = {
    getConcertAll: exports.getConcertAll,
    getConcertOne: exports.getConcertOne,
    getConcertSearch: exports.getConcertSearch,
    postConcertComment: exports.postConcertComment,
    postConcertLike: exports.postConcertLike,
    deleteConcertLike: exports.deleteConcertLike,
    postConcertScrap: exports.postConcertScrap,
    deleteConcertScrap: exports.deleteConcertScrap,
};
exports.default = concertService;
//# sourceMappingURL=concertService.js.map
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
exports.postNoticeComment = exports.getNoticeSearch = exports.getNoticeOne = exports.getNoticeAll = void 0;
const sequelize_1 = require("sequelize");
// models
const models_1 = require("../models");
/**
 *  @공지사항_전체_가져오기
 *  @route Get /notice?offset=@&limit=
 *  @access public
 *  @error
 *    1. limit이 없는 경우
 */
const getNoticeAll = (userID, offset, limit) => __awaiter(void 0, void 0, void 0, function* () {
    // isDelete = false 인 애들만 가져오기
    // isNotice = true 인 애들만 가져오기
    // offset 뒤에서 부터 가져오기
    // 최신순으로 정렬
    // 댓글, 답글 최신순으로 정렬
    // 1. 요청 부족
    if (!limit) {
        return -1;
    }
    if (!offset) {
        offset = 0;
    }
    let include = [
        { model: models_1.Concert, required: true, where: { isNotice: true } },
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
    ];
    const noticeList = yield models_1.Post.findAll({
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
    const notices = noticeList.map((notice) => {
        // 댓글 형식 변환
        let comment = [];
        notice.comments.forEach((c) => {
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
            id: notice.id,
            createdAt: notice.createdAt,
            updatedAt: notice.updatedAt,
            userID: notice.userID,
            nickname: notice.user.nickname,
            img: notice.user.img,
            title: notice.concert.title,
            videoLink: notice.concert.videoLink,
            imgThumbnail: notice.concert.imgThumbnail,
            text: notice.concert.text,
            interest: notice.interest.split(","),
            hashtag: notice.concert.hashtag
                ? notice.concert.hashtag.slice(1).split("#")
                : undefined,
            commentNum: notice.comments.length,
            comment,
            isDeleted: notice.isDeleted,
            isNotice: notice.concert.isNotice,
        };
        return returnData;
    });
    const totalNoticeNum = noticeList.length;
    const resData = {
        notices,
        totalNoticeNum,
    };
    return resData;
});
exports.getNoticeAll = getNoticeAll;
/**
 *  @공지사항_Detail
 *  @route Get /notice/:noticeID
 *  @access public
 *  @error
 *    1. noticeID가 없을 경우
 */
const getNoticeOne = (userID, noticeID) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. noticeID가 없을 경우
    if (!noticeID) {
        return -1;
    }
    let include = [
        { model: models_1.Concert, required: true, where: { isNotice: true } },
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
    ];
    // 댓글, 답글 join
    // isDeleted = false
    const notice = yield models_1.Post.findOne({
        where: { isDeleted: false, "$concert.id$": noticeID },
        order: [["comments", "id", "DESC"]],
        include,
    });
    // 댓글 형식 변환
    let comment = [];
    notice.comments.forEach((c) => {
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
        id: notice.id,
        createdAt: notice.createdAt,
        updatedAt: notice.updatedAt,
        userID: notice.userID,
        nickname: notice.user.nickname,
        img: notice.user.img,
        title: notice.concert.title,
        videoLink: notice.concert.videoLink,
        imgThumbnail: notice.concert.imgThumbnail,
        text: notice.concert.text,
        interest: notice.interest.split(","),
        hashtag: notice.concert.hashtag
            ? notice.concert.hashtag.slice(1).split("#")
            : undefined,
        commentNum: notice.comments.length,
        comment,
        isDeleted: notice.isDeleted,
        isNotice: notice.concert.isNotice,
    };
    return resData;
});
exports.getNoticeOne = getNoticeOne;
/**
 *  @공지사항_검색_또는_필터
 *  @route Get /notice/search?offset=&limit=&tag=&keyword=
 *  @error
 *    1. limit이 없는 경우
 */
const getNoticeSearch = (offset, limit, userID, tag, keyword) => __awaiter(void 0, void 0, void 0, function* () {
    // isDelete = false 인 애들만 가져오기
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
        { model: models_1.Concert, required: true, where: { isNotice: true } },
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
    ];
    const noticeList = yield models_1.Post.findAll({
        order: [["createdAt", "DESC"]],
        where,
        include,
        limit,
        offset,
    });
    const notices = noticeList.map((notice) => {
        // 댓글 형식 변환
        let comment = [];
        notice.comments.forEach((c) => {
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
            id: notice.id,
            createdAt: notice.createdAt,
            updatedAt: notice.updatedAt,
            userID: notice.userID,
            nickname: notice.user.nickname,
            img: notice.user.img,
            title: notice.concert.title,
            videoLink: notice.concert.videoLink,
            imgThumbnail: notice.concert.imgThumbnail,
            text: notice.concert.text,
            interest: notice.interest.split(","),
            hashtag: notice.concert.hashtag
                ? notice.concert.hashtag.slice(1).split("#")
                : undefined,
            commentNum: notice.comments.length,
            comment,
            isDeleted: notice.isDeleted,
            isNotice: notice.concert.isNotice,
        };
        return returnData;
    });
    const totalNoticeNum = noticeList.length;
    const resData = {
        notices,
        totalNoticeNum,
    };
    return resData;
});
exports.getNoticeSearch = getNoticeSearch;
/**
 *  @공지사항_댓글_등록
 *  @route Post /notice/comment/:noticeID
 *  @access private
 *  @error
 *      1. 공지사항 id 잘못됨
 *      2. 요청 바디 부족
 *      3. 부모 댓글 id 값이 유효하지 않을 경우
 */
const postNoticeComment = (noticeID, userID, reqData) => __awaiter(void 0, void 0, void 0, function* () {
    const { parentID, text } = reqData;
    // 1. 회고록 id 잘못됨
    const notice = yield models_1.Post.findOne({
        where: {
            "$concert.id$": noticeID,
            isDeleted: false,
        },
        include: [{ model: models_1.Concert, required: true, where: { isNotice: true } }],
    });
    if (!notice || notice.isDeleted) {
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
            postID: noticeID,
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
            postID: noticeID,
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
exports.postNoticeComment = postNoticeComment;
const noticeService = {
    getNoticeAll: exports.getNoticeAll,
    getNoticeOne: exports.getNoticeOne,
    getNoticeSearch: exports.getNoticeSearch,
    postNoticeComment: exports.postNoticeComment,
};
exports.default = noticeService;
//# sourceMappingURL=noticeService.js.map
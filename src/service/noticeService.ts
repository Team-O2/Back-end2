import sequelize, { Op } from "sequelize";

// models
import { Badge, Concert, Comment, Like, Post, Scrap, User } from "../models";

// DTO
import { concertDTO, commentDTO } from "../DTO";

/**
 *  @공지사항_전체_가져오기
 *  @route Get /notice?offset=@&limit=
 *  @access public
 *  @error
 *    1. limit이 없는 경우
 */
export const getNoticeAll = async (
  userID: number,
  offset: number,
  limit: number
) => {
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

  let include: sequelize.Includeable | sequelize.Includeable[] = [
    { model: Concert, required: true, where: { isNotice: true } },
    User,
    {
      model: Comment,
      as: "comments",
      required: false,
      where: { level: 0 },
      include: [
        User,
        {
          model: Comment,
          as: "children",
          separate: true,
          order: [["id", "DESC"]],
          include: [User],
        },
      ],
    },
  ];

  const noticeList = await Post.findAll({
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

  const notices: concertDTO.getConcertResDTO[] = noticeList.map((notice) => {
    // 댓글 형식 변환
    let comment: commentDTO.IComment[] = [];
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

    let returnData: concertDTO.getConcertResDTO = {
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
  const resData: concertDTO.noticeAllResDTO = {
    notices,
    totalNoticeNum,
  };

  return resData;
};

/**
 *  @공지사항_Detail
 *  @route Get /notice/:noticeID
 *  @access public
 *  @error
 *    1. noticeID가 없을 경우
 */
export const getNoticeOne = async (userID: number, noticeID: number) => {
  // 1. noticeID가 없을 경우
  if (!noticeID) {
    return -1;
  }

  let include: sequelize.Includeable | sequelize.Includeable[] = [
    { model: Concert, required: true, where: { isNotice: true } },
    User,
    {
      model: Comment,
      as: "comments",
      required: false,
      where: { level: 0 },
      include: [
        User,
        {
          model: Comment,
          as: "children",
          separate: true,
          order: [["id", "DESC"]],
          include: [User],
        },
      ],
    },
  ];

  // 댓글, 답글 join
  // isDeleted = false
  const notice = await Post.findOne({
    where: { isDeleted: false, "$concert.id$": noticeID },
    order: [["comments", "id", "DESC"]],
    include,
  });
  // 댓글 형식 변환
  let comment: commentDTO.IComment[] = [];
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

  let resData: concertDTO.getConcertResDTO = {
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
};

/**
 *  @공지사항_검색_또는_필터
 *  @route Get /notice/search?offset=&limit=&tag=&keyword=
 *  @error
 *    1. limit이 없는 경우
 */
export const getNoticeSearch = async (
  offset: number,
  limit: number,
  userID?: number,
  tag?: string,
  keyword?: string
) => {
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
  let where: any = {
    isDeleted: false,
  };

  if (tag && tag !== "전체") {
    where = {
      ...where,
      interest: { [Op.like]: `%${tag}%` },
    };
  }

  if (keyword) {
    where = {
      ...where,
      [Op.or]: [
        { "$concert.text$": { [Op.like]: `%${keyword}%` } },
        { "$concert.title$": { [Op.like]: `%${keyword}%` } },
        { "$concert.hashtag$": { [Op.like]: `%${keyword}%` } },
      ],
    };
  }

  // include
  let include: sequelize.Includeable | sequelize.Includeable[] = [
    { model: Concert, required: true, where: { isNotice: true } },
    User,
    {
      model: Comment,
      as: "comments",
      required: false,
      where: { level: 0 },
      include: [
        User,
        {
          model: Comment,
          as: "children",
          separate: true,
          order: [["id", "DESC"]],
          include: [User],
        },
      ],
    },
  ];

  const noticeList = await Post.findAll({
    order: [["createdAt", "DESC"]],
    where,
    include,
    limit,
    offset,
  });

  const notices: concertDTO.getConcertResDTO[] = noticeList.map((notice) => {
    // 댓글 형식 변환
    let comment: commentDTO.IComment[] = [];
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

    let returnData: concertDTO.getConcertResDTO = {
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
  const resData: concertDTO.noticeAllResDTO = {
    notices,
    totalNoticeNum,
  };

  return resData;
};

/**
 *  @공지사항_댓글_등록
 *  @route Post /notice/comment/:noticeID
 *  @access private
 *  @error
 *      1. 공지사항 id 잘못됨
 *      2. 요청 바디 부족
 *      3. 부모 댓글 id 값이 유효하지 않을 경우
 */
export const postNoticeComment = async (
  noticeID: number,
  userID: number,
  reqData: commentDTO.postCommentReqDTO
) => {
  const { parentID, text } = reqData;
  // 1. 회고록 id 잘못됨
  const notice = await Post.findOne({
    where: {
      "$concert.id$": noticeID,
      isDeleted: false,
    },
    include: [{ model: Concert, required: true, where: { isNotice: true } }],
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
    const parentComment = await Comment.findOne({
      where: { id: parentID, isDeleted: false },
    });

    // 3. 부모 댓글 id 값이 유효하지 않을 경우
    if (!parentComment) {
      return -3;
    }

    await Comment.create({
      userID,
      postID: noticeID,
      parentID,
      text,
      level: 1,
    });

    // 첫 답글 작성 시 뱃지 추가
    await Badge.update(
      { firstReplyBadge: true },
      {
        where: { id: userID, firstReplyBadge: false },
      }
    );
  } else {
    // 댓글인 경우
    await Comment.create({
      userID,
      postID: noticeID,
      text,
    });

    // 댓글 1개 작성 시 뱃지 추가
    const badge = await Badge.findOne({ where: { id: userID } });
    if (!badge.oneCommentBadge) {
      badge.oneCommentBadge = true;
      await badge.save();
    }

    // 댓글 5개 작성 시 뱃지 추가
    const user = await User.findOne({
      where: { id: userID },
      include: [Comment],
    });

    // 댓글 5개 작성 시 뱃지 추가
    if (!badge.fiveCommentBadge && user.comments.length > 4) {
      badge.fiveCommentBadge = true;
      await badge.save();
    }

    return 1;
  }
};

const noticeService = {
  getNoticeAll,
  getNoticeOne,
  getNoticeSearch,
  postNoticeComment,
};

export default noticeService;

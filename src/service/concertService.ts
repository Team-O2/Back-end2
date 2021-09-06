import sequelize, { Op } from "sequelize";

// models
import { Badge, Concert, Comment, Like, Post, Scrap, User } from "../models";

// DTO
import { concertDTO, commentDTO } from "../DTO";

/**
 *  @오투콘서트_전체_가져오기
 *  @route Get /concert?offset=@&limit=
 *  @access public
 *  @error
 *    1. limit이 없는 경우
 */
export const getConcertAll = async (
  userID: number,
  offset: number,
  limit: number
) => {
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

  let include: sequelize.Includeable | sequelize.Includeable[] = [
    { model: Concert, required: true, where: { isNotice: false } },
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
    { model: Like, as: "likes", required: false },
    { model: Scrap, as: "scraps", required: false },
  ];

  // userID가 있는 경우
  if (userID)
    include = [
      ...include,
      { model: Like, as: "userLikes", where: { userID }, required: false },
      { model: Scrap, as: "userScraps", where: { userID }, required: false },
    ];

  const concertList = await Post.findAll({
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

  const concerts: concertDTO.getConcertResDTO[] = concertList.map((concert) => {
    // 댓글 형식 변환
    let comment: commentDTO.IComment[] = [];
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

    let returnData: concertDTO.getConcertResDTO = {
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
      returnData = {
        ...returnData,
        isLike: concert.userLikes.length ? true : false,
        isScrap: concert.userScraps.length ? true : false,
      };

    return returnData;
  });

  const totalConcertNum = await Post.count({
    where: {
      isDeleted: false,
    },
    include: [{ model: Concert, required: true, where: { isNotice: false } }],
  });
  const resData: concertDTO.concertAllResDTO = {
    concerts,
    totalConcertNum,
  };

  return resData;
};

/**
 *  @오투콘서트_Detail
 *  @route Get /concert/:concertID
 *  @access public
 *  @error
 *    1. concertID가 없을 경우
 */
export const getConcertOne = async (userID: number, concertID: number) => {
  // 1. concertID가 없을 경우
  if (!concertID) {
    return -1;
  }

  let include: sequelize.Includeable | sequelize.Includeable[] = [
    { model: Concert, required: true, where: { isNotice: false } },
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
    { model: Like, as: "likes", required: false },
    { model: Scrap, as: "scraps", required: false },
  ];

  // userID가 있는 경우
  if (userID)
    include = [
      ...include,
      { model: Like, as: "userLikes", where: { userID }, required: false },
      { model: Scrap, as: "userScraps", where: { userID }, required: false },
    ];

  // 댓글, 답글 join
  // isDeleted = false
  // isNotice = false
  const concert = await Post.findOne({
    where: { isDeleted: false, "$concert.id$": concertID },
    order: [["comments", "id", "DESC"]],
    include,
  });
  // 댓글 형식 변환
  let comment: commentDTO.IComment[] = [];
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

  let resData: concertDTO.getConcertResDTO = {
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
    resData = {
      ...resData,
      isLike: concert.userLikes.length ? true : false,
      isScrap: concert.userScraps.length ? true : false,
    };

  return resData;
};

/**
 *  @오투콘서트_검색_또는_필터
 *  @route Get /concert/search?offset=&limit=&tag=&keyword=
 *  @error
 *    1. limit이 없는 경우
 */
export const getConcertSearch = async (
  offset: number,
  limit: number,
  userID?: number,
  tag?: string,
  keyword?: string
) => {
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
    { model: Concert, required: true, where: { isNotice: false } },
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
    { model: Like, as: "likes", required: false },
    { model: Scrap, as: "scraps", required: false },
  ];

  // userID가 있는 경우
  if (userID)
    include = [
      ...include,
      { model: Like, as: "userLikes", where: { userID }, required: false },
      { model: Scrap, as: "userScraps", where: { userID }, required: false },
    ];

  const concertList = await Post.findAll({
    order: [["createdAt", "DESC"]],
    where,
    include,
    limit,
    offset,
  });

  const concerts: concertDTO.getConcertResDTO[] = concertList.map((concert) => {
    // 댓글 형식 변환
    let comment: commentDTO.IComment[] = [];
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

    let returnData: concertDTO.getConcertResDTO = {
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
      returnData = {
        ...returnData,
        isLike: concert.userLikes.length ? true : false,
        isScrap: concert.userScraps.length ? true : false,
      };

    return returnData;
  });

  const totalConcertNum = await Post.count({
    where,
    include: [{ model: Concert, required: true, where: { isNotice: false } }],
  });
  const resData: concertDTO.concertAllResDTO = {
    concerts,
    totalConcertNum,
  };

  return resData;
};

/**
 *  @콘서트_댓글_등록
 *  @route Post /concert/comment/:concertID
 *  @access private
 *  @error
 *      1. 회고록 id 잘못됨
 *      2. 요청 바디 부족
 *      3. 부모 댓글 id 값이 유효하지 않을 경우
 */
export const postConcertComment = async (
  concertID: number,
  userID: number,
  reqData: commentDTO.postCommentReqDTO
) => {
  const { parentID, text } = reqData;
  // 1. 회고록 id 잘못됨
  const concert = await Post.findOne({
    where: {
      "$concert.id$": concertID,
      isDeleted: false,
    },
    include: [{ model: Concert, required: true, where: { isNotice: false } }],
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
    const parentComment = await Comment.findOne({
      where: { id: parentID, isDeleted: false },
    });

    // 3. 부모 댓글 id 값이 유효하지 않을 경우
    if (!parentComment) {
      return -3;
    }

    await Comment.create({
      userID,
      postID: concertID,
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
      postID: concertID,
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

/**
 *  @오투콘서트_좋아요_등록
 *  @route Post /concert/like/:concertID
 *  @access private
 *  @error
 *      1. 콘서트 id 잘못됨
 *      2. 이미 좋아요 한 글일 경우
 */
export const postConcertLike = async (concertID: number, userID: number) => {
  // 1. 콘서트 id 잘못됨
  const concert = await Post.findOne({
    where: {
      "$concert.id$": concertID,
      isDeleted: false,
    },
    include: [{ model: Concert, required: true, where: { isNotice: false } }],
  });

  if (!concert || concert.isDeleted) {
    return -1;
  }

  const like = await Like.findOne({ where: { postID: concertID, userID } });
  // 2. 이미 좋아요 한 글일 경우
  if (like) {
    return -2;
  }

  // 좋아요
  await Like.create({
    postID: concertID,
    userID,
  });

  // 좋아요 1개 누를 시 뱃지 추가
  const badge = await Badge.findOne({ where: { id: userID } });
  if (!badge.oneLikeBadge) {
    badge.oneLikeBadge = true;
    await badge.save();
  }

  // 좋아요 5개 누를 시 뱃지 추가
  // 댓글 5개 작성 시 뱃지 추가
  const user = await User.findOne({
    where: { id: userID },
    include: [Like],
  });

  // 댓글 5개 작성 시 뱃지 추가
  if (!badge.fiveLikeBadge && user.likes.length > 4) {
    badge.fiveLikeBadge = true;
    await badge.save();
  }

  return 1;
};

/**
 *  @오투콘서트_좋아요_삭제
 *  @route Delete /concert/like/:concertID
 *  @access private
 *  @error
 *      1. 콘서트 id 잘못됨
 *      2. 좋아요 개수가 0
 */
export const deleteConcertLike = async (concertID: number, userID: number) => {
  // 1. 콘서트 id 잘못됨
  const concert = await Post.findOne({
    where: {
      "$concert.id$": concertID,
      isDeleted: false,
    },
    include: [
      { model: Concert, required: true, where: { isNotice: false } },
      { model: Like, as: "likes", required: false },
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
  await Like.destroy({
    where: { postID: concertID, userID },
  });

  return 1;
};

/**
 *  @오투콘서트_스크랩하기
 *  @route Post /concert/:concertID/scrap
 *  @access private
 *  @error
 *      1. 콘서트 id 잘못됨
 *      2. 이미 스크랩 한 회고일 경우
 */
export const postConcertScrap = async (concertID: number, userID: number) => {
  // 1. 콘서트 id 잘못됨
  const concert = await Post.findOne({
    where: {
      "$concert.id$": concertID,
      isDeleted: false,
    },
    include: [{ model: Concert, required: true, where: { isNotice: false } }],
  });

  if (!concert || concert.isDeleted) {
    return -1;
  }

  // 2. 이미 스크랩 한 회고인 경우
  const scrap = await Scrap.findOne({ where: { postID: concertID, userID } });
  if (scrap) {
    return -2;
  }

  // 3. 자신의 회고인 경우
  if (concert.concert.userID === userID) {
    return -3;
  }

  await Scrap.create({
    postID: concertID,
    userID,
  });

  // 첫 스크랩이면 뱃지 발급
  await Badge.update(
    { concertScrapBadge: true },
    { where: { id: userID, concertScrapBadge: false } }
  );

  return 1;
};

/**
 *  @유저_콘서트_스크랩_취소하기
 *  @route Delete /user/concert/:concertID
 *  @access private
 *  @error
 *      1. 콘서트 id 잘못됨
 *      2. 스크랩 하지 않은 글일 경우
 */
export const deleteConcertScrap = async (concertID: number, userID: number) => {
  // 1. 콘서트 id 잘못됨
  const concert = await Post.findOne({
    where: {
      "$concert.id$": concertID,
      isDeleted: false,
    },
    include: [{ model: Concert, required: true, where: { isNotice: false } }],
  });

  if (!concert || concert.isDeleted) {
    return -1;
  }

  // 2. 스크랩하지 않은 글일 경우
  let scrap = await Scrap.findOne({ where: { postID: concertID, userID } });
  if (!scrap) {
    return -2;
  }

  await Scrap.destroy({ where: { postID: concertID, userID } });

  return 1;
};

const concertService = {
  getConcertAll,
  getConcertOne,
  getConcertSearch,
  postConcertComment,
  postConcertLike,
  deleteConcertLike,
  postConcertScrap,
  deleteConcertScrap,
};

export default concertService;

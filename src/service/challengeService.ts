import sequelize, { Op } from "sequelize";
// models
import {
  Badge,
  Challenge,
  Comment,
  Like,
  Post,
  Scrap,
  User,
  Generation,
} from "../models";
// DTO
import { challengeDTO, commentDTO } from "../DTO";

/**
 *  @챌린지_회고_등록
 *  @route Post /
 *  @body author, good, bad, learn, interest, generation
 *  @error
 *      1. 요청 바디 부족
 *      2. 유저 id 잘못됨
 */

const postChallenge = async (
  userID: number,
  reqData: challengeDTO.postChallengeReqDTO
) => {
  const { good, bad, learn, interest, generation } = reqData;

  // 1. 요청 바디 부족
  if (!good || !bad || !learn || !interest || !generation) {
    return -1;
  }

  const user = await User.findOne({ where: { id: userID } });

  // 2. 유저 id 잘못됨
  if (!user) {
    return -2;
  }

  // challenge 생성
  const newPost = await Post.create({
    userID,
    generation,
  });
  await Challenge.create({
    id: newPost.id,
    good: good,
    bad: bad,
    learn: learn,
    interest: interest.join(),
  });

  // 유저의 writingCNT 증가
  await Generation.increment("writingNum", { by: 1, where: { userID } });

  // 첫 챌린지 회고 작성 시 배지 추가
  await Badge.update(
    { firstWriteBadge: true },
    { where: { id: userID, firstWriteBadge: false } }
  );

  // table join
  const challenge = await Post.findOne({
    where: {
      id: newPost.id,
    },
    include: [
      Challenge,
      {
        model: User,
        attributes: ["nickname", "img"],
      },
      Like,
      Scrap,
    ],
  });

  // data 형식에 맞게 변경
  const resData: challengeDTO.postChallengeResDTO = {
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
};

/**
 *  @챌린지_회고_댓글_등록
 *  @route POST /:challengeID/comment
 *  @body parentID, text
 *  @error
 *      1. 챌린지 id 잘못됨
 *      2. 요청 바디 부족
 *      3. 부모 댓글 id 값이 유효하지 않을 경우
 */

const postComment = async (
  challengeID: number,
  userID: number,
  reqData: commentDTO.postCommentReqDTO
) => {
  const { parentID, text } = reqData;

  // 1. 회고록 id 잘못됨
  const challenge = await Challenge.findOne({
    where: { id: challengeID },
    include: [Post],
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
    const parentComment = await Comment.findOne({
      where: { id: parentID, isDeleted: false },
    });

    // 3. 부모 댓글 id 값이 유효하지 않을 경우
    if (!parentComment) {
      return -3;
    }

    // 대댓글 생성
    await Comment.create({
      userID,
      postID: challengeID,
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
      postID: challengeID,
      text,
    });
  }

  // 댓글 1개 작성 시 뱃지 추가
  const badge = await Badge.findOne({
    where: { id: userID },
    include: [{ model: User, include: [Comment] }],
  });
  if (!badge.oneCommentBadge) {
    badge.oneCommentBadge = true;
    await badge.save();
  }
  // 댓글 5개 작성 시 뱃지 추가
  if (!badge.fiveCommentBadge && badge.user.comments.length > 4) {
    badge.fiveCommentBadge = true;
    await badge.save();
  }

  return undefined;
};

/**
 *  @챌린지_회고_좋아요_등록
 *  @route /:challengeID/like
 *  @error
 *      1. 챌린지 id 잘못됨
 *      2. 이미 좋아요 한 글일 경우
 */

const postLike = async (challengeID: number, userID: number) => {
  const challenge = await Challenge.findOne({
    where: { id: challengeID },
    include: [Post],
  });

  // 1. 회고록 id 잘못됨
  if (!challenge || challenge.post.isDeleted) {
    return -1;
  }

  const like = await Like.findOne({ where: { postID: challengeID, userID } });

  // 2. 이미 좋아요 한 글일 경우
  if (like) {
    return -2;
  }

  // 좋아요 등록
  await Like.create({
    postID: challengeID,
    userID,
  });

  // 좋아요 1개 누를 시 뱃지 추가
  const badge = await Badge.findOne({
    where: { id: userID },
    include: [{ model: User, include: [Like] }],
  });
  if (!badge.oneLikeBadge) {
    badge.oneLikeBadge = true;
    await badge.save();
  }

  // 좋아요 5개 누를 시 뱃지 추가
  if (!badge.fiveLikeBadge && badge.user.likes.length > 4) {
    badge.fiveLikeBadge = true;
    await badge.save();
  }

  return;
};

/**
 *  @유저_챌린지_회고_스크랩하기
 *  @route Post /:challengeID/scrap
 *  @error
 *      1. 챌린지 id 잘못됨
 *      2. 이미 스크랩 한 글일 경우
 *      3. 자신이 작성한 글인 경우
 */

const postScrap = async (challengeID: number, userID: number) => {
  const challenge = await Challenge.findOne({
    where: { id: challengeID },
    include: [Post],
  });

  // 1. 챌린지 id 잘못됨
  if (!challenge || challenge.post.isDeleted) {
    return -1;
  }

  const scrap = await Scrap.findOne({ where: { postID: challengeID, userID } });

  // 2. 이미 스크랩 한 글인 경우
  if (scrap) {
    return -2;
  }

  // 3. 자신의 글인 경우
  if (challenge.post.userID === userID) {
    return -3;
  }

  await Scrap.create({
    postID: challengeID,
    userID,
  });

  // 게시글 첫 스크랩 시 배지 추가
  await Badge.update(
    { learnMySelfScrapBadge: true },
    { where: { id: userID, learnMySelfScrapBadge: false } }
  );

  return;
};

/**
 *  @챌린지_전체_가져오기
 *  @route Get ?offset=&limit=&generation=
 *  @error
 *    1. limit이 없는 경우
 *    2. generation이 없는 경우
 */

const getChallengeAll = async (
  userID?: number,
  generation?: number,
  offset?: number,
  limit?: number
) => {
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

  let include: sequelize.Includeable | sequelize.Includeable[] = [
    { model: Challenge, required: true },
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

  const challengeList = await Post.findAll({
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

  const resData: challengeDTO.getChallengeResDTO[] = challengeList.map(
    (challenge) => {
      // 댓글 형식 변환
      let comment: commentDTO.IComment[] = [];
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

      let returnData: challengeDTO.getChallengeResDTO = {
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
        returnData = {
          ...returnData,
          isLike: challenge.userLikes.length ? true : false,
          isScrap: challenge.userScraps.length ? true : false,
        };

      return returnData;
    }
  );

  return resData;
};

/**
 *  @챌린지_회고_검색_또는_필터
 *  @route Get /search?offset=&limit=&generation=&tag=&keyword=&isMine=
 *  @error
 *    1. limit이 없는 경우
 *    2. generation이 없는 경우
 *    3. isMine=true 인데 user id가 없는 경우
 */

const getChallengeSearch = async (
  offset: number,
  limit: number,
  generation: number,
  userID?: number,
  tag?: string,
  isMine?: boolean,
  keyword?: string
) => {
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

  // 3. isMine=true 인데 user id가 없는 경우
  if (isMine && !userID) {
    return -3;
  }

  if (!offset) {
    offset = 0;
  }

  // where option
  let where: sequelize.WhereOptions<any> = {
    isDeleted: false,
    generation,
  };

  // tag 여부에 따라 query 적용
  if (tag && tag !== "전체")
    where = {
      ...where,
      interest: { [Op.like]: `%${tag}%` },
    };

  // keyword 여부에 따라 query 적용
  if (keyword)
    where = {
      ...where,
      [Op.or]: [
        { "$challenge.good$": { [Op.like]: `%${keyword}%` } },
        { "$challenge.bad$": { [Op.like]: `%${keyword}%` } },
        { "$challenge.learn$": { [Op.like]: `%${keyword}%` } },
      ],
    };

  // isMine, user id 여부에 따라 query 적용
  if (isMine && userID)
    where = {
      ...where,
      "$user.id$": { [Op.eq]: userID },
    };

  // include option
  let include: sequelize.Includeable | sequelize.Includeable[] = [
    { model: Challenge, required: true },
    { model: User, required: true },
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

  // userID 있는 경우
  if (userID)
    include = [
      ...include,
      { model: Like, as: "userLikes", where: { userID }, required: false },
      { model: Scrap, as: "userScraps", where: { userID }, required: false },
    ];

  const challengeList = await Post.findAll({
    order: [
      ["createdAt", "DESC"],
      ["comments", "id", "DESC"],
    ],
    where,
    include,
    limit,
    offset,
  });

  const resData: challengeDTO.getChallengeResDTO[] = challengeList.map(
    (challenge) => {
      // 댓글 형식 변환
      let comment: commentDTO.IComment[] = [];
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

      let returnData: challengeDTO.getChallengeResDTO = {
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
        returnData = {
          ...returnData,
          isLike: challenge.userLikes.length ? true : false,
          isScrap: challenge.userScraps.length ? true : false,
        };

      return returnData;
    }
  );

  return resData;
};

/**
 *  @챌린지_Detail
 *  @route Get /challenge/:challengeID
 *  @error
 *    1. challenge id가 없을 때
 */

const getChallengeOne = async (challengeID: number, userID: number) => {
  // isDelete = fasle 인 애들만 가져오기
  const challenge = await Post.findOne({
    where: { isDeleted: false, "$challenge.id$": challengeID },
    order: [["comments", "id", "DESC"]],
    include: [
      { model: Challenge, required: true },
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
      { model: Like, as: "userLikes", where: { userID }, required: false },
      { model: Scrap, as: "scraps", required: false },
      { model: Scrap, as: "userScraps", where: { userID }, required: false },
    ],
  });

  // challenge ID가 없을 때
  if (!challenge) {
    return -1;
  }

  let comment: commentDTO.IComment[] = [];
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
};

/**
 *  @챌린지_회고_수정
 *  @route PATCH challenge/:challengeId
 *  @body good, bad, learn, interest
 *  @error
 *    1. 요청 바디 부족
 *    2. 회고록 id 잘못됨
 */

const patchChallenge = async (
  challengeID: number,
  reqData: challengeDTO.patchChallengeReqDTO
) => {
  const { good, bad, learn, interest } = reqData;

  // 1. 요청 바디 부족
  if (!good || !bad || !learn || !interest) {
    return -1;
  }

  const challenge = await Post.findOne({
    where: { isDeleted: false, "$challenge.id$": challengeID },
    include: [{ model: Challenge, required: true }, User, Like, Scrap],
  });

  // 2. 회고록 id 잘못됨
  if (!challenge) {
    return -2;
  }

  // 데이터 업데이트
  challenge.interest = interest.join();
  await challenge.save();
  await Challenge.update(
    { good, bad, learn },
    {
      where: { id: challengeID },
    }
  );

  const returnData: challengeDTO.patchChallengeResDTO = {
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
};

/**
 *  @챌린지_회고_삭제
 *  @route DELETE /challenge/:challengeId
 *  @error
 *      1. 회고록 id 잘못됨
 */

const deleteChallenge = async (challengeID: number) => {
  const challenge = await Post.findOne({ where: { id: challengeID } });

  // 1. 회고록 id 잘못됨
  if (!challenge || challenge.isDeleted) {
    return -1;
  }

  challenge.isDeleted = true;
  await challenge.save();

  // 유저의 writingNum 감소
  await Generation.update(
    { writingNum: sequelize.literal("writingNum - 1") },
    { where: { userID: challenge.userID, generation: challenge.generation } }
  );

  return undefined;
};

/**
 *  @챌린지_회고_좋아요_삭제
 *  @route DELETE /challenge/:challengeID/like
 *  @error
 *      1. 회고록 id 잘못됨
 */

const deleteLike = async (challengeID: number, userID: number) => {
  const like = await Like.destroy({
    where: { postID: challengeID, userID },
  });

  // 1. 회고록 id 잘못됨
  if (!like) {
    return -1;
  }

  return undefined;
};

/**
 *  @챌린지_회고_스크랩_삭제
 *  @route Delete /challenge/:challengeID
 *  @error
 *      1. 회고록 id 잘못됨
 */

const deleteScrap = async (challengeID: number, userID: number) => {
  const scrap = await Scrap.destroy({
    where: { postID: challengeID, userID },
  });

  // 1. 회고록 id 잘못됨
  if (!scrap) {
    return -1;
  }

  return undefined;
};

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

export default challengeService;

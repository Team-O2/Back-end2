// models
import Concert from "../models/Concert";
import User from "../models/User";
import Comment from "../models/Comment";
import Badge from "../models/Badge";

// DTO
import {
  IConcertDTO,
  concertResDTO,
  IConcertDetailDTO,
} from "../DTO/concertDTO";
import { commentReqDTO } from "../DTO/commentDTO";

/**
 *  @오투콘서트_전체_가져오기
 *  @route Get /concert
 */
export const getConcertAll = async (userID, offset, limit) => {
  // isDelete = true 인 애들만 가져오기
  // offset 뒤에서 부터 가져오기
  // 최신순으로 정렬
  // 댓글, 답글 populate
  // 댓글, 답글 최신순으로 정렬
  if (!limit) {
    return -1;
  }
  if (!offset) {
    offset = 0;
  }

  let concerts;
  concerts = await Concert.find({
    isDeleted: false,
    isNotice: false,
  })
    .skip(Number(offset))
    .limit(Number(limit))
    .sort({ likes: -1 })
    .populate("user", ["nickname", "img"])
    .populate({
      path: "comments",
      select: { userID: 1, text: 1, isDeleted: 1 },
      options: { sort: { _id: -1 } },
      populate: [
        {
          path: "childrenComment",
          select: { userID: 1, text: 1, isDeleted: 1 },
          options: { sort: { _id: -1 } },
          populate: {
            path: "userID",
            select: ["nickname", "img"],
          },
        },
        {
          path: "userID",
          select: ["nickname", "img"],
        },
      ],
    });

  let totalConcertNum = await Concert.find({
    isDeleted: false,
    isNotice: false,
  }).countDocuments();

  let resData: concertResDTO;
  if (userID) {
    // 좋아요, 스크랩 여부 추가
    const user = await User.findById(userID.id);
    const newConcerts: IConcertDTO[] = concerts.map((c) => {
      if (
        user.scraps.concertScraps.includes(c._id) &&
        user.likes.concertLikes.includes(c._id)
      ) {
        return { ...c._doc, isLike: true, isScrap: true };
      } else if (user.scraps.concertScraps.includes(c._id)) {
        return { ...c._doc, isLike: false, isScrap: true };
      } else if (user.likes.concertLikes.includes(c._id)) {
        return { ...c._doc, isLike: true, isScrap: false };
      } else {
        return {
          ...c._doc,
          isLike: false,
          isScrap: false,
        };
      }
    });

    resData = {
      concerts: newConcerts,
      totalConcertNum,
    };
  } else {
    resData = {
      concerts,
      totalConcertNum,
    };
  }

  return resData;
};

/**
 *  @오투콘서트_Detail
 *  @route Get /concert/:concertID
 */
export const getConcertOne = async (userID, concertID) => {
  // 댓글, 답글 populate
  // isDelete = true 인 애들만 가져오기
  let concert;
  concert = await Concert.findById(concertID)
    .populate("user", ["nickname", "img"])
    .populate({
      path: "comments",
      select: { userID: 1, text: 1, isDeleted: 1 },
      options: { sort: { _id: -1 } },
      populate: [
        {
          path: "childrenComment",
          select: { userID: 1, text: 1, isDeleted: 1 },
          options: { sort: { _id: -1 } },
          populate: {
            path: "userID",
            select: ["nickname", "img"],
          },
        },
        {
          path: "userID",
          select: ["nickname", "img"],
        },
      ],
    });

  let resData: IConcertDTO;
  if (userID) {
    // 좋아요, 스크랩 여부 추가
    const user = await User.findById(userID.id);
    if (
      user.scraps.concertScraps.includes(concertID) &&
      user.likes.concertLikes.includes(concertID)
    ) {
      resData = { ...concert._doc, isLike: true, isScrap: true };
    } else if (user.scraps.concertScraps.includes(concertID)) {
      resData = { ...concert._doc, isLike: false, isScrap: true };
    } else if (user.likes.concertLikes.includes(concertID)) {
      resData = { ...concert._doc, isLike: true, isScrap: false };
    } else {
      resData = {
        ...concert._doc,
        isLike: false,
        isScrap: false,
      };
    }
  } else {
    resData = concert;
  }

  return resData;
};

/**
 *  @오투콘서트_검색_또는_필터
 *  @route Get /concert/search?tag=관심분야&ismine=내글만보기여부&keyword=검색할단어
 */
export const getConcertSearch = async (userID, tag, keyword, offset, limit) => {
  // isDelete = true 인 애들만 가져오기
  // offset 뒤에서 부터 가져오기
  // 최신순으로 정렬
  // 댓글, 답글 populate

  if (!limit) {
    return -1;
  }
  if (!offset) {
    offset = 0;
  }

  let concerts;

  concerts = await Concert.find({
    isDeleted: false,
    isNotice: false,
  })
    .sort({ likes: -1 })
    .populate("user", ["nickname", "img"])
    .populate({
      path: "comments",
      select: { userID: 1, text: 1, isDeleted: 1 },
      options: { sort: { _id: -1 } },
      populate: [
        {
          path: "childrenComment",
          select: { userID: 1, text: 1, isDeleted: 1 },
          options: { sort: { _id: -1 } },
          populate: {
            path: "userID",
            select: ["nickname", "img"],
          },
        },
        {
          path: "userID",
          select: ["nickname", "img"],
        },
      ],
    });

  let filteredData = await concerts;

  // 관심분야 필터링
  if (tag !== "" && tag && tag !== "전체") {
    filteredData = filteredData.filter((fd) => {
      if (fd.interest.includes(tag.toLowerCase())) return fd;
    });
  }

  // 검색 단어 필터링
  if (keyword !== "" && keyword) {
    filteredData = filteredData.filter((fd) => {
      if (
        fd.text.includes(keyword.toLowerCase().trim()) ||
        fd.title.includes(keyword.toLowerCase().trim()) ||
        fd.hashtag.includes(keyword.toLowerCase().trim())
      )
        return fd;
    });
  }

  var searchData = [];
  for (var i = Number(offset); i < Number(offset) + Number(limit); i++) {
    if (!filteredData[i]) {
      break;
    }
    searchData.push(filteredData[i]);
  }

  const totalConcertNum = filteredData.length;
  let resData: concertResDTO;
  if (userID) {
    // 좋아요, 스크랩 여부 추가
    const user = await User.findById(userID.id);
    const newConcert = searchData.map((c) => {
      if (
        user.scraps.concertScraps.includes(c._id) &&
        user.likes.concertLikes.includes(c._id)
      ) {
        return { ...c._doc, isLike: true, isScrap: true };
      } else if (user.scraps.concertScraps.includes(c._id)) {
        return { ...c._doc, isLike: false, isScrap: true };
      } else if (user.likes.concertLikes.includes(c._id)) {
        return { ...c._doc, isLike: true, isScrap: false };
      } else {
        return {
          ...c._doc,
          isLike: false,
          isScrap: false,
        };
      }
    });

    resData = {
      concerts: newConcert,
      totalConcertNum,
    };
  } else {
    resData = {
      concerts: searchData,
      totalConcertNum,
    };
  }

  return resData;
};

/**
 *  @콘서트_댓글_등록
 *  @route Post /concert/comment/:concertID
 *  @access Private
 *  @error
 *      1. 회고록 id 잘못됨
 *      2. 요청 바디 부족
 *      3. 부모 댓글 id 값이 유효하지 않을 경우
 */
export const postConcertComment = async (
  concertID,
  userID,
  reqData: commentReqDTO
) => {
  const { parentID, text } = reqData;

  // 1. 회고록 id 잘못됨
  const concert = await Concert.findById(concertID);

  if (!concert || concert.isDeleted) {
    return -1;
  }
  // 2. 요청 바디 부족
  if (!text) {
    return -2;
  }

  let comment;
  // 답글인 경우
  if (parentID) {
    const parentComment = await Comment.findById(parentID);

    // 3. 부모 댓글 id 값이 유효하지 않을 경우
    if (!parentComment) {
      return -3;
    }

    comment = new Comment({
      postModel: "Concert",
      post: concertID,
      userID: userID,
      parentComment: parentID,
      text,
    });
    await comment.save();

    await parentComment.childrenComment.push(comment._id);
    await parentComment.save();

    // 첫 답글 작성 시 뱃지 추가
    const badge = await Badge.findOne({ user: userID });
    if (!badge.firstReplyBadge) {
      badge.firstReplyBadge = true;
      await badge.save();
    }
  } else {
    // 댓글인 경우
    comment = new Comment({
      postModel: "Concert",
      post: concertID,
      userID: userID,
      text,
    });

    await comment.save();
    await concert.comments.push(comment._id);
    await concert.save();

    // 댓글 1개 작성 시 뱃지 추가
    const badge = await Badge.findOne({ user: userID });
    if (!badge.oneCommentBadge) {
      badge.oneCommentBadge = true;
      await badge.save();
    }
    // 댓글 5개 작성 시 뱃지 추가
    const user = await User.findById(userID);
    if (!badge.fiveCommentBadge && user.commentCNT === 4) {
      badge.fiveCommentBadge = true;
      await badge.save();
    }

    // 유저 댓글 수 1 증가
    await user.update({
      commentCNT: user.commentCNT + 1,
    });
  }

  // 게시글 댓글 수 1 증가
  await Concert.findOneAndUpdate(
    { _id: concertID },
    {
      $inc: { commentNum: 1 },
    }
  );

  const user = await User.findById(userID);

  return {
    _id: comment._id,
    nickname: user.nickname,
    text: text,
    createdAt: comment.createdAt,
  };

  return;
};

/**
 *  @오투콘서트_좋아요_등록
 *  @route Post /concert/like/:concertID
 *  @error
 *      1. 콘서트 id 잘못됨
 *      2. 이미 좋아요 한 글일 경우
 */
export const postConcertLike = async (concertID, userID) => {
  // 1. 콘서트 id 잘못됨
  const concert = await Concert.findById(concertID);

  if (!concert || concert.isDeleted) {
    return -1;
  }

  const user = await User.findById(userID);
  // 2. 이미 좋아요 한 글일 경우
  if (user.likes.concertLikes.includes(concertID)) {
    return -2;
  }

  // 챌린지 글의 like 1 증가
  await Concert.findOneAndUpdate(
    { _id: concertID },
    {
      $inc: { likes: 1 },
    }
  );
  // 유저 likes 필드에 챌린지 id 추가
  user.likes.concertLikes.push(concertID);
  await user.save();

  // 좋아요 1개 누를 시 뱃지 추가
  const badge = await Badge.findOne({ user: userID });
  if (!badge.oneLikeBadge) {
    badge.oneLikeBadge = true;
    await badge.save();
  }

  // 좋아요 5개 누를 시 뱃지 추가
  if (
    !badge.fiveLikeBadge &&
    user.likes.challengeLikes.length + user.likes.concertLikes.length === 5
  ) {
    badge.fiveLikeBadge = true;
    await badge.save();
  }

  return { _id: concertID };
};

/**
 *  @오투콘서트_좋아요_삭제
 *  @route Delete /concert/like/:concertID
 *  @error
 *      1. 콘서트 id 잘못됨
 *      2. 좋아요 개수가 0
 */
export const deleteConcertLike = async (concertID, userID) => {
  const concert = await Concert.findById(concertID);

  // 1. 콘서트 id 잘못됨
  if (!concert || concert.isDeleted) {
    return -1;
  }

  // 2. 좋아요 개수가 0
  if (concert.likes === 0) {
    return -2;
  }

  // 콘서트 글의 like 1 감소
  await Concert.findOneAndUpdate(
    { _id: concertID },
    {
      $inc: { likes: -1 },
    }
  );
  // 유저 likes 필드에 챌린지 id 삭제
  const user = await User.findById(userID);

  const idx = user.likes.concertLikes.indexOf(concertID);
  user.likes.concertLikes.splice(idx, 1);

  await user.save();

  return { _id: concertID };
};

/**
 *  @오투콘서트_스크랩하기
 *  @route Post /user/concert/:concertID
 *  @error
 *      1. 콘서트 id 잘못됨
 *      2. 이미 스크랩 한 회고일 경우
 */
export const postConcertScrap = async (concertID, userID) => {
  // 1. 회고 id 잘못됨
  let concert = await Concert.findById(concertID);
  if (!concert || concert.isDeleted) {
    return -1;
  }

  const user = await User.findById(userID);

  // 2. 이미 스크랩 한 회고인 경우
  if (user.scraps.concertScraps.includes(concertID)) {
    return -2;
  }
  // 3. 자신의 회고인 경우
  if (concert.user.toString() === user._id.toString()) {
    console.log("dd");
    return -3;
  }

  // 게시글 스크랩 수 1 증가
  await Concert.findOneAndUpdate(
    { _id: concertID },
    {
      $inc: { scrapNum: 1 },
    }
  );

  user.scraps.concertScraps.push(concertID);
  await user.save();

  // 첫 스크랩이면 뱃지 발급
  const badge = await Badge.findOne(
    { user: userID },
    { concertScrapBadge: true, _id: false }
  );

  const scrapNum = user.scraps.concertScraps.length;
  if (!badge.concertScrapBadge && scrapNum === 1) {
    await Badge.findOneAndUpdate(
      { user: userID },
      { $set: { concertScrapBadge: true } }
    );
  }

  return { _id: concertID };
};

/**
 *  @유저_콘서트_스크랩_취소하기
 *  @route Delete /user/concert/:concertID
 *  @error
 *      1. 콘서트 id 잘못됨
 *      2. 스크랩 하지 않은 글일 경우
 */
export const deleteConcertScrap = async (concertID, userID) => {
  // 1. 콘서트 id 잘못됨
  let concert = await Concert.findById(concertID);
  if (!concert || concert.isDeleted) {
    return -1;
  }

  const user = await User.findById(userID);
  // 2. 스크랩하지 않은 글일 경우
  if (!user.scraps.concertScraps.includes(concertID)) {
    return -2;
  }

  // 게시글 스크랩 수 1 감소
  await Concert.findOneAndUpdate(
    { _id: concertID },
    {
      $inc: { scrapNum: -1 },
    }
  );

  // 유저 likes 필드에 챌린지 id 삭제
  const idx = user.scraps.concertScraps.indexOf(concertID);
  user.scraps.concertScraps.splice(idx, 1);
  await user.save();

  return { _id: concertID };
};

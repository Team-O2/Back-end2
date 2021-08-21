import sequelize, { Op } from "sequelize";

// models
import { Badge, Concert, Comment, Like, Post, Scrap, User } from "../models";

// DTO
import { concertDTO, commentDTO } from "../DTO";

/**
 *  @오투콘서트_전체_가져오기
 *  @route Get /concert?offset=@&limit=
 *  @error
 *    1. limit이 없는 경우
 */
export const getConcertAll = async (userID, offset, limit) => {
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

  const concertList = await Post.findAll({
    order: [["createdAt", "DESC"]],
    where: {
      isDeleted: false,
    },
    include: [
      { model: Concert, required: true, where: { isNotice: false } },
      User,
      { model: Comment, include: [User] },
      Like,
      Scrap,
    ],
    limit,
    offset,
  });

  const totalConcertNum = concertList.length;
  const concertListArr = Object.values(concertList);

  const concerts: concertDTO.getConcertResDTO[] = await Promise.all(
    concertListArr.map(async (concert) => {
      // 댓글 형식 변환
      let comment: commentDTO.IComment[] = [];
      concert.comments.forEach((c) => {
        if (c.level === 0) {
          comment.unshift({
            id: c.id,
            userID: c.userID,
            nickname: c.user.nickname,
            img: c.user.img,
            text: c.text,
            children: [],
          });
        } else if (!c.isDeleted) {
          comment[comment.length - 1].children.unshift({
            id: c.id,
            userID: c.userID,
            nickname: c.user.nickname,
            img: c.user.img,
            text: c.text,
          });
        }
      });

      const returnData = {
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

      if (userID) {
        const isLike = await Like.findOne({
          where: { userID, postID: concert.id },
        });
        const isScrap = await Scrap.findOne({
          where: { postID: concert.id },
        });

        return {
          ...returnData,
          isLike: isLike ? true : false,
          isScrap: isScrap ? true : false,
        };
      }

      return returnData;
    })
  );

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
export const getConcertOne = async (userID, concertID) => {
  // 1. concertID가 없을 경우
  if (!concertID) {
    return -1;
  }
  // 댓글, 답글 join
  // isDeleted = false
  // isNotice = false
  const concert = await Post.findOne({
    order: [["createdAt", "DESC"]],
    where: {
      "$concert.id$": concertID,
      isDeleted: false,
    },
    include: [
      { model: Concert, required: true, where: { isNotice: false } },
      User,
      { model: Comment, include: [User] },
      Like,
      Scrap,
    ],
  });

  let comment: commentDTO.IComment[] = [];
  concert.comments.forEach((c) => {
    if (c.level === 0) {
      comment.unshift({
        id: c.id,
        userID: c.userID,
        nickname: c.user.nickname,
        img: c.user.img,
        text: c.text,
        children: [],
      });
    } else if (!c.isDeleted) {
      comment[comment.length - 1].children.unshift({
        id: c.id,
        userID: c.userID,
        nickname: c.user.nickname,
        img: c.user.img,
        text: c.text,
      });
    }
  });

  const resData: concertDTO.getConcertResDTO = {
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

  if (userID) {
    const isLike = await Like.findOne({
      where: { userID, postID: concert.id },
    });
    const isScrap = await Scrap.findOne({
      where: { postID: concert.id },
    });

    return {
      ...resData,
      isLike: isLike ? true : false,
      isScrap: isScrap ? true : false,
    };
  }

  return resData;
};

/**
 *  @오투콘서트_검색_또는_필터
 *  @route Get /concert/search?offset=&limit=&tag=&keyword=
 *  @error
 *    1. limit이 없는 경우
 */
export const getConcertSearch = async (
  offset,
  limit,
  userID?,
  tag?,
  keyword?
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

  const concertList = await Post.findAll({
    order: [["createdAt", "DESC"]],
    where,
    include: [
      { model: Concert, required: true, where: { isNotice: false } },
      { model: User, required: true },
      { model: Comment, include: [User] },
      Like,
      Scrap,
    ],
    limit,
    offset,
  });

  const totalConcertNum = concertList.length;
  const concertListArr = Object.values(concertList);

  const concerts: concertDTO.getConcertResDTO[] = await Promise.all(
    concertListArr.map(async (concert) => {
      // 댓글 형식 변환
      let comment: commentDTO.IComment[] = [];
      concert.comments.forEach((c) => {
        if (c.level === 0) {
          comment.unshift({
            id: c.id,
            userID: c.userID,
            nickname: c.user.nickname,
            img: c.user.img,
            text: c.text,
            children: [],
          });
        } else if (!c.isDeleted) {
          comment[comment.length - 1].children.unshift({
            id: c.id,
            userID: c.userID,
            nickname: c.user.nickname,
            img: c.user.img,
            text: c.text,
          });
        }
      });
      const returnData = {
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

      if (userID) {
        const isLike = await Like.findOne({
          where: { userID, postID: concert.id },
        });
        const isScrap = await Scrap.findOne({
          where: { postID: concert.id },
        });

        return {
          ...returnData,
          isLike: isLike ? true : false,
          isScrap: isScrap ? true : false,
        };
      }

      return returnData;
    })
  );

  const resData: concertDTO.concertAllResDTO = {
    concerts,
    totalConcertNum,
  };

  return resData;
};

// /**
//  *  @콘서트_댓글_등록
//  *  @route Post /concert/comment/:concertID
//  *  @access Private
//  *  @error
//  *      1. 회고록 id 잘못됨
//  *      2. 요청 바디 부족
//  *      3. 부모 댓글 id 값이 유효하지 않을 경우
//  */
// export const postConcertComment = async (
//   concertID,
//   userID,
//   reqData: commentReqDTO
// ) => {
//   const { parentID, text } = reqData;

//   // 1. 회고록 id 잘못됨
//   const concert = await Concert.findById(concertID);

//   if (!concert || concert.isDeleted) {
//     return -1;
//   }
//   // 2. 요청 바디 부족
//   if (!text) {
//     return -2;
//   }

//   let comment;
//   // 답글인 경우
//   if (parentID) {
//     const parentComment = await Comment.findById(parentID);

//     // 3. 부모 댓글 id 값이 유효하지 않을 경우
//     if (!parentComment) {
//       return -3;
//     }

//     comment = new Comment({
//       postModel: "Concert",
//       post: concertID,
//       userID: userID,
//       parentComment: parentID,
//       text,
//     });
//     await comment.save();

//     await parentComment.childrenComment.push(comment._id);
//     await parentComment.save();

//     // 첫 답글 작성 시 뱃지 추가
//     const badge = await Badge.findOne({ user: userID });
//     if (!badge.firstReplyBadge) {
//       badge.firstReplyBadge = true;
//       await badge.save();
//     }
//   } else {
//     // 댓글인 경우
//     comment = new Comment({
//       postModel: "Concert",
//       post: concertID,
//       userID: userID,
//       text,
//     });

//     await comment.save();
//     await concert.comments.push(comment._id);
//     await concert.save();

//     // 댓글 1개 작성 시 뱃지 추가
//     const badge = await Badge.findOne({ user: userID });
//     if (!badge.oneCommentBadge) {
//       badge.oneCommentBadge = true;
//       await badge.save();
//     }
//     // 댓글 5개 작성 시 뱃지 추가
//     const user = await User.findById(userID);
//     if (!badge.fiveCommentBadge && user.commentCNT === 4) {
//       badge.fiveCommentBadge = true;
//       await badge.save();
//     }

//     // 유저 댓글 수 1 증가
//     await user.update({
//       commentCNT: user.commentCNT + 1,
//     });
//   }

//   // 게시글 댓글 수 1 증가
//   await Concert.findOneAndUpdate(
//     { _id: concertID },
//     {
//       $inc: { commentNum: 1 },
//     }
//   );

//   const user = await User.findById(userID);

//   return {
//     _id: comment._id,
//     nickname: user.nickname,
//     text: text,
//     createdAt: comment.createdAt,
//   };

//   return;
// };

// /**
//  *  @오투콘서트_좋아요_등록
//  *  @route Post /concert/like/:concertID
//  *  @error
//  *      1. 콘서트 id 잘못됨
//  *      2. 이미 좋아요 한 글일 경우
//  */
// export const postConcertLike = async (concertID, userID) => {
//   // 1. 콘서트 id 잘못됨
//   const concert = await Concert.findById(concertID);

//   if (!concert || concert.isDeleted) {
//     return -1;
//   }

//   const user = await User.findById(userID);
//   // 2. 이미 좋아요 한 글일 경우
//   if (user.likes.concertLikes.includes(concertID)) {
//     return -2;
//   }

//   // 챌린지 글의 like 1 증가
//   await Concert.findOneAndUpdate(
//     { _id: concertID },
//     {
//       $inc: { likes: 1 },
//     }
//   );
//   // 유저 likes 필드에 챌린지 id 추가
//   user.likes.concertLikes.push(concertID);
//   await user.save();

//   // 좋아요 1개 누를 시 뱃지 추가
//   const badge = await Badge.findOne({ user: userID });
//   if (!badge.oneLikeBadge) {
//     badge.oneLikeBadge = true;
//     await badge.save();
//   }

//   // 좋아요 5개 누를 시 뱃지 추가
//   if (
//     !badge.fiveLikeBadge &&
//     user.likes.challengeLikes.length + user.likes.concertLikes.length === 5
//   ) {
//     badge.fiveLikeBadge = true;
//     await badge.save();
//   }

//   return { _id: concertID };
// };

// /**
//  *  @오투콘서트_좋아요_삭제
//  *  @route Delete /concert/like/:concertID
//  *  @error
//  *      1. 콘서트 id 잘못됨
//  *      2. 좋아요 개수가 0
//  */
// export const deleteConcertLike = async (concertID, userID) => {
//   const concert = await Concert.findById(concertID);

//   // 1. 콘서트 id 잘못됨
//   if (!concert || concert.isDeleted) {
//     return -1;
//   }

//   // 2. 좋아요 개수가 0
//   if (concert.likes === 0) {
//     return -2;
//   }

//   // 콘서트 글의 like 1 감소
//   await Concert.findOneAndUpdate(
//     { _id: concertID },
//     {
//       $inc: { likes: -1 },
//     }
//   );
//   // 유저 likes 필드에 챌린지 id 삭제
//   const user = await User.findById(userID);

//   const idx = user.likes.concertLikes.indexOf(concertID);
//   user.likes.concertLikes.splice(idx, 1);

//   await user.save();

//   return { _id: concertID };
// };

// /**
//  *  @오투콘서트_스크랩하기
//  *  @route Post /user/concert/:concertID
//  *  @error
//  *      1. 콘서트 id 잘못됨
//  *      2. 이미 스크랩 한 회고일 경우
//  */
// export const postConcertScrap = async (concertID, userID) => {
//   // 1. 회고 id 잘못됨
//   let concert = await Concert.findById(concertID);
//   if (!concert || concert.isDeleted) {
//     return -1;
//   }

//   const user = await User.findById(userID);

//   // 2. 이미 스크랩 한 회고인 경우
//   if (user.scraps.concertScraps.includes(concertID)) {
//     return -2;
//   }
//   // 3. 자신의 회고인 경우
//   if (concert.user.toString() === user._id.toString()) {
//     console.log("dd");
//     return -3;
//   }

//   // 게시글 스크랩 수 1 증가
//   await Concert.findOneAndUpdate(
//     { _id: concertID },
//     {
//       $inc: { scrapNum: 1 },
//     }
//   );

//   user.scraps.concertScraps.push(concertID);
//   await user.save();

//   // 첫 스크랩이면 뱃지 발급
//   const badge = await Badge.findOne(
//     { user: userID },
//     { concertScrapBadge: true, _id: false }
//   );

//   const scrapNum = user.scraps.concertScraps.length;
//   if (!badge.concertScrapBadge && scrapNum === 1) {
//     await Badge.findOneAndUpdate(
//       { user: userID },
//       { $set: { concertScrapBadge: true } }
//     );
//   }

//   return { _id: concertID };
// };

// /**
//  *  @유저_콘서트_스크랩_취소하기
//  *  @route Delete /user/concert/:concertID
//  *  @error
//  *      1. 콘서트 id 잘못됨
//  *      2. 스크랩 하지 않은 글일 경우
//  */
// export const deleteConcertScrap = async (concertID, userID) => {
//   // 1. 콘서트 id 잘못됨
//   let concert = await Concert.findById(concertID);
//   if (!concert || concert.isDeleted) {
//     return -1;
//   }

//   const user = await User.findById(userID);
//   // 2. 스크랩하지 않은 글일 경우
//   if (!user.scraps.concertScraps.includes(concertID)) {
//     return -2;
//   }

//   // 게시글 스크랩 수 1 감소
//   await Concert.findOneAndUpdate(
//     { _id: concertID },
//     {
//       $inc: { scrapNum: -1 },
//     }
//   );

//   // 유저 likes 필드에 챌린지 id 삭제
//   const idx = user.scraps.concertScraps.indexOf(concertID);
//   user.scraps.concertScraps.splice(idx, 1);
//   await user.save();

//   return { _id: concertID };
// };

const concertService = { getConcertAll, getConcertOne, getConcertSearch };

export default concertService;

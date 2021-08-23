// models
import {
  Badge,
  Challenge,
  Comment,
  Like,
  Post,
  PostInterest,
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

export const postChallenge = async (
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
    good: good.toLowerCase(),
    bad: bad.toLowerCase(),
    learn: learn.toLowerCase(),
  });
  interest.map(
    async (it) =>
      await PostInterest.create({
        postID: newPost.id,
        interest: it.toLowerCase(),
      })
  );

  // 유저의 writingCNT 증가
  await Generation.increment("writingNum", { by: 1, where: { userID } });

  // 첫 챌린지 회고 작성 시 배지 추가
  const badge = await Badge.findOne({ where: { id: userID } });
  if (!badge.firstWriteBadge) {
    badge.firstWriteBadge = true;
    await badge.save();
  }

  // table join
  const challenge = await Post.findOne({
    where: {
      id: newPost.id,
    },
    include: [
      PostInterest,
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
    interest: challenge.interests.map((i) => i.interest),
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

export const postComment = async (
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

  let newComment;
  // 대댓글인 경우
  if (parentID) {
    const parentComment = await Comment.findOne({ where: { id: parentID } });

    // 3. 부모 댓글 id 값이 유효하지 않을 경우
    if (!parentComment) {
      return -3;
    }

    // 대댓글 생성
    newComment = await Comment.create({
      userID,
      postID: challengeID,
      text,
      level: 1,
      order: parentComment.groupNum,
    });
    await Comment.increment("groupNum", { by: 1, where: { id: parentID } });

    // 첫 답글 작성 시 뱃지 추가
    const badge = await Badge.findOne({ where: { id: userID } });
    if (!badge.firstReplyBadge) {
      badge.firstReplyBadge = true;
      await badge.save();
    }
  } else {
    // 댓글인 경우
    newComment = await Comment.create({
      userID,
      postID: challengeID,
      text,
      order: 0,
    });
  }

  const comment = await Comment.findOne({
    where: { id: newComment.id },
    include: [
      {
        model: User,
        attributes: ["img", "nickname"],
      },
    ],
  });

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

  const resData: commentDTO.postCommentResDTO = {
    id: comment.id,
    userID: comment.userID,
    nickname: comment.user.nickname,
    img: comment.user.img,
    text: comment.text,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };

  return resData;
};

/**
 *  @챌린지_회고_좋아요_등록
 *  @route /:challengeID/like
 *  @error
 *      1. 챌린지 id 잘못됨
 *      2. 이미 좋아요 한 글일 경우
 */

export const postLike = async (challengeID: number, userID: number) => {
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

export const postScrap = async (challengeID: number, userID: number) => {
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
  const badge = await Badge.findOne({ where: { id: userID } });
  if (!badge.learnMySelfScrapBadge) {
    badge.learnMySelfScrapBadge = true;
    await badge.save();
  }

  return;
};

/**
 *  @챌린지_전체_가져오기
 *  @route Get ?offset=&limit=&generation=
 *  @error
 *    1. limit이 없는 경우
 *    2. generation이 없는 경우
 */

export const getChallengeAll = async (
  userID?: number,
  generation?: number,
  offset?: number,
  limit?: number
) => {
  // isDelete = true 인 애들만 가져오기
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
    offset = 1;
  }

  const challengeList = await Post.findAll({
    order: [["createdAt", "DESC"]],
    where: {
      isDeleted: false,
      generation,
    },
    include: [
      Challenge,
      User,
      { model: Comment, include: [User] },
      Like,
      Scrap,
      PostInterest,
    ],
    limit,
    offset,
  });

  const resData: challengeDTO.getChallengeAllResDTO[] = await Promise.all(
    challengeList.map(async (challenge) => {
      // 댓글 형식 변환
      let comment: commentDTO.IComment[] = [];
      challenge.comments.forEach((c) => {
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
        interest: challenge.interests.map((interest) => interest.interest),
        likeNum: challenge.likes.length,
        scrapNum: challenge.scraps.length,
        commentNum: challenge.comments.length,
        comment,
      };

      if (userID) {
        const isLike = await Like.findOne({
          where: { userID, postID: challenge.id },
        });
        const isScrap = await Scrap.findOne({
          where: { postID: challenge.id },
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

  return resData;
};

// /**
//  *  @챌린지_Detail
//  *  @route Get /challenge/:challengeID
//  */
// export const getChallengeOne = async (userID, challengeID) => {
//   // 댓글, 답글 populate
//   // isDelete = true 인 애들만 가져오기
//   let challenge;
//   challenge = await Challenge.findById(challengeID)
//     .populate("user", ["nickname", "img"])
//     .populate({
//       path: "comments",
//       select: ["userID", "text", "isDeleted"],
//       options: { sort: { _id: -1 } },
//       populate: [
//         {
//           path: "childrenComment",
//           select: ["userID", "text", "isDeleted"],
//           options: { sort: { _id: -1 } },
//           populate: {
//             path: "userID",
//             select: ["nickname", "img"],
//           },
//         },
//         {
//           path: "userID",
//           select: ["nickname", "img"],
//         },
//       ],
//     });

//   // challenge ID가 잘못되었을 때
//   if (!challenge) {
//     return -1;
//   }

//   let resData: IChallengeDTO[];
//   if (userID) {
//     // 좋아요, 스크랩 여부 추가
//     const user = await User.findById(userID.id);
//     if (
//       user.scraps.challengeScraps.includes(challengeID) &&
//       user.likes.challengeLikes.includes(challengeID)
//     ) {
//       resData = { ...challenge._doc, isLike: true, isScrap: true };
//     } else if (user.scraps.challengeScraps.includes(challengeID)) {
//       resData = { ...challenge._doc, isLike: false, isScrap: true };
//     } else if (user.likes.challengeLikes.includes(challengeID)) {
//       resData = { ...challenge._doc, isLike: true, isScrap: false };
//     } else {
//       resData = {
//         ...challenge._doc,
//         isLike: false,
//         isScrap: false,
//       };
//     }
//   } else {
//     resData = challenge;
//   }

//   return resData;
// };

// /**
//  *  @챌린지_회고_검색_또는_필터
//  *  @route Get /challenge/search
//  */
// export const getChallengeSearch = async (
//   tag,
//   ismine,
//   keyword,
//   offset,
//   limit,
//   gen,
//   userID
// ) => {
//   // isDelete = true 인 애들만 가져오기
//   // offset 뒤에서 부터 가져오기
//   // 최신순으로 정렬
//   // 댓글, 답글 populate

//   if (!limit) {
//     return -1;
//   }
//   if (!offset) {
//     offset = 0;
//   }

//   let challenges;
//   challenges = await Challenge.find({
//     isDeleted: false,
//     generation: gen,
//   })
//     .sort({ _id: -1 })
//     .populate("user", ["nickname", "img"])
//     .populate({
//       path: "comments",
//       select: ["userID", "text", "isDeleted"],
//       options: { sort: { _id: -1 } },
//       populate: [
//         {
//           path: "childrenComment",
//           select: ["userID", "text", "isDeleted"],
//           options: { sort: { _id: -1 } },
//           populate: {
//             path: "userID",
//             select: ["nickname", "img"],
//           },
//         },
//         {
//           path: "userID",
//           select: ["nickname", "img"],
//         },
//       ],
//     });

//   let filteredData = challenges;

//   // 관심분야 필터링
//   if (tag !== "" && tag && tag !== "전체") {
//     filteredData = filteredData.filter((fd) => {
//       if (fd.interest.includes(tag.toLowerCase())) return fd;
//     });
//   }

//   if (userID) {
//     // 내가 쓴 글 필터링
//     if (ismine === "1" && ismine) {
//       filteredData = filteredData.filter((fd) => {
//         if (String(fd.user._id) === String(userID.id)) return fd;
//       });
//     }
//   }

//   // 검색 단어 필터링
//   if (keyword !== "" && keyword) {
//     filteredData = filteredData.filter((fd) => {
//       if (
//         fd.good.includes(keyword.toLowerCase().trim()) ||
//         fd.bad.includes(keyword.toLowerCase().trim()) ||
//         fd.learn.includes(keyword.toLowerCase().trim())
//       )
//         return fd;
//     });
//   }
//   var searchData = [];
//   for (var i = Number(offset); i < Number(offset) + Number(limit); i++) {
//     if (!filteredData[i]) {
//       break;
//     }
//     searchData.push(filteredData[i]);
//   }

//   var resData: IChallengeDTO[];
//   if (userID) {
//     // 좋아요, 스크랩 여부 추가
//     const user = await User.findById(userID.id);
//     const newChallenge = searchData.map((c) => {
//       // console.log(c);
//       if (
//         user.scraps.challengeScraps.includes(c._id) &&
//         user.likes.challengeLikes.includes(c._id)
//       ) {
//         return { ...c._doc, isLike: true, isScrap: true };
//       } else if (user.scraps.challengeScraps.includes(c._id)) {
//         return { ...c._doc, isLike: false, isScrap: true };
//       } else if (user.likes.challengeLikes.includes(c._id)) {
//         return { ...c._doc, isLike: true, isScrap: false };
//       } else {
//         return {
//           ...c._doc,
//           isLike: false,
//           isScrap: false,
//         };
//       }
//     });

//     resData = newChallenge;
//   } else {
//     resData = searchData;
//   }

//   return resData;
// };

// /**
//  *  @챌린지_회고_수정
//  *  @route PATCH api/challenge/:challengeId
//  *  @body good, bad, learn
//  *  @error
//  *      1. 회고록 id 잘못됨
//  *      2. 요청 바디 부족
//  */
// export const patchChallenge = async (
//   challengeID,
//   reqData: challengeWriteReqDTO
// ) => {
//   const { good, bad, learn, interest } = reqData;

//   // 1. 회고록 id 잘못됨
//   const challenge = await Challenge.findById(challengeID);
//   if (!challenge || challenge.isDeleted) {
//     return -1;
//   }
//   // 2. 요청 바디 부족
//   if (!good || !bad || !learn || !interest) {
//     return -2;
//   }

//   const updateDate = new Date();

//   await Challenge.update(
//     { _id: challengeID },
//     {
//       good: good.toLowerCase(),
//       bad: bad.toLowerCase(),
//       learn: learn.toLowerCase(),
//       interest: interest,
//       updatedAt: updateDate,
//     }
//   );
// };

// /**
//  *  @챌린지_회고_삭제
//  *  @route DELETE api/challenge/:challengeId
//  *  @error
//  *      1. 회고록 id 잘못됨
//  */
// export const deleteChallenge = async (userID, challengeID) => {
//   // 1. 회고록 id 잘못됨
//   const challenge = await Challenge.findById(challengeID);
//   if (!challenge || challenge.isDeleted) {
//     return -1;
//   }

//   await Challenge.findByIdAndUpdate(
//     { _id: challengeID },
//     { $set: { isDeleted: true } }
//   );

//   // 유저의 writingCNT 감소
//   await User.findOneAndUpdate(
//     { _id: userID },
//     {
//       $inc: { writingCNT: 1 },
//     }
//   );

//   return { _id: challenge._id };
// };

// /**
//  *  @챌린지_회고_좋아요_삭제
//  *  @route DELETE /challenge/like/:challengeID
//  *  @error
//  *      1. 회고록 id 잘못됨
//  *      2. 좋아요 개수가 0
//  */
// export const deleteChallengeLike = async (challengeID, userID) => {
//   const challenge = await Challenge.findById(challengeID);

//   // 1. 회고록 id 잘못됨
//   if (!challenge || challenge.isDeleted) {
//     return -1;
//   }

//   // 2. 좋아요 개수가 0
//   if (challenge.likes === 0) {
//     return -2;
//   }

//   // 챌린지 글의 like 1 감소
//   await Challenge.findOneAndUpdate(
//     { _id: challengeID },
//     {
//       $inc: { likes: -1 },
//     }
//   );
//   // 유저 likes 필드에 챌린지 id 삭제
//   const user = await User.findById(userID);
//   const idx = user.likes.challengeLikes.indexOf(challengeID);
//   user.likes.challengeLikes.splice(idx, 1);
//   await user.save();

//   return { _id: challengeID };
// };

// /**
//  *  @유저_챌린지_회고_스크랩_취소하기
//  *  @route Delete /user/challenge/:challengeID
//  *  @error
//  *      1. 회고록 id 잘못됨
//  *      2. 스크랩 하지 않은 글일 경우
//  */
// export const deleteChallengeScrap = async (challengeID, userID) => {
//   // 1. 회고 id 잘못됨
//   let challenge = await Challenge.findById(challengeID);
//   if (!challenge || challenge.isDeleted) {
//     return -1;
//   }

//   const user = await User.findById(userID);
//   // 2. 스크랩하지 않은 글일 경우
//   if (!user.scraps.challengeScraps.includes(challengeID)) {
//     return -2;
//   }

//   // 유저 scraps 필드에 챌린지 id 삭제
//   const idx = user.scraps.challengeScraps.indexOf(challengeID);
//   user.scraps.challengeScraps.splice(idx, 1);
//   await user.save();

//   // 게시글 스크랩 수 1 감소
//   await Challenge.findOneAndUpdate(
//     { _id: challengeID },
//     {
//       $inc: { scrapNum: -1 },
//     }
//   );

//   return { _id: challengeID };
// };

const challengeService = {
  postChallenge,
  postComment,
  postLike,
  postScrap,
  getChallengeAll,
};

export default challengeService;

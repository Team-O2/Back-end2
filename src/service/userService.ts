// models
import {
  Admin,
  User,
  Badge,
  Concert,
  Challenge,
  Comment,
  Post,
  Scrap,
  Like,
} from "../models";
// library
import period from "../library/date";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "../config";
import { emailSender } from "../library";
import ejs from "ejs";
import { ConnectionTimedOutError, Op, QueryTypes, Sequelize } from "sequelize";
// DTO
import sequelize from "../models";
import { userDTO, commentDTO } from "../DTO";
import { async, share } from "rxjs";
import { getModels } from "sequelize-typescript";
import { userInfo } from "os";
import { CodeArtifact } from "aws-sdk";

/**
 *  @User_마이페이지_Info
 *  @route Get user/mypage/info
 *  @access private
 */

export const getMypageInfo = async (userID: number) => {
  const user = await User.findOne({
    where: { id: userID },
    attributes: ["nickname", "isAdmin"],
  });

  const learnMyselfQuery = `SELECT G.conditionNum, G.writingNum, A.challengeStartDT, A.challengeEndDT, A.generation
  FROM Generation as G
  INNER JOIN Admin as A ON (G.generation = A.generation)
  WHERE G.userID = :userID
    AND day(A.challengeStartDT) <= day(curdate())
    AND day(A.challengeEndDT) >= day(curdate())
  `;

  const learnMyself: userDTO.IMyPageLearnMySelf[] = await sequelize.query(
    learnMyselfQuery,
    {
      type: QueryTypes.SELECT,
      replacements: { userID: userID },
      raw: true,
    }
  );

  let learnMyselfAchieve: userDTO.ILearnMySelfAchieve | null;

  // 현재기수 참여 X or 관리자
  if (!learnMyself.length || user[0].isAdmin) {
    learnMyselfAchieve = null;
  }
  // 현재기수 참여
  else {
    let term = await period.period(
      learnMyself[0].challengeStartDT,
      learnMyself[0].challengeEndDT
    );
    if (term < 1) {
      term = 1;
    }
    // 내림을 취해서 최대한 많은 %를 달성할 수 있도록 한다
    let totalNum = learnMyself[0].conditionNum * Math.floor(term / 7);

    if (totalNum < 1) {
      totalNum = 1;
    }

    // 퍼센트 올림을 취함
    var percent = Math.ceil((learnMyself[0].writingNum / totalNum) * 100);

    if (percent > 100) {
      percent = 100;
    }

    learnMyselfAchieve = {
      percent,
      totalNum,
      completeNum: learnMyself[0].writingNum,
      startDT: learnMyself[0].challengeStartDT,
      endDT: learnMyself[0].challengeEndDT,
      generation: learnMyself[0].generation,
    };
  }

  const shareTogetherQuery = `SELECT P.id, title
  FROM Post AS P
  INNER JOIN Concert As C ON P.id = C.id
  WHERE C.userID = :userID 
  ORDER BY createdAt DESC LIMIT 5`;

  let shareTogether: userDTO.IShareTogether[] | null = await sequelize.query(
    shareTogetherQuery,
    {
      type: QueryTypes.SELECT,
      replacements: { userID: userID },
      raw: true,
    }
  );

  if (!shareTogether.length) {
    shareTogether = null;
  }

  const couponBook = await Badge.findOne({
    where: { id: userID },
    attributes: {
      exclude: ["id"],
    },
  });

  const mypageInfoRes: userDTO.mypageInfoResDTO = {
    nickname: user.nickname,
    learnMyselfAchieve,
    shareTogether,
    couponBook,
  };

  return mypageInfoRes;
};

/**
 *  @마이페이지_회원정보_조회
 *  @route Get user/userInfo
 *  @access private
 */

export const getUserInfo = async (userID: number) => {
  const user = await User.findOne({
    where: {
      id: userID,
    },
    attributes: ["isMarketing", "img", "id", "email", "nickname", "interest"],
  });

  const userInfoRes: userDTO.userInfoResDTO = {
    interest: user.interest.split(","),
    isMarketing: user.isMarketing,
    img: user.img,
    id: user.id,
    email: user.email,
    nickname: user.nickname,
  };

  return userInfoRes;
};

/**
 *  @User_마이페이지_콘서트_스크랩
 *  @route GET user/mypage/concert?offset=@&limit=
 *  @access private
 */

export const getConcertScrap = async (
  userID?: number,
  offset?: number,
  limit?: number
) => {
  if (!offset) {
    offset = 0;
  }

  // 1. No limit
  if (!limit) {
    return -1;
  }

  const concertList = await Post.findAll({
    order: [["createdAt", "DESC"]],
    include: [
      { model: Scrap, attributes: ["userID"], required: true, as: "scraps" },
      {
        model: Scrap,
        attributes: ["userID"],
        where: { userID },
        required: true,
        as: "userScraps",
      },
      { model: Concert, where: { isNotice: false }, required: true },
      {
        model: Comment,
        as: "comments",
        where: { level: 0 },
        required: false,
        include: [
          User,
          {
            model: Comment,
            as: "children",
            separate: true,
            required: false,
            order: [["id", "DESC"]],
            include: [User],
          },
        ],
      },
      // { model: Comment, include: [{ model: User, attributes: ['id', 'img', 'nickname']}], as: "comments" },
      { model: User, attributes: ["id", "img", "nickname"] },
      { model: Like, attributes: ["userID"], required: false, as: "likes" },
      {
        model: Like,
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
  if (!concertList.length) {
    return -2;
  }

  const totalScrapNum = concertList.length;

  const mypageConcertScrap: userDTO.concertResDTO[] = concertList.map(
    (concert) => {
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
    }
  );

  const resData: userDTO.concertScrapResDTO = {
    mypageConcertScrap,
    totalScrapNum,
  };

  return resData;
};

/**
 *  @User_마이페이지_회고_스크랩
 *  @route Post user/mypage/challenge
 *  @access private
 */

export const getChallengeScrap = async (
  userID?: number,
  offset?: number,
  limit?: number
) => {
  if (!offset) {
    offset = 0;
  }

  // 1. No limit
  if (!limit) {
    return -1;
  }

  const challengeList = await Post.findAll({
    order: [["createdAt", "DESC"]],
    include: [
      { model: Scrap, attributes: ["userID"], required: true, as: "scraps" },
      {
        model: Scrap,
        attributes: ["userID"],
        where: { userID },
        required: true,
        as: "userScraps",
      },
      { model: Challenge, required: true },
      {
        model: Comment,
        as: "comments",
        where: { level: 0 },
        required: false,
        include: [
          User,
          {
            model: Comment,
            as: "children",
            separate: true,
            required: false,
            order: [["id", "DESC"]],
            include: [User],
          },
        ],
      },
      // { model: Comment, include: [{ model: User, attributes: ['id', 'img', 'nickname']}], as: "comments" },
      { model: User, attributes: ["id", "img", "nickname"], required: false },
      { model: Like, attributes: ["userID"], required: false, as: "likes" },
      {
        model: Like,
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
  if (!challengeList.length) {
    return -2;
  }

  const totalScrapNum = challengeList.length;

  const mypageChallengeScrap: userDTO.challengeResDTO[] = challengeList.map(
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
    }
  );

  const resData: userDTO.challengeScrapResDTO = {
    mypageChallengeScrap,
    totalScrapNum,
  };

  return resData;
};

/**
 *  @마이페이지_내가_쓴_글
 *  @route Get user/mypage/write
 *  @access private
 */

export const getMyWritings = async (
  userID?: number,
  offset?: number,
  limit?: number
) => {
  if (!offset) {
    offset = 0;
  }

  // 1. No limit
  if (!limit) {
    return -1;
  }

  const challengeList = await Post.findAll({
    order: [["createdAt", "DESC"]],
    include: [
      { model: Scrap, attributes: ["userID"], required: false, as: "scraps" },
      {
        model: Scrap,
        attributes: ["userID"],
        where: { userID },
        required: false,
        as: "userScraps",
      },
      { model: Challenge, required: true },
      {
        model: Comment,
        as: "comments",
        where: { level: 0 },
        required: false,
        include: [
          User,
          {
            model: Comment,
            as: "children",
            separate: true,
            required: false,
            order: [["id", "DESC"]],
            include: [User],
          },
        ],
      },
      // { model: Comment, include: [{ model: User, attributes: ['id', 'img', 'nickname']}], as: "comments" },
      { model: User, attributes: ["id", "img", "nickname"] },
      { model: Like, attributes: ["userID"], required: false, as: "likes" },
      {
        model: Like,
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
  if (!challengeList.length) {
    // console.log(challengeList.length);
    return -2;
  }

  const resData: userDTO.challengeResDTO[] = challengeList.map((challenge) => {
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
};

/**
 *  @마이페이지_내가_쓴_댓글
 *  @route Get user/mypage/comment?postModel=@&offset=@&limit=
 *  @error
 *    1. No limit / No postModel
 *    2. Wrong postModel
 *    3. 작성한 댓글이 없을 때
 */

export const getMyComments = async (
  userID?: number,
  postModel?: string,
  offset?: number,
  limit?: number
) => {
  if (!offset) {
    offset = 0;
  }

  // 1. No limit / No postModel
  if (!limit || !postModel) {
    return -1;
  }

  let commentList;

  if (postModel === "Challenge") {
    commentList = await Comment.findAll({
      order: [["createdAt", "DESC"]],
      where: {
        userID,
        isDeleted: false,
      },
      include: [
        {
          model: Post,
          where: { isDeleted: false },
          include: [
            {
              model: Challenge,
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
  } else if (postModel === "Concert") {
    commentList = await Comment.findAll({
      order: [["createdAt", "DESC"]],
      where: {
        userID,
        isDeleted: false,
      },
      include: [
        {
          model: Post,
          where: { isDeleted: false },
          include: [
            {
              model: Concert,
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
  } else if (postModel === "Notice") {
    commentList = await Comment.findAll({
      order: [["createdAt", "DESC"]],
      where: {
        userID,
        isDeleted: false,
      },
      include: [
        {
          model: Post,
          where: { isDeleted: false },
          include: [
            {
              model: Concert,
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
  } else {
    commentList = null;
  }

  // 2. Wrong postModel
  if (!commentList) {
    return -2;
  }
  // 3. 작성한 댓글이 없을 떄
  else if (!commentList.length) {
    // console.log(challengeList.length);
    return -3;
  }

  const commentNum = commentList.length;

  const comments: userDTO.commentResDTO[] = await Promise.all(
    commentList.map(async (comment) => {
      const returnData = {
        id: comment.id,
        text: comment.text,
        post: comment.post.id,
        createdAt: comment.createdAt,
      };
      return returnData;
    })
  );

  const resData: userDTO.myCommentsResDTO = {
    comments,
    commentNum,
  };

  return resData;
};

/**
 *  @마이페이지_비밀번호_수정
 *  @route Patch user/password
 *  @access private
 *  @error
 *    1. 요청 바디 부족
 *    2. 현재 비밀번호와 일치하지 않음
 */

export const patchPW = async (userID?: number, body?: userDTO.newPwReqDTO) => {
  const { password, newPassword } = body;

  // 1. 요청 바디 부족
  if (!newPassword || !password || !userID) {
    return -1;
  }

  const user = await User.findOne({
    where: { id: userID },
    attributes: ["password"],
  });

  // Encrpyt password
  const salt = await bcrypt.genSalt(10);
  const currentEncrpytPW = await bcrypt.hash(password, salt);

  // 2. 현재 비밀번호와 일치하지 않음
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return -2;
  }

  // Encrpyt password
  const encrpytPW = await bcrypt.hash(newPassword, salt);

  await User.update({ password: encrpytPW }, { where: { id: userID } });

  return;
};

/**
 *  @마이페이지_내가_쓴_댓글_삭제
 *  @route Patch user/mypage/comment
 *  @error
 *    1. 요청 바디가 부족할 경우
 *    2. comment ID가 잘못된 경우
 *    3. 해당 유저가 작성한 댓글이 아닐 경우
 *    4. 삭제하려는 댓글이 이미 isDeleted = true 인 경우
 */

export const deleteMyComments = async (
  userID?: number,
  comments?: userDTO.deleteCommentsReqDTO
) => {
  // 1. 요청 바디가 부족할 경우
  if (!comments || !comments.commentID.length) {
    return -1;
  }

  comments.commentID.map(async (commentID: number) => {
    const comment = await Comment.findOne({
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
      console.log("=444");
      return -4;
    }
  });

  comments.commentID.map(async (commentID: number) => {
    await Comment.update(
      { isDeleted: true },
      { where: { id: commentID, userID } }
    );
  });

  return;
};

/**
 *  @User_마이페이지_회고_스크랩_취소토글
 *  @route Delete user/mypage/challenge/:challengeID
 *  @access private
 *  @error
 *    1. no challengeID
 *    2. challengeID 잘못됨
 *    3. 스크랩 하지 않은 challenge
 */

export const deleteChallengeScrap = async (
  userID: number,
  challengeID: number
) => {
  // 1. no challengeID
  if (!challengeID) {
    return -1;
  }

  const challenge = await Post.findOne({
    where: { id: challengeID, isDeleted: false },
    include: [
      { model: Scrap, as: "userScraps", required: false, where: { userID } },
      { model: Challenge, required: true },
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
  } else {
    await Scrap.destroy({
      where: { postID: challengeID, userID: userID },
    });
  }
  return challenge;

  // await User.update(
  //   { password: encrpytPW },
  //   { where: { id: userID } },
  // );
};

// export const deleteMypageChallenge = async (userID, challengeID) => {
//   // 1. 회고 id 잘못됨
//   let challenge = await Challenge.findById(challengeID);
//   if (!challenge) {
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

//   return;
// };

// /**
//  *  @마이페이지_회원정보_수정
//  *  @route Patch user/userInfo
//  *  @access private
//  */

// export const patchInfo = async(userID?: number, body, url) => {
//   let imgUrl = url.img;
//   const { nickname, isMarketing } = body;
//   let rawInterest = body.interest;
//   let interest;

// }
// export const patchInfo = async (userID, body, url) => {
//   var imgUrl = url.img;
//   const { nickname, marpolicy } = body;
//   let rawInterest = body.interest;
//   var interest;
//   if (rawInterest !== "") {
//     interest = stringToArray(rawInterest);
//   } else {
//     interest = rawInterest;
//   }
//   const user = await User.findById(userID);

//   // 1. 요청 바디 부족
//   if (
//     nickname === undefined ||
//     interest === undefined ||
//     marpolicy === undefined
//   ) {
//     return -1;
//   }

//   if (user.nickname !== nickname) {
//     // 3. 닉네임 중복
//     let checkNickname = await User.findOne({ nickname });
//     if (checkNickname) {
//       return -2;
//     }
//   }

//   if (imgUrl !== "") {
//     await user.update({ $set: { img: imgUrl } });
//   }

//   if (nickname !== "") {
//     await user.update({ $set: { nickname: nickname } });
//   }

//   if (interest !== "") {
//     await user.update({ $set: { interest: interest } });
//   }

//   if (marpolicy !== "") {
//     await user.update({ $set: { marpolicy: marpolicy } });
//   }

//   // 마케팅 동의(marpolicy == true) 시 뱃지 발급
//   if (marpolicy) {
//     await Badge.findOneAndUpdate(
//       { user: user.id },
//       { $set: { marketingBadge: true } }
//     );
//   }
//   return;
// };

// /**
//  *  @User_챌린지_신청하기
//  *  @route Post user/register
//  *  @body challengeCNT
//  *  @access private
//  */

// export const posetRegister = async (userID: number, body: userDTO.registerReqDTO) => {

// }

// export const postRegister = async (userID, body: registerReqDTO) => {
//   const challengeCNT = body.challengeCNT;

//   // 1. 요청 바디 부족
//   if (!challengeCNT) {
//     return -1;
//   }

//   // 2. 유저 id가 관리자 아이디임
//   let user = await User.findById(userID);
//   if (user.userType === 1) {
//     return -2;
//   }

//   // 신청 기간을 확인
//   let dateNow = new Date();
//   const admin = await Admin.findOne({
//     $and: [
//       { registerStartDT: { $lte: dateNow } },
//       { registerEndDT: { $gte: dateNow } },
//     ],
//   });

//   // 3. 신청 기간이 아님
//   if (!admin) {
//     return -3;
//   }

//   // 4. 이미 신청이 완료된 사용자
//   if (user.isRegist) {
//     return -4;
//   }

//   // 5. 신청 인원을 초과함
//   if (admin.applyNum > admin.limitNum) {
//     return -5;
//   }

//   // 신청 성공
//   // applyNum 증가
//   await Admin.findOneAndUpdate(
//     {
//       $and: [
//         { registerStartDT: { $lte: dateNow } },
//         { registerEndDT: { $gte: dateNow } },
//       ],
//     },
//     {
//       $inc: { applyNum: 1 },
//     }
//   );

//   // isRegist true
//   await user.update({ $set: { isRegist: true } });
//   await user.update({ $set: { challengeCNT: challengeCNT } });

//   // 첫 챌린지 참여 시 뱃지 부여
//   const badge = await Badge.findOne(
//     { user: userID },
//     { firstJoinBadge: true, _id: false }
//   );

//   if (!badge.firstJoinBadge) {
//     await Badge.findOneAndUpdate(
//       { user: userID },
//       { $set: { firstJoinBadge: true } }
//     );
//   }
//   return;
// };

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
};

export default userService;

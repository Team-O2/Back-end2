// models
import { Admin, User, Badge, Concert, Challenge, Comment, Post, Scrap, Like } from "../models";
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

/**
 *  @User_마이페이지_Info
 *  @route Get user/mypage/info
 *  @access private
 */

export const getMypageInfo = async (userID: number) => {

  const user = await User.findOne({
    where: { id: userID },
    attributes: ['nickname', 'isAdmin']
  });

  const learnMyselfQuery = `SELECT G.conditionNum, G.writingNum, A.challengeStartDT, A.challengeEndDT, A.generation
  FROM Generation as G
  INNER JOIN Admin as A ON (G.generation = A.generation)
  WHERE G.userID = :userID
    AND day(A.challengeStartDT) <= day(curdate())
    AND day(A.challengeEndDT) >= day(curdate())
  `

  const learnMyself: userDTO.IMyPageLearnMySelf[] = await sequelize.query(learnMyselfQuery, { 
    type: QueryTypes.SELECT,
    replacements: { userID: userID },
    raw: true,
  });

  let learnMyselfAchieve: userDTO.ILearnMySelfAchieve | null;

  // 현재기수 참여 X or 관리자
  if (!learnMyself.length || user[0].isAdmin) {
    learnMyselfAchieve = null;
  }
  // 현재기수 참여
  else {
    let term = await period.period(learnMyself[0].challengeStartDT, learnMyself[0].challengeEndDT);
    if (term < 1) {
      term = 1;
    }
    // 내림을 취해서 최대한 많은 %를 달성할 수 있도록 한다
    let totalNum = learnMyself[0].conditionNum * Math.floor(term/7);

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
      generation: learnMyself[0].generation
    }
  }
  
  const shareTogetherQuery = `SELECT P.id, title
  FROM Post AS P
  INNER JOIN Concert As C ON P.id = C.id
  WHERE C.userID = :userID 
  ORDER BY createdAt DESC LIMIT 5`

  let shareTogether: userDTO.IShareTogether[] | null =  await sequelize.query(shareTogetherQuery, { 
    type: QueryTypes.SELECT,
    replacements: { userID: userID },
    raw: true,
  });

  if (!shareTogether.length) {
    shareTogether = null;
  } 
  
  const couponBook = await Badge.findOne({
    where: { id: userID },
    attributes: {
      exclude: ['id']
    }
  });

  const mypageInfoRes: userDTO.mypageInfoResDTO = {
    nickname: user.nickname,
    learnMyselfAchieve,
    shareTogether,
    couponBook
  };

  return  mypageInfoRes;
};

/**
 *  @마이페이지_회원정보_조회
 *  @route Get user/userInfo
 *  @access private
 */

export const getUserInfo = async (userID: number) => {
  const user = await User.findOne({
    where: {
      id: userID
    },
    attributes: ['isMarketing', 'img', 'id', 'email', 'nickname', 'interest']
  });

  const userInfoRes: userDTO.userInfoResDTO = {
    interest: user.interest.split(","),
    isMarketing: user.isMarketing,
    img: user.img,
    id: user.id,
    email: user.email,
    nickname: user.nickname
  }
  
  return userInfoRes;
}


/**
 *  @User_마이페이지_콘서트_스크랩
 *  @route GET user/mypage/concert?offset=@&limit=
 *  @access private
 */

export const getMypageConcert = async (userID?: number, offset?: number, limit?: number) => {

  if (!offset) {
    offset = 0;
  }

  // 요청 부족
  if (!limit) {
    return -2;
  }

  const concertList = await Post.findAll({
    order: [["createdAt", "DESC"]],
    include: [
      { model: Scrap, attributes: ['userID'], required: true, as: "scraps"},
      { model: Scrap, attributes: ['userID'], where: { userID }, required: true, as: "userScraps"},
      { model: Concert, required: true },
      { model: Comment, include: [{ model: User, attributes: ['id', 'img', 'nickname']}] },
      { model: User, attributes: ['id', 'img', 'nickname']},
      { model: Like, attributes: ['userID'], required: false, as: "likes"},
      { model: Like, attributes: ['userID'], where: { userID }, required: false, as: "userLikes"}
    ],
    where: {
      isDeleted: false
    },
    offset,
    limit
  });

  // 스크랩한 글이 없을 때
  if (!concertList.length) {
    return -1;
  }

  const totalScrapNum = concertList.length;

  const mypageConcertScrap: userDTO.getScrapConcertResDTO[] = await Promise.all(
    concertList.map(async (concert) => {
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
        isLike: concert.userLikes.length? true: false,
        isScrap: true
      };

      return returnData;
    })
  );

  const resData: userDTO.scrapConcertAllResDTO = {
    mypageConcertScrap,
    totalScrapNum
  };

  return resData;

}


/**
 *  @User_마이페이지_회고_스크랩
 *  @route Post user/mypage/challenge
 *  @access private
*/

export const getMypageChallenge = async (
  userID?: number,
  offset?: number, 
  limit?: number
) => {
  if (!offset) {
    offset = 0;
  }

  // 요청 부족
  if (!limit) {
    return -2;
  }

  const challengeList = await Post.findAll({
    order: [["createdAt", "DESC"]],
    include: [
      { model: Scrap, attributes: ['userID'], required: true, as: "scraps"},
      { model: Scrap, attributes: ['userID'], where: { userID }, required: true, as: "userScraps"},
      { model: Challenge, required: true },
      { model: Comment, include: [{ model: User, attributes: ['id', 'img', 'nickname']}] },
      { model: User, attributes: ['id', 'img', 'nickname']},
      { model: Like, attributes: ['userID'], required: false, as: "likes"},
      { model: Like, attributes: ['userID'], where: { userID }, required: false, as: "userLikes"}
    ],
    where: {
      isDeleted: false
    },
    offset,
    limit
  });
  
    // 스크랩한 글이 없을 때
  if (!challengeList.length) {
      return -1;
  }

  const totalScrapNum = challengeList.length;

  const mypageChallengeScrap: userDTO.getScrapChallengeResDTO[] = await Promise.all(
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
        interest: challenge.interest.split(","),
        likeNum: challenge.likes.length,
        scrapNum: challenge.scraps.length,
        commentNum: challenge.comments.length,
        comment,
        isLike: challenge.userLikes.length? true: false,
        isScrap: true
      };

      return returnData;
    })
  );

  const resData: userDTO.scrapChallengeAllResDTO = {
    mypageChallengeScrap,
    totalScrapNum
  };

  return resData;
}

// export const getMypageChallenge = async (userID, offset, limit) => {
//   if (!offset) {
//     offset = 0;
//   }

//   const user = await User.findById(userID);

//   if (!user.scraps.challengeScraps[0]) {
//     return -1;
//   }

//   if (!limit) {
//     return -2;
//   }

//   const challengeList: (IChallenge &
//     Document<IUser, mongoose.Schema.Types.ObjectId> &
//     Document<IComment, mongoose.Schema.Types.ObjectId>)[][] = await Promise.all(
//     user.scraps.challengeScraps.map(async function (scrap) {
//       let challengeScrap: (IChallenge &
//         Document<IUser, mongoose.Schema.Types.ObjectId> &
//         Document<IComment, mongoose.Schema.Types.ObjectId>)[] =
//         await Challenge.find({ _id: scrap }, { isDeleted: false })
//           .populate("user", ["nickname", "img"])
//           .populate({
//             path: "comments",
//             select: { userID: 1, text: 1, isDeleted: 1 },
//             options: { sort: { _id: -1 } },
//             populate: [
//               {
//                 path: "childrenComment",
//                 select: { userID: 1, text: 1, isDeleted: 1 },
//                 options: { sort: { _id: -1 } },
//                 populate: {
//                   path: "userID",
//                   select: ["nickname", "img"],
//                 },
//               },
//               {
//                 path: "userID",
//                 select: ["nickname", "img"],
//               },
//             ],
//           });
//       return challengeScrap;
//     })
//   );
//   const mypageChallenge: (IChallenge &
//     Document<IUser, mongoose.Schema.Types.ObjectId> &
//     Document<IComment, mongoose.Schema.Types.ObjectId>)[][] =
//     challengeList.sort(function (a, b) {
//       return dateToNumber(b[0].createdAt) - dateToNumber(a[0].createdAt);
//     });

//   var challengeScraps = [];

//   for (var i = Number(offset); i < Number(offset) + Number(limit); i++) {
//     const tmp = mypageChallenge[i];
//     if (!tmp) {
//       break;
//     }
//     challengeScraps.push(tmp[0]);
//   }

//   // 좋아요, 스크랩 여부 추가
//   const mypageChallengeScrap: IChallengeDTO[] = challengeScraps.map((c) => {
//     if (
//       user.scraps.challengeScraps.includes(c._id) &&
//       user.likes.challengeLikes.includes(c._id)
//     ) {
//       return { ...c._doc, isLike: true, isScrap: true };
//     } else if (user.scraps.challengeScraps.includes(c._id)) {
//       return { ...c._doc, isLike: false, isScrap: true };
//     } else if (user.likes.challengeLikes.includes(c._id)) {
//       return { ...c._doc, isLike: true, isScrap: false };
//     } else {
//       return {
//         ...c._doc,
//         isLike: false,
//         isScrap: false,
//       };
//     }
//   });

//   const resData: challengeScrapResDTO = {
//     mypageChallengeScrap,
//     totalScrapNum: mypageChallenge.length,
//   };
//   return resData;
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


// /**
//  *  @User_마이페이지_회고_스크랩_취소토글
//  *  @route Delete user/mypage/challenge/:challengeID
//  *  @access private
//  */

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
//  *  @마이페이지_내가_쓴_글
//  *  @route Get user/mypage/write
//  *  @error
//  *    1.
//  */
// export const getMyWritings = async (userID, offset, limit) => {
//   if (!limit) {
//     return -1;
//   }

//   if (!offset) {
//     offset = 0;
//   }

//   let challenges;

//   challenges = await Challenge.find({
//     isDeleted: false,
//     user: userID,
//   })
//     .skip(Number(offset))
//     .limit(Number(limit))
//     .sort({ _id: -1 })
//     .populate("user", ["nickname", "img"])
//     .populate({
//       path: "comments",
//       select: { userID: 1, text: 1, isDeleted: 1 },
//       options: { sort: { _id: -1 } },
//       populate: [
//         {
//           path: "childrenComment",
//           select: { userID: 1, text: 1, isDeleted: 1 },
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

//   // 좋아요, 스크랩 여부 추가
//   const user = await User.findById(userID);
//   const resData: IChallengeDTO[] = challenges.map((c) => {
//     if (
//       user.scraps.challengeScraps.includes(c._id) &&
//       user.likes.challengeLikes.includes(c._id)
//     ) {
//       return { ...c._doc, isLike: true, isScrap: true };
//     } else if (user.scraps.challengeScraps.includes(c._id)) {
//       return { ...c._doc, isLike: false, isScrap: true };
//     } else if (user.likes.challengeLikes.includes(c._id)) {
//       return { ...c._doc, isLike: true, isScrap: false };
//     } else {
//       return {
//         ...c._doc,
//         isLike: false,
//         isScrap: false,
//       };
//     }
//   });

//   return resData;
// };

// /**
//  *  @마이페이지_내가_쓴_댓글
//  *  @route Get user/mypage/comment
//  */
// export const getMyComments = async (userID, postModel, offset, limit) => {
//   if (!limit) {
//     return -1;
//   }
//   if (!offset) {
//     offset = 0;
//   }
//   let comments: IComment[];
//   comments = await Comment.find({
//     isDeleted: false,
//     postModel: postModel,
//     userID,
//   })
//     .skip(Number(offset))
//     .limit(Number(limit))
//     .sort({ _id: -1 });

//   const totalCommentNum: number = await Comment.find({
//     userID,
//     postModel: postModel,
//     isDeleted: false,
//   }).countDocuments();

//   const resData: myCommentsResDTO = {
//     comments,
//     commentNum: totalCommentNum,
//   };
//   return resData;
// };

// /**
//  *  @마이페이지_내가_쓴_댓글_삭제
//  *  @route Delete user/mypage/comment
//  *  @error
//  *    1. 요청 바디가 부족할 경우
//  */
// export const deleteMyComments = async (body) => {
//   const { userID, commentID }: delMyCommentReqDTO = body;

//   //1. 요청 바디가 부족할 경우
//   if (!commentID || commentID.length === 0) {
//     return -1;
//   }

//   commentID.map(async (cmtID) => {
//     // 삭제하려는 댓글 isDelete = true로 변경
//     await Comment.findByIdAndUpdate(cmtID, { isDeleted: true });
//     // 게시글 댓글 수 1 감소
//     let comment = await Comment.findById(cmtID);
//     if (comment.postModel === "Challenge") {
//       // challenge
//       await Challenge.findByIdAndUpdate(comment.post, {
//         $inc: { commentNum: -1 },
//       });
//     } else {
//       // concert
//       await Concert.findByIdAndUpdate(comment.post, {
//         $inc: { commentNum: -1 },
//       });
//     }
//     // 유저 댓글 수 1 감소
//     // 과연 필요할까??
//     // await User.findByIdAndUpdate(userID.id, {
//     //   $inc: { commentCNT: -1 },
//     // });
//   });

//   return;
// };


// /**
//  *  @마이페이지_회원정보_수정
//  *  @route Patch user/userInfo
//  *  @access private
//  */
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
//  *  @마이페이지_비밀번호_수정
//  *  @route Patch user/pw
//  *  @access private
//  */
// export const patchPW = async (body: newPwReqDTO) => {
//   const { password, newPassword, userID } = body;
//   // 1. 요청 바디 부족
//   if (!newPassword) {
//     return -1;
//   }

//   const user = await User.findById(userID.id);

//   // Encrpyt password
//   const salt = await bcrypt.genSalt(10);
//   const currentEncrpytPW = await bcrypt.hash(password, salt);

//   // 2. 현재 비밀번호가 일치하지 않음
//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) {
//     return -2;
//   }

//   // Encrpyt password
//   const encrpytPW = await bcrypt.hash(newPassword, salt);

//   await user.update({ $set: { password: encrpytPW } });

//   return;
// };

const userService = {
  getMypageInfo,
  getUserInfo,
  getMypageConcert,
  getMypageChallenge
};

export default userService;

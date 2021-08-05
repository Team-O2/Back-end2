// models
import Admin from "../models/Admin";
import User from "../models/User";
import Badge from "../models/Badge";
import Concert from "../models/Concert";
import Challenge from "../models/Challenge";
import Comment from "../models/Comment";

// library
import { dateToNumber, period } from "../library/date";
import { stringToArray } from "../library/array";

// jwt
import bcrypt from "bcryptjs";

// DTO
import mongoose, { Document } from "mongoose";
import {
  challengeScrapResDTO,
  concertScrapResDTO,
  ICouponBook,
  ILearnMySelfAchieve,
  IShareTogether,
  registerReqDTO,
  mypageInfoResDTO,
  myCommentsResDTO,
  delMyCommentReqDTO,
  userInfoResDTO,
  newPwReqDTO,
} from "../DTO/userDTO";
// interface
import { IConcert } from "../interfaces/IConcert";
import { IUser } from "../interfaces/IUser";
import { IComment } from "../interfaces/IComment";
import { IChallenge } from "../interfaces/IChallenge";
import { IChallengeDTO } from "../DTO/challengeDTO";
import { IConcertDTO } from "../DTO/concertDTO";

/**
 *  @User_챌린지_신청하기
 *  @route Post user/register
 *  @body challengeCNT
 *  @access private
 */

export const postRegister = async (userID, body: registerReqDTO) => {
  const challengeCNT = body.challengeCNT;

  // 1. 요청 바디 부족
  if (!challengeCNT) {
    return -1;
  }

  // 2. 유저 id가 관리자 아이디임
  let user = await User.findById(userID);
  if (user.userType === 1) {
    return -2;
  }

  // 신청 기간을 확인
  let dateNow = new Date();
  const admin = await Admin.findOne({
    $and: [
      { registerStartDT: { $lte: dateNow } },
      { registerEndDT: { $gte: dateNow } },
    ],
  });

  // 3. 신청 기간이 아님
  if (!admin) {
    return -3;
  }

  // 4. 이미 신청이 완료된 사용자
  if (user.isRegist) {
    return -4;
  }

  // 5. 신청 인원을 초과함
  if (admin.applyNum > admin.limitNum) {
    return -5;
  }

  // 신청 성공
  // applyNum 증가
  await Admin.findOneAndUpdate(
    {
      $and: [
        { registerStartDT: { $lte: dateNow } },
        { registerEndDT: { $gte: dateNow } },
      ],
    },
    {
      $inc: { applyNum: 1 },
    }
  );

  // isRegist true
  await user.update({ $set: { isRegist: true } });
  await user.update({ $set: { challengeCNT: challengeCNT } });

  // 첫 챌린지 참여 시 뱃지 부여
  const badge = await Badge.findOne(
    { user: userID },
    { firstJoinBadge: true, _id: false }
  );

  if (!badge.firstJoinBadge) {
    await Badge.findOneAndUpdate(
      { user: userID },
      { $set: { firstJoinBadge: true } }
    );
  }
  return;
};

/**
 *  @User_마이페이지_콘서트_스크랩
 *  @route Post user/mypage/concert
 *  @access private
 */

export const getMypageConcert = async (userID, offset, limit) => {
  if (!offset) {
    offset = "0";
  }

  const user = await User.findById(userID);

  if (!user.scraps.concertScraps[0]) {
    return -1;
  }

  if (!limit) {
    return -2;
  }

  const concertList: (IConcert &
    Document<IUser, mongoose.Schema.Types.ObjectId> &
    Document<IComment, mongoose.Schema.Types.ObjectId>)[][] = await Promise.all(
    user.scraps.concertScraps.map(async function (scrap) {
      let concertScrap: (IConcert &
        Document<IUser, mongoose.Schema.Types.ObjectId> &
        Document<IComment, mongoose.Schema.Types.ObjectId>)[] =
        await Concert.find({ _id: scrap }, { isDeleted: false })
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
      return concertScrap;
    })
  );
  const mypageConcert: (IConcert &
    Document<IUser, mongoose.Schema.Types.ObjectId> &
    Document<IComment, mongoose.Schema.Types.ObjectId>)[][] = concertList.sort(
    function (a, b) {
      return dateToNumber(b[0].createdAt) - dateToNumber(a[0].createdAt);
    }
  );

  let concertScraps = [];
  for (var i = Number(offset); i < Number(offset) + Number(limit); i++) {
    const tmp = mypageConcert[i];
    if (!tmp) {
      break;
    }
    concertScraps.push(tmp[0]);
  }

  // 좋아요, 스크랩 여부 추가
  const mypageConcertScrap: IConcertDTO[] = concertScraps.map((c) => {
    if (
      user.scraps.challengeScraps.includes(c._id) &&
      user.likes.challengeLikes.includes(c._id)
    ) {
      return { ...c._doc, isLike: true, isScrap: true };
    } else if (user.scraps.challengeScraps.includes(c._id)) {
      return { ...c._doc, isLike: false, isScrap: true };
    } else if (user.likes.challengeLikes.includes(c._id)) {
      return { ...c._doc, isLike: true, isScrap: false };
    } else {
      return {
        ...c._doc,
        isLike: false,
        isScrap: false,
      };
    }
  });

  const resData: concertScrapResDTO = {
    mypageConcertScrap,
    totalScrapNum: mypageConcert.length,
  };
  return resData;
};

/**
 *  @User_마이페이지_회고_스크랩
 *  @route Post user/mypage/challenge
 *  @access private
 */

export const getMypageChallenge = async (userID, offset, limit) => {
  if (!offset) {
    offset = 0;
  }

  const user = await User.findById(userID);

  if (!user.scraps.challengeScraps[0]) {
    return -1;
  }

  if (!limit) {
    return -2;
  }

  const challengeList: (IChallenge &
    Document<IUser, mongoose.Schema.Types.ObjectId> &
    Document<IComment, mongoose.Schema.Types.ObjectId>)[][] = await Promise.all(
    user.scraps.challengeScraps.map(async function (scrap) {
      let challengeScrap: (IChallenge &
        Document<IUser, mongoose.Schema.Types.ObjectId> &
        Document<IComment, mongoose.Schema.Types.ObjectId>)[] =
        await Challenge.find({ _id: scrap }, { isDeleted: false })
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
      return challengeScrap;
    })
  );
  const mypageChallenge: (IChallenge &
    Document<IUser, mongoose.Schema.Types.ObjectId> &
    Document<IComment, mongoose.Schema.Types.ObjectId>)[][] =
    challengeList.sort(function (a, b) {
      return dateToNumber(b[0].createdAt) - dateToNumber(a[0].createdAt);
    });

  var challengeScraps = [];

  for (var i = Number(offset); i < Number(offset) + Number(limit); i++) {
    const tmp = mypageChallenge[i];
    if (!tmp) {
      break;
    }
    challengeScraps.push(tmp[0]);
  }

  // 좋아요, 스크랩 여부 추가
  const mypageChallengeScrap: IChallengeDTO[] = challengeScraps.map((c) => {
    if (
      user.scraps.challengeScraps.includes(c._id) &&
      user.likes.challengeLikes.includes(c._id)
    ) {
      return { ...c._doc, isLike: true, isScrap: true };
    } else if (user.scraps.challengeScraps.includes(c._id)) {
      return { ...c._doc, isLike: false, isScrap: true };
    } else if (user.likes.challengeLikes.includes(c._id)) {
      return { ...c._doc, isLike: true, isScrap: false };
    } else {
      return {
        ...c._doc,
        isLike: false,
        isScrap: false,
      };
    }
  });

  const resData: challengeScrapResDTO = {
    mypageChallengeScrap,
    totalScrapNum: mypageChallenge.length,
  };
  return resData;
};

/**
 *  @User_마이페이지_Info
 *  @route Get user/mypage/info
 *  @access private
 */
export const getMypageInfo = async (userID) => {
  const user = await User.findById(userID);
  const userBadge = await Badge.findOne({ user: userID });

  const couponBook: ICouponBook = {
    welcomeBadge: userBadge.welcomeBadge,
    firstJoinBadge: userBadge.firstJoinBadge,
    firstWriteBadge: userBadge.firstWriteBadge,
    oneCommentBadge: userBadge.oneCommentBadge,
    fiveCommentBadge: userBadge.fiveCommentBadge,
    oneLikeBadge: userBadge.oneLikeBadge,
    fiveLikeBadge: userBadge.fiveLikeBadge,
    loginBadge: userBadge.loginBadge,
    marketingBadge: userBadge.marketingBadge,
    learnMySelfScrapBadge: userBadge.learnMySelfScrapBadge,
    firstReplyBadge: userBadge.firstReplyBadge,
    concertScrapBadge: userBadge.concertScrapBadge,
    challengeBadge: userBadge.challengeBadge,
  };

  let shareTogether: IShareTogether[] | null = await Concert.find(
    { user: userID, isNotice: false },
    { _id: true, title: true },
    { sort: { _id: -1 } }
  ).limit(5);

  if (shareTogether.length === 0) {
    shareTogether = null;
  }

  const admin = await Admin.findOne({ generation: user.generation });

  let resData: mypageInfoResDTO;
  // ischallenge 가 false 이거나 admin === null 이면 현재기수 참여 x
  if (!user.isChallenge || !admin) {
    resData = {
      nickname: user.nickname,
      learnMyselfAchieve: null,
      shareTogether,
      couponBook,
    };
  }
  // 현재기수 참여
  else {
    var term = await period(admin.challengeStartDT, admin.challengeEndDT);
    if (term < 1) {
      term = 1;
    }
    // 내림을 취해서 최대한 많은 %를 달성할 수 있도록 한다
    var totalNum = user.conditionCNT * Math.floor(term / 7);

    if (totalNum < 1) {
      totalNum = 1;
    }
    // 퍼센트 올림을 취함
    var percent = Math.ceil((user.writingCNT / totalNum) * 100);
    if (percent > 100) {
      percent = 100;
    }

    const learnMyselfAchieve: ILearnMySelfAchieve = {
      percent,
      totalNum,
      completeNum: user.writingCNT,
      startDT: admin.challengeStartDT,
      endDT: admin.challengeEndDT,
      generation: user.generation,
    };

    resData = {
      nickname: user.nickname,
      learnMyselfAchieve,
      shareTogether,
      couponBook,
    };
  }
  return resData;
};

/**
 *  @User_마이페이지_회고_스크랩_취소토글
 *  @route Delete user/mypage/challenge/:challengeID
 *  @access private
 */

export const deleteMypageChallenge = async (userID, challengeID) => {
  // 1. 회고 id 잘못됨
  let challenge = await Challenge.findById(challengeID);
  if (!challenge) {
    return -1;
  }

  const user = await User.findById(userID);
  // 2. 스크랩하지 않은 글일 경우
  if (!user.scraps.challengeScraps.includes(challengeID)) {
    return -2;
  }

  // 유저 scraps 필드에 챌린지 id 삭제
  const idx = user.scraps.challengeScraps.indexOf(challengeID);
  user.scraps.challengeScraps.splice(idx, 1);
  await user.save();

  return;
};

/**
 *  @마이페이지_내가_쓴_글
 *  @route Get user/mypage/write
 *  @error
 *    1.
 */
export const getMyWritings = async (userID, offset, limit) => {
  if (!limit) {
    return -1;
  }

  if (!offset) {
    offset = 0;
  }

  let challenges;

  challenges = await Challenge.find({
    isDeleted: false,
    user: userID,
  })
    .skip(Number(offset))
    .limit(Number(limit))
    .sort({ _id: -1 })
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

  // 좋아요, 스크랩 여부 추가
  const user = await User.findById(userID);
  const resData: IChallengeDTO[] = challenges.map((c) => {
    if (
      user.scraps.challengeScraps.includes(c._id) &&
      user.likes.challengeLikes.includes(c._id)
    ) {
      return { ...c._doc, isLike: true, isScrap: true };
    } else if (user.scraps.challengeScraps.includes(c._id)) {
      return { ...c._doc, isLike: false, isScrap: true };
    } else if (user.likes.challengeLikes.includes(c._id)) {
      return { ...c._doc, isLike: true, isScrap: false };
    } else {
      return {
        ...c._doc,
        isLike: false,
        isScrap: false,
      };
    }
  });

  return resData;
};

/**
 *  @마이페이지_내가_쓴_댓글
 *  @route Get user/mypage/comment
 */
export const getMyComments = async (userID, postModel, offset, limit) => {
  if (!limit) {
    return -1;
  }
  if (!offset) {
    offset = 0;
  }
  let comments: IComment[];
  comments = await Comment.find({
    isDeleted: false,
    postModel: postModel,
    userID,
  })
    .skip(Number(offset))
    .limit(Number(limit))
    .sort({ _id: -1 });

  const totalCommentNum: number = await Comment.find({
    userID,
    postModel: postModel,
    isDeleted: false,
  }).countDocuments();

  const resData: myCommentsResDTO = {
    comments,
    commentNum: totalCommentNum,
  };
  return resData;
};

/**
 *  @마이페이지_내가_쓴_댓글_삭제
 *  @route Delete user/mypage/comment
 *  @error
 *    1. 요청 바디가 부족할 경우
 */
export const deleteMyComments = async (body) => {
  const { userID, commentID }: delMyCommentReqDTO = body;

  //1. 요청 바디가 부족할 경우
  if (!commentID || commentID.length === 0) {
    return -1;
  }

  commentID.map(async (cmtID) => {
    // 삭제하려는 댓글 isDelete = true로 변경
    await Comment.findByIdAndUpdate(cmtID, { isDeleted: true });
    // 게시글 댓글 수 1 감소
    let comment = await Comment.findById(cmtID);
    if (comment.postModel === "Challenge") {
      // challenge
      await Challenge.findByIdAndUpdate(comment.post, {
        $inc: { commentNum: -1 },
      });
    } else {
      // concert
      await Concert.findByIdAndUpdate(comment.post, {
        $inc: { commentNum: -1 },
      });
    }
    // 유저 댓글 수 1 감소
    // 과연 필요할까??
    // await User.findByIdAndUpdate(userID.id, {
    //   $inc: { commentCNT: -1 },
    // });
  });

  return;
};

/**
 *  @마이페이지_회원정보_조회
 *  @route Get user/userInfo
 *  @access private
 */

export const getUserInfo = async (userID) => {
  const user = await User.findById(userID);
  const resData: userInfoResDTO = {
    img: user.img,
    email: user.email,
    nickname: user.nickname,
    interest: user.interest,
    gender: user.gender,
    marpolicy: user.marpolicy,
    _id: user.id,
  };
  return resData;
};

/**
 *  @마이페이지_회원정보_수정
 *  @route Patch user/userInfo
 *  @access private
 */
export const patchInfo = async (userID, body, url) => {
  var imgUrl = url.img;
  const { nickname, gender, marpolicy } = body;
  let rawInterest = body.interest;
  var interest;
  if (rawInterest !== "") {
    interest = stringToArray(rawInterest);
  } else {
    interest = rawInterest;
  }
  const user = await User.findById(userID);

  // 1. 요청 바디 부족
  if (
    nickname === undefined ||
    interest === undefined ||
    gender === undefined ||
    marpolicy === undefined
  ) {
    return -1;
  }

  if (user.nickname !== nickname) {
    // 3. 닉네임 중복
    let checkNickname = await User.findOne({ nickname });
    if (checkNickname) {
      return -2;
    }
  }

  if (imgUrl !== "") {
    await user.update({ $set: { img: imgUrl } });
  }

  if (nickname !== "") {
    await user.update({ $set: { nickname: nickname } });
  }

  if (interest !== "") {
    await user.update({ $set: { interest: interest } });
  }
  if (gender !== "") {
    await user.update({ $set: { gender: gender } });
  }
  if (marpolicy !== "") {
    await user.update({ $set: { marpolicy: marpolicy } });
  }

  // 마케팅 동의(marpolicy == true) 시 뱃지 발급
  if (marpolicy) {
    await Badge.findOneAndUpdate(
      { user: user.id },
      { $set: { marketingBadge: true } }
    );
  }
  return;
};

/**
 *  @마이페이지_비밀번호_수정
 *  @route Patch user/pw
 *  @access private
 */
export const patchPW = async (body: newPwReqDTO) => {
  const { password, newPassword, userID } = body;
  // 1. 요청 바디 부족
  if (!newPassword) {
    return -1;
  }

  const user = await User.findById(userID.id);

  // Encrpyt password
  const salt = await bcrypt.genSalt(10);
  const currentEncrpytPW = await bcrypt.hash(password, salt);

  // 2. 현재 비밀번호가 일치하지 않음
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return -2;
  }

  // Encrpyt password
  const encrpytPW = await bcrypt.hash(newPassword, salt);

  await user.update({ $set: { password: encrpytPW } });

  return;
};

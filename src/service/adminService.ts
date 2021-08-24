import sequelize, { Op } from "sequelize";

// models
import { Badge, Concert, Comment, Like, Post, Scrap, User } from "../models";

// DTO
import { adminDTO, concertDTO, commentDTO } from "../DTO";

// library
import { array } from "../library";
// /**
//  *  @관리자_페이지_조회
//  *  @route Get admin
//  *  @body
//  *  @error
//  *      1. 유저 id가 관리자가 아님
//  */

// export const postAdminList = async (userID, offset, limit) => {
//   if (!offset) {
//     offset = 0;
//   }

//   if (!limit) {
//     return -1;
//   }

//   // 1. 유저 id가 관리자가 아님
//   let user = await User.findById(userID);
//   if (!(user.userType === 1)) {
//     return -2;
//   }

//   const admins = await Admin.find(
//     {},
//     {
//       _id: false,
//       title: false,
//       limitNum: false,
//       __v: false,
//     }
//   ).sort({ generation: -1 });

//   const adminList = await Promise.all(
//     admins.map(async function (admin) {
//       let totalNum = await Challenge.aggregate([
//         {
//           $match: { generation: admin.generation },
//         },
//         {
//           $group: {
//             _id: "$user",
//             // 참여 인원
//             total: { $sum: 1 },
//           },
//         },
//         { $project: { _id: 0 } },
//       ]);
//       let participants = 0;
//       if (totalNum[0]) {
//         participants = totalNum[0]["total"];
//       }
//       const admintemp = {
//         registerStartDT: admin.registerStartDT,
//         registerEndDT: admin.registerEndDT,
//         challengeStartDT: admin.challengeStartDT,
//         challengeEndDT: admin.challengeEndDT,
//         generation: admin.generation,
//         createdDT: admin.createdDT,
//         // 신청 인원
//         applyNum: admin.applyNum,
//         // 참여 인원
//         participants,
//         postNum: await Challenge.find({ generation: admin.generation }).count(),
//         img: admin.img,
//       };
//       return admintemp;
//     })
//   );

//   var offsetAdmin = [];
//   for (var i = Number(offset); i < Number(offset) + Number(limit); i++) {
//     offsetAdmin.push(adminList[i]);
//   }
//   const resData: adminResDTO = {
//     offsetAdmin,
//     totalAdminNum: adminList.length,
//   };

//   return resData;
// };

// /**
//  *  @관리자_챌린지_등록
//  *  @route Post admin/challenge
//  *  @body registerStartDT, registerEndDT, challengeStartDT, challengeEndDT, limitNum, img
//  *  @error
//  *      1. 요청 바디 부족
//  *      2. 유저 id가 관리자가 아님
//  *      3. 챌린지 기간이 잘못됨
//  */
// export const postAdminChallenge = async (
//   userID,
//   reqData: adminRegistReqDTO,
//   url
// ) => {
//   const img = url.img;
//   const {
//     title,
//     registerStartDT,
//     registerEndDT,
//     challengeStartDT,
//     challengeEndDT,
//     limitNum,
//   } = reqData;

//   // 1. 요청 바디 부족
//   if (
//     !title ||
//     !registerStartDT ||
//     !registerEndDT ||
//     !challengeStartDT ||
//     !challengeEndDT ||
//     !limitNum
//   ) {
//     return -1;
//   }

//   // 2. 유저 id가 관리자가 아님
//   let user = await User.findById(userID);
//   if (!(user.userType === 1)) {
//     return -2;
//   }

//   /*
//     var = new Date('2020-10-23');
//     var date2 = new Date('2020-10-22');

//     console.log(date1 > date2); // true
//   */

//   //기수 증가
//   const changeGen = (await Admin.find().count()) + 1;
//   const admin = new Admin({
//     title,
//     registerStartDT: stringToDate(registerStartDT),
//     registerEndDT: stringToEndDate(registerEndDT),
//     challengeStartDT: stringToDate(challengeStartDT),
//     challengeEndDT: stringToEndDate(challengeEndDT),
//     generation: changeGen,
//     limitNum,
//     img,
//     createdAt: new Date(),
//   });
//   // 3. 챌린지 기간이 잘못됨
//   // 신청 마감날짜가 신청 시작 날짜보다 빠름
//   if (registerEndDT < registerStartDT) {
//     return -3;
//   }
//   // 챌린지 끝나는 날짜가 챌린지 시작하는 날짜보다 빠름
//   else if (challengeEndDT < challengeStartDT) {
//     return -3;
//   }
//   // 챌린지가 시작하는 날짜가 신청 마감 날짜보다 빠름
//   else if (challengeStartDT < registerEndDT) {
//     return -3;
//   }
//   await admin.save();
//   return;
// };

// /**
//  *  @관리자_챌린지_신청페이지
//  *  @route Get admin/regist
//  *  @access private
//  */
// export const getAdminRegist = async () => {
//   // 신청 기간을 확인 현재 진행중인 기수를 가져옴
//   let dateNow = new Date();
//   const admin = await Admin.findOne({
//     $and: [
//       { registerStartDT: { $lte: dateNow } },
//       { registerEndDT: { $gte: dateNow } },
//     ],
//   });

//   // 현재 진행중인 기수가 없음
//   if (!admin) {
//     return -1;
//   }

//   const resData: adminRegistResDTO = {
//     img: admin.img,
//     title: admin.title,
//     registerStartDT: admin.registerStartDT,
//     registerEndDT: admin.registerEndDT,
//     challengeStartDT: admin.challengeStartDT,
//     challengeEndDT: admin.challengeEndDT,
//     generation: admin.generation,
//   };

//   return resData;
// };

/**
 *  @관리자_콘서트_등록
 *  @route Post admin/concert
 *  @access private
 *  @error
 *      1. 요청 바디 부족
 *      2. 유저 id가 관리자가 아님
 *      3. 해당 날짜에 진행되는 기수가 없음
 */

export const postAdminConcert = async (
  userID: number,
  reqData: adminDTO.adminWriteReqDTO,
  url
) => {
  const { title, text, authorNickname } = reqData;
  let interest = array.stringToInterest(reqData.interest);
  let hashtag = array.stringToHashtag(reqData.hashtag);

  // 1. 요청 바디 부족
  if (!title || !text || !interest || !hashtag || !authorNickname) {
    return -1;
  }

  // 2. 유저 id가 관리자가 아님
  const user = await User.findOne({
    where: { id: userID },
    attributes: ["isAdmin", "nickName"],
  });
  if (user.isAdmin === false) {
    return -2;
  }

  // 해당 닉네임을 가진 유저를 찾음
  const authorUser = await User.findOne({
    where: { nickname: authorNickname },
  });

  // 원글 작성자 아이디
  let authorID;

  // 해당 닉네임을 가진 유저가 있음
  if (authorUser) {
    // 해당 닉네임을 가진 유저의 id를 넣음
    authorID = authorUser.id;
  } else {
    // 해당 닉네임을 가진 유저가 없음
    // 아이디는 관리자 아이디를 사용, 닉네임은 그 자체(authorNickname)를 사용
    authorID = userID;
  }

  // Concert 등록
  const newPost = await Post.create({
    userID,
    interest,
  });

  await Concert.create({
    id: newPost.id,
    userID: authorID,
    title,
    videoLink: url.videoLink,
    imgThumbnail: url.imgThumbnail,
    text,
    isNotice: false,
    authorNickname,
    hashtag,
  });

  return 1;
};

// /**
//  *  @관리자_공지사항_등록
//  *  @route Post admin/notice
//  *  @body
//  *  @error
//  *      1. 요청 바디 부족
//  *      2. 유저 id가 관리자가 아님
//  */

// export const postAdminNotice = async (userID, reqData, url) => {
//   const { title, text } = reqData;

//   let interest;
//   if (reqData.interest) {
//     interest = stringToArray(reqData.interest);
//     // .toLowerCase()
//     // .slice(1, -1)
//     // .replace(/"/gi, "")
//     // .split(/,\s?/);
//   }

//   let hashtag;
//   if (reqData.hashtag) {
//     hashtag = stringToArray(reqData.hashtag);
//     // .toLowerCase()
//     // .slice(1, -1)
//     // .replace(/"/gi, "")
//     // .split(/,\s?/);
//   }

//   // 1. 요청 바디 부족
//   if (!title || !text) {
//     return -1;
//   }

//   // 2. 유저 id가 관리자가 아님
//   let user = await User.findById(userID);
//   if (!(user.userType === 1)) {
//     return -2;
//   }

//   const notice = new Concert({
//     title: title.toLowerCase(),
//     interest,
//     user: userID,
//     isNotice: true,
//     videoLink: url.videoLink,
//     imgThumbnail: url.imgThumbnail,
//     text: text.toLowerCase(),
//     hashtag,
//   });

//   await notice.save();

//   return;
// };

const adminService = { postAdminConcert };
export default adminService;

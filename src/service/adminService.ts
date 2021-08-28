import sequelize, { Op } from "sequelize";

// models
import {
  Badge,
  Concert,
  Comment,
  Like,
  Post,
  Challenge,
  User,
  Admin,
} from "../models";

// DTO
import { adminDTO, concertDTO, commentDTO } from "../DTO";

// library
import { array } from "../library";

/**
 *  @관리자_페이지_조회
 *  @route Get /admin?offset=&limit=
 *  @body
 *  @error
 *      1. 유저 id가 관리자가 아님
 */

export const getAdminList = async (
  userID: number,
  offset: number,
  limit: number
) => {
  // isDelete = true 인 애들만 가져오기
  // offset 뒤에서 부터 가져오기
  // 최신순으로 정렬
  // 댓글, 답글 최신순으로 정렬
  if (!offset) {
    offset = 0;
  }

  // 1. 요청 부족
  if (!limit) {
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

  const admins: adminDTO.adminResDetailDTO[] = await Admin.findAll({
    order: [["generation", "DESC"]],
    limit,
    offset,
  });

  const adminList = await Promise.all(
    admins.map(async (admin) => {
      // 해당 기수 글 작성자
      const participantList = await Post.findAll({
        where: { generation: admin.generation },
        include: [
          {
            model: Challenge,
            required: true,
          },
        ],
        attributes: [[sequelize.fn("count", sequelize.col("userID")), "count"]],
      });

      // 해당 기수 글 개수
      const postNum = await Post.findAll({
        where: { generation: admin.generation },
        include: [
          {
            model: Challenge,
            required: true,
          },
        ],
      });

      let returnData: adminDTO.adminResDetailDTO = {
        registerStartDT: admin.registerStartDT,
        registerEndDT: admin.registerEndDT,
        challengeStartDT: admin.challengeStartDT,
        challengeEndDT: admin.challengeEndDT,
        generation: admin.generation,
        createdAT: admin.createdAT,
        applyNum: admin.applyNum,
        participants: participantList.length,
        postNum: postNum.length,
        img: admin.img,
      };

      return returnData;
    })
  );

  const totalAdmin = await Admin.findAll();

  const resData: adminDTO.adminResDTO = {
    offsetAdmin: adminList,
    totalAdminNum: totalAdmin.length,
  };

  return resData;
};

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

/**
 *  @관리자_챌린지_신청페이지
 *  @route Get admin/regist
 *  @access public
 */
export const getAdminRegist = async () => {
  // 신청 기간을 확인 현재 진행중인 기수를 가져옴
  let dateNow = new Date();
  const admin = await Admin.findOne({
    where: {
      [sequelize.Op.and]: {
        registerStartDT: { [sequelize.Op.lte]: dateNow },
        registerEndDT: { [sequelize.Op.gte]: dateNow },
      },
    },
  });

  // 현재 진행중인 기수가 없음
  if (!admin) {
    return -1;
  }

  const resData: adminDTO.adminRegistResDTO = {
    img: admin.img,
    title: admin.title,
    registerStartDT: admin.registerStartDT,
    registerEndDT: admin.registerEndDT,
    challengeStartDT: admin.challengeStartDT,
    challengeEndDT: admin.challengeEndDT,
    generation: admin.generation,
  };

  return resData;
};

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
  url: any
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

/**
 *  @관리자_공지사항_등록
 *  @route Post admin/notice
 *  @body
 *  @error
 *      1. 요청 바디 부족
 *      2. 유저 id가 관리자가 아님
 */

export const postAdminNotice = async (
  userID: number,
  reqData: adminDTO.adminWriteReqDTO,
  url: any
) => {
  const { title, text } = reqData;

  let interest = array.stringToInterest(reqData.interest);
  let hashtag = array.stringToHashtag(reqData.hashtag);

  // 1. 요청 바디 부족
  if (!title || !text) {
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

  // Notice 등록
  const newPost = await Post.create({
    userID,
    interest,
  });

  await Concert.create({
    id: newPost.id,
    userID,
    title,
    videoLink: url.videoLink,
    imgThumbnail: url.imgThumbnail,
    text,
    isNotice: true,
    hashtag,
  });

  return 1;
};

const adminService = {
  getAdminList,
  getAdminRegist,
  postAdminConcert,
  postAdminNotice,
};
export default adminService;

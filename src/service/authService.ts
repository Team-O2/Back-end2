// models
import { User, Badge, Admin } from "../models";
// DTO
import { authDTO } from "../DTO";
// library
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "../config";
import { emailSender } from "../library";
import ejs from "ejs";
import sequelize from "sequelize";

/**
 *  @회원가입
 *  @route Post /auth/signup
 *  @body email,password, nickname, marpolicy, interest
 *  @access public
 *  @error
 *      1. 요청 바디 부족
 *      2. 아이디 중복
 */

const postSignup = async (data: authDTO.signupReqDTO) => {
  const { email, password, nickname, isMarketing, interest } = data;

  // 1. 요청 바디 부족
  if (!email || !password || !nickname || !interest) {
    return -1;
  }

  // 2. 아이디 중복
  const existUser = await User.findOne({ where: { email: email } });

  if (existUser) {
    return -2;
  }

  // 3. 닉네임 중복
  const checkNickname = await User.findOne({ where: { nickname: nickname } });
  if (checkNickname) {
    return -3;
  }

  // password 암호화
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  // User 생성
  const user = await User.create({
    email,
    password: hashPassword,
    nickname,
    isMarketing,
  });

  // UserInterest 생성
  const userID = (await user).id;
  const interests = await interest.map((interestOne) => {
    UserInterest.create({
      userID: userID,
      interest: interestOne,
    });
    return interestOne;
  });

  // Badge 생성
  const badge = await Badge.create({
    id: user.id,
  });

  // 마케팅 동의(isMarketing == true) 시 뱃지 발급
  if (user.isMarketing) {
    badge.marketingBadge = true;
    await badge.save();
  }

  // Return jsonwebtoken
  const payload = {
    user: {
      id: userID,
    },
  };

  // access 토큰 발급
  // 유효기간 14일
  let token = jwt.sign(payload, config.jwtSecret, { expiresIn: "14d" });

  return { user, token };
};

/**
 *  @로그인
 *  @route Post auth/siginin
 *  @body email,password
 *  @error
 *      1. 요청 바디 부족
 *      2. 아이디가 존재하지 않음
 *      3. 패스워드가 올바르지 않음
 *  @response
 *      0: 비회원,
 *      1: 챌린지안하는유저 (기간은 신청기간 중)
 *      2: 챌린지 안하는 유저 (기간은 신청기간이 아님)
 *      3: 챌린지 하는 유저 (기간은 챌린지 중)
 *      4: 관리자
 */

async function postSignin(reqData: authDTO.signinReqDTO) {
  const { email, password } = reqData;

  // 1. 요청 바디 부족
  if (!email || !password) {
    return -1;
  }

  // 2. email이 DB에 존재하지 않음
  const user = await User.findOne({ where: { email: email } });
  if (!user) {
    return -2;
  }

  // 3. password가 올바르지 않음
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return -3;
  }

  await user.save();

  const payload = {
    user: {
      id: user.id,
    },
  };

  // access 토큰 발급
  // 유효기간 14일
  let token = jwt.sign(payload, config.jwtSecret, { expiresIn: "14d" });

  let userState = 0;

  // 신청 진행 중 기수(generation)를 확인하여 오투콘서트에 삽입
  let dateNow = new Date();
  const gen = await Admin.findOne({
    where: {
      [sequelize.Op.and]: {
        registerStartDT: { [sequelize.Op.lte]: dateNow },
        registerEndDT: { [sequelize.Op.gte]: dateNow },
      },
    },
  });

  const progressGen = await Admin.findOne({
    where: {
      [sequelize.Op.and]: {
        challengeStartDT: { [sequelize.Op.lte]: dateNow },
        challengeEndDT: { [sequelize.Op.gte]: dateNow },
      },
    },
  });

  let registGeneration = gen ? gen.generation : null;
  let progressGeneration = null;
  if (progressGen) {
    progressGeneration = progressGen.generation;
  }

  // UserState 등록
  // 4-관리자
  if (user.isAdmin === true) {
    userState = 4;
    registGeneration = null;
  }
  // 챌린지 안하는 유저
  else if (!user.isChallenge) {
    // 1- 해당 날짜에 신청 가능한 기수가 있음
    if (gen) {
      userState = 1;
    }
    // 2- 해당 날짜에 신청 가능한 기수가 없음
    else {
      userState = 2;
    }
  }
  // 3- 챌린지 중인 유저
  else {
    userState = 3;
  }

  let totalGeneration = await (await Admin.findAndCountAll({})).count;
  const userData: authDTO.signinResDTO = {
    userState,
    progressGeneration,
    registGeneration,
    totalGeneration,
  };

  return { userData, token };
}

/**
 *  @햄버거바
 *  @route Post auth/hamburger
 *  @desc
 *  @access public
 */

const getHamburger = async () => {
  // 신청 진행 중 기수(generation)를 확인하여 오투콘서트에 삽입
  let dateNow = new Date();
  const gen = await Admin.findOne({
    where: {
      [sequelize.Op.and]: {
        registerStartDT: { [sequelize.Op.lte]: dateNow },
        registerEndDT: { [sequelize.Op.gte]: dateNow },
      },
    },
  });

  const progressGen = await Admin.findOne({
    where: {
      [sequelize.Op.and]: {
        challengeStartDT: { [sequelize.Op.lte]: dateNow },
        challengeEndDT: { [sequelize.Op.gte]: dateNow },
      },
    },
  });

  var registGeneration = gen ? gen.generation : null;
  var progressGeneration = null;
  if (progressGen) {
    progressGeneration = progressGen.generation;
  }

  const resData: authDTO.hamburgerResDTO = {
    progressGeneration,
    registGeneration,
  };

  return resData;
};

// /**
//  *  @이메일_인증번호_전송
//  *  @route Post auth/email
//  *  @body email
//  *  @error
//  *      1. 요청 바디 부족
//  *      2. 아이디가 존재하지 않음
//  */
// export async function postEmail(body) {
//   const { email } = body;

//   // 1. 요청 바디 부족
//   if (!email) {
//     return -1;
//   }

//   // 2. email이 DB에 존재하지 않음
//   let user = await User.findOne({ email });
//   if (!user) {
//     return -2;
//   }

//   // 인증번호를 user에 저장 -> 제한 시간 설정하기!
//   const authNum = Math.random().toString().substr(2, 6);
//   user.emailCode = authNum;
//   await user.save();

//   let emailTemplate;
//   ejs.renderFile(
//     "src/library/emailTemplete.ejs",
//     { authCode: authNum },
//     (err, data) => {
//       if (err) {
//         console.log(err);
//       }
//       emailTemplate = data;
//     }
//   );

//   const mailOptions = {
//     front: "hyunjin5697@gmail.com",
//     to: email,
//     subject: "메일 제목",
//     text: "메일 내용",
//     html: emailTemplate,
//   };

//   await emailSender.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       // res.json({ msg: "err" });
//       console.log(error);
//     } else {
//       // res.json({ msg: "sucess" });
//       console.log("success");
//     }
//     emailSender.close();
//   });

//   return 0;
// }

// /**
//  *  @인증번호_인증
//  *  @route Post auth/code
//  *  @body email
//  *  @error
//  *      1. 요청 바디 부족
//  *      2. 유저가 존재하지 않음
//  */
// export async function postCode(body) {
//   // 저장해놓은 authNum이랑 body로 온 인증번호랑 비교
//   const { email, emailCode } = body;

//   // 1. 요청 바디 부족
//   if (!email || !emailCode) {
//     return -1;
//   }

//   // 2. 유저가 존재하지 않음
//   // isDeleted = false 인 유저를 찾아야함
//   // 회원 탈퇴했다가 다시 가입한 경우 생각하기
//   let user = await User.findOne({ email: email });
//   if (!user) {
//     return -2;
//   }

//   if (emailCode !== user.emailCode) {
//     // 인증번호가 일치하지 않음
//     return -3;
//   } else {
//     // 인증번호 일치
//     return 0;
//   }

//   return;
// }

// /**
//  *  @비밀번호_재설정
//  *  @route Patch auth/pw
//  *  @body email
//  *  @error
//  *      1. 요청 바디 부족
//  *      2. 아이디가 존재하지 않음
//  */
// export async function patchPassword(reqData: pwReqDTO) {
//   const { email, password } = reqData;

//   // 1. 요청 바디 부족
//   if (!email || !password) {
//     return -1;
//   }

//   // 2. email이 DB에 존재하지 않음
//   let user = await User.findOne({ email });
//   if (!user) {
//     return -2;
//   }

//   // 비밀번호 변경 로직
//   // Encrpyt password
//   const salt = await bcrypt.genSalt(10);
//   user.password = await bcrypt.hash(password, salt);
//   await user.save();
//   return;
// }

const authService = {
  postSignup,
  postSignin,
  getHamburger,
};

export default authService;

// models
import User from "../models/User";
import Badge from "../models/Badge";
import Admin from "../models/Admin";

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "../config";

// DTO
import {
  signupReqDTO,
  signinReqDTO,
  signinResDTO,
  hamburgerResDTO,
  pwReqDTO,
} from "../DTO/authDTO";

// library
import { smtpTransport } from "../library/emailSender";
import ejs from "ejs";

/**
 *  @회원가입
 *  @route Post api/auth
 *  @body email,password, nickname, marpolicy, interest
 *  @error
 *      1. 요청 바디 부족
 *      2. 아이디 중복
 */

export async function postSignup(data: signupReqDTO) {
  const { email, password, nickname, gender, marpolicy, interest } = data;

  // 1. 요청 바디 부족
  if (!email || !password || !nickname || !interest) {
    return -1;
  }

  // 2. 아이디 중복
  let user = await User.findOne({ email });
  if (user) {
    return -2;
  }

  // 3. 닉네임 중복
  let checkNickname = await User.findOne({ nickname });
  if (checkNickname) {
    return -3;
  }

  user = new User({
    email,
    password,
    nickname,
    gender,
    marpolicy,
    interest,
  });

  const badge = new Badge({
    user: user.id,
  });
  await badge.save();

  // Encrpyt password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);

  await user.save();
  // console.log(user);
  await user.updateOne({ badge: badge._id });

  // 마케팅 동의(marpolicy == true) 시 뱃지 발급
  if (user.marpolicy) {
    await Badge.findOneAndUpdate(
      { user: user.id },
      { $set: { marketingBadge: true } }
    );
  }

  // Return jsonwebtoken
  const payload = {
    user: {
      id: user.id,
    },
  };

  // access 토큰 발급
  // 유효기간 14일
  let token = jwt.sign(payload, config.jwtSecret, { expiresIn: "14d" });

  return { user, token };
}

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

export async function postSignin(reqData: signinReqDTO) {
  const { email, password } = reqData;

  // 1. 요청 바디 부족
  if (!email || !password) {
    return -1;
  }

  // 2. email이 DB에 존재하지 않음
  let user = await User.findOne({ email });
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

  var userState = 0;
  /*
    var = new Date('2020-10-23');
    var date2 = new Date('2020-10-22');

    console.log(date1 > date2); // true
  */

  // 신청 진행 중 기수(generation)를 확인하여 오투콘서트에 삽입
  let dateNow = new Date();
  const gen = await Admin.findOne({
    $and: [
      { registerStartDT: { $lte: dateNow } },
      { registerEndDT: { $gte: dateNow } },
    ],
  });

  const progressGen = await Admin.findOne({
    $and: [
      { challengeStartDT: { $lte: dateNow } },
      { challengeEndDT: { $gte: dateNow } },
    ],
  });

  var registGeneration = gen ? gen.generation : null;
  var progressGeneration = null;
  if (progressGen) {
    progressGeneration = progressGen.generation;
  }

  // 4-관리자
  if (user.userType === 1) {
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

  var totalGeneration = await Admin.find().countDocuments();
  const userData: signinResDTO = {
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
 *  @access Public
 */

export async function getHamburger() {
  // 신청 진행 중 기수(generation)를 확인하여 오투콘서트에 삽입
  let dateNow = new Date();
  const gen = await Admin.findOne({
    $and: [
      { registerStartDT: { $lte: dateNow } },
      { registerEndDT: { $gte: dateNow } },
    ],
  });

  const progressGen = await Admin.findOne({
    $and: [
      { challengeStartDT: { $lte: dateNow } },
      { challengeEndDT: { $gte: dateNow } },
    ],
  });

  var registGeneration = gen ? gen.generation : null;
  var progressGeneration = null;
  if (progressGen) {
    progressGeneration = progressGen.generation;
  }
  const resData: hamburgerResDTO = {
    progressGeneration,
    registGeneration,
  };
  return resData;
}

/**
 *  @이메일_인증번호_전송
 *  @route Post auth/email
 *  @body email
 *  @error
 *      1. 요청 바디 부족
 *      2. 아이디가 존재하지 않음
 */
export async function postEmail(body) {
  const { email } = body;

  // 1. 요청 바디 부족
  if (!email) {
    return -1;
  }

  // 2. email이 DB에 존재하지 않음
  let user = await User.findOne({ email });
  if (!user) {
    return -2;
  }

  // 인증번호를 user에 저장 -> 제한 시간 설정하기!
  const authNum = Math.random().toString().substr(2, 6);
  user.emailCode = authNum;
  await user.save();

  let emailTemplate;
  ejs.renderFile(
    "src/library/emailTemplete.ejs",
    { authCode: authNum },
    (err, data) => {
      if (err) {
        console.log(err);
      }
      emailTemplate = data;
    }
  );

  const mailOptions = {
    front: "hyunjin5697@gmail.com",
    to: email,
    subject: "메일 제목",
    text: "메일 내용",
    html: emailTemplate,
  };

  await smtpTransport.sendMail(mailOptions, (error, info) => {
    if (error) {
      // res.json({ msg: "err" });
      console.log(error);
    } else {
      // res.json({ msg: "sucess" });
      console.log("success");
    }
    smtpTransport.close();
  });

  return 0;
}

/**
 *  @인증번호_인증
 *  @route Post auth/code
 *  @body email
 *  @error
 *      1. 요청 바디 부족
 *      2. 유저가 존재하지 않음
 */
export async function postCode(body) {
  // 저장해놓은 authNum이랑 body로 온 인증번호랑 비교
  const { email, emailCode } = body;

  // 1. 요청 바디 부족
  if (!email || !emailCode) {
    return -1;
  }

  // 2. 유저가 존재하지 않음
  // isDeleted = false 인 유저를 찾아야함
  // 회원 탈퇴했다가 다시 가입한 경우 생각하기
  let user = await User.findOne({ email: email });
  if (!user) {
    return -2;
  }

  if (emailCode !== user.emailCode) {
    // 인증번호가 일치하지 않음
    return -3;
  } else {
    // 인증번호 일치
    return 0;
  }

  return;
}

/**
 *  @비밀번호_재설정
 *  @route Patch auth/pw
 *  @body email
 *  @error
 *      1. 요청 바디 부족
 *      2. 아이디가 존재하지 않음
 */
export async function patchPassword(reqData: pwReqDTO) {
  const { email, password } = reqData;

  // 1. 요청 바디 부족
  if (!email || !password) {
    return -1;
  }

  // 2. email이 DB에 존재하지 않음
  let user = await User.findOne({ email });
  if (!user) {
    return -2;
  }

  // 비밀번호 변경 로직
  // Encrpyt password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  await user.save();
  return;
}

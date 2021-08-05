import jwt from "jsonwebtoken";
import { returnCode } from "../library/returnCode";
import { response } from "../library/response";
import config from "../config";

export function verify(authorization) {
  // verify를 통해 토큰 값을 decode 한다.
  let decoded;
  try {
    decoded = jwt.verify(authorization, config.jwtSecret);
    return decoded;
  } catch (err) {
    if (err.message === "jwt expired") {
      console.log("expired token");
      return -3;
    } else if (err.message === "invalid token") {
      console.log("invalid token");
      return -2;
    } else {
      console.log("invalid token");
      return -2;
    }
  }
}

export function isLogin(req, res, next) {
  const { authorization } = req.headers;

  if (authorization == undefined) {
    // 토큰이 없는 경우
    req.user = {
      userIdx: null,
    };
  } else {
    // 토큰이 있는 경우
    try {
      // 유효한 경우 token을 decode
      req.user = jwt.verify(authorization, config.jwtSecret);
      next();
    } catch (error) {
      // 유효하지 않은 경우
      response(res, returnCode.UNAUTHORIZED, error.message); //
    }
  }
}

export function checkLogin(req, res, next) {
  const { authorization } = req.headers;

  try {
    // 유효한 경우 token decode
    req.user = jwt.verify(authorization, config.jwtSecret);
    next();
  } catch (error) {
    // 유효하지 않은 경우
    response(res, returnCode.UNAUTHORIZED, error.message);
  }
}

// libararies
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { response, returnCode } from "../library";

export default (req: Request, res: Response, next) => {
  // 토큰 검사
  if (req.headers.authorization == null) {
    req.body.userID = null;
    next();
  } else {
    const token = req.headers.authorization;

    // Verify token
    try {
      const decoded = jwt.verify(token, config.jwtSecret);

      req.body.userID = decoded.user;
      next();
    } catch (err) {
      if (err.message === "jwt expired") {
        response.basicResponse(
          res,
          returnCode.UNAUTHORIZED,
          "만료된 토큰입니다"
        );
      } else {
        response.basicResponse(
          res,
          returnCode.UNAUTHORIZED,
          "적합하지 않은 토큰입니다"
        );
      }
    }
  }
};

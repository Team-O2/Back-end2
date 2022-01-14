"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const library_1 = require("../library");
exports.default = (req, res, next) => {
    // 토큰 검사
    if (req.headers.authorization == null) {
        library_1.response.basicResponse(res, library_1.returnCode.BAD_REQUEST, "토큰 값이 요청되지 않았습니다");
    }
    const token = req.headers.authorization;
    // Verify token
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwtSecret);
        req.body.userID = decoded.user;
        next();
    }
    catch (err) {
        if (err.message === "jwt expired") {
            library_1.response.basicResponse(res, library_1.returnCode.UNAUTHORIZED, "만료된 토큰입니다");
        }
        else {
            library_1.response.basicResponse(res, library_1.returnCode.UNAUTHORIZED, "적합하지 않은 토큰입니다");
        }
    }
};
//# sourceMappingURL=auth.js.map
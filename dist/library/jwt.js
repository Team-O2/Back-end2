"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const library_1 = require("../library");
const config_1 = __importDefault(require("../config"));
function verify(authorization) {
    // verify를 통해 토큰 값을 decode 한다.
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(authorization, config_1.default.jwtSecret);
        return decoded;
    }
    catch (err) {
        if (err.message === "jwt expired") {
            console.log("expired token");
            return -3;
        }
        else if (err.message === "invalid token") {
            console.log("invalid token");
            return -2;
        }
        else {
            console.log("invalid token");
            return -2;
        }
    }
}
function isLogin(req, res, next) {
    const { authorization } = req.headers;
    if (authorization == undefined) {
        // 토큰이 없는 경우
        req.user = {
            userIdx: null,
        };
    }
    else {
        // 토큰이 있는 경우
        try {
            // 유효한 경우 token을 decode
            req.user = jsonwebtoken_1.default.verify(authorization, config_1.default.jwtSecret);
            next();
        }
        catch (error) {
            // 유효하지 않은 경우
            library_1.response.basicResponse(res, library_1.returnCode.UNAUTHORIZED, error.message); //
        }
    }
}
function checkLogin(req, res, next) {
    const { authorization } = req.headers;
    try {
        // 유효한 경우 token decode
        req.user = jsonwebtoken_1.default.verify(authorization, config_1.default.jwtSecret);
        next();
    }
    catch (error) {
        // 유효하지 않은 경우
        library_1.response.basicResponse(res, library_1.returnCode.UNAUTHORIZED, error.message);
    }
}
const JWT = {
    verify,
    isLogin,
    checkLogin,
};
exports.default = JWT;
//# sourceMappingURL=jwt.js.map
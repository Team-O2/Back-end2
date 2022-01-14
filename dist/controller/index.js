"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = exports.noticeController = exports.concertController = exports.challengeController = exports.userController = exports.authController = void 0;
var auth_1 = require("./auth");
Object.defineProperty(exports, "authController", { enumerable: true, get: function () { return __importDefault(auth_1).default; } });
var user_1 = require("./user");
Object.defineProperty(exports, "userController", { enumerable: true, get: function () { return __importDefault(user_1).default; } });
var challenge_1 = require("./challenge");
Object.defineProperty(exports, "challengeController", { enumerable: true, get: function () { return __importDefault(challenge_1).default; } });
var concert_1 = require("./concert");
Object.defineProperty(exports, "concertController", { enumerable: true, get: function () { return __importDefault(concert_1).default; } });
var notice_1 = require("./notice");
Object.defineProperty(exports, "noticeController", { enumerable: true, get: function () { return __importDefault(notice_1).default; } });
var admin_1 = require("./admin");
Object.defineProperty(exports, "adminController", { enumerable: true, get: function () { return __importDefault(admin_1).default; } });
//# sourceMappingURL=index.js.map
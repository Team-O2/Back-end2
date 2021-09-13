"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./auth"));
const user_1 = __importDefault(require("./user"));
const challenge_1 = __importDefault(require("./challenge"));
const concert_1 = __importDefault(require("./concert"));
const notice_1 = __importDefault(require("./notice"));
const admin_1 = __importDefault(require("./admin"));
const router = express_1.default.Router();
router.use("/auth", auth_1.default);
router.use("/user", user_1.default);
router.use("/challenge", challenge_1.default);
router.use("/concert", concert_1.default);
router.use("/notice", notice_1.default);
router.use("/admin", admin_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map
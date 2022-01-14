"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const library_1 = require("../library");
const router = express_1.default.Router();
router.get("", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        library_1.response.basicResponse(res, library_1.returnCode.OK, "o2 api");
    }
    catch (err) {
        library_1.response.basicResponse(res, library_1.returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
    }
}));
router.use("/auth", auth_1.default);
router.use("/user", user_1.default);
router.use("/challenge", challenge_1.default);
router.use("/concert", concert_1.default);
router.use("/notice", notice_1.default);
router.use("/admin", admin_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_1 = require("../controller");
// middleware
const middleware_1 = require("../middleware");
// modules
const upload = require("../modules/upload");
const router = express_1.default.Router();
router.get("/mypage/info", middleware_1.authMiddleware, controller_1.userController.getMypageInfoController);
router.get("/userInfo", middleware_1.authMiddleware, controller_1.userController.getUserInfoController);
router.get("/mypage/concert", middleware_1.authMiddleware, controller_1.userController.getConcertScrapController);
router.get("/mypage/challenge", middleware_1.authMiddleware, controller_1.userController.getChallengeScrapController);
router.get("/mypage/write", middleware_1.authMiddleware, controller_1.userController.getMyWritingsController);
router.get("/mypage/comment", middleware_1.authMiddleware, controller_1.userController.getMyCommentsController);
router.patch("/password", middleware_1.authMiddleware, controller_1.userController.patchPWController);
router.patch("/mypage/comment", middleware_1.authMiddleware, controller_1.userController.deleteMyCommentsController);
router.patch("/mypage/challenge/:challengeID", middleware_1.authMiddleware, controller_1.userController.deleteChallengeScrapController);
router.post("/register", middleware_1.authMiddleware, controller_1.userController.postRegisterController);
router.patch("/userInfo", upload.fields([{ name: "img", maxCount: 1 }]), middleware_1.authMiddleware, controller_1.userController.patchUserInfoController);
exports.default = router;
//# sourceMappingURL=user.js.map
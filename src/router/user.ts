import express from "express";
import { userController } from "../controller";
// middleware
import { authMiddleware, publicAuthMiddleware } from "../middleware";
// modules
const upload = require("../modules/upload");

const router = express.Router();

router.get(
  "/mypage/info",
  authMiddleware,
  userController.getMypageInfoController
);
router.get("/userInfo", authMiddleware, userController.getUserInfoController);

router.get(
  "/mypage/concert",
  authMiddleware,
  userController.getConcertScrapController
);
router.get(
  "/mypage/challenge",
  authMiddleware,
  userController.getChallengeScrapController
);
router.get(
  "/mypage/write",
  authMiddleware,
  userController.getMyWritingsController
);
router.get(
  "/mypage/comment",
  authMiddleware,
  userController.getMyCommentsController
);

router.patch("/password", authMiddleware, userController.patchPWController);
router.patch(
  "/mypage/comment",
  authMiddleware,
  userController.deleteMyCommentsController
);
router.patch(
  "/mypage/challenge/:challengeID",
  authMiddleware,
  userController.deleteChallengeScrapController
);
router.post("/register", authMiddleware, userController.postRegisterController);
router.patch(
  "/userInfo",
  upload.fields([{ name: "img", maxCount: 1 }]),
  authMiddleware,
  userController.patchUserInfoController
);
export default router;

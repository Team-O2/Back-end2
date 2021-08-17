import express from "express";
import { userController } from "../controller";
// middleware
import { authMiddleware, publicAuthMiddleware } from "../middleware";

const router = express.Router();

router.get("/mypage/info", authMiddleware, userController.mypageInfoController);
// router.get("/mypage/concert", authMiddleware, userController.mypageConcertController);
router.get("/userInfo", authMiddleware, userController.userInfoController)
export default router;

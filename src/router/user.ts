import express from "express";
import { userController } from "../controller";
// middleware
import { authMiddleware, publicAuthMiddleware } from "../middleware";

const router = express.Router();

router.get("/mypage/info", authMiddleware, userController.mypageInfoController);

export default router;

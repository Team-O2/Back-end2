import express from "express";
import { userController } from "../controller";

const router = express.Router();

router.get("/mypage/info", userController.mypageInfoController);

export default router;

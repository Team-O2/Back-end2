import { Route53RecoveryCluster } from "aws-sdk";
import express, { Request, Response } from "express";
import authRouter from "./auth";
import userRouter from "./user";
import challengeRouter from "./challenge";
import concertRouter from "./concert";
import noticeRouter from "./notice";
import adminRouter from "./admin";
import { response, returnCode } from "../library";

const router = express.Router();

router.get("", async (req: Request, res: Response) => {
  try {
    response.basicResponse(res, returnCode.OK, "o2 api");
  } catch (err) {
    response.basicResponse(res, returnCode.INTERNAL_SERVER_ERROR, "서버 오류");
  }
});
router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/challenge", challengeRouter);
router.use("/concert", concertRouter);
router.use("/notice", noticeRouter);
router.use("/admin", adminRouter);
export default router;

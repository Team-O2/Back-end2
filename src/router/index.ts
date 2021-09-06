import { Route53RecoveryCluster } from "aws-sdk";
import express from "express";
import authRouter from "./auth";
import userRouter from "./user";
import challengeRouter from "./challenge";
import concertRouter from "./concert";
import adminRouter from "./admin";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/challenge", challengeRouter);
router.use("/concert", concertRouter);
router.use("/admin", adminRouter);

export default router;

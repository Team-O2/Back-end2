import { Route53RecoveryCluster } from "aws-sdk";
import express from "express";
import authRouter from "./auth";
import userRouter from "./user";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);

export default router;

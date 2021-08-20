import express from "express";
import authRouter from "./auth";
import challengeRouter from "./challenge";
import concertRouter from "./concert";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/challenge", challengeRouter);
router.use("/concert", concertRouter);

export default router;

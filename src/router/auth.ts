import express from "express";
import { signupController } from "../controller/auth";

const router = express.Router();

router.post("/signup", signupController);

export default router;

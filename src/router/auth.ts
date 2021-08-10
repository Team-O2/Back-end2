import express from "express";
import {
  signupController,
  signinController,
  hamburgerController,
} from "../controller/auth";

const router = express.Router();

router.post("/signup", signupController);
router.post("/signin", signinController);
router.get("/hamburger", hamburgerController);

export default router;

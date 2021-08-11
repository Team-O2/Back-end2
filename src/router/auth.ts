import express from "express";
import { authController } from "../controller";

const router = express.Router();

router.post("/signup", authController.signupController);
router.post("/signin", authController.signinController);
router.get("/hamburger", authController.hamburgerController);

export default router;

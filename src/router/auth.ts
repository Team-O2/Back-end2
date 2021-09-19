import express from "express";
import { authController } from "../controller";
import { typeCheckMiddleware } from "../middleware";

const router = express.Router();

router.post("/signup", typeCheckMiddleware, authController.signupController);
router.post("/signin", typeCheckMiddleware, authController.signinController);
router.post(
  "/email",
  typeCheckMiddleware[0],
  authController.postEmailController
);
router.post("/code", typeCheckMiddleware[0], authController.postCodeController);
router.get("/hamburger", authController.hamburgerController);
router.patch(
  "/pw",
  typeCheckMiddleware,
  authController.patchPasswordController
);

export default router;

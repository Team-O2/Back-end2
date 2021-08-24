import { Router } from "express";
// controller
import { adminController } from "../controller";
// middleware
import { authMiddleware, publicAuthMiddleware } from "../middleware";
const upload = require("../modules/upload");

const router = Router();

router.post(
  "/concert",
  upload.fields([
    { name: "videoLink", maxCount: 1 },
    { name: "imgThumbnail", maxCount: 1 },
  ]),
  authMiddleware,
  adminController.postAdminConcertController
);

export default router;

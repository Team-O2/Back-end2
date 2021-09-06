import { Router } from "express";
// controller
import { adminController } from "../controller";
// middleware
import { authMiddleware, publicAuthMiddleware } from "../middleware";
const upload = require("../modules/upload");

const router = Router();

router.get("/", authMiddleware, adminController.getAdminListController);
router.get(
  "/regist",
  publicAuthMiddleware,
  adminController.getAdminRegistController
);

router.post(
  "/concert",
  upload.fields([
    { name: "videoLink", maxCount: 1 },
    { name: "imgThumbnail", maxCount: 1 },
  ]),
  authMiddleware,
  adminController.postAdminConcertController
);

router.post(
  "/notice",
  upload.fields([
    { name: "videoLink", maxCount: 1 },
    { name: "imgThumbnail", maxCount: 1 },
  ]),
  authMiddleware,
  adminController.postAdminNoticeController
);
router.post(
  "/challenge",
  upload.fields([{ name: "img", maxCount: 1 }]),
  authMiddleware,
  adminController.postAdminChallengeController
);

export default router;

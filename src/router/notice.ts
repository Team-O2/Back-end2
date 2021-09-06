import { Router } from "express";
// controller
import { noticeController } from "../controller";
// middleware
import { authMiddleware, publicAuthMiddleware } from "../middleware";

const router = Router();

router.get("", publicAuthMiddleware, noticeController.getNoticeAllController);
router.get(
  "/search",
  publicAuthMiddleware,
  noticeController.getNoticeSearchController
);
router.get(
  "/:noticeID",
  publicAuthMiddleware,
  noticeController.getNoticeDetailController
);

router.post(
  "/:noticeID/comment",
  authMiddleware,
  noticeController.postNoticeCommentController
);

export default router;

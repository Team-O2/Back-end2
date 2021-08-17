import { Router } from "express";
// controller
import { challengeController } from "../controller";
// middleware
import { authMiddleware, publicAuthMiddleware } from "../middleware";

const router = Router();

router.post("", authMiddleware, challengeController.postChallengeController);
router.post(
  "/:challengeID/comment",
  authMiddleware,
  challengeController.postCommentController
);
router.post(
  "/:challengeID/like",
  authMiddleware,
  challengeController.postLikeController
);
router.post(
  "/:challengeID/scrap",
  authMiddleware,
  challengeController.postScrapController
);
router.get(
  "",
  publicAuthMiddleware,
  challengeController.getChallengeAllController
);
// router.get("/search");
// router.get("/:challengeID");
// router.patch("/:challengeID");
// router.delete("/:challengeID");
// router.delete("/like/:challengeID");
// router.delete("/scrap/:challengeID");

export default router;

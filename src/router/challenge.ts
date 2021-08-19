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
router.get(
  "/search",
  publicAuthMiddleware,
  challengeController.getChallengeSearchController
);
router.get(
  "/:challengeID",
  authMiddleware,
  challengeController.getChallengeOneController
);
router.patch(
  "/:challengeID",
  authMiddleware,
  challengeController.patchChallengeController
);
router.delete(
  "/:challengeID",
  authMiddleware,
  challengeController.deleteChallengeController
);
router.delete(
  "/:challengeID/like",
  authMiddleware,
  challengeController.deleteLikeController
);
router.delete(
  "/:challengeID/scrap",
  authMiddleware,
  challengeController.deleteScrapController
);

export default router;

import { Router } from "express";
// controller
import { challengeController, concertController } from "../controller";
// middleware
import { authMiddleware, publicAuthMiddleware } from "../middleware";

const router = Router();

router.get("", publicAuthMiddleware, concertController.getConcertAllController);
router.get(
  "/search",
  publicAuthMiddleware,
  concertController.getConcertSearchController
);
router.get(
  "/:concertID",
  publicAuthMiddleware,
  concertController.getConcertDetailController
);

router.post(
  "/:concertID/comment",
  authMiddleware,
  concertController.postConcertCommentController
);

router.post(
  "/:concertID/like",
  authMiddleware,
  concertController.postConcertLikeController
);

router.post(
  "/:concertID/scrap",
  authMiddleware,
  concertController.postConcertScrapController
);

router.delete(
  "/:concertID/like",
  authMiddleware,
  concertController.deleteConcertLikeController
);
router.delete(
  "/:concertID/scrap",
  authMiddleware,
  concertController.deleteConcertScrapController
);

export default router;

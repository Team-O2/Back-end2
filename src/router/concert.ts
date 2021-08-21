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
  "/comment/:concertID",
  authMiddleware,
  concertController.postConcertCommentController
);

router.post(
  "/like/:concertID",
  authMiddleware,
  concertController.postConcertLikeController
);

router.post(
  "/scrap/:concertID",
  authMiddleware,
  concertController.postConcertScrapController
);

router.delete(
  "/like/:concertID",
  authMiddleware,
  concertController.deleteConcertLikeController
);
router.delete(
  "/scrap/:concertID",
  authMiddleware,
  concertController.deleteConcertScrapController
);

export default router;

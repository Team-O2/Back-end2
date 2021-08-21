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

export default router;

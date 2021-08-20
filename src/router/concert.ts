import { Router } from "express";
// controller
import { challengeController, concertController } from "../controller";
// middleware
import { authMiddleware, publicAuthMiddleware } from "../middleware";

const router = Router();

router.get("", publicAuthMiddleware, concertController.getConcertAllController);
router.get(
  "/:concertID",
  publicAuthMiddleware,
  concertController.getConcertDetailController
);

export default router;

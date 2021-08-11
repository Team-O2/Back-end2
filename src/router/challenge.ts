import { Router } from "express";
// controller
import { challengeController } from "../controller";
// middleware
import { authMiddleware } from "../middleware";

const router = Router();

router.post("", authMiddleware, challengeController.postChallengeController);
// router.post("/comment/:challengeID");
// router.post("/like/:challengeID");
// router.post("/scrap/:challengeID");
// router.get("");
// router.get("/search");
// router.get("/:challengeID");
// router.patch("/:challengeID");
// router.delete("/:challengeID");
// router.delete("/like/:challengeID");
// router.delete("/scrap/:challengeID");

export default router;

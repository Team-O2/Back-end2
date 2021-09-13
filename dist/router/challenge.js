"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// controller
const controller_1 = require("../controller");
// middleware
const middleware_1 = require("../middleware");
const router = express_1.Router();
router.post("", middleware_1.authMiddleware, controller_1.challengeController.postChallengeController);
router.post("/:challengeID/comment", middleware_1.authMiddleware, controller_1.challengeController.postCommentController);
router.post("/:challengeID/like", middleware_1.authMiddleware, controller_1.challengeController.postLikeController);
router.post("/:challengeID/scrap", middleware_1.authMiddleware, controller_1.challengeController.postScrapController);
router.get("", middleware_1.publicAuthMiddleware, controller_1.challengeController.getChallengeAllController);
router.get("/search", middleware_1.publicAuthMiddleware, controller_1.challengeController.getChallengeSearchController);
router.get("/:challengeID", middleware_1.authMiddleware, controller_1.challengeController.getChallengeOneController);
router.patch("/:challengeID", middleware_1.authMiddleware, controller_1.challengeController.patchChallengeController);
router.delete("/:challengeID", middleware_1.authMiddleware, controller_1.challengeController.deleteChallengeController);
router.delete("/:challengeID/like", middleware_1.authMiddleware, controller_1.challengeController.deleteLikeController);
router.delete("/:challengeID/scrap", middleware_1.authMiddleware, controller_1.challengeController.deleteScrapController);
exports.default = router;
//# sourceMappingURL=challenge.js.map
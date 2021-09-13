"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// controller
const controller_1 = require("../controller");
// middleware
const middleware_1 = require("../middleware");
const router = express_1.Router();
router.get("", middleware_1.publicAuthMiddleware, controller_1.concertController.getConcertAllController);
router.get("/search", middleware_1.publicAuthMiddleware, controller_1.concertController.getConcertSearchController);
router.get("/:concertID", middleware_1.publicAuthMiddleware, controller_1.concertController.getConcertDetailController);
router.post("/:concertID/comment", middleware_1.authMiddleware, controller_1.concertController.postConcertCommentController);
router.post("/:concertID/like", middleware_1.authMiddleware, controller_1.concertController.postConcertLikeController);
router.post("/:concertID/scrap", middleware_1.authMiddleware, controller_1.concertController.postConcertScrapController);
router.delete("/:concertID/like", middleware_1.authMiddleware, controller_1.concertController.deleteConcertLikeController);
router.delete("/:concertID/scrap", middleware_1.authMiddleware, controller_1.concertController.deleteConcertScrapController);
exports.default = router;
//# sourceMappingURL=concert.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// controller
const controller_1 = require("../controller");
// middleware
const middleware_1 = require("../middleware");
const router = express_1.Router();
router.get("", middleware_1.publicAuthMiddleware, controller_1.noticeController.getNoticeAllController);
router.get("/search", middleware_1.publicAuthMiddleware, controller_1.noticeController.getNoticeSearchController);
router.get("/:noticeID", middleware_1.publicAuthMiddleware, controller_1.noticeController.getNoticeDetailController);
router.post("/:noticeID/comment", middleware_1.authMiddleware, controller_1.noticeController.postNoticeCommentController);
exports.default = router;
//# sourceMappingURL=notice.js.map
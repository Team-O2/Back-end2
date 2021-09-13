"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// controller
const controller_1 = require("../controller");
// middleware
const middleware_1 = require("../middleware");
const upload = require("../modules/upload");
const router = express_1.Router();
router.get("/", middleware_1.authMiddleware, controller_1.adminController.getAdminListController);
router.get("/regist", middleware_1.publicAuthMiddleware, controller_1.adminController.getAdminRegistController);
router.post("/concert", upload.fields([
    { name: "videoLink", maxCount: 1 },
    { name: "imgThumbnail", maxCount: 1 },
]), middleware_1.authMiddleware, controller_1.adminController.postAdminConcertController);
router.post("/notice", upload.fields([
    { name: "videoLink", maxCount: 1 },
    { name: "imgThumbnail", maxCount: 1 },
]), middleware_1.authMiddleware, controller_1.adminController.postAdminNoticeController);
router.post("/challenge", upload.fields([{ name: "img", maxCount: 1 }]), middleware_1.authMiddleware, controller_1.adminController.postAdminChallengeController);
exports.default = router;
//# sourceMappingURL=admin.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_1 = require("../controller");
const middleware_1 = require("../middleware");
const router = express_1.default.Router();
router.post("/signup", middleware_1.typeCheckMiddleware, controller_1.authController.signupController);
router.post("/signin", middleware_1.typeCheckMiddleware, controller_1.authController.signinController);
router.post("/email", middleware_1.typeCheckMiddleware, controller_1.authController.postEmailController);
router.post("/code", middleware_1.typeCheckMiddleware, controller_1.authController.postCodeController);
router.get("/hamburger", controller_1.authController.hamburgerController);
router.patch("/pw", middleware_1.typeCheckMiddleware, controller_1.authController.patchPasswordController);
exports.default = router;
//# sourceMappingURL=auth.js.map
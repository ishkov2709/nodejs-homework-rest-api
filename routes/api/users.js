const express = require("express");

const router = express.Router();

const ctrl = require("../../controllers/users");

const { validateBody, authenticate, upload } = require("../../middlewares");

const {
  registerSchema,
  loginSchema,
  updateSubSchema,
  verifySchema,
} = require("../../models/users");

router.post("/register", validateBody(registerSchema), ctrl.register);

router.post("/login", validateBody(loginSchema), ctrl.login);

router.post("/logout", authenticate, ctrl.logout);

router.get("/current", authenticate, ctrl.current);

router.patch(
  "/",
  authenticate,
  validateBody(updateSubSchema),
  ctrl.updateSubscription
);

router.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  ctrl.updateAvatar
);

router.get("/verify/:verificationToken", ctrl.verificateUser);

router.post("/verify", validateBody(verifySchema), ctrl.resendVerify);

module.exports = router;

const express = require("express");
const { authRequired } = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");
const { loginSchema, registerSchema } = require("../validators/auth/auth.schema");

function createAuthRoutes({ authController }) {
    const router = express.Router();

    router.post("/register", validate(registerSchema), authController.register);
    router.post("/login", validate(loginSchema), authController.login);
    router.get("/me", authRequired, authController.me);

    return router;
}

module.exports = { createAuthRoutes };
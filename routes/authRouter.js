const passport = require("passport");
const { Router } = require("express");
const authController = require("../controllers/authController");
const authRouter = Router();

authRouter.get("/sign-up", authController.getSignUp);
authRouter.post("/sign-up", authController.postSignUp);

authRouter.get("/sign-in", authController.getSignIn);
authRouter.post("/sign-in", authController.postSignIn);
authRouter.get("/sign-out", authController.signOut);

module.exports = authRouter;
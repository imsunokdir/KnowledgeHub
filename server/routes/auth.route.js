const express = require("express");
const {
  register,
  login,
  getCurrentUser,
  logout,
} = require("../controllers/auth.controller");
const { authenticateUser } = require("../middlewares/authMiddleware");

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", authenticateUser, getCurrentUser);
authRouter.post("/logout", logout);

module.exports = authRouter;

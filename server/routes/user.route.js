const express = require("express");
const { getUsers } = require("../controllers/user.controller");
const userRouter = express.Router();

userRouter.get("/get-users", getUsers);

module.exports = userRouter;

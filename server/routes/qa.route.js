const express = require("express");
const { askQuestion } = require("../controllers/qa.controller");
const qaRouter = express.Router();

qaRouter.post("/", askQuestion);

module.exports = qaRouter;

const express = require("express");
const {
  semanticSearch,
  search,
} = require("../controllers/semanticSearch.controller");
const searchRouter = express.Router();

searchRouter.post("/document", search);

module.exports = searchRouter;

const express = require("express");
const authRouter = require("./auth.route");
const { authenticateUser } = require("../middlewares/authMiddleware");
const {
  createDocument,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getDocuments,
  getRecentEdits,
  getDocumentVersions,
  generateSummaryForDoc,
  generateTagsForDoc,
} = require("../controllers/document.controller");

const docRouter = express.Router();

docRouter.use(authenticateUser);

// CREATE a new document
docRouter.post("/", createDocument);

// GET all documents by pagination
docRouter.get("/", getDocuments);

// GET a single document by ID
docRouter.get("/:id", getDocumentById);

// UPDATE a document by ID (owner or admin)
docRouter.put("/:id", updateDocument);

// DELETE a document by ID (owner or admin)
docRouter.delete("/:id", deleteDocument);

// recent activity feed
docRouter.get("/activity/recent", getRecentEdits);

// versions for a doc
docRouter.get("/:id/history", getDocumentVersions);

// GENERATE summary for a doc
docRouter.post("/:id/summarize", generateSummaryForDoc);

// GENERATE tags for a doc
docRouter.post("/:id/generate-tags", generateTagsForDoc);

module.exports = docRouter;

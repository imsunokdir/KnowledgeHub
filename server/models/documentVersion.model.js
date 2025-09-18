const mongoose = require("mongoose");

const DocumentVersionSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    summary: { type: String },
    tags: { type: [String], default: [] },
    embedding: { type: [Number] }, // snapshot of embedding at that version
    aiStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const DocumentVersion = mongoose.model(
  "DocumentVersion",
  DocumentVersionSchema
);
module.exports = DocumentVersion;

const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
    embedding: {
      type: [Number],
    },
    aiStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
const Document = mongoose.model("Document", documentSchema);
module.exports = Document;

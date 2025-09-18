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
    members: [
      {
        role: {
          type: String,
          enum: ["admin", "editor", "viewer"],
          default: "viewer",
        },
        user: {
          _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          name: String,
          email: String,
          role: String, // user's system role
        },
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// documentSchema.virtual("allMembers").get(function () {
//   return [
//     { user: this.createdBy, role: "admin" }, // owner is always admin
//     ...this.members,
//   ];
// });

const Document = mongoose.model("Document", documentSchema);
module.exports = Document;

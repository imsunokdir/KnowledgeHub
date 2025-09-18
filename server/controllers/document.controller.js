const {
  generateSummary,
  generateTags,
  generateEmbedding,
} = require("../ai/gemini");
const Document = require("../models/document.model");
const DocumentVersion = require("../models/documentVersion.model");
const User = require("../models/user.model");

// CREATE DOCUMENT
// const createDocument = async (req, res) => {
//   const { title, content } = req.body;
//   const io = req.app.get("io");

//   try {
//     const doc = await Document.create({
//       title,
//       content,
//       createdBy: req.currentUser._id,
//       aiStatus: "pending",
//     });

//     console.log("📝 Document created:", doc._id);

//     // Respond immediately
//     res.status(201).json(doc);

//     // Background AI processing (initial creation)
//     (async () => {
//       try {
//         const [summary, tags, embedding] = await Promise.all([
//           generateSummary(content),
//           generateTags(content),
//           generateEmbedding(content),
//         ]);

//         doc.summary = summary;
//         doc.tags = tags;
//         doc.embedding = embedding;
//         doc.aiStatus = "completed";
//         await doc.save();

//         io.to(doc._id.toString()).emit("documentUpdated", {
//           _id: doc._id.toString(),
//           title: doc.title,
//           content: doc.content,
//           summary: doc.summary,
//           tags: doc.tags,
//           aiStatus: doc.aiStatus,
//           createdAt: doc.createdAt,
//           updatedAt: doc.updatedAt,
//         });

//         console.log("✅ Initial AI processing completed for doc:", doc._id);
//       } catch (aiError) {
//         console.error("❌ Initial AI processing failed:", doc._id, aiError);
//         doc.aiStatus = "failed";
//         await doc.save();

//         io.to(doc._id.toString()).emit("documentUpdated", {
//           _id: doc._id.toString(),
//           aiStatus: "failed",
//         });
//       }
//     })();
//   } catch (error) {
//     console.error("💥 Document creation failed:", error);
//     res.status(500).json({ message: "Internal server error", error });
//   }
// };

const createDocument = async (req, res) => {
  const { title, content } = req.body;
  const io = req.app.get("io");
  const currentUser = req.currentUser;

  try {
    const doc = await Document.create({
      title,
      content,
      createdBy: currentUser._id,
      aiStatus: "pending",
      members: [
        {
          role: "admin",
          user: {
            _id: currentUser._id,
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role,
          },
        },
      ],
    });

    console.log("📝 Document created:", doc._id);

    // Respond immediately
    res.status(201).json(doc);

    // Background AI processing (initial creation)
    (async () => {
      try {
        const [summary, tags, embedding] = await Promise.all([
          generateSummary(content),
          generateTags(content),
          generateEmbedding(content),
        ]);

        doc.summary = summary;
        doc.tags = tags;
        doc.embedding = embedding;
        doc.aiStatus = "completed";
        await doc.save();

        io.to(doc._id.toString()).emit("documentUpdated", {
          _id: doc._id.toString(),
          title: doc.title,
          content: doc.content,
          summary: doc.summary,
          tags: doc.tags,
          aiStatus: doc.aiStatus,
          members: doc.members,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        });

        console.log("✅ Initial AI processing completed for doc:", doc._id);
      } catch (aiError) {
        console.error("❌ Initial AI processing failed:", doc._id, aiError);
        doc.aiStatus = "failed";
        await doc.save();

        io.to(doc._id.toString()).emit("documentUpdated", {
          _id: doc._id.toString(),
          aiStatus: "failed",
        });
      }
    })();
  } catch (error) {
    console.error("💥 Document creation failed:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// GET DOCUMENT BY ID
const getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id)
      .populate("createdBy", "name email role")
      .populate("members", "name email");
    if (!doc) return res.status(404).json({ message: "Document not found" });
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET DOCUMENTS (with pagination)
const getDocuments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalDocs = await Document.countDocuments();
    const docs = await Document.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name");

    res.json({
      page,
      limit,
      totalDocs,
      totalPages: Math.ceil(totalDocs / limit),
      docs,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// UPDATE DOCUMENT
const updateDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    // Only admin or owner can update
    if (
      req.currentUser.role !== "admin" &&
      !doc.createdBy.equals(req.currentUser._id)
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this document" });
    }

    const { title, content } = req.body;
    const titleChanged = title !== undefined && title !== doc.title;
    const contentChanged = content !== undefined && content !== doc.content;

    if (titleChanged || contentChanged) {
      // Create version snapshot before updating
      await DocumentVersion.create({
        document: doc._id,
        title: doc.title,
        content: doc.content,
        summary: doc.summary,
        tags: doc.tags,
        embedding: doc.embedding,
        aiStatus: doc.aiStatus,
        members: doc.members,
        editedBy: req.currentUser._id,
      });

      // Update the document fields
      if (titleChanged) doc.title = title;
      if (contentChanged) doc.content = content;
    }

    await doc.save();
    res.json({ message: "Document updated", doc });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE DOCUMENT
const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    if (
      req.currentUser.role !== "admin" &&
      !doc.createdBy.equals(req.currentUser._id)
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this document" });
    }

    await doc.remove();
    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GENERATE SUMMARY (on-demand)
const generateSummaryForDoc = async (req, res) => {
  const io = req.app.get("io");
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    doc.aiStatus = "pending";
    await doc.save();

    io.to(req.params.id).emit("documentUpdated", {
      _id: doc._id.toString(),
      aiStatus: "pending",
    });
    res.json({ message: "Summary generation started", doc });

    (async () => {
      try {
        const summary = await generateSummary(doc.content);
        doc.summary = summary;
        doc.aiStatus = "completed";
        await doc.save();

        io.to(req.params.id).emit("documentUpdated", {
          _id: doc._id.toString(),
          summary,
          aiStatus: "completed",
        });
      } catch (err) {
        console.error("❌ Summary generation failed:", err);
        doc.aiStatus = "failed";
        await doc.save();

        io.to(req.params.id).emit("documentUpdated", {
          _id: doc._id.toString(),
          aiStatus: "failed",
          error: err,
        });
      }
    })();
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GENERATE TAGS (on-demand)
const generateTagsForDoc = async (req, res) => {
  const io = req.app.get("io");
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    doc.aiStatus = "pending";
    await doc.save();

    io.to(req.params.id).emit("documentUpdated", {
      _id: doc._id.toString(),
      aiStatus: "pending",
    });
    res.json({ message: "Tags generation started", doc });

    (async () => {
      try {
        const tags = await generateTags(doc.content);
        doc.tags = tags;
        doc.aiStatus = "completed";
        await doc.save();

        io.to(req.params.id).emit("documentUpdated", {
          _id: doc._id.toString(),
          tags,
          aiStatus: "completed",
        });
      } catch (err) {
        console.error("❌ Tags generation failed:", err);
        doc.aiStatus = "failed";
        await doc.save();

        io.to(req.params.id).emit("documentUpdated", {
          _id: doc._id.toString(),
          aiStatus: "failed",
          error: err,
        });
      }
    })();
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET DOCUMENT VERSIONS
const getDocumentVersions = async (req, res) => {
  try {
    const versions = await DocumentVersion.find({ document: req.params.id })
      .populate("editedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(versions);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// TEAM ACTIVITY FEED (recent edits)
const getRecentEdits = async (req, res) => {
  try {
    const items = await DocumentVersion.find()
      .populate("editedBy", "name email")
      .populate("document", "title")
      .sort({ createdAt: -1 })
      .limit(5);

    const feed = items.map((it) => ({
      versionId: it._id,
      docId: it.document?._id,
      title: it.document?.title || "Untitled",
      editedBy: it.editedBy
        ? { _id: it.editedBy._id, name: it.editedBy.name }
        : null,
      editedAt: it.createdAt,
    }));

    res.json(feed);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
const getRecentEditsForDoc = async (req, res) => {
  try {
    const { docId } = req.params; // or req.query.docId

    if (!docId) {
      return res.status(400).json({ message: "Document ID is required" });
    }

    // Fetch latest 5 versions for the specific document
    const items = await DocumentVersion.find({ document: docId })
      .populate("editedBy", "name email")
      .populate("document", "title")
      .sort({ createdAt: -1 })
      .limit(5);

    const feed = items.map((it) => ({
      versionId: it._id,
      docId: it.document?._id,
      title: it.document?.title || "Untitled",
      editedBy: it.editedBy
        ? { _id: it.editedBy._id, name: it.editedBy.name }
        : null,
      editedAt: it.createdAt,
    }));

    res.json(feed);
  } catch (err) {
    console.error("Error fetching recent edits for doc:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getMyDocuments = async (req, res) => {
  try {
    // req.user should contain the authenticated user's info
    const userId = req.currentUser._id;

    // Find documents where `owner` field matches current user
    const documents = await Document.find({ createdBy: userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (err) {
    console.error("Error fetching user's documents:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// controllers/documentController.js
const addMember = async (req, res) => {
  const { documentId } = req.params;
  const { email, role } = req.body;
  const user = req.currentUser;

  try {
    const doc = await Document.findById(documentId);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    const isAdmin =
      doc.createdBy.equals(user._id) ||
      doc.members.some(
        (m) => m.user._id.equals(user._id) && m.role === "admin"
      );
    if (!isAdmin)
      return res.status(403).json({ message: "Only admins can add members" });

    const newUser = await User.findOne({ email });
    if (!newUser)
      return res
        .status(404)
        .json({ message: "User with this email not found" });

    // Check if user is already a member
    if (doc.members.some((m) => m.user._id.equals(newUser._id)))
      return res.status(400).json({ message: "User is already a member" });

    // Add member with full user data embedded
    doc.members.push({
      role,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });

    await doc.save();

    return res.status(200).json({
      message: "Member added",
      members: doc.members,
    });
  } catch (err) {
    console.error("Add member error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  createDocument,
  getDocumentById,
  getDocuments,
  updateDocument,
  deleteDocument,
  generateSummaryForDoc,
  generateTagsForDoc,
  getDocumentVersions,
  getRecentEdits,
  getRecentEditsForDoc,
  getMyDocuments,
  addMember,
};

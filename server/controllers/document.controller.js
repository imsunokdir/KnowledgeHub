const {
  generateSummary,
  generateTags,
  generateEmbedding,
} = require("../ai/gemini");
const Document = require("../models/document.model");
const DocumentVersion = require("../models/documentVersion.model");

const createDocument = async (req, res) => {
  const { title, content } = req.body;
  const io = req.app.get("io");

  try {
    const doc = await Document.create({
      title,
      content,
      createdBy: req.currentUser._id,
      aiStatus: "pending",
    });

    console.log("📝 Document created:", doc._id);

    // respond immediately
    res.status(201).json(doc);

    (async () => {
      try {
        console.log("⚙️ Starting AI processing for doc:", doc._id);

        const [summary, tags, embedding] = await Promise.all([
          generateSummary(content),
          generateTags(content),
          generateEmbedding(content),
        ]);

        // Update DB with AI results
        console.log("tags:", tags);
        doc.summary = summary;
        doc.tags = tags;
        doc.embedding = embedding;
        doc.aiStatus = "completed";
        await doc.save();

        console.log("✅ AI processing completed for doc:", doc._id);

        // Emit update to all clients in this room
        io.to(doc._id.toString()).emit("documentUpdated", {
          _id: doc._id.toString(),
          summary,
          tags,
          aiStatus: "completed",
        });

        console.log(
          "📡 Emitted documentUpdated event for doc:",
          doc._id.toString()
        );
      } catch (aiError) {
        console.error("❌ AI processing failed for doc:", doc._id, aiError);
        doc.aiStatus = "failed";
        await doc.save();

        io.to(doc._id.toString()).emit("documentUpdated", {
          _id: doc._id.toString(),
          aiStatus: "failed",
        });

        console.log("⚠️ Emitted failed status for doc:", doc._id.toString());
      }
    })();
  } catch (error) {
    console.error("💥 Document creation failed:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id).populate(
      "createdBy",
      "name email role"
    );

    if (!doc) return res.status(404).json({ message: "Document not found" });

    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getDocuments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Total documents count
    const totalDocs = await Document.countDocuments();

    // Fetch documents with pagination
    const docs = await Document.find()
      .sort({ createdAt: -1 }) // newest first
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

// UPDATE a document
const updateDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);

    if (!doc) return res.status(404).json({ message: "Document not found" });

    // ✅ Only admin or owner can update
    if (
      req.currentUser.role !== "admin" &&
      !doc.createdBy.equals(req.currentUser._id)
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this document" });
    }

    const { title, content, tags, summary } = req.body;

    doc.title = title !== undefined ? title : doc.title;
    doc.content = content !== undefined ? content : doc.content;
    doc.tags = tags !== undefined ? tags : doc.tags;
    doc.summary = summary !== undefined ? summary : doc.summary;

    await DocumentVersion.create({
      document: doc._id,
      title: doc.title,
      content: doc.content,
      summary: doc.summary,
      tags: doc.tags,
      embedding: doc.embedding,
      aiStatus: doc.aiStatus,
      editedBy: req.currentUser._id,
    });
    // Update fields
    const contentChanged =
      typeof content === "string" && content !== doc.content;
    if (typeof title === "string") doc.title = title;
    if (typeof content === "string") doc.content = content;
    await doc.save();
    res.json({ message: "Document updated", doc });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE a document
const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    // ✅ Only admin or owner can delete
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

const generateSummaryForDoc = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    // snapshot
    await DocumentVersion.create({
      document: doc._id,
      title: doc.title,
      content: doc.content,
      summary: doc.summary,
      tags: doc.tags,
      embedding: doc.embedding,
      aiStatus: doc.aiStatus,
      editedBy: req.currentUser._id,
    });

    const summary = await generateSummary(doc.content);
    doc.summary = summary;
    doc.aiStatus = "completed";
    await doc.save();

    res.json({ message: "Summary generated", summary, doc });
  } catch (err) {
    console.error("generateSummaryForDoc:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const generateTagsForDoc = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    // snapshot
    await DocumentVersion.create({
      document: doc._id,
      title: doc.title,
      content: doc.content,
      summary: doc.summary,
      tags: doc.tags,
      embedding: doc.embedding,
      aiStatus: doc.aiStatus,
      editedBy: req.currentUser._id,
    });

    const tags = await generateTags(doc.content);
    doc.tags = tags;
    doc.aiStatus = "completed";
    await doc.save();

    res.json({ message: "Tags generated", tags, doc });
  } catch (err) {
    console.error("generateTagsForDoc:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getDocumentVersions = async (req, res) => {
  try {
    const versions = await DocumentVersion.find({ document: req.params.id })
      .populate("editedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(versions);
  } catch (err) {
    console.error("getDocumentVersions:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Team Activity Feed (last 5 edits: which doc, who, when)
const getRecentEdits = async (req, res) => {
  try {
    const items = await DocumentVersion.find()
      .populate("editedBy", "name email")
      .populate("document", "title")
      .sort({ createdAt: -1 })
      .limit(5);

    // return lightweight feed items
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
    console.error("getRecentEdits:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createDocument,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getDocuments,
  generateSummaryForDoc,
  generateTagsForDoc,
  getDocumentVersions,
  getRecentEdits,
};

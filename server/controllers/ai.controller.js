const Document = require("../models/document.model");

const generateDocumentSummary = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    doc.summary = await generateSummary(doc.content);
    await doc.save();

    res.json({ message: "Summary generated", summary: doc.summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

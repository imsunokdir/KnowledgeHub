const { generateEmbedding } = require("../ai/gemini");
const Document = require("../models/document.model");
const cosineSimilarity = require("compute-cosine-similarity");

// const semanticSearch = async (req, res) => {
//   const { query } = req.body;

//   try {
//     const queryEmbedding = await generateEmbedding(query);

//     // Get all documents with embeddings

//     const docs = await Document.find({ embedding: { $exists: true, $ne: [] } });

//     // Compute similarity for each document
//     const results = docs.map((doc) => {
//       const similarity = cosineSimilarity(queryEmbedding, doc.embedding);
//       return { doc, similarity };
//     });

//     // Sort by similarity descending
//     results.sort((a, b) => b.similarity - a.similarity);

//     res.json(
//       results.map((r) => ({ ...r.doc.toObject(), similarity: r.similarity }))
//     );
//   } catch (error) {
//     console.error("Semantic search failed:", error);
//     res.status(500).json({ message: "Semantic search failed", error });
//   }
// };

// const Document = require("../models/document.model");
// const { generateEmbedding } = require("../ai/gemini");
// const cosineSimilarity = require("compute-cosine-similarity");

const search = async (req, res) => {
  try {
    const { query, type } = req.body;

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    if (type === "text") {
      // Regular MongoDB text search
      const docs = await Document.find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { content: { $regex: query, $options: "i" } },
        ],
      });
      return res.json(docs);
    } else if (type === "semantic") {
      // Semantic search
      const docs = await Document.find({
        aiStatus: "completed",
        embedding: { $exists: true },
      });
      if (!docs.length) return res.json([]);

      // Get query embedding
      const queryEmbedding = await generateEmbedding(query);

      // Compute similarity safely
      const results = docs
        .map((doc) => {
          const docEmbedding = doc.embedding;

          // Skip if embeddings are missing or lengths mismatch
          if (!docEmbedding || docEmbedding.length !== queryEmbedding.length) {
            console.warn(
              `Skipping doc ${doc._id} due to embedding length mismatch`,
              "docEmbedding length:",
              docEmbedding?.length,
              "queryEmbedding length:",
              queryEmbedding.length
            );
            return null;
          }

          const similarity = cosineSimilarity(queryEmbedding, docEmbedding);
          return { doc, similarity };
        })
        .filter(Boolean); // remove nulls

      // Sort by similarity descending
      results.sort((a, b) => b.similarity - a.similarity);

      return res.json(
        results.map((r) => ({
          ...r.doc.toObject(),
          similarity: r.similarity,
        }))
      );
    } else {
      return res.status(400).json({ message: "Invalid search type" });
    }
  } catch (error) {
    console.error("Semantic search error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { search };

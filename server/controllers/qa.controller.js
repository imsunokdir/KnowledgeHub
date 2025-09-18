const { GoogleGenAI } = require("@google/genai");
const cosineSimilarity = require("compute-cosine-similarity");
const Document = require("../models/document.model");
const ai = new GoogleGenAI({});

const askQuestion = async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ message: "Question is required" });
  }

  try {
    const qEmbeddingResp = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: [question],
      taskType: "SEMANTIC_SIMILARITY",
    });

    const qEmbedding = qEmbeddingResp.embeddings[0].values;

    // Fetch all documents
    const docs = await Document.find({ aiStatus: "completed" });

    const docsWithSim = docs.map((doc) => {
      const sim = cosineSimilarity(qEmbedding, doc.embedding);
      return { ...doc.toObject(), similarity: sim };
    });

    // Sort by similarity
    docsWithSim.sort((a, b) => b.similarity - a.similarity);

    // Take top 3 most relevant documents
    const topDocs = docsWithSim.slice(0, 3);

    const context = topDocs.map((d) => d.content).join("\n\n");

    // Ask Gemini using the context
    const answerResp = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Answer this question using the following context:\n\n${context}\n\nQuestion: ${question}`,
    });

    const answer = answerResp.text;

    res.json({ answer, context: topDocs, question });
  } catch (error) {
    console.error("Q&A error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { askQuestion };

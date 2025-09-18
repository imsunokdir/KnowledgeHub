const { GoogleGenAI } = require("@google/genai");
const parseTags = require("../utils/parseTags");
// require("dotenv").config();

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

// Generate summary
const generateSummary = async (text) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Summarize this document briefly:\n${text}`,
  });
  return response.text;
};

// Generate tags
const generateTags = async (text) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Generate 5-7 relevant tags for this text:\n${text}`,
  });

  // Use your existing parseTags function
  const tags = parseTags(response.text);
  if (tags.length > 0) tags.shift();

  return tags;
};

// Generate embeddings
const generateEmbedding = async (text) => {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: [text],
    taskType: "SEMANTIC_SIMILARITY",
  });
  console.log("emb response:", response);
  return response.embeddings[0].values;
};

module.exports = {
  generateSummary,
  generateTags,
  generateEmbedding,
};

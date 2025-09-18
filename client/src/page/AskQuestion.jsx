import { useState } from "react";
import axios from "axios";
import { askQuestion } from "../api/qa";

const AskQuestion = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");
    setError("");

    try {
      const res = await askQuestion(question);
      if (res.status === 200) {
        console.log("question ans:", res);
      }
      //   setAnswer(res.data.answer);
    } catch (err) {
      console.error(err);
      setError("Failed to get answer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Ask a Question</h2>

      <form onSubmit={handleAsk} className="mb-4 flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question..."
          className="flex-1 p-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
          disabled={loading}
        >
          {loading ? "Asking..." : "Ask"}
        </button>
      </form>

      {error && <p className="text-red-500">{error}</p>}
      {answer && (
        <div className="p-3 border rounded shadow-sm">
          <h3 className="font-semibold">Answer:</h3>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

export default AskQuestion;

import React from "react";
import { useNavigate } from "react-router-dom";
import { useTeamQnA } from "../context/TeamQnAContext";
import { askQuestion } from "../api/qa";

const TeamQnA = () => {
  const {
    question,
    setQuestion,
    answerData,
    setAnswerData,
    loading,
    setLoading,
  } = useTeamQnA();
  const navigate = useNavigate();

  const handleAsk = async () => {
    if (!question.trim()) return;

    setLoading(true);
    try {
      const res = await askQuestion(question);
      setAnswerData(res.data);
    } catch (err) {
      console.error(err);
      setAnswerData({
        answer: "⚠️ Something went wrong while fetching the answer.",
        context: [],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Team Q&A</h1>

        {/* Input */}
        <div className="flex space-x-3 mb-6">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question..."
            disabled={loading}
            className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            onClick={handleAsk}
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Asking..." : "Ask"}
          </button>
        </div>

        {/* Answer + Context */}
        {answerData && (
          <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <h2 className="font-semibold text-slate-800 mb-2">
              Q: {answerData.question}
            </h2>
            <p className="text-slate-700 mb-4 whitespace-pre-line">
              A: {answerData.answer}
            </p>

            {answerData.context?.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">
                  Context from documents:
                </h3>
                <div className="space-y-3">
                  {answerData.context.map((doc, idx) => (
                    <div
                      key={idx}
                      onClick={() => navigate(`/document/${doc._id}`)}
                      className="p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-indigo-700">
                          {doc.title}
                        </span>
                        <span className="text-xs text-slate-500">
                          {Math.round(doc.similarity * 100)}% match
                        </span>
                      </div>
                      <p className="text-slate-700 text-sm line-clamp-3">
                        {doc.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamQnA;

// src/context/TeamQnAContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const TeamQnAContext = createContext();
export const useTeamQnA = () => useContext(TeamQnAContext);

export const TeamQnAProvider = ({ children }) => {
  const [question, setQuestion] = useState("");
  const [answerData, setAnswerData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load saved state from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("teamQnA");
    if (saved) {
      const parsed = JSON.parse(saved);
      setQuestion(parsed.question || "");
      setAnswerData(parsed.answerData || null);
    }
  }, []);

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("teamQnA", JSON.stringify({ question, answerData }));
  }, [question, answerData]);

  return (
    <TeamQnAContext.Provider
      value={{
        question,
        setQuestion,
        answerData,
        setAnswerData,
        loading,
        setLoading,
      }}
    >
      {children}
    </TeamQnAContext.Provider>
  );
};

// src/pages/DocumentDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getDocument,
  updateDocument,
  summarizeDocument,
  generateTagsDocument,
  getDocumentVersions,
} from "../api/document";
import TeamActivityFeed from "../components/TeamActivityFeed";
import HistoryModal from "../components/HistoryModal";

const DocumentDetailsPage = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [doc, setDoc] = useState(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState([]);

  const fetchDoc = async () => {
    try {
      const res = await getDocument(id);
      setDoc(res.data);
      setTitle(res.data.title);
      setContent(res.data.content);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        alert("Document not found");
        nav("/documents");
      }
    }
  };

  useEffect(() => {
    fetchDoc();
    // eslint-disable-next-line
  }, [id]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await updateDocument(id, { title, content });
      setDoc(res.data.doc || res.data);
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const res = await summarizeDocument(id);
      if (res.status === 200) {
        console.log("sum gen:", res);
        if (res.data.doc) setDoc(res.data.doc);
        else if (res.data.summary)
          setDoc((d) => ({ ...d, summary: res.data.summary }));
      }
      // res.data.doc or res.data.summary depending on server response
    } catch (err) {
      console.error(err);
      alert("Summary generation failed");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleGenerateTags = async () => {
    setIsGeneratingTags(true);
    try {
      const res = await generateTagsDocument(id);
      if (res.data.doc) setDoc(res.data.doc);
      else if (res.data.tags) setDoc((d) => ({ ...d, tags: res.data.tags }));
    } catch (err) {
      console.error(err);
      alert("Tag generation failed");
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const openHistory = async () => {
    try {
      const res = await getDocumentVersions(id);
      setVersions(res.data);
      setShowHistory(true);
    } catch (err) {
      console.error(err);
      alert("Failed to load history");
    }
  };

  if (!doc)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            <span className="text-slate-700 font-medium">
              Loading document...
            </span>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="border-b border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {!editing ? (
                  <h1 className="text-3xl font-bold text-slate-900 mb-2 leading-tight">
                    {doc.title}
                  </h1>
                ) : (
                  <input
                    className="w-full text-3xl font-bold text-slate-900 p-3 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-200"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Document title..."
                  />
                )}
                {/* <div className="flex items-center text-sm text-slate-500 space-x-2">
                  <span className="font-medium text-slate-600">
                    Created by:
                  </span>
                  <span>{doc.createdBy?.name || "Unknown"}</span>
                  <span>•</span>
                  <span>{new Date(doc.createdAt).toLocaleString()}</span>
                </div> */}
              </div>

              <div className="flex items-center gap-3 ml-6">
                <button
                  onClick={() => setEditing((s) => !s)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium"
                >
                  {editing ? "Cancel" : "Edit"}
                </button>

                {editing ? (
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                ) : (
                  <button
                    onClick={openHistory}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium"
                  >
                    History
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {!editing ? (
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-base">
                  {doc.content}
                </p>
              </div>
            ) : (
              <textarea
                className="w-full p-4 border-2 border-slate-200 rounded-lg min-h-[300px] resize-y focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-200 text-slate-700 leading-relaxed"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your document content here..."
              />
            )}
          </div>

          {/* AI Actions */}
          <div className="border-t border-slate-200 p-6 bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              AI Tools
            </h3>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleSummarize}
                disabled={isSummarizing}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm flex items-center space-x-2"
              >
                <span>✨</span>
                <span>
                  {isSummarizing ? "Generating..." : "Summarize with Gemini"}
                </span>
              </button>
              <button
                onClick={handleGenerateTags}
                disabled={isGeneratingTags}
                className="px-5 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm flex items-center space-x-2"
              >
                <span>🏷️</span>
                <span>
                  {isGeneratingTags
                    ? "Generating..."
                    : "Generate Tags with Gemini"}
                </span>
              </button>
            </div>
          </div>

          {/* Summary and Tags */}
          <div className="border-t border-slate-200 p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center space-x-2">
                <span>📝</span>
                <span>Summary</span>
              </h3>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {doc.summary ||
                    "No summary generated yet. Use the AI tools above to create one."}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center space-x-2">
                <span>🏷️</span>
                <span>Tags</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {(doc.tags || []).length > 0 ? (
                  (doc.tags || []).map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium border border-indigo-200"
                    >
                      #{t}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 text-sm italic">
                    No tags generated yet. Use the AI tools above to create
                    some.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <TeamActivityFeed />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
              <span>⚡</span>
              <span>Quick Actions</span>
            </h4>
            <button
              onClick={openHistory}
              className="w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium flex items-center justify-center space-x-2"
            >
              <span>📜</span>
              <span>Show Version History</span>
            </button>
          </div>
        </aside>
      </div>

      {showHistory && (
        <HistoryModal
          versions={versions}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
};

export default DocumentDetailsPage;

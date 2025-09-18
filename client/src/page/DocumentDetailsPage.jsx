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
import {
  connectSocket,
  joinDocumentRoom,
  subscribeToDocumentUpdates,
} from "../api/socket";
import { message } from "antd";
import DocActivityFeed from "../components/DocActivityFeed";
import AddMemberForm from "../components/AddMemberForm";

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
  const [aiErrorMessage, setAiErrorMessage] = useState("");
  const [msgApi, contextHolder] = message.useMessage();

  const fetchDoc = async () => {
    try {
      const res = await getDocument(id);
      console.log("docs:", res);
      setDoc(res.data);
      setTitle(res.data.title);
      setContent(res.data.content);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        msgApi.error("Document not found");
        nav("/documents");
      } else {
        msgApi.error("Failed to fetch document");
      }
    }
  };

  useEffect(() => {
    fetchDoc();

    // Join document room for real-time updates
    joinDocumentRoom(id);

    // Subscribe to document updates
    subscribeToDocumentUpdates((updatedDoc) => {
      console.log("📩 Received document update:", updatedDoc);

      setDoc((prev) => ({
        ...prev,
        ...updatedDoc, // merge updated fields (summary, tags, aiStatus)
      }));

      // Stop loading states when AI operations complete
      if (updatedDoc.aiStatus === "completed") {
        setIsSummarizing(false);
        setIsGeneratingTags(false);
      } else if (updatedDoc.aiStatus === "failed") {
        setIsSummarizing(false);
        setIsGeneratingTags(false);
        console.error("❌ AI operation failed:", updatedDoc);
        msgApi.error("AI operation failed. Please try again.");
      }
    });

    // Cleanup function
    return () => {
      const socket = connectSocket();
      socket.off("documentUpdated");
    };
    // eslint-disable-next-line
  }, [id]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await updateDocument(id, { title, content });
      setDoc(res.data.doc || res.data);
      setEditing(false);
      msgApi.success("Document saved successfully");
    } catch (err) {
      console.error(err);
      msgApi.error("Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);

    try {
      const res = await summarizeDocument(id);
      // Note: The actual update will come via socket, so we don't need to update state here
      console.log("Summary request sent:", res);
    } catch (err) {
      console.error("Summary generation failed:", err);
      msgApi.error("Summary generation failed. Please try again.");
      setIsSummarizing(false);
    }
  };

  const handleGenerateTags = async () => {
    setIsGeneratingTags(true);
    setAiErrorMessage("");
    try {
      const res = await generateTagsDocument(id);
      // Note: The actual update will come via socket, so we don't need to update state here
      console.log("Tags generation request sent:", res);
    } catch (err) {
      console.error("Tag generation failed:", err);
      msgApi.error("Tag generation failed. Please try again.");
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
      msgApi.error("Failed to load history");
    }
  };

  // Loading skeleton components
  const SummarySkeleton = () => (
    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 animate-pulse">
      <div className="flex items-center space-x-2 mb-3">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
        <span className="text-slate-600 text-sm font-medium">
          Generating summary...
        </span>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded w-full"></div>
        <div className="h-4 bg-slate-200 rounded w-4/5"></div>
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
      </div>
    </div>
  );

  const TagsSkeleton = () => (
    <div className="animate-pulse">
      <div className="flex items-center space-x-2 mb-3">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
        <span className="text-slate-600 text-sm font-medium">
          Generating tags...
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-8 bg-slate-200 rounded-full"
            style={{ width: `${60 + i * 15}px` }}
          ></div>
        ))}
      </div>
    </div>
  );

  // Check if AI operations are pending
  const isSummaryPending =
    doc?.aiStatus === "pending" && doc?.summary === undefined;
  const isTagsPending =
    doc?.aiStatus === "pending" && (!doc?.tags || doc.tags.length === 0);

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
      {contextHolder}
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
                disabled={isSummarizing || isSummaryPending}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm flex items-center space-x-2"
              >
                <span>✨</span>
                <span>
                  {isSummarizing || isSummaryPending
                    ? "Generating..."
                    : "Summarize with Gemini"}
                </span>
              </button>
              <button
                onClick={handleGenerateTags}
                disabled={isGeneratingTags || isTagsPending}
                className="px-5 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm flex items-center space-x-2"
              >
                <span>🏷️</span>
                <span>
                  {isGeneratingTags || isTagsPending
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
              {isSummaryPending || isSummarizing ? (
                <SummarySkeleton />
              ) : (
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {doc.summary ||
                      "No summary generated yet. Use the AI tools above to create one."}
                  </p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center space-x-2">
                <span>🏷️</span>
                <span>Tags</span>
              </h3>
              {isTagsPending || isGeneratingTags ? (
                <TagsSkeleton />
              ) : (
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
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <DocActivityFeed docId={id} />
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
            <div className="mt-5">
              <AddMemberForm
                documentId={doc._id}
                onMemberAdded={(updatedMembers) =>
                  setDoc((prev) => ({ ...prev, members: updatedMembers }))
                }
                members={doc.members}
              />
            </div>
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

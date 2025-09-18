import React from "react";
import { useNavigate } from "react-router-dom";

const DocCard = (params) => {
  const { doc } = params;
  const navigate = useNavigate();
  return (
    <div
      key={doc._id || index}
      className="group cursor-pointer bg-slate-50 border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-indigo-200 hover:bg-white transition-all duration-300 transform hover:-translate-y-1"
      onClick={() => navigate(`/document/${doc._id}`)}
    >
      {/* Document Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors duration-200 line-clamp-2 leading-tight">
          {doc.title}
        </h3>
        {doc.similarity && (
          <span className="flex-shrink-0 ml-2 px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
            {Math.round(doc.similarity * 100)}% match
          </span>
        )}
      </div>

      {/* Document Content Preview */}
      <p className="text-slate-600 mb-4 line-clamp-3 leading-relaxed text-sm">
        {doc.content?.substring(0, 150)}
        {doc.content?.length > 150 ? "..." : ""}
      </p>

      {/* Metadata */}
      <div className="space-y-3">
        {doc.aiStatus && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-500">
              AI Status:
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                doc.aiStatus === "completed"
                  ? "bg-emerald-100 text-emerald-800"
                  : doc.aiStatus === "processing"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {doc.aiStatus}
            </span>
          </div>
        )}

        {doc.tags && doc.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {doc.tags.slice(0, 3).map((tag, tagIndex) => (
              <span
                key={tagIndex}
                className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
            {doc.tags.length > 3 && (
              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                +{doc.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
          <div className="flex items-center space-x-2">
            <span>👤</span>
            <span>{doc.createdBy?.name || "Unknown"}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>📅</span>
            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <span className="text-indigo-600 font-medium text-sm">View →</span>
      </div>
    </div>
  );
};

export default DocCard;

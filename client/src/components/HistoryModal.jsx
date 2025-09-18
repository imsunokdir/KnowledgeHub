// src/components/HistoryModal.jsx
import React from "react";

const HistoryModal = ({ versions = [], onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📜</span>
            <h3 className="text-xl font-semibold text-slate-900">
              Document History
            </h3>
            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
              {versions.length} version{versions.length !== 1 ? "s" : ""}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-white hover:border-slate-400 transition-all duration-200 font-medium"
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(85vh-140px)]">
          {versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-6xl mb-4 opacity-20">📄</div>
              <h4 className="text-lg font-medium text-slate-600 mb-2">
                No Version History
              </h4>
              <p className="text-slate-500">
                This document hasn't been edited yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((v, i) => (
                <div
                  key={v._id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-all duration-200"
                >
                  {/* Version Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold">
                        {versions.length - i}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">
                          Version {versions.length - i}
                          {i === 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                              Latest
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-600 flex items-center space-x-2 mt-1">
                          <span>👤</span>
                          <span>{v.editedBy?.name || "Unknown User"}</span>
                          {v.editedBy?.email && (
                            <>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-500">
                                {v.editedBy.email}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-700">
                        {new Date(v.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(v.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-lg mb-2 leading-tight">
                        {v.title}
                      </h4>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">
                        {v.content.length > 300
                          ? `${v.content.substring(0, 300)}...`
                          : v.content}
                      </p>
                      {v.content.length > 300 && (
                        <button className="mt-2 text-indigo-600 hover:text-indigo-800 text-xs font-medium">
                          Show full content
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all duration-200 font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;

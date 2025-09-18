import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecentDocEdits, getRecentEdits } from "../api/document";

const DocActivityFeed = ({ docId }) => {
  const [items, setItems] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getRecentDocEdits(docId);
        setItems(res.data || []);
      } catch (err) {
        console.error("fetch recent edits:", err);
      }
    };
    fetch();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 w-full mt-5">
      <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2 border-b border-slate-200 pb-2">
        <span className="text-indigo-600">👥</span>
        <span>Doc Activity Feed</span>
      </h4>

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-3 opacity-20">💭</div>
            <p className="text-sm text-slate-500 font-medium mb-1">
              No recent activity
            </p>
            <p className="text-xs text-slate-400">
              Team edits will appear here
            </p>
          </div>
        ) : (
          items.map((it) => (
            <div
              key={it.versionId}
              onClick={() => nav(`/document/${it.docId}`)}
              className="group cursor-pointer rounded-lg border border-slate-200 p-3 hover:border-indigo-300 hover:shadow-lg hover:bg-indigo-50 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></span>
                    <h5 className="text-sm font-medium text-slate-900 truncate group-hover:text-indigo-900 transition-colors duration-200">
                      {it.title}
                    </h5>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-slate-500 ml-4">
                    <span>✏️</span>
                    <span>edited by</span>
                    <span className="font-medium text-slate-600">
                      {it.editedBy?.name || "Someone"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end ml-3 text-right">
                  <span className="text-xs text-slate-400 font-medium">
                    {new Date(it.editedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-xs text-slate-300 mt-0.5">
                    {new Date(it.editedAt).toLocaleDateString() ===
                    new Date().toLocaleDateString()
                      ? "Today"
                      : new Date(it.editedAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* {items.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-200 flex justify-center">
          <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200">
            View all activity →
          </button>
        </div>
      )} */}
    </div>
  );
};

export default DocActivityFeed;

// src/components/TeamActivityFeed.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecentEdits } from "../api/document";

const TeamActivityFeed = () => {
  const [items, setItems] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getRecentEdits();
        setItems(res.data || []);
      } catch (err) {
        console.error("fetch recent edits:", err);
      }
    };
    fetch();
  }, []);

  return (
    <div>
      <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
        <span>👥</span>
        <span>Team Activity Feed</span>
      </h4>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3 opacity-20">💭</div>
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
              className="group cursor-pointer"
              onClick={() => nav(`/document/${it.docId}`)}
            >
              <div className="flex items-start justify-between p-3 rounded-lg border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-200">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full flex-shrink-0"></span>
                    <h5 className="font-medium text-slate-900 text-sm truncate group-hover:text-indigo-900 transition-colors duration-200">
                      {it.title}
                    </h5>
                  </div>
                  <div className="flex items-center text-xs text-slate-500 space-x-1 ml-4">
                    <span>✏️</span>
                    <span>edited by</span>
                    <span className="font-medium text-slate-600">
                      {it.editedBy?.name || "Someone"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end ml-3">
                  <div className="text-xs text-slate-400 font-medium">
                    {new Date(it.editedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    {new Date(it.editedAt).toLocaleDateString() ===
                    new Date().toLocaleDateString()
                      ? "Today"
                      : new Date(it.editedAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-200">
          <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200">
            View all activity →
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamActivityFeed;

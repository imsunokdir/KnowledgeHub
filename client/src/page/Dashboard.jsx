import React, { useState } from "react";
import AdvancedSearch from "../components/AdvancedSearch";
import DocsList from "../components/DocsList";
import { useDocs } from "../context/DocsContext";
import TeamActivityFeed from "../components/TeamActivityFeed";

const Dashboard = () => {
  const { handleSearch, handleClearSearch, recentSearches, loading } =
    useDocs();
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
      {/* Sidebar for large screens */}
      <div className="hidden lg:block lg:fixed lg:top-0 lg:right-0 lg:h-full lg:w-80 lg:bg-white lg:shadow-2xl lg:z-20">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            Team Activity
          </h3>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">
          <TeamActivityFeed />
        </div>
      </div>

      {/* Sidebar for small screens (overlay) */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-40 transform transition-transform duration-300 lg:hidden ${
          showSidebar ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            Team Activity
          </h3>
          <button
            onClick={() => setShowSidebar(false)}
            className="text-slate-500 hover:text-slate-700 transition-colors duration-200"
          >
            ✖
          </button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">
          <TeamActivityFeed />
        </div>
      </div>

      {/* Overlay background for small screens */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setShowSidebar(false)}
        ></div>
      )}

      <div className="max-w-7xl mx-auto p-6 lg:pr-96">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Dashboard
            </h1>
            <p className="text-lg text-slate-600">
              Search, manage, and organize your documents with AI-powered tools
            </p>
          </div>

          {/* Button visible only on small screens */}
          <button
            onClick={() => setShowSidebar(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-200 flex items-center space-x-2 lg:hidden"
          >
            <span>👥</span>
            <span className="font-medium">Team Activity</span>
          </button>
        </div>

        {/* Search Component */}
        <div className="mb-8">
          <AdvancedSearch
            onSearch={handleSearch}
            onClear={handleClearSearch}
            recentSearches={recentSearches}
            isLoading={loading}
            placeholder="Search your documents..."
            className="max-w-5xl mx-auto"
          />
        </div>

        {/* Documents List */}
        <DocsList />
      </div>
    </div>
  );
};

export default Dashboard;

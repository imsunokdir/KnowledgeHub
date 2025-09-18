import React from "react";
import AdvancedSearch from "../components/AdvancedSearch";
import DocsList from "../components/DocsList";
import { useDocs } from "../context/DocsContext";

const Dashboard = () => {
  const { handleSearch, handleClearSearch, recentSearches, loading } =
    useDocs();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-lg text-slate-600">
            Search, manage, and organize your documents with AI-powered tools
          </p>
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

import React from "react";
import { useNavigate } from "react-router-dom";
import { useDocs } from "../context/DocsContext";
import DocCard from "./DocCard";

const DocsList = () => {
  const {
    documents,
    searchMode,
    searchResults,
    currentSearch,
    page,
    setPage,
    totalPages,
    loading,
    handleClearSearch,
  } = useDocs();

  const navigate = useNavigate();
  const currentDocuments = searchMode ? searchResults : documents;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Content Header */}
      <div className="border-b border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-1">
              {searchMode ? "Search Results" : "All Documents"}
            </h2>
            <div className="flex items-center space-x-3 text-sm text-slate-600">
              {searchMode && currentSearch && (
                <>
                  <span>Query: "{currentSearch.query}"</span>
                  <span>•</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      currentSearch.type === "semantic"
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {currentSearch.type === "semantic"
                      ? "AI Search"
                      : "Text Search"}
                  </span>
                  <span>•</span>
                </>
              )}
              <span>
                {currentDocuments.length} document
                {currentDocuments.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {searchMode && (
            <button
              onClick={handleClearSearch}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all duration-200 font-medium"
            >
              Clear Search
            </button>
          )}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="p-6">
        {loading && currentDocuments.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
            <span className="text-slate-600">
              {searchMode ? "Searching documents..." : "Loading documents..."}
            </span>
          </div>
        ) : currentDocuments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 opacity-20">
              {searchMode ? "🔍" : "📄"}
            </div>
            <h3 className="text-lg font-medium text-slate-600 mb-2">
              {searchMode ? "No search results found" : "No documents found"}
            </h3>
            <p className="text-slate-500">
              {searchMode
                ? "Try adjusting your search terms or using a different search type"
                : "Create your first document to get started"}
            </p>
            {searchMode && (
              <button
                onClick={handleClearSearch}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200"
              >
                View All Documents
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentDocuments.map((doc, index) => (
                <DocCard doc={doc} />
              ))}
            </div>

            {/* Load More Button */}
            {!searchMode && page < totalPages && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setPage(page + 1)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200"
                >
                  {loading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DocsList;

// src/components/DocsList.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useDocs } from "../context/DocsContext";
import DocCard from "./DocCard";
import DocCardSkeleton from "./DocCardSkeleton";

const DocsList = () => {
  const {
    documents,
    filteredDocuments,
    searchResults,
    searchMode,
    localFilterActive,
    currentSearch,
    loading,
    documentsLoading,
    searchLoading,
    isFetchingNextPage,
    hasNextPage,
    handleLoadMore,
    handleClearSearch,
    clearLocalFilter,
    documentsError,
    searchError,
  } = useDocs();

  const navigate = useNavigate();

  // Determine which documents to display
  const currentDocuments = searchMode
    ? searchResults
    : localFilterActive
    ? filteredDocuments
    : documents;

  // Handle errors
  if (documentsError && !searchMode) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
        <div className="p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Failed to load documents
          </h3>
          <p className="text-slate-600 text-sm">{documentsError.message}</p>
        </div>
      </div>
    );
  }

  if (searchError && searchMode) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
        <div className="p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Search failed
          </h3>
          <p className="text-slate-600 text-sm">{searchError.message}</p>
          <button
            onClick={handleClearSearch}
            className="mt-4 px-4 py-2 text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all duration-200 font-medium"
          >
            Clear Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-1">
              {searchMode
                ? "Search Results"
                : localFilterActive
                ? "Filtered Documents"
                : "All Documents"}
            </h2>
            <div className="flex items-center space-x-3 text-sm text-slate-600">
              {searchMode && currentSearch && (
                <>
                  Query: "{currentSearch.query}" •{" "}
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
                </>
              )}
              {localFilterActive && <span>Local filters applied</span>}
              <span>
                {currentDocuments.length} document
                {currentDocuments.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {(searchMode || localFilterActive) && (
            <button
              onClick={searchMode ? handleClearSearch : clearLocalFilter}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all duration-200 font-medium"
            >
              {searchMode ? "Clear Search" : "Clear Filter"}
            </button>
          )}
        </div>
      </div>

      {/* Document List */}
      <div className="divide-y divide-slate-100">
        {loading && !isFetchingNextPage && currentDocuments.length === 0 ? (
          // Initial loading state
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <DocCardSkeleton key={idx} />
            ))}
          </div>
        ) : currentDocuments.length > 0 ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentDocuments.map((doc) => (
              <DocCard key={doc._id} doc={doc} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            No documents found.
          </div>
        )}
      </div>

      {/* Load More Button */}
      {hasNextPage && (
        <div className="p-6 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={isFetchingNextPage}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isFetchingNextPage ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default DocsList;

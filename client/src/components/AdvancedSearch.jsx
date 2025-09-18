// src/components/AdvancedSearch.jsx
import React, { useState, useEffect, useRef } from "react";
import { Search, Filter, Sparkles, X, Clock, Loader2 } from "lucide-react";
import { useDocs } from "../context/DocsContext";

const AdvancedSearch = ({
  placeholder = "Search documents...",
  className = "",
}) => {
  const {
    runSearch,
    searchResults,
    loading,
    documents,
    runLocalFilter,
    clearLocalFilter,
    localFilterActive,
    filteredDocuments,
    filters,
    setFilters,
  } = useDocs();

  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("text"); // "text" or "semantic"
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  // const [filters, setFilters] = useState({
  //   tags: [],
  // });

  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Get all unique tags from documents
  const availableTags = React.useMemo(() => {
    const tagSet = new Set();
    documents.forEach((doc) => {
      if (doc.tags && Array.isArray(doc.tags)) {
        doc.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [documents]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Apply local filters when tags change
  // useEffect(() => {
  //   if (filters.tags.length > 0) {
  //     runLocalFilter(filters);
  //   } else {
  //     clearLocalFilter();
  //   }
  // }, [filters.tags, runLocalFilter, clearLocalFilter]);

  useEffect(() => {
    if (filters.tags.length > 0) {
      runLocalFilter(filters);
    }
  }, [filters.tags, runLocalFilter]);

  const handleSearch = () => {
    if (query.trim()) {
      const searchPayload = {
        query: query.trim(),
        type: searchType,
        filters: searchType === "text" ? filters : {},
      };

      // Clear local filters when doing API search
      if (localFilterActive) {
        clearLocalFilter();
      }

      runSearch(searchPayload);

      // save recent searches in memory
      setRecentSearches((prev) => [
        searchPayload,
        ...prev.filter((r) => r.query !== searchPayload.query).slice(0, 4),
      ]);

      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setFilters({
      tags: [],
    });
    clearLocalFilter();
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setIsExpanded(false);
    }
  };

  const handleRecentSearchClick = (recentQuery) => {
    setQuery(recentQuery.query);
    setSearchType(recentQuery.type);
    setFilters(recentQuery.filters || { tags: [] });
    setShowSuggestions(false);

    // Clear local filters when doing API search
    if (localFilterActive) {
      clearLocalFilter();
    }

    runSearch(recentQuery);
  };

  const toggleSearchType = (type) => {
    setSearchType(type);
    if (type === "semantic") {
      setIsExpanded(false); // Collapse filters for semantic search
    }
  };

  const addTag = (tag) => {
    if (tag && !filters.tags.includes(tag)) {
      setFilters({ ...filters, tags: [...filters.tags, tag] });
    }
  };

  const removeTag = (index) => {
    setFilters({
      ...filters,
      tags: filters.tags.filter((_, i) => i !== index),
    });
  };

  const handleTagSuggestionClick = (tag) => {
    addTag(tag);
  };

  // Show tag suggestions when typing
  const [tagInput, setTagInput] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  const tagSuggestions = availableTags
    .filter(
      (tag) =>
        tag.toLowerCase().includes(tagInput.toLowerCase()) &&
        !filters.tags.includes(tag)
    )
    .slice(0, 5);

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Main Search Bar */}
      <div className="relative">
        <div
          className={`
            flex items-center bg-white border-2 rounded-xl shadow-sm transition-all duration-300
            ${
              isExpanded || showSuggestions
                ? "border-indigo-500 shadow-lg"
                : "border-slate-200 hover:border-slate-300"
            }
          `}
        >
          {/* Search Type Toggle */}
          <div className="flex bg-slate-100 rounded-l-lg m-1">
            <button
              onClick={() => toggleSearchType("text")}
              className={`
                px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-1
                ${
                  searchType === "text"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }
              `}
            >
              <Search size={16} />
              <span>Text</span>
            </button>
            <button
              onClick={() => toggleSearchType("semantic")}
              className={`
                px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-1
                ${
                  searchType === "semantic"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }
              `}
            >
              <Sparkles size={16} />
              <span>AI</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={() => setShowSuggestions(true)}
              placeholder={
                searchType === "semantic"
                  ? "Ask anything about your documents..."
                  : placeholder
              }
              className="w-full px-4 py-3 text-slate-900 placeholder-slate-400 bg-transparent outline-none"
            />

            {/* Loading Spinner */}
            {loading && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Loader2 size={20} className="text-indigo-500 animate-spin" />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 pr-2">
            {searchType === "text" && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`
                  p-2 rounded-lg transition-all duration-200
                  ${
                    isExpanded
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  }
                `}
                title="Advanced filters"
              >
                <Filter size={18} />
              </button>
            )}

            {(query || filters.tags.length > 0) && (
              <button
                onClick={handleClear}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all duration-200"
                title="Clear search"
              >
                <X size={18} />
              </button>
            )}

            <button
              onClick={handleSearch}
              disabled={!query.trim() || loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm"
            >
              Search
            </button>
          </div>
        </div>

        {/* Search Type Description */}
        <div className="mt-2 px-4">
          {searchType === "semantic" ? (
            <div className="flex items-center space-x-2 text-sm text-indigo-600">
              <Sparkles size={14} />
              <span>
                AI-powered semantic search - finds content by meaning, not just
                keywords
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <Search size={14} />
              <span>
                Traditional keyword-based search with advanced filtering options
              </span>
              {localFilterActive && (
                <>
                  <span>•</span>
                  <span className="text-indigo-600 font-medium">
                    Local filters active ({filteredDocuments.length} results)
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected Tags Display (always visible when tags are selected) */}
      {filters.tags.length > 0 && (
        <div className="mt-3 px-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-slate-700">
              Active Filters:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium flex items-center space-x-2 border border-indigo-200"
              >
                <span>#{tag}</span>
                <button
                  onClick={() => removeTag(index)}
                  className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-200 rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Filters (Text Search Only) */}
      {isExpanded && searchType === "text" && (
        <div className="mt-4 p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
          <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center space-x-2">
            <Filter size={16} />
            <span>Local Filters</span>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
              Filters {documents.length} documents instantly
            </span>
          </h4>

          <div className="grid grid-cols-1 gap-4">
            {/* Tags Input with Suggestions */}
            <div className="relative">
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Filter by Tags
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  setShowTagSuggestions(e.target.value.length > 0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    const tag = tagInput.trim().replace(",", "");
                    if (tag) {
                      addTag(tag);
                      setTagInput("");
                      setShowTagSuggestions(false);
                    }
                  }
                  if (e.key === "Escape") {
                    setShowTagSuggestions(false);
                  }
                }}
                onFocus={() => setShowTagSuggestions(tagInput.length > 0)}
                placeholder="Type to search tags or add new ones..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
              />

              {/* Tag Suggestions Dropdown */}
              {showTagSuggestions && tagSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                  {tagSuggestions.map((tag, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        addTag(tag);
                        setTagInput("");
                        setShowTagSuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors duration-150 text-sm border-b border-slate-100 last:border-b-0"
                    >
                      <span className="text-slate-600">#</span>
                      <span className="font-medium text-slate-900">{tag}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-2 text-xs text-slate-500">
                {availableTags.length > 0 ? (
                  <>Available tags: {availableTags.length}</>
                ) : (
                  <>No tags found in your documents</>
                )}
              </div>
            </div>

            {/* Popular Tags */}
            {availableTags.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Popular Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.slice(0, 10).map((tag, index) => (
                    <button
                      key={index}
                      onClick={() => addTag(tag)}
                      disabled={filters.tags.includes(tag)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm font-medium hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Searches */}
      {showSuggestions && recentSearches.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50">
          <div className="p-4">
            <h5 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3 flex items-center space-x-2">
              <Clock size={14} />
              <span>Recent Searches</span>
            </h5>
            <div className="space-y-2">
              {recentSearches.slice(0, 5).map((recent, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(recent)}
                  className="w-full text-left p-3 rounded-lg hover:bg-slate-50 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {recent.type === "semantic" ? (
                        <Sparkles size={16} className="text-indigo-500" />
                      ) : (
                        <Search size={16} className="text-slate-400" />
                      )}
                      <span className="text-sm text-slate-900 font-medium">
                        {recent.query}
                      </span>
                      {recent.filters?.tags?.length > 0 && (
                        <div className="flex space-x-1">
                          {recent.filters.tags
                            .slice(0, 2)
                            .map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 group-hover:text-slate-600">
                      {recent.type === "semantic" ? "AI Search" : "Text Search"}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;

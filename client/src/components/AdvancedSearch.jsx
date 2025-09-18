// src/components/AdvancedSearchComponent.jsx
import React, { useState, useEffect, useRef } from "react";
import { Search, Filter, Sparkles, X, Clock, Loader2 } from "lucide-react";
import { useDocs } from "../context/DocsContext";

const AdvancedSearch = ({
  placeholder = "Search documents...",
  className = "",
}) => {
  const { runSearch, searchResults, loading } = useDocs();

  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("text"); // "text" or "semantic"
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: "all",
    author: "",
    tags: [],
    contentType: "all",
  });

  const searchRef = useRef(null);
  const inputRef = useRef(null);

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

  const handleSearch = () => {
    if (query.trim()) {
      const searchPayload = {
        query: query.trim(),
        type: searchType,
        filters: searchType === "text" ? filters : {},
      };

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
      dateRange: "all",
      author: "",
      tags: [],
      contentType: "all",
    });
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
    setShowSuggestions(false);
    runSearch(recentQuery);
  };

  const toggleSearchType = (type) => {
    setSearchType(type);
    if (type === "semantic") {
      setIsExpanded(false); // Collapse filters for semantic search
    }
  };

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

            {query && (
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
            </div>
          )}
        </div>
      </div>

      {/* Advanced Filters (Text Search Only) */}
      {isExpanded && searchType === "text" && (
        <div className="mt-4 p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
          {/* same advanced filters UI as before */}
          {/* ... keep your filter fields (dateRange, author, tags, etc.) */}
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

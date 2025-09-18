import React, { createContext, useContext, useState, useEffect } from "react";
import { getDocuments } from "../api/document";
import { searchDocs } from "../api/search";

const DocsContext = createContext();
export const useDocs = () => useContext(DocsContext);

export const DocsProvider = ({ children }) => {
  const [documents, setDocuments] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(2);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [searchMode, setSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearch, setCurrentSearch] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

  // load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  // fetch documents (default view)
  const fetchDocuments = async (pageNum) => {
    setLoading(true);
    try {
      const res = await getDocuments(pageNum, limit);
      // setDocuments(res.data.docs);
      setDocuments((prev) => [...prev, ...res.data.docs]);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchMode) {
      fetchDocuments(page);
    }
  }, [page, searchMode]);

  const saveRecentSearch = (searchQuery) => {
    const newRecent = [
      searchQuery,
      ...recentSearches.filter((r) => r.query !== searchQuery.query),
    ].slice(0, 10);
    setRecentSearches(newRecent);
    localStorage.setItem("recentSearches", JSON.stringify(newRecent));
  };

  const runSearch = async (searchQuery) => {
    setLoading(true);
    setSearchMode(true);
    setCurrentSearch(searchQuery);
    setPage(1);

    try {
      const response = await searchDocs({
        query: searchQuery.query,
        type: searchQuery.type,
      });
      setSearchResults(response.data);
      saveRecentSearch(searchQuery);
    } catch (err) {
      console.error("Search failed:", err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchMode(false);
    setSearchResults([]);
    setCurrentSearch(null);
    setPage(1);
  };

  return (
    <DocsContext.Provider
      value={{
        documents,
        page,
        setPage,
        totalPages,
        loading,
        searchMode,
        searchResults,
        currentSearch,
        recentSearches,
        runSearch,
        handleClearSearch,
      }}
    >
      {children}
    </DocsContext.Provider>
  );
};

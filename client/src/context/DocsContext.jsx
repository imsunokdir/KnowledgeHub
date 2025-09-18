// src/context/DocsContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { getDocuments } from "../api/document";
import { searchDocs } from "../api/search";

const DocsContext = createContext();
export const useDocs = () => useContext(DocsContext);

export const DocsProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [limit] = useState(2);

  // Search state
  const [searchMode, setSearchMode] = useState(false);
  const [currentSearch, setCurrentSearch] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

  // Local filtering state
  const [localFilterActive, setLocalFilterActive] = useState(false);
  const [localFilters, setLocalFilters] = useState({});

  const [filters, setFilters] = useState({
    tags: [],
  });

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  // Infinite query for documents pagination
  const {
    data: documentsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: documentsLoading,
    error: documentsError,
  } = useInfiniteQuery({
    queryKey: ["documents", limit],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getDocuments(pageParam, limit);
      return {
        docs: response.data.docs,
        currentPage: pageParam,
        totalPages: response.data.totalPages,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined;
    },
    enabled: !searchMode, // Only fetch when not in search mode
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (searchQuery) => {
      const response = await searchDocs({
        query: searchQuery.query,
        type: searchQuery.type,
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Save to recent searches
      saveRecentSearch(variables);
    },
    onError: (error) => {
      console.error("Search failed:", error);
    },
  });

  // Flatten documents from all pages
  const documents = documentsData?.pages?.flatMap((page) => page.docs) || [];
  const totalPages = documentsData?.pages?.[0]?.totalPages || 1;
  const currentPage = documentsData?.pages?.length || 1;

  // Apply local filters to documents
  const filteredDocuments = useMemo(() => {
    if (!localFilterActive) return documents;

    return documents.filter((doc) => {
      // Filter by tags
      if (localFilters.tags && localFilters.tags.length > 0) {
        const docTags = doc.tags || [];
        const hasMatchingTag = localFilters.tags.some((filterTag) =>
          docTags.some((docTag) =>
            docTag.toLowerCase().includes(filterTag.toLowerCase())
          )
        );
        if (!hasMatchingTag) return false;
      }

      // Add more local filters here if needed
      // if (localFilters.author) {
      //   const authorName = doc.createdBy?.name || '';
      //   if (!authorName.toLowerCase().includes(localFilters.author.toLowerCase())) {
      //     return false;
      //   }
      // }

      return true;
    });
  }, [documents, localFilterActive, localFilters]);

  // Search results and loading state
  const searchResults = searchMutation.data || [];
  const searchLoading = searchMutation.isPending;

  // Combined loading state
  const loading = documentsLoading || searchLoading || isFetchingNextPage;

  const saveRecentSearch = useCallback(
    (searchQuery) => {
      const newRecent = [
        searchQuery,
        ...recentSearches.filter((r) => r.query !== searchQuery.query),
      ].slice(0, 10);
      setRecentSearches(newRecent);
      localStorage.setItem("recentSearches", JSON.stringify(newRecent));
    },
    [recentSearches]
  );

  const runSearch = async (searchQuery) => {
    setSearchMode(true);
    setCurrentSearch(searchQuery);
    // Clear local filters when doing API search
    setLocalFilterActive(false);
    setLocalFilters({});
    searchMutation.mutate(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchMode(false);
    setCurrentSearch(null);
    // Reset search mutation
    searchMutation.reset();
  };

  // Local filtering functions
  const runLocalFilter = useCallback(
    (filters) => {
      setLocalFilters(filters);
      setLocalFilterActive(true);
      // Clear search mode when using local filters
      if (searchMode) {
        setSearchMode(false);
        setCurrentSearch(null);
        searchMutation.reset();
      }
    },
    [searchMode, searchMutation]
  );

  const clearLocalFilter = useCallback(() => {
    setLocalFilterActive(false);
    setLocalFilters({});
    setFilters({
      tags: [],
    });
  }, []);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Refresh documents
  const refreshDocuments = () => {
    queryClient.invalidateQueries({ queryKey: ["documents"] });
  };

  // Add new document to cache (useful after creating a document)
  const addDocumentToCache = (newDoc) => {
    queryClient.setQueryData(["documents", limit], (oldData) => {
      if (!oldData) return oldData;

      const newPages = [...oldData.pages];
      if (newPages[0]) {
        newPages[0] = {
          ...newPages[0],
          docs: [newDoc, ...newPages[0].docs],
        };
      }
      return {
        ...oldData,
        pages: newPages,
      };
    });
  };

  // Remove document from cache (useful after deleting a document)
  const removeDocumentFromCache = (docId) => {
    queryClient.setQueryData(["documents", limit], (oldData) => {
      if (!oldData) return oldData;

      const newPages = oldData.pages.map((page) => ({
        ...page,
        docs: page.docs.filter((doc) => doc._id !== docId),
      }));

      return {
        ...oldData,
        pages: newPages,
      };
    });
  };

  // Update document in cache (useful after editing a document)
  const updateDocumentInCache = (docId, updatedDoc) => {
    queryClient.setQueryData(["documents", limit], (oldData) => {
      if (!oldData) return oldData;

      const newPages = oldData.pages.map((page) => ({
        ...page,
        docs: page.docs.map((doc) =>
          doc._id === docId ? { ...doc, ...updatedDoc } : doc
        ),
      }));

      return {
        ...oldData,
        pages: newPages,
      };
    });
  };

  const value = {
    // Documents data
    documents,
    page: currentPage,
    totalPages,
    hasNextPage,

    // Local filtering
    localFilterActive,
    filteredDocuments,
    runLocalFilter,
    clearLocalFilter,
    filters,
    setFilters,

    // Loading states
    loading,
    documentsLoading,
    searchLoading,
    isFetchingNextPage,

    // Search functionality
    searchMode,
    searchResults,
    currentSearch,
    recentSearches,
    runSearch,
    handleClearSearch,

    // Cache management
    refreshDocuments,
    addDocumentToCache,
    removeDocumentFromCache,
    updateDocumentInCache,

    // Load more for infinite scroll
    handleLoadMore,

    // Errors
    documentsError,
    searchError: searchMutation.error,
  };

  return <DocsContext.Provider value={value}>{children}</DocsContext.Provider>;
};

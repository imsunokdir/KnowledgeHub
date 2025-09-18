import { useState } from "react";
import axios from "axios";
import { searchDocs } from "../api/search";

const SemanticSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const res = await searchDocs({ query, type: "semantic" });
      console.log("serach res:", res);
      setResults(res.data);
    } catch (err) {
      console.error(err);
      setError("Search failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Semantic Search</h2>

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter search text..."
          className="flex-1 p-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p className="text-red-500">{error}</p>}

      <div className="space-y-4">
        {results.length === 0 && !loading && <p>No results found.</p>}

        {results.map((doc) => (
          <div key={doc._id} className="p-3 border rounded shadow-sm">
            <h3 className="font-semibold">{doc.title}</h3>
            <p>{doc.content}</p>
            {doc.similarity && (
              <p className="text-sm text-gray-500">
                Similarity: {doc.similarity.toFixed(4)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SemanticSearch;

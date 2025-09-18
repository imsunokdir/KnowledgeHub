import { useState } from "react";
import { searchDocs } from "../api/search";

const Search = () => {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("text"); // "text" or "semantic"
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!query) return;
    try {
      const res = await searchDocs({ query, type });
      setResults(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Search Documents</h2>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter your search"
      />
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="text">Text Search</option>
        <option value="semantic">Semantic Search</option>
      </select>
      <button onClick={handleSearch}>Search</button>

      <div>
        <h3>Results:</h3>
        {results.length ? (
          results.map((doc) => (
            <div
              key={doc._id}
              style={{ border: "1px solid #ccc", margin: 5, padding: 5 }}
            >
              <h4>{doc.title}</h4>
              <p>{doc.content}</p>
              {type === "semantic" && (
                <p>Similarity: {doc.similarity.toFixed(4)}</p>
              )}
            </div>
          ))
        ) : (
          <p>No results found</p>
        )}
      </div>
    </div>
  );
};

export default Search;

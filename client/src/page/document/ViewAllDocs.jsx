// src/pages/DocumentsPage.jsx
import { useEffect, useState } from "react";
import { getDocuments } from "../../api/document";
import { useNavigate } from "react-router-dom";
import AdvancedSearch from "../../components/AdvancedSearch";

const ViewAllDocs = () => {
  const [documents, setDocuments] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(2); // documents per page
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchDocuments = async (page) => {
    setLoading(true);
    try {
      const res = await getDocuments(page, limit);
      console.log("all docs:", res);
      setDocuments(res.data.docs);
      setTotalPages(res.data.totalPages); // assume backend returns totalPages
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(page);
  }, [page]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <AdvancedSearch />
      <h1 className="text-3xl font-bold mb-6">All Documents</h1>

      {loading ? (
        <p>Loading documents...</p>
      ) : documents.length === 0 ? (
        <p>No documents found.</p>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="p-4 border rounded-lg shadow hover:shadow-md transition"
              onClick={() => navigate(`/document/${doc._id}`)}
            >
              <h2 className="text-xl font-semibold">{doc.title}</h2>
              <p className="text-gray-700 mt-1">{doc.content}</p>
              <p className="mt-2 text-sm text-gray-500">
                Status: {doc.aiStatus}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                page === i + 1 ? "bg-blue-500 text-white" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewAllDocs;

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDocument } from "../../api/document";
import { joinDocumentRoom, subscribeToDocumentUpdates } from "../../api/socket";

const DocumentPage = () => {
  const { id } = useParams(); // document ID from route
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // for doc not found
  const [summary, setSummary] = useState("Generating summary...");
  const [tags, setTags] = useState("Generating tags...");
  const [aiStatus, setAiStatus] = useState("pending");

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const res = await getDocument(id);
        setDoc(res.data);
        setLoading(false);

        // join socket room for AI updates
        joinDocumentRoom(id);

        // subscribe to AI updates
        subscribeToDocumentUpdates((update) => {
          console.log("📩 Document update received:", update);

          if (update._id === id) {
            setAiStatus(update.aiStatus);

            if (update.aiStatus === "completed") {
              setSummary(update.summary);
              setTags(update.tags.join(", "));
            } else if (update.aiStatus === "failed") {
              setSummary("AI summary generation failed");
              setTags("AI tag generation failed");
            }
          }
        });
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError("Document not found or has been deleted.");
        } else {
          setError("Failed to fetch document. Try again later.");
        }
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  if (loading) return <p>Loading document...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>{doc.title}</h1>
      <p>{doc.content}</p>

      <div>
        <h3>Summary:</h3>
        <p>{summary}</p>
      </div>

      <div>
        <h3>Tags:</h3>
        <p>{tags}</p>
      </div>

      <p>Status: {aiStatus}</p>
    </div>
  );
};

export default DocumentPage;

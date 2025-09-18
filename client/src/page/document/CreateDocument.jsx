import { useState } from "react";
import { authContext } from "../../context/AuthProvider";
import { createDoc } from "../../api/document";
import { logout } from "../../api/user";
import { useNavigate } from "react-router-dom";
import SemanticSearch from "../SemanticSearch";
import AskQuestion from "../AskQuestion";
import Search from "../Search";
// import { createDocument } from "../../src/api/document";
// import { authContext } from "../../context/AuthProvider";

const CreateDocument = () => {
  const { isAuth, setUser } = authContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [message, setMessage] = useState("");

  if (!isAuth) {
    return <p>You must be logged in to create a document.</p>;
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createDoc(formData);
      if (res.status === 201) {
        setMessage("Document created successfully!");
        setFormData({ title: "", content: "" });
        console.log("Created document:", res.data);
        navigate(`/document/${res.data._id}`);
      }
    } catch (error) {
      console.error("Error creating document:", error);
      setMessage("Failed to create document.");
    }
  };

  const handleLogout = async () => {
    try {
      const res = await logout();
      if (res.status === 200) {
        setUser(null);
      }
    } catch (error) {
      console.log("logout error:", error);
    }
  };

  return (
    <div>
      <h2>Create Document</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Content:</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Create</button>
      </form>
      {message && <p>{message}</p>}
      {isAuth && <button onClick={handleLogout}>Logout</button>}

      {/* <SemanticSearch /> */}
      {/* <AskQuestion /> */}
      <Search />
    </div>
  );
};

export default CreateDocument;

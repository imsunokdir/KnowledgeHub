import { useState } from "react";
import { authContext } from "../../context/AuthProvider";
import { createDoc } from "../../api/document";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Typography,
  Button,
  Alert,
} from "@mui/material";

const CreateDocument = () => {
  const { isAuth } = authContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!isAuth) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="70vh"
      >
        <Typography variant="h6" color="textSecondary">
          You must be logged in to create a document.
        </Typography>
      </Box>
    );
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await createDoc(formData);
      if (res.status === 201) {
        setMessage("Document created successfully!");
        setFormData({ title: "", content: "" });
        navigate(`/document/${res.data._id}`);
      }
    } catch (err) {
      console.error("Error creating document:", err);
      setError("Failed to create document. Please try again.");
    }
  };

  return (
    <Box display="flex" justifyContent="center" mt={6}>
      <Card
        sx={{ width: "100%", maxWidth: 600, boxShadow: 3, borderRadius: 3 }}
      >
        <CardHeader
          title="Create Document"
          titleTypographyProps={{ variant: "h5", fontWeight: 600 }}
        />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Box mb={2}>
              <TextField
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                fullWidth
              />
            </Box>
            <Box mb={2}>
              <TextField
                label="Content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                fullWidth
                multiline
                rows={6}
              />
            </Box>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ py: 1.2, fontWeight: "bold" }}
            >
              Create
            </Button>
          </form>

          {message && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {message}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateDocument;

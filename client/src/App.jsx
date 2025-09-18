import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./page/Home";
import Login from "./page/Login";
import Register from "./page/Register";
import DocumentPage from "./page/document/DocumentPage";
import Header from "./components/Header";
import DocumentDetailsPage from "./page/DocumentDetailsPage";
import TeamQnA from "./page/TeamQnA";

const App = () => {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/document/:id" element={<DocumentDetailsPage />} />
          <Route path="/team-qa" element={<TeamQnA />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

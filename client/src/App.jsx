import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./page/Home";
import Login from "./page/Login";
import Register from "./page/Register";
import DocumentPage from "./page/document/DocumentPage";
import Header from "./components/Header";
import DocumentDetailsPage from "./page/DocumentDetailsPage";
import TeamQnA from "./page/TeamQnA";
import CreateDocument from "./page/document/CreateDocument";

const App = () => {
  return (
    <Router>
      <div>
        <Header />
        <div className="pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/document/:id" element={<DocumentDetailsPage />} />
            <Route path="/team-qa" element={<TeamQnA />} />
            <Route path="/document" element={<CreateDocument />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;

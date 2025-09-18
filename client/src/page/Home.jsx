import React from "react";
import { authContext } from "../context/AuthProvider";
import CreateDocument from "./document/CreateDocument";
import Login from "./Login";
import ViewAllDocs from "./document/ViewAllDocs";
import Dashboard from "./Dashboard";

const Home = () => {
  const { isAuth } = authContext();

  return <div>{isAuth ? <Dashboard /> : <Login />}</div>;
};

export default Home;

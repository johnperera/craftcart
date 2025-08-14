import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter,HashRouter as Router } from "react-router-dom";
import "./index.css";
import Navbar from "./components/Navbar";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <Router>
      <Navbar />
    </Router>
);
 
 
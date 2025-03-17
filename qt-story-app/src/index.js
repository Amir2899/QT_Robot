import React from "react";
import ReactDOM from "react-dom/client"; // Utiliser "react-dom/client"
import "./index.css";
import App from "./App";

// Sélectionne l'élément "root"
const root = ReactDOM.createRoot(document.getElementById("root"));

// Rend l'application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

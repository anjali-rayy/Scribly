import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import Context from "./Context/Context.jsx";
import "react-toastify/dist/ReactToastify.css";
import "react-quill/dist/quill.bubble.css";
import "react-tagsinput/react-tagsinput.css";

// Suppress ReactQuill findDOMNode deprecation warning
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' && 
    args[0].includes('findDOMNode is deprecated')
  ) {
    return;
  }
  originalError(...args);
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Context>
        <App />
      </Context>
    </BrowserRouter>
  </React.StrictMode>
);
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/serviceWorker.js")
      .then((reg) => console.log("SW registered:", reg))
      .catch((err) => console.log("SW failed:", err));
  });
}

setInterval(() => {
  fetch("https://photobooking-2-d4nb.onrender.com/api/health")
    .then(() => {})
    .catch(() => {});
}, 10 * 60 * 1000);
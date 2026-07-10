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

// Register Service Worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/serviceWorker.js")
      .then((reg) => console.log("SW registered:", reg))
      .catch((err) => console.log("SW failed:", err));
  });
}

// Keep backend alive
setInterval(() => {
  fetch("https://photobooking-2-d4nb.onrender.com/api/health")
    .then(() => console.log("Backend alive"))
    .catch(() => {});
}, 10 * 60 * 1000);
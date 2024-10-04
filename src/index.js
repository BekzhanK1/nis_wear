import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import OrderManagementPage from "./pages/OrderManagementPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import Loader from "./pages/Loader";
import MainPage from "./pages/MainPage";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Router>
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/login" element={<LoginPage />} />{" "}
      <Route path="/orders" element={<OrderManagementPage />} />{" "}
      <Route path="/tracking" element={<OrderTrackingPage />} />{" "}
      <Route path="*" element={<Loader />} />
      {/* Example additional route */}
    </Routes>
  </Router>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

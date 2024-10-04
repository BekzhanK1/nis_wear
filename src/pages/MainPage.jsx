import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MainPage = () => {
  const navigate = useNavigate();

  const handleCustomerClick = () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      navigate("/tracking");
    } else {
      navigate("/login");
    }
  };

  const handleAdminClick = () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      navigate("/orders");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600 mb-12">
        Welcome to NIS WEAR
      </h1>
      <div className="flex space-x-6">
        <button
          className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-lg hover:bg-green-600"
          onClick={handleCustomerClick}
        >
          Customer
        </button>
        <button
          className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-600"
          onClick={handleAdminClick}
        >
          Admin
        </button>
      </div>
    </div>
  );
};

export default MainPage;

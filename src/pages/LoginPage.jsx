// src/LoginPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../utils/apiService";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await getToken(username, password);
      setIsError(false);
      setMessage("Login successful, redirecting...");
      setTimeout(() => {
        navigate("/orders");
      }, 2000);
    } catch (error) {
      console.error("Error fetching token:", error);
      setIsError(true);
      setMessage("Invalid credentials");
    } finally {
      console.log("IsError: ", isError);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:border-blue-500"
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring focus:border-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Sign In
            </button>
          </div>
        </form>

        {/* Conditional rendering of error or success messages */}
        {message && (
          <div
            className={`${
              isError
                ? "bg-red-100 border-red-500 text-red-700"
                : "bg-green-100 border-green-500 text-green-700"
            } border-l-4 p-4 mt-4`}
            role="alert"
          >
            <p className="font-bold">{isError ? "Error" : "Success"}</p>
            <p>{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;

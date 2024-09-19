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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-10 rounded-lg shadow-2xl w-full max-w-md transform transition-transform duration-500 hover:-translate-y-1">
        <h2 className="text-3xl font-bold mb-8 text-center text-indigo-700">
          Welcome Back
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-semibold mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border-2 border-indigo-300 rounded-lg bg-gradient-to-r from-indigo-50 to-white focus:outline-none focus:ring-4 focus:ring-indigo-200 shadow-md transition-all duration-300 ease-in-out"
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="mb-8">
            <label
              className="block text-gray-700 text-sm font-semibold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border-2 border-indigo-300 rounded-lg bg-gradient-to-r from-indigo-50 to-white focus:outline-none focus:ring-4 focus:ring-indigo-200 shadow-md transition-all duration-300 ease-in-out"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
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
            } border-l-4 p-4 mt-6 shadow-lg rounded-lg transition-all duration-300 ease-in-out`}
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

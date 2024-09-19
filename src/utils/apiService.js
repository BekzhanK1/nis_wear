import axios from "axios";
import API_URL from "./config";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const getToken = async (username, password) => {
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);

  try {
    const response = await api.post("/token", params);
    console.log("Response:", response.data);
    console.log("Status:", response.status);
    if (response.status !== 200) {
      if (response.status === 401) {
        throw new Error("Invalid credentials");
      } else if (response.status === 500) {
        throw new Error("Server error");
      } else {
        throw new Error("Error fetching token");
      }
    }
    localStorage.setItem("access_token", response.data.access_token);

    return response.data;
  } catch (error) {
    console.error("Error fetching token:", error);
    throw error;
  }
};

const fetchOrders = async (token) => {
  try {
    const response = await api.get("/orders", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Response:", response.data);
    console.log("Status:", response.status);
    if (response.status !== 200) {
      throw new Error("Error fetching orders");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

export { getToken, fetchOrders };

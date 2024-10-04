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
    if (error.response && error.response.status === 401) {
      // Clear token from localStorage
      localStorage.removeItem("access_token");

      // Redirect to the login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const getToken = async (username, password) => {
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);

  try {
    const response = await api.post("/token", params);
    localStorage.setItem("access_token", response.data.access_token);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const fetchOrders = async (
  token,
  shippingDate,
  school,
  grade,
  letter,
  payed
) => {
  try {
    // Build query string dynamically based on the parameters provided
    let queryParams = [];

    if (shippingDate) queryParams.push(`shipping_date=${shippingDate}`);
    if (school) queryParams.push(`school=${school}`);
    if (grade) queryParams.push(`grade=${grade}`);
    if (letter) queryParams.push(`letter=${letter}`);
    if (payed !== null && payed !== undefined)
      queryParams.push(`payed=${payed}`);

    const queryString = queryParams.length ? `?${queryParams.join("&")}` : "";

    const response = await api.get(`/orders${queryString}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateOrderStatus = async (orderId, newStatus, token) => {
  try {
    const response = await api.patch(
      `/orders/${orderId}?status=${newStatus}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateProductAssembledStatus = async (productId, isAssembled, token) => {
  try {
    const response = await api.patch(
      `/products/${productId}?assemble=${isAssembled}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const sendEmail = async (email, subject, body, token) => {
  try {
    const response = await api.post(
      "/send-email",
      { email, subject, body },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export {
  getToken,
  fetchOrders,
  updateOrderStatus,
  updateProductAssembledStatus,
  sendEmail,
};

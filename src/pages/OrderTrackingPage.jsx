import React, { useState } from "react";
import axios from "axios";

const OrderTrackingPage = () => {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isError, setIsError] = useState(false);

  const statuses = {
    new: "Order Placed 🆕",
    paid: "Payment Received 💵",
    processing: "Processing Order 🔄",
    shipped: "Order Shipped 📦",
    delivered: "Delivered ✅",
    canceled: "Canceled ❌",
  };

  const handleTrackOrder = async () => {
    setLoading(true);
    setIsError(false);

    try {
      // API call to get order details by order ID
      const response = await axios.get(
        `http://localhost:8000/order-tracking/${orderId}`
      );

      setOrderDetails(response.data); // Set order details from API response
      setIsError(false);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setOrderDetails(null); // Reset order details if error
      setIsError(true); // Set error state to true if API call fails
    } finally {
      setLoading(false); // Stop loading animation
    }

    // Hide the error message after 5 seconds
    setTimeout(() => {
      setIsError(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <h1 className="text-4xl font-bold mb-8 text-indigo-700 text-center drop-shadow-lg">
        Track Your Order
      </h1>
      <div className="bg-white p-10 rounded-lg shadow-xl max-w-xl mx-auto transition-transform transform hover:-translate-y-1 duration-500">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          Enter your Order ID
        </h2>
        <input
          type="number"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Order ID"
          className="w-full p-4 border-2 border-blue-300 rounded-lg mb-6 bg-gradient-to-r from-indigo-50 to-white focus:outline-none focus:ring-4 focus:ring-indigo-300 shadow-lg hover:shadow-2xl transition-all duration-500 ease-in-out transform hover:-translate-y-1"
        />
        <button
          onClick={handleTrackOrder}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-4 px-6 rounded-lg hover:from-purple-600 hover:to-indigo-600 hover:shadow-lg transition-all duration-500 ease-in-out transform hover:-translate-y-1"
        >
          Track Order
        </button>
      </div>

      {/* Show loading spinner when fetching order */}
      {loading && (
        <div className="flex justify-center mt-6">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-blue-300 h-12 w-12"></div>
        </div>
      )}

      {/* Show order details if found */}
      {!loading && orderDetails && (
        <div className="mt-10 bg-white p-8 rounded-lg shadow-xl max-w-xl mx-auto transition-transform transform hover:-translate-y-1 duration-500">
          <h3 className="text-2xl font-bold mb-4 text-green-600 drop-shadow-md">
            Order Status
          </h3>
          <p className="text-lg mb-4">
            Status:{" "}
            <span className="font-semibold text-indigo-600">
              {statuses[orderDetails.status]}
            </span>
          </p>
          <p className="text-lg mb-4">
            Total Amount:{" "}
            <span className="font-semibold text-indigo-600">
              ${orderDetails.total_amount}
            </span>
          </p>

          {/* Display all status changes */}
          <h3 className="text-2xl font-bold mb-4">Status Changes</h3>
          <ul className="list-disc list-inside">
            {orderDetails.status_changes.map((change) => (
              <li key={change.id} className="mb-2">
                <span className="font-semibold">{statuses[change.status]}</span>{" "}
                - {new Date(change.created_at).toLocaleString()}
              </li>
            ))}
          </ul>
          <h3 className="text-2xl font-bold mb-4">Products</h3>
          <ul>
            {orderDetails.products.map((product, index) => (
              <li
                key={index}
                className="mb-4 bg-gray-50 p-4 rounded-lg shadow-md"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-lg">
                      {product.name}
                    </span>{" "}
                    <span className="text-sm text-gray-500">
                      ({product.sku})
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">Quantity: </span>
                    {product.quantity}
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">Price: </span>$
                    {product.price}
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">Amount: </span>$
                    {product.amount}
                  </div>
                </div>

                {/* Include options if they exist */}
                {product.options.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-indigo-600">Options:</h4>
                    <ul className="ml-4 mt-2 space-y-1">
                      {product.options.map((option) => (
                        <li
                          key={option.id}
                          className="bg-indigo-100 text-indigo-800 rounded-full px-3 py-1 text-sm font-medium inline-block"
                        >
                          {option.option_name}: {option.variant}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <p className="text-lg mt-4 text-gray-600">
            Do you have any questions? Contact us:{" "}
            <span className="text-indigo-500 font-bold">
              support@example.com
            </span>
          </p>
        </div>
      )}

      {/* Show error if no order found */}
      {!loading && isError && (
        <div className="mt-8 bg-red-100 p-6 rounded-lg shadow-xl max-w-md mx-auto text-red-700 animate-pulse">
          <p>No order found for ID: {orderId}</p>
        </div>
      )}
    </div>
  );
};

export default OrderTrackingPage;

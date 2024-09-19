import React, { useState } from "react";

const OrderTrackingPage = () => {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isError, setIsError] = useState(false);

  // Dummy order data for simulation
  const orders = {
    123: {
      status: "shipped",
      totalAmount: 70,
      products: [
        { name: "T-Shirt", quantity: 2, price: 20 },
        { name: "Shoes", quantity: 1, price: 30 },
      ],
    },
    456: {
      status: "delivered",
      totalAmount: 120,
      products: [
        { name: "Jacket", quantity: 1, price: 80 },
        { name: "Jeans", quantity: 2, price: 40 },
      ],
    },
    789: {
      status: "processing",
      totalAmount: 50,
      products: [
        { name: "Hat", quantity: 1, price: 15 },
        { name: "Gloves", quantity: 2, price: 35 },
      ],
    },
  };

  const statuses = {
    new: "Order Placed 🆕",
    paid: "Payment Received 💵",
    processing: "Processing Order 🔄",
    shipped: "Order Shipped 📦",
    delivered: "Delivered ✅",
    canceled: "Canceled ❌",
  };

  const handleTrackOrder = () => {
    setLoading(true);
    setTimeout(() => {
      // Simulate fetching data by order ID
      if (orders[orderId]) {
        setOrderDetails(orders[orderId]);
        setIsError(false);
      } else {
        setOrderDetails(null); // No order found
        setIsError(true);
      }
      setLoading(false);
    }, 2000); // Simulating a 2-second loading delay
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
              ${orderDetails.totalAmount}
            </span>
          </p>
          <h3 className="text-2xl font-bold mb-4">Products</h3>
          <ul>
            {orderDetails.products.map((product, index) => (
              <li key={index} className="mb-2">
                <span className="font-semibold">{product.name}</span> -{" "}
                {product.quantity} x ${product.price}
              </li>
            ))}
          </ul>
          <p className="text-lg mt-4 text-gray-600">
            Do you have any questions? Contact us:{" "}
            <span className="text-indigo-500 font-bold">
              bkimadieff@gmail.com
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

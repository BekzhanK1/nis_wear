import React, { useState, useEffect } from "react";
import {
  fetchOrders,
  sendEmail,
  updateOrderStatus,
  updateProductAssembledStatus,
} from "../utils/apiService";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import dayjs from "dayjs";

const OrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailBody, setEmailBody] = useState("");
  const [alert, setAlert] = useState(false);
  const [activeTab, setActiveTab] = useState("activeOrders"); // Tabs: closestOrders, nextOrders, previousOrders
  const statuses = [
    { name: "canceled", emoji: "❌" },
    { name: "new", emoji: "🆕" },
    { name: "paid", emoji: "💵" },
    { name: "processing", emoji: "🔄" },
    { name: "shipped", emoji: "📦" },
    { name: "delivered", emoji: "✅" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You must be logged in to view orders.");
      setIsLoading(false);
      return;
    }

    // Fetch orders based on the active tab
    const shippingDateMap = {
      activeOrders: "closest",
      nextShippingOrders: "next",
      previousOrders: "previous",
    };

    setIsLoading(true);
    fetchOrders(token, shippingDateMap[activeTab])
      .then((data) => {
        setOrders(data);
        setIsLoading(false);
      })
      .catch((error) => {
        setError("Error fetching orders");
        setIsLoading(false);
      });
  }, [activeTab]); // Refetch orders when activeTab changes

  const generateWhatsAppLink = (phone, orderId) => {
    const baseUrl = "https://wa.me/";
    const message = `Hi, your order id is ${orderId}, you can check it at http://38.107.234.128:3000/tracking`;
    const encodedMessage = encodeURIComponent(message);

    return `${baseUrl}${phone.replace(/\D/g, "")}?text=${encodedMessage}`;
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
  };

  const getNextShippingSunday = (currentDate) => {
    const startDate = dayjs("2024-01-07"); // Assume this is a known start date for shipping Sundays
    const today = dayjs(currentDate);

    const weeksSinceStart = today.diff(startDate, "week", true); // Get the number of weeks since the start date
    const isCurrentShippingWeek = Math.floor(weeksSinceStart) % 2 === 0;

    const nextShippingSunday = isCurrentShippingWeek
      ? today.add((7 - today.day()) % 7, "day") // This Sunday if it's shipping week
      : today.add((14 - today.day()) % 14, "day"); // The next Sunday in two weeks

    return nextShippingSunday;
  };

  const closestShippingDate = getNextShippingSunday(new Date());
  const nextShippingDate = closestShippingDate.add(2, "week");

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const newStatus = destination.droppableId;
    const token = localStorage.getItem("access_token");

    try {
      await updateOrderStatus(draggableId, newStatus, token);

      const updatedOrders = orders.map((order) =>
        order.order_id === draggableId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem("access_token");

    try {
      await updateOrderStatus(orderId, newStatus, token);

      const updatedOrders = orders.map((order) =>
        order.order_id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      setSelectedOrder(null); // Close modal
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleAssembleChange = async (productId, isAssembled) => {
    const token = localStorage.getItem("access_token");

    try {
      updateProductAssembledStatus(productId, isAssembled, token);

      const updatedOrders = orders.map((order) => {
        if (order.order_id === selectedOrder.order_id) {
          const updatedProducts = order.products.map((product) =>
            product.id === productId
              ? { ...product, is_assembled: isAssembled }
              : product
          );
          return { ...order, products: updatedProducts };
        }
        return order;
      });

      const updatedSelectedOrder = {
        ...selectedOrder,
        products: selectedOrder.products.map((product) =>
          product.id === productId
            ? { ...product, is_assembled: isAssembled }
            : product
        ),
      };

      setOrders(updatedOrders);
      setSelectedOrder(updatedSelectedOrder);
    } catch (error) {
      console.error("Error updating product assembly status:", error);
    }
  };

  if (isLoading) return <p>Loading orders...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-4 text-blue-700 text-center">
        Order Management
      </h1>

      {/* Tabs */}
      <div className="flex justify-center mb-4">
        <button
          className={`px-4 py-2 font-bold rounded-l-lg ${
            activeTab === "activeOrders"
              ? "bg-blue-500 text-white"
              : "bg-gray-300 text-gray-700"
          }`}
          onClick={() => setActiveTab("activeOrders")}
        >
          Active Orders {closestShippingDate.format("DD/MM/YYYY")}
        </button>
        <button
          className={`px-4 py-2 font-bold ${
            activeTab === "nextShippingOrders"
              ? "bg-blue-500 text-white"
              : "bg-gray-300 text-gray-700"
          }`}
          onClick={() => setActiveTab("nextShippingOrders")}
        >
          Next shipping orders {nextShippingDate.format("DD/MM/YYYY")}
        </button>
        <button
          className={`px-4 py-2 font-bold rounded-r-lg ${
            activeTab === "previousOrders"
              ? "bg-blue-500 text-white"
              : "bg-gray-300 text-gray-700"
          }`}
          onClick={() => setActiveTab("previousOrders")}
        >
          Previous Orders
        </button>
      </div>

      {/* Drag and Drop Context */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statuses.map((status) => (
            <Droppable droppableId={status.name} key={status.name}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-white p-4 rounded-lg shadow-md"
                >
                  <h2 className="text-xl font-bold mb-4 capitalize text-blue-500">
                    {status.emoji} {status.name} Orders
                  </h2>
                  {orders.filter((order) => order.status === status.name)
                    .length === 0 ? (
                    <p>No orders in this status.</p>
                  ) : (
                    <ul>
                      {orders
                        .filter((order) => order.status === status.name)
                        .map((order, index) => (
                          <Draggable
                            key={order.order_id}
                            draggableId={String(order.order_id)}
                            index={index}
                          >
                            {(provided) => (
                              <li
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                ref={provided.innerRef}
                                className="bg-gray-200 p-4 mb-2 rounded-lg shadow-sm cursor-pointer hover:bg-gray-300"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <p>
                                  <strong>Order ID:</strong> {order.order_id}
                                </p>
                                <p>
                                  <strong>Customer:</strong>{" "}
                                  {order.customer.name} ({order.customer.phone})
                                </p>
                                <p>
                                  <strong>Total Amount:</strong>{" "}
                                  {order.total_amount} KZT
                                </p>
                              </li>
                            )}
                          </Draggable>
                        ))}
                    </ul>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-10 rounded-lg shadow-lg max-w-3xl w-full">
            <h2 className="text-2xl font-bold mb-4">
              Order Details: {selectedOrder.order_id}
            </h2>
            <p className="text-lg">
              <strong>Customer:</strong> {selectedOrder.customer.name}
            </p>
            <p className="text-lg">
              <strong>Phone:</strong> {selectedOrder.customer.phone}
            </p>
            <p className="text-lg">
              <strong>Email:</strong> {selectedOrder.customer.email}
            </p>

            <p>
              <strong>Total Amount:</strong> {selectedOrder.total_amount} KZT
            </p>
            <p>
              <strong>Payment System:</strong> {selectedOrder.payment_system}
            </p>
            <h3 className="text-lg font-bold mt-4">Products</h3>
            <table className="table-auto w-full mb-4">
              <thead>
                <tr>
                  <th className="px-4 py-2">Product</th>
                  <th className="px-4 py-2">Price</th>
                  <th className="px-4 py-2">Quantity</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Assembled</th>
                  <th className="px-4 py-2">Options</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.products.map((product) => (
                  <tr key={product.id}>
                    <td className="border px-4 py-2">{product.name}</td>
                    <td className="border px-4 py-2">{product.price}</td>
                    <td className="border px-4 py-2">{product.quantity}</td>
                    <td className="border px-4 py-2">{product.amount}</td>
                    <td className="border px-4 py-2">
                      <input
                        type="checkbox"
                        checked={product.is_assembled}
                        onChange={(e) =>
                          handleAssembleChange(product.id, e.target.checked)
                        }
                      />
                    </td>
                    <td className="border px-4 py-2">
                      {product.options.length > 0
                        ? product.options.map((opt) => (
                            <div key={opt.id}>
                              {opt.option_name}: {opt.variant}
                            </div>
                          ))
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a
              href={generateWhatsAppLink(
                selectedOrder.customer.phone,
                selectedOrder.order_id
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              Send WhatsApp message
            </a>
            <h3 className="text-lg font-bold mt-4">Change Status</h3>
            <select
              value={selectedOrder.status}
              onChange={(e) =>
                handleStatusChange(selectedOrder.order_id, e.target.value)
              }
              className="w-full p-2 border border-blue-500 rounded-lg"
            >
              {statuses.map((status) => (
                <option key={status.name} value={status.name}>
                  {status.emoji} {status.name}
                </option>
              ))}
            </select>
            <button
              onClick={closeOrderModal}
              className="mt-4 mr-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600"
            >
              Close
            </button>
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="mt-4 mr-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 px-4 rounded-lg hover:from-yellow-600 hover:to-orange-600"
            >
              Send Email
            </button>
            <button
              onClick={() =>
                handleStatusChange(
                  selectedOrder.order_id,
                  statuses[
                    statuses.findIndex(
                      (status) => status.name === selectedOrder.status
                    ) + 1
                  ]?.name
                )
              }
              className={`mt-4 bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 px-4 rounded-lg hover:from-green-600 hover:to-blue-600 ${
                selectedOrder.status === statuses[statuses.length - 1].name ||
                selectedOrder.status === "canceled"
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={
                selectedOrder.status === statuses[statuses.length - 1].name ||
                selectedOrder.status === "canceled"
              }
            >
              {selectedOrder.status === statuses[statuses.length - 1].name ||
              selectedOrder.status === "canceled"
                ? "No further steps"
                : `Next step ➡️ ${
                    statuses[
                      statuses.findIndex(
                        (status) => status.name === selectedOrder.status
                      ) + 1
                    ]?.name
                  }`}
            </button>
            {alert && (
              <div
                className="p-4 mb-4 mt-4 text-sm text-green-400 rounded-lg bg-green-50 border border-green-200"
                role="alert"
              >
                <span className="font-medium">Email sent successfully to </span>{" "}
                <strong>{selectedOrder.customer.email}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Send Email</h2>

            <div className="mb-4">
              <label
                className="block text-gray-700 font-bold mb-2"
                htmlFor="to"
              >
                To:
              </label>
              <input
                id="to"
                type="text"
                className="w-full p-2 border rounded-lg"
                value={selectedOrder.customer.email}
                readOnly
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-gray-700 font-bold mb-2"
                htmlFor="subject"
              >
                Subject:
              </label>
              <input
                id="subject"
                type="text"
                className="w-full p-2 border rounded-lg"
                value={`nis-wear.kz(Order id: ${selectedOrder.order_id})`}
                readOnly
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-gray-700 font-bold mb-2"
                htmlFor="body"
              >
                Body:
              </label>
              <textarea
                id="body"
                className="w-full p-2 border rounded-lg"
                rows="4"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Write your message here..."
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="mr-4 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
              >
                Close
              </button>

              <button
                onClick={async () => {
                  try {
                    const response = sendEmail(
                      selectedOrder.customer.email,
                      `nis-wear.kz(Order id: ${selectedOrder.order_id})`,
                      emailBody,
                      localStorage.getItem("access_token")
                    );
                    console.log("Email sent:", response.data);
                  } catch (error) {
                    console.error("Error sending email:", error);
                  }

                  setAlert(true);
                  setIsEmailModalOpen(false);
                  setTimeout(() => {
                    setAlert(false);
                  }, 3000);
                }}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 px-4 rounded-lg hover:from-green-600 hover:to-blue-600"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagementPage;

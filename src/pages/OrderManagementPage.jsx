import React, { useState, useEffect } from "react";
import { fetchOrders } from "../utils/apiService";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import axios from "axios";

const OrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null); // For popup modal

  const statuses = [
    { name: "new", emoji: "🆕" },
    { name: "paid", emoji: "💵" },
    { name: "processing", emoji: "🔄" },
    { name: "shipped", emoji: "📦" },
    { name: "delivered", emoji: "✅" },
    { name: "canceled", emoji: "❌" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You must be logged in to view orders.");
      setIsLoading(false);
      return;
    }

    fetchOrders(token)
      .then((data) => {
        setOrders(data);
        setIsLoading(false);
      })
      .catch((error) => {
        setError("Error fetching orders");
        setIsLoading(false);
      });
  }, []);

  const generateWhatsAppLink = (phone, orderId) => {
    const baseUrl = "https://wa.me/";
    const message = `Hi, your order id is ${orderId}, you can check it at http://localhost:3000/tracking`;
    const encodedMessage = encodeURIComponent(message);

    // Generate the full WhatsApp link
    return `${baseUrl}${phone.replace(/\D/g, "")}?text=${encodedMessage}`;
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const newStatus = destination.droppableId;
    const token = localStorage.getItem("access_token");

    try {
      await axios.patch(
        `http://localhost:8000/orders/${draggableId}?status=${newStatus}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
      await axios.patch(
        `http://localhost:8000/orders/${orderId}?status=${newStatus}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedOrders = orders.map((order) =>
        order.order_id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      setSelectedOrder(null); // Close modal
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const groupOrdersByStatus = (status) => {
    return orders.filter((order) => order.status === status);
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
  };

  if (isLoading) return <p>Loading orders...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-blue-700">
        Order Management
      </h1>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-3 gap-4">
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
                  {groupOrdersByStatus(status.name).length === 0 ? (
                    <p>No orders in this status.</p>
                  ) : (
                    <ul>
                      {groupOrdersByStatus(status.name).map((order, index) => (
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
                              onClick={() => openOrderModal(order)}
                            >
                              <p>
                                <strong>Order ID:</strong> {order.order_id}
                              </p>
                              <p>
                                <strong>Customer:</strong> {order.customer.name}{" "}
                                ({order.customer.phone})
                              </p>
                              <p>
                                <strong>Total Amount:</strong>{" "}
                                {order.total_amount}
                              </p>
                              <p>
                                <strong>Payment System:</strong>{" "}
                                {order.payment_system}
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">
              Order Details: {selectedOrder.order_id}
            </h2>
            <p>
              <strong>Customer:</strong> {selectedOrder.customer.name} (
              {selectedOrder.customer.phone})
            </p>
            <p>
              <strong>Total Amount:</strong> {selectedOrder.total_amount}
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
                      {product.options.length > 0
                        ? product.options.map((opt) => (
                            <div key={opt.id}>
                              {opt.option_name}: {opt.variant}
                            </div>
                          ))
                        : "None"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a
              href={generateWhatsAppLink(
                "+7 (705) 723-8447",
                "202949518785578"
              )}
              target="_blank" // Open in a new tab
              rel="noopener noreferrer" // Security reasons
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
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagementPage;

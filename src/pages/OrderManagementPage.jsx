import React, { useState, useEffect } from "react";
import {
  fetchOrders,
  sendEmail,
  updateOrderStatus,
  updateProductAssembledStatus,
} from "../utils/apiService";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const OrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailBody, setEmailBody] = useState("");
  const [alert, setAlert] = useState(false);
  const [activeTab, setActiveTab] = useState("activeOrders"); // Tabs: closestOrders, nextOrders, previousOrders
  const [viewMode, setViewMode] = useState("kanban"); // View modes: kanban, table
  const [sortColumn, setSortColumn] = useState(null); // For sorting
  const [sortDirection, setSortDirection] = useState("asc"); // For sorting direction
  const statuses = [
    { name: "canceled", emoji: "❌" },
    { name: "new", emoji: "🆕" },
    { name: "paid", emoji: "💵" },
    { name: "processing", emoji: "🔄" },
    { name: "shipped", emoji: "📦" },
    { name: "delivered", emoji: "✅" },
  ];

  const schools = {
    1: "НИШ ФМН города Астана",
    2: "НИШ IB города Астана",
    3: "НИШ ФМН города Алматы",
    4: "НИШ ХБН города Алматы",
    5: "НИШ ХБН города Актау",
    6: "НИШ ФМН города Актобе",
    7: "НИШ ХБН города Атырау",
    8: "НИШ ХБН города Караганда",
    9: "НИШ ФМН города Кокшетау",
    10: "НИШ ФМН города Костанай",
    11: "НИШ ХБН города Кызылорда",
    12: "НИШ ХБН города Павлодар",
    13: "НИШ ХБН города Петропавловск",
    14: "НИШ ФМН города Семей",
    15: "НИШ ФМН города Талдыкорган",
    16: "НИШ ФМН города Тараз",
    17: "НИШ ХБН города Туркестан",
    18: "НИШ ФМН города Уральск",
    19: "НИШ ХБН города Усть-Каменогорск",
    20: "НИШ ФМН города Шымкент",
    21: "НИШ ХБН города Шымкент",
  };

  const grades = ["7", "8", "9", "10", "11", "12"];
  const letters = ["A", "B", "C", "D", "E", "F", "G"];

  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("");
  const [isPayed, setIsPayed] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You must be logged in to view orders.");
      navigate("/login");
      return;
    }

    // Fetch orders based on the active tab and filters
    const shippingDateMap = {
      activeOrders: "closest",
      nextShippingOrders: "next",
      previousOrders: "previous",
    };

    setIsLoading(true);
    fetchOrders(
      token,
      shippingDateMap[activeTab],
      selectedSchool,
      selectedGrade,
      selectedLetter,
      isPayed
    )
      .then((data) => {
        setOrders(data);
        setIsLoading(false);
      })
      .catch((error) => {
        setError("Error fetching orders");
        setIsLoading(false);
      });
  }, [activeTab, selectedSchool, selectedGrade, selectedLetter, isPayed]); // Refetch orders when activeTab changes

  const generateWhatsAppLink = (phone, orderId) => {
    const baseUrl = "https://wa.me/";
    const message = `Hi, your order id is ${orderId}, you can check it at http://38.107.234.128:3000/tracking`;
    const encodedMessage = encodeURIComponent(message);

    return `${baseUrl}${phone.replace(/\D/g, "")}?text=${encodedMessage}`;
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
  };
  const handleSort = (column) => {
    const newDirection =
      sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortDirection(newDirection);

    const sortedOrders = [...orders].sort((a, b) => {
      if (a[column] < b[column]) {
        return newDirection === "asc" ? -1 : 1;
      }
      if (a[column] > b[column]) {
        return newDirection === "asc" ? 1 : -1;
      }
      return 0;
    });

    setOrders(sortedOrders);
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

  const handleViewToggle = () => {
    setViewMode(viewMode === "kanban" ? "table" : "kanban");
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

      {/* Filters */}
      <div className="mb-4">
        {/* School Select */}
        <select
          className="border p-2 rounded-lg"
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
        >
          <option value="">Select School</option>
          {Object.keys(schools).map((id) => (
            <option key={id} value={id}>
              {schools[id]}
            </option>
          ))}
        </select>

        {/* Grade Select */}
        <select
          className="border p-2 rounded-lg ml-2"
          value={selectedGrade}
          onChange={(e) => {
            setSelectedGrade(e.target.value);
            setSelectedLetter(""); // Reset letter when grade changes
          }}
        >
          <option value="">Select Grade</option>
          {grades.map((grade) => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>

        {/* Letter Select */}
        <select
          className="border p-2 rounded-lg ml-2"
          value={selectedLetter}
          onChange={(e) => setSelectedLetter(e.target.value)}
          disabled={!selectedGrade}
        >
          <option value="">Select Letter</option>
          {letters.map((letter) => (
            <option key={letter} value={letter}>
              {letter}
            </option>
          ))}
        </select>

        {/* Payed Checkbox */}
        <label className="ml-4">
          <input
            type="checkbox"
            checked={isPayed === true}
            onChange={() => setIsPayed((prev) => (prev === true ? null : true))}
          />
          Payed
        </label>
        <label className="ml-4">
          <input
            type="checkbox"
            checked={isPayed === false}
            onChange={() =>
              setIsPayed((prev) => (prev === false ? null : false))
            }
          />
          Unpaid
        </label>
      </div>

      <div className="mb-4 text-center">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          onClick={handleViewToggle}
        >
          Switch to {viewMode === "kanban" ? "Table View" : "Kanban View"}
        </button>
      </div>

      {viewMode === "kanban" ? (
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
                                    {order.customer.name} (
                                    {order.customer.phone})
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
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full bg-white rounded-lg shadow-md">
            <thead>
              <tr>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => handleSort("order_id")}
                >
                  Order ID{" "}
                  {sortColumn === "order_id"
                    ? sortDirection === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => handleSort("customer.name")}
                >
                  Customer Name{" "}
                  {sortColumn === "customer.name"
                    ? sortDirection === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => handleSort("school")}
                >
                  School{" "}
                  {sortColumn === "school"
                    ? sortDirection === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => handleSort("grade")}
                >
                  Grade{" "}
                  {sortColumn === "grade"
                    ? sortDirection === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => handleSort("letter")}
                >
                  Letter{" "}
                  {sortColumn === "letter"
                    ? sortDirection === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  Status{" "}
                  {sortColumn === "status"
                    ? sortDirection === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => handleSort("total_amount")}
                >
                  Total Amount{" "}
                  {sortColumn === "total_amount"
                    ? sortDirection === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No orders available.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.order_id} className="text-center">
                    <td className="border px-4 py-2">{order.order_id}</td>
                    <td className="border px-4 py-2">{order.customer.name}</td>
                    <td className="border px-4 py-2">{order.school}</td>
                    <td className="border px-4 py-2">{order.grade}</td>
                    <td className="border px-4 py-2">{order.letter}</td>
                    <td className="border px-4 py-2">{order.status}</td>
                    <td className="border px-4 py-2">
                      {order.total_amount} KZT
                    </td>
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-2 py-1 bg-blue-500 text-white rounded"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

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

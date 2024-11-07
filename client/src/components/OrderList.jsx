import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Card, Badge, Select, Toast, Pagination } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import {
  cancelOrderItem,
  fetchOrders,
  returnOrderItem,
  updateOrderStatus,
} from "../redux/order/orderSlice";

const OrderList = () => {
  const dispatch = useDispatch();

  const { currentUser } = useSelector((state) => state.user);
  const { orders, isLoading, error } = useSelector((state) => state.order);
  const [showModal, setShowModal] = useState(false);
  const [cancelledOrderId, setCancelledOrderId] = useState("");
  const [cancelledItemId, setCancelledItemId] = useState("");
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchOrders());
      console.log("orders", orders);
    }
  }, [dispatch, currentUser]);

  // Handle cancellation modal
  const handleCancel = (orderId, itemId) => {
    setCancelledOrderId(orderId);
    setCancelledItemId(itemId);
    setShowModal(true);
  };

  const handleConfirmCancel = async () => {
    try {
      await dispatch(
        cancelOrderItem({
          orderId: cancelledOrderId,
          itemId: cancelledItemId,
          cancelReason,
        })
      );
      setShowModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleReturn = (orderId, itemId) => {
    setCancelledOrderId(orderId);
    setCancelledItemId(itemId);
    setShowReturnModal(true);
  };

  const handleConfirmReturn = async () => {
    try {
      const response = await dispatch(
        returnOrderItem({
          orderId: cancelledOrderId,
          itemId: cancelledItemId,
          returnReason,
        })
      );
      console.log(response);
      setShowReturnModal(false); // Show a success message or toast
      // Toast.success(
      //   `Refund of ₹${response.payload.refundAmount} processed successfully`
      // );
    } catch (error) {
      console.error(error);
      // Show an error message or toast
      // Toast.error("Failed to process return");
    }
  };

  // Handle order status update for admins
  const handleStatusChange = (orderId, itemId, newStatus) => {
    dispatch(updateOrderStatus({ orderId, itemId, newStatus }));
  };

  // Sorting orders by most recent first
  console.log("Orders:", orders);
  const sortedOrders = [...(orders || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Filtering orders by status
  const filteredOrders = sortedOrders.filter((order) => {
    if (filterStatus === "All") {
      return true; // Show all orders
    }
    return order.orderSummary.status === filterStatus; // Show orders that match the selected status
  });

  // Pagination logic
  const totalOrders = filteredOrders.length;
  const totalPages = Math.ceil(totalOrders / ordersPerPage);

  // Get current orders
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  const handleOrderClick = (orderId) => {
    navigate(`/order/${orderId}`);
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); // Scroll to the top of the page
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Page Header */}
      <Card className="mb-8 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Orders</h2>
            <p className="text-sm text-gray-500">
              Overview of your order history
            </p>
          </div>

          {/* Filter Dropdown */}
          {/* <div>
            <Select
              onChange={(e) => setFilterStatus(e.target.value)} // Update filter status
              value={filterStatus}
              className="block w-full text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm"
            >
              <option value="All">All Orders</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
            </Select>
          </div> */}
          {/* <div className="text-right">
            <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
            <Badge color="success" className="mt-2">
              Total Orders
            </Badge>
          </div> */}
        </div>
      </Card>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-6">
          {currentOrders.map((order) => (
            <Card key={order._id} className="shadow-lg">
              {/* Order Header */}
              <div
                className="flex justify-between items-center mb-4"
                onClick={() => handleOrderClick(order._id)}
              >
                <div>
                  <Badge color="info" size="lg" className="text-lg">
                    Order No: {order.orderNumber}
                  </Badge>
                  <p className="text-gray-600 mt-2">
                    Total: ₹{order.orderSummary.total.toFixed(2)}
                  </p>
                  <p className="text-gray-500 mt-1">
                    Ordered on: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb">Payment Status</p>
                  <Badge
                    color={
                      order.paymentStatus === "success"
                        ? "success"
                        : order.paymentStatus === "pending"
                        ? "info"
                        : "warning"
                    }
                  >
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>

              {/* Books in the Order */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {order.cartItems.map((item) => (
                  <Card key={item._id} className="shadow-md">
                    <div className="flex gap-4 items-center">
                      <img
                        src={item.images[0]}
                        alt={item.book}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {item.book}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm text-gray-500">
                          Price: ₹{item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Status and Cancel Action */}
                    <div className="flex justify-between items-center mt-4">
                      <div>
                        {currentUser.isAdmin ? (
                          <select
                            value={item.status}
                            onChange={(e) => {
                              handleStatusChange(
                                order._id,
                                item._id,
                                e.target.value
                              );
                              e.stopPropagation(); // Prevent click from bubbling up
                            }}
                            className="block w-full text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        ) : (
                          <Badge
                            color={
                              item.status === "delivered"
                                ? "success"
                                : item.status === "cancelled"
                                ? "failure"
                                : "warning"
                            }
                          >
                            {item.status}
                          </Badge>
                        )}
                      </div>
                      <div>
                        {item.status !== "cancelled" &&
                          item.status !== "delivered" &&
                          item.status !== "returned" && (
                            <Button
                              color="failure"
                              size="xs"
                              onClick={(e) => {
                                handleCancel(order._id, item._id);
                                e.stopPropagation(); // Prevent click from bubbling up
                              }}
                            >
                              Cancel
                            </Button>
                          )}
                        {item.status === "delivered" &&
                          !currentUser.isAdmin && (
                            <Button
                              color="failure"
                              size="xs"
                              onClick={(e) => {
                                handleReturn(order._id, item._id);
                                e.stopPropagation(); // Prevent click from bubbling up
                              }}
                            >
                              Return
                            </Button>
                          )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          ))}
          {/* Pagination Controls */}
          <div className="flex justify-center mt-4">
            <Pagination
              currentPage={currentPage}
              onPageChange={handlePageChange}
              showIcons={true}
              totalPages={totalPages}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="text-red-500 mt-4">
          <HiOutlineExclamationCircle className="inline-block mr-2" />
          {error}
        </div>
      )}

      {/* Cancel Order Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>Cancel Order Item</Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to cancel this order item?</p>
          <p>Reason for cancellation:</p>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Enter reason for cancellation"
            className="w-full p-2 mt-2 border border-gray-300 rounded-md"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleConfirmCancel} color="failure">
            Confirm Cancel
          </Button>
          <Button onClick={() => setShowModal(false)} color="gray">
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showReturnModal} onClose={() => setShowReturnModal(false)}>
        <Modal.Header>Return Order Item</Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to return this order item?</p>
          <p>Reason for return:</p>
          <textarea
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            placeholder="Enter reason for return"
            className="w-full p-2 mt-2 border border-gray-300 rounded-md"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleConfirmReturn} color="warning">
            Confirm Return
          </Button>
          <Button onClick={() => setShowReturnModal(false)} color="gray">
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderList;

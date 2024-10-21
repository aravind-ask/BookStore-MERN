import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Card, Badge, Select } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import {
  cancelOrderItem,
  fetchOrders,
  updateOrderStatus,
} from "../redux/order/orderSlice";

const OrderList = () => {
  const dispatch = useDispatch();

  const { currentUser } = useSelector((state) => state.user);
  const { orders, isLoading, error } = useSelector((state) => state.order);

  const [showModal, setShowModal] = useState(false);
  const [cancelledOrderId, setCancelledOrderId] = useState("");
  const [cancelledItemId, setCancelledItemId] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchOrders(currentUser._id));
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

  // Handle order status update for admins
  const handleStatusChange = (orderId, itemId, newStatus) => {
    dispatch(updateOrderStatus({ orderId, itemId, newStatus }));
  };

  // Sorting orders by most recent first
  const sortedOrders = [...(orders || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Filtering orders by status
  const filteredOrders = sortedOrders.filter((order) =>
    filterStatus === "All" ? true : order.orderSummary.status === filterStatus
  );

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
          <div>
            <Select
              onChange={(e) => setFilterStatus(e.target.value)}
              value={filterStatus}
              className="block w-full text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm"
            >
              <option value="All">All Orders</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
            </Select>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
            <Badge color="success" className="mt-2">
              Total Orders
            </Badge>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <Card key={order._id} className="shadow-lg">
              {/* Order Header */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <Badge color="info" size="lg" className="text-lg">
                    Order No: {order.orderNumber}
                  </Badge>
                  <p className="text-gray-600 mt-2">
                    Total: ${order.orderSummary.total.toFixed(2)}
                  </p>
                </div>
                <div>
                  <Badge color="info">{order.orderSummary.status}</Badge>
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
                          Price: ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Status and Cancel Action */}
                    <div className="flex justify-between items-center mt-4">
                      <div>
                        {currentUser.isAdmin ? (
                          <select
                            value={item.status}
                            onChange={(e) =>
                              handleStatusChange(
                                order._id,
                                item._id,
                                e.target.value
                              )
                            }
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
                        {item.status !== "cancelled" && (
                          <Button
                            color="failure"
                            size="xs"
                            onClick={() => handleCancel(order._id, item._id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          ))}
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
    </div>
  );
};

export default OrderList;

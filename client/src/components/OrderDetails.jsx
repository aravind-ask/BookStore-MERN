import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { updateOrderStatus, cancelOrder } from "../redux/order/orderSlice";

const OrderDetails = ({ orderId }) => {
  const { orders } = useSelector((state) => state.order);
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const order = orders.find((order) => order._id === orderId);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [status, setStatus] = useState(order.status);

  const handleCancelOrder = () => {
    dispatch(cancelOrder(orderId));
  };

  const handleUpdateStatus = (newStatus) => {
    dispatch(updateOrderStatus({ orderId, newStatus }));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pt-6">
      <h2 className="text-2xl font-bold mb-4">Order Details</h2>
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-bold">Order ID:</h3>
          <p>{order._id}</p>
        </div>
        <div>
          <h3 className="text-lg font-bold">Order Date:</h3>
          <p>{order.createdAt}</p>
        </div>
        <div>
          <h3 className="text-lg font-bold">Status:</h3>
          {currentUser.isAdmin ? (
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          ) : (
            <p>{order.status}</p>
          )}
          {currentUser.isAdmin && (
            <button
              className="btn btn-primary mt-2"
              onClick={() => handleUpdateStatus(status)}
            >
              Update Status
            </button>
          )}
        </div>
        <div>
          <h3 className="text-lg font-bold">Order Items:</h3>
          <ul>
            {order.cartItems.map((item, index) => (
              <li key={index}>
                <Link to={`/book/${item.bookId}`}>
                  {item.bookTitle} by {item.author} (x{item.quantity}) - $
                  {item.price}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-bold">Total:</h3>
          <p>${order.total}</p>
        </div>
        <div>
          <button
            className="btn btn-error"
            onClick={() => setShowCancelModal(true)}
          >
            Cancel Order
          </button>
        </div>
      </div>
      {showCancelModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              Are you sure you want to cancel this order?
            </h3>
            <div className="modal-action">
              <button className="btn btn-error" onClick={handleCancelOrder}>
                Yes, Cancel Order
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowCancelModal(false)}
              >
                No, Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;

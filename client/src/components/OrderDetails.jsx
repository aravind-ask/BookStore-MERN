import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Badge, Card, Button, Spinner, Alert, Modal } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import {
  cancelOrderItem,
  fetchOrderDetails,
  returnOrderItem,
} from "../redux/order/orderSlice";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

const OrderDetails = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const { orderDetails, isLoading, error } = useSelector(
    (state) => state.order
  );

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [cancelledOrderId, setCancelledOrderId] = useState("");
  const [cancelledItemId, setCancelledItemId] = useState("");
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function loadOrderDetails() {
      try {
        await dispatch(fetchOrderDetails(orderId));
        setLoading(false);
        console.log(orderDetails);
      } catch (err) {
        setErrorMessage("Failed to load order details.");
        setLoading(false);
      }
    }
    loadOrderDetails();
  }, [dispatch, orderId]);

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await axios.get(`/api/order/${orderId}/invoice`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading the invoice", error);
    }
  };

  const handleCompletePayment = async () => {
    try {
      const response = await axios.get(
        `/api/order/${orderId}/razorpay-payment-details`
      );
      const { order, key } = response.data;

      const options = {
        key,
        amount: order.amount,
        currency: "INR",
        name: "Book Store",
        description: `Order #${order.receipt}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyResponse = await axios.post(
              "/api/order/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                items: orderDetails.cartItems,
              }
            );
            toast.success("Payment completed successfully!");
            await dispatch(fetchOrderDetails(orderId));
          } catch (error) {
            toast.error("Payment verification failed.");
            console.error("Error verifying payment:", error);
          }
        },
        prefill: {
          name: currentUser.name,
          email: currentUser.email,
          contact: orderDetails.addressId.phone,
        },
        theme: { color: "#3399cc" },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      toast.error("Error initiating Razorpay payment.");
      console.error("Error:", error);
    }
  };

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
      await dispatch(fetchOrderDetails(orderId));
      toast.success("Order item cancelled successfully!");
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
      await dispatch(
        returnOrderItem({
          orderId: cancelledOrderId,
          itemId: cancelledItemId,
          returnReason,
        })
      );
      toast.success("Order item returned successfully!");
      await dispatch(fetchOrderDetails(orderId));
      setShowReturnModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error || errorMessage) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Alert color="failure" icon={HiOutlineExclamationCircle}>
          {errorMessage || "An error occurred while loading order details."}
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <ToastContainer />
      <Card className="mb-8 p-6 rounded-xl shadow-lg bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Order #{orderDetails?.orderNumber}
          </h2>
          <Badge
            color={
              orderDetails?.paymentStatus === "success"
                ? "success"
                : orderDetails?.paymentStatus === "pending"
                ? "warning"
                : "failure"
            }
          >
            {orderDetails?.paymentStatus}
          </Badge>
          {orderDetails?.paymentMethod === "Razorpay" &&
           ( orderDetails?.paymentStatus === "pending" ||
            orderDetails?.paymentStatus === "failed") && (
              <Button
                color="success"
                onClick={handleCompletePayment}
                className="mb-6"
              >
                Complete Payment
              </Button>
            )}
        </div>
        <p className="text-sm text-gray-500">
          Placed on: {new Date(orderDetails?.createdAt).toLocaleDateString()}
        </p>
        {orderDetails?.paymentStatus === "success" && (
          <Button
            color="gray"
            onClick={() => handleDownloadInvoice(orderId)}
            className="mt-4 w-full"
          >
            Download Invoice
          </Button>
        )}
        <Button color="gray" onClick={() => navigate("/dashboard?tab=orders")}>
          Back to Orders
        </Button>
      </Card>

      <div className="space-y-6">
        <Card className="p-6 rounded-xl shadow-md bg-white">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Items Ordered
          </h3>
          <div className="space-y-4">
            {orderDetails?.cartItems?.map((item) => (
              <Card
                key={item._id}
                className="flex flex-row md:flex-row items-center gap-4 p-4 rounded-lg shadow-md bg-gray-50"
              >
                <div className="flex items-center justify-evenly md:items-start gap-4">
                  {/* Image Section */}
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-md shadow-sm"
                  />

                  {/* Book Details and Status */}
                  <div className="flex-grow flex flex-col space-y-1">
                    <h4 className="text-lg font-semibold text-gray-700">
                      {item.book}
                    </h4>
                    {/* <p className="text-sm text-gray-500">Author: {item.author}</p> */}
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                    <Badge
                      color={
                        item.status === "delivered"
                          ? "success"
                          : item.status === "pending"
                          ? "warning"
                          : "failure"
                      }
                    >
                      {item.status.charAt(0).toUpperCase() +
                        item.status.slice(1)}
                    </Badge>
                  </div>

                  {/* Price Details */}
                  <div className="flex flex-col items-end text-right">
                    <p className="text-lg font-bold text-gray-800">
                      ₹{item.price.toFixed(2)}
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      Total: ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  {orderDetails.paymentStatus !== "failed" && (
                    <div className="flex flex-col md:flex-row items-center gap-2 mt-2 md:mt-0">
                      {item?.status !== "cancelled" && (
                        <Button
                          color="failure"
                          onClick={() =>
                            handleCancel(orderDetails?._id, item._id)
                          }
                          size="sm"
                        >
                          Cancel
                        </Button>
                      )}
                      {item?.status === "delivered" && (
                        <Button
                          color="warning"
                          onClick={() =>
                            handleReturn(orderDetails?._id, item._id)
                          }
                          size="sm"
                        >
                          Return
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </Card>

        <Card className="p-6 rounded-xl shadow-md bg-white">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Order Summary
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{orderDetails?.orderSummary?.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (8%)</span>
              <span>₹{orderDetails?.orderSummary?.tax?.toFixed(2)}</span>
            </div>
            {orderDetails?.orderSummary?.discount > 0 && (
              <div className="flex justify-between text-green-500">
                <span>Discount</span>
                <span>
                  - ₹{orderDetails?.orderSummary?.discount?.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-gray-700">
              <span>Total</span>
              <span>₹{orderDetails?.orderSummary?.total?.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-xl shadow-md bg-white">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Shipping Address
          </h3>
          <div className="space-y-2 text-gray-600">
            <p>{orderDetails?.addressId?.name || "N/A"}</p>
            <p>
              {orderDetails?.addressId?.address || "N/A"},{" "}
              {orderDetails?.addressId?.city || "N/A"},{" "}
              {orderDetails?.addressId?.state || "N/A"}{" "}
              {orderDetails?.addressId?.pinCode || "N/A"}
            </p>
            <p>Phone: {orderDetails?.addressId?.phone || "N/A"}</p>
          </div>
        </Card>
      </div>

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

export default OrderDetails;

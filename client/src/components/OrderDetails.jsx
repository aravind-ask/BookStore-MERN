import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Badge, Card, Button, Spinner, Alert } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { fetchOrderDetails } from "../redux/order/orderSlice"; // Assuming you have a slice to fetch order details
import { toast, ToastContainer } from "react-toastify";

const OrderDetails = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { orderDetails, isLoading, error } = useSelector(
    (state) => state.order
  );
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadOrderDetails() {
      try {
        await dispatch(fetchOrderDetails(orderId));
        setLoading(false);
      } catch (err) {
        setErrorMessage("Failed to load order details.");
        setLoading(false);
      }
    }
    loadOrderDetails();
    console.log(orderDetails)
  }, [dispatch, orderId]);

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
    <div className="max-w-4xl mx-auto p-4">
      <ToastContainer />
      <Card className="mb-8 shadow-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
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
        </div>
        <p className="text-sm text-gray-500">
          Placed on: {new Date(orderDetails?.createdAt).toLocaleDateString()}
        </p>
      </Card>

      <div className="space-y-6">
        {/* Items Ordered */}
        <Card className="p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-4">Items Ordered</h3>
          <div className="space-y-4">
            {orderDetails?.cartItems?.map((item) => (
              <Card
                key={item._id}
                className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0"
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="text-lg font-bold">{item.book}</h4>
                    <p className="text-sm text-gray-500">
                      Author: {item.author}
                    </p>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center w-full">
                  <p className="text-lg font-bold">${item.price.toFixed(2)}</p>
                  <p className="text-lg font-bold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Order Summary */}
        <Card className="p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>
                $
                {orderDetails?.orderSummary?.subtotal
                  ? orderDetails.orderSummary.subtotal.toFixed(2)
                  : "0.00"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8%)</span>
              <span>
                $
                {orderDetails?.orderSummary?.tax
                  ? orderDetails.orderSummary.tax.toFixed(2)
                  : "0.00"}
              </span>
            </div>
            {orderDetails?.orderSummary?.discount > 0 && (
              <div className="flex justify-between text-green-500">
                <span>Discount</span>
                <span>
                  - $
                  {orderDetails?.orderSummary?.discount
                    ? orderDetails.orderSummary.discount.toFixed(2)
                    : "0.00"}
                </span>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>
                $
                {orderDetails?.orderSummary?.total
                  ? orderDetails.orderSummary.total.toFixed(2)
                  : "0.00"}
              </span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Razorpay Payment ID</span>
              <span>
                {orderDetails?.paymentMethod === "Razorpay" && (
                  <span>{orderDetails.razorpayOrderId}</span>
                )}
              </span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Payment Method</span>
              <span>{orderDetails?.paymentMethod}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Payment Status</span>
              <span>{orderDetails?.paymentStatus}</span>
            </div>
          </div>
        </Card>

        {/* Shipping Address */}
        <Card className="p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-4">Shipping Address</h3>
          <div className="space-y-2">
            <p>{orderDetails?.addressId?.name || "N/A"}</p>
            <p>
              {orderDetails?.addressId?.address || "N/A"},{" "}
              {orderDetails?.addressId?.city || "N/A"}{" "}
              {orderDetails?.addressId?.state || "N/A"}{" "}
              {orderDetails?.addressId?.pinCode || "N/A"}
            </p>
            <p>Phone: {orderDetails?.addressId?.phone || "N/A"}</p>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4 mt-6">
          {orderDetails?.orderSummary?.status !== "cancelled" && (
            <Button
              color="failure"
              onClick={() =>
                toast.error("Order cancellation is not implemented yet.")
              }
            >
              Cancel Order
            </Button>
          )}
          {orderDetails?.orderSummary?.status === "delivered" && (
            <Button
              color="warning"
              onClick={() =>
                toast.success("Return process is not implemented yet.")
              }
            >
              Return Order
            </Button>
          )}
          <Button
            color="gray"
            onClick={() => navigate("/dashboard?tab=orders")}
          >
            Back to Orders
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

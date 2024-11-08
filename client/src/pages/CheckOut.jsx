import React from "react";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarker,
  faCreditCard,
  faMoneyBill,
} from "@fortawesome/free-solid-svg-icons";
import {
  addNewAddress,
  editAddress,
  fetchAddress,
} from "../redux/address/addressSlice";
import { useLocation } from "react-router-dom";
import { CartItems } from "../components/CartItems";
import { Button, Card, Modal } from "flowbite-react";
import { AiOutlineEdit } from "react-icons/ai";
import { clearCart } from "../redux/cart/cartSlice";
import { createNewOrder } from "../redux/order/orderSlice";
import { toast } from "react-toastify";

const CheckoutPage = () => {
  const location = useLocation();
  const cartItems = location.state?.cartItems;
  console.log("cart: ", cartItems);

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [orderSummary, setOrderSummary] = useState({});
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const { currentUser } = useSelector((state) => state.user);
  const { addressList } = useSelector((state) => state.address);
  console.log(addressList);
  const [newAddress, setNewAddress] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    phone: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState({});
  const [error, setError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [paymentStart, setPayamentStart] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false); // State for tooltip visibility
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState("");
  // const [paymentSuccessful, setPaymentSuccessful] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [availableCoupons, setAvailableCoupons] = useState([]);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await axios.get("/api/coupon"); // Adjust the endpoint as necessary
        setAvailableCoupons(response.data);
        console.log("c:", response.data);
      } catch (error) {
        console.error("Error fetching coupons:", error);
      }
    };

    fetchCoupons();
  }, []);

  useEffect(() => {
    dispatch(fetchAddress(currentUser._id));
  }, [dispatch, currentUser]);

  const handleAddressChange = (address) => {
    setSelectedAddress(address);
    console.log(selectedAddress);
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    console.log(paymentMethod);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const handlePlaceOrder = async () => {
    const orderData = {
      cartItems,
      selectedAddress,
      paymentMethod,
      orderSummary,
    };
    console.log("Order Data", orderData);

    if (!selectedAddress) {
      setError("Please select a shipping address.");
      return;
    }

    if (!paymentMethod) {
      setError("Please select a payment method.");
      return;
    }
    setError("");

    try {
      const response = await dispatch(createNewOrder(orderData));
      if (response.error) {
        setError(response.error.message);
        return;
      }
      console.log("res", response.payload);
      setOrderId(response.payload.orderId);

      if (paymentMethod === "Razorpay") {
        if (typeof window.Razorpay === "undefined") {
          await loadRazorpayScript();
        }

        if (typeof window.Razorpay === "undefined") {
          setError("Razorpay SDK failed to load");
          return;
        }

        const options = {
          key: response.payload.key,
          amount: response.payload.order.amount,
          currency: "INR",
          name: "Book Store",
          description: "Book Store Order",
          image: "https://example.com/logo.png",
          order_id: response.payload.order.id,
          handler: async function (response) {
            try {
              const verifyResponse = await axios.post(
                "/api/order/verify-payment",
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  items: orderData.cartItems.items,
                  orderNo: orderData.orderNumber,
                }
              );

              if (
                verifyResponse.data.message === "Payment verified successfully"
              ) {
                setShowConfirmationModal(true);
                dispatch(clearCart(currentUser._id));
              } else if (verifyResponse.status === 400) {
                setPaymentErrorMessage(verifyResponse.data.message);
                setPaymentFailed(true);
              }
            } catch (error) {
              console.error("Payment verification error:", error);
              setPaymentErrorMessage(error.message);
              setPaymentFailed(true);
            }
          },
          prefill: {
            name: currentUser.name,
            email: currentUser.email,
            contact: selectedAddress.phone,
          },
          theme: {
            color: "#3399cc",
          },
          // onClose handler to mark payment as failed and redirect
          modal: {
            ondismiss: async () => {
              await axios.post("/api/order/mark-payment-failed", {
                orderId: response.payload.order.id,
              });
              toast.error("Payment failed. Redirecting to order details...");
              navigate(`/order/${response.payload.orderId}`);
            },
          },
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();
      } else if (paymentMethod === "COD") {
        dispatch(clearCart(currentUser._id));
        setOrderId(response.payload.orderNo);
        setShowConfirmationModal(true);
      }
    } catch (error) {
      console.error(error);
      setError("Error placing order");
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    console.log(orderId);
    try {
      const response = await axios.get(`/api/order/${orderId}/invoice`, {
        responseType: "blob",
      });

      console.log("res ", response);

      // Create a URL for the PDF blob and open/download it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      link.remove();
    } catch (error) {
      console.error("Error downloading the invoice", error);
    }
  };

  const handleAddNewAddress = async () => {
    if (
      !newAddress.name ||
      !newAddress.address ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.pinCode ||
      !newAddress.phone
    ) {
      setAddressError("Please fill in all fields.");
      return;
    }
    setAddressError("");
    try {
      await dispatch(addNewAddress(newAddress));
      setNewAddress({
        name: "",
        address: "",
        city: "",
        state: "",
        pinCode: "",
        phone: "",
      });
      setShowModal(false);
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleEditAddress = async () => {
    if (
      !addressToEdit.name ||
      !addressToEdit.address ||
      !addressToEdit.city ||
      !addressToEdit.state ||
      !addressToEdit.pinCode ||
      !addressToEdit.phone
    ) {
      setAddressError("Please fill in all fields.");
      return; // Exit the function if validation fails
    }
    setAddressError("");
    try {
      console.log("edit:", addressToEdit._id);
      console.log("Addressedit:", addressToEdit);
      await dispatch(
        editAddress({
          userId: currentUser._id,
          addressId: addressToEdit._id,
          formData: addressToEdit,
        })
      );
      setNewAddress({
        name: "",
        address: "",
        city: "",
        state: "",
        pinCode: "",
        phone: "",
      });
      dispatch(fetchAddress(currentUser._id));
      setShowEditModal(false);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    if (cartItems && cartItems.items) {
      const subtotal = cartItems.items.reduce(
        (sum, item) =>
          sum + item.price * (item.quantity > 0 ? item.quantity : 1),
        0
      );
      const offerPrice = cartItems.items.reduce(
        (sum, item) =>
          sum + item.discountedPrice * (item.quantity > 0 ? item.quantity : 1),
        0
      );
      let finalAmount = offerPrice;
      if (discountAmount) {
        finalAmount -= discountAmount;
      }
      const totalDiscount = subtotal - finalAmount;
      setOrderSummary({
        subtotal,
        offerPrice,
        totalDiscount,
        total: finalAmount,
        discount: discountAmount,
        coupon: couponCode,
      });
    }
  }, [cartItems, discountAmount]);

  const applyCoupon = async () => {
    try {
      const response = await axios.post("/api/order/apply-coupon", {
        couponCode,
        totalAmount: orderSummary.total,
      });
      if (response.data.discountAmount) {
        setDiscountAmount(response.data.discountAmount);
        setCouponError("");
      } else {
        setDiscountAmount(0);
        setCouponError(response.error.message);
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      setCouponError("Error applying coupon.");
    }
  };

  if (!cartItems) {
    return <div className="text-red-500">No cart items found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 pt-10">
      <h2 className="text-3xl font-bold mb-6">Checkout</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order Details and Address */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card className="p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Your Items</h3>
            <CartItems cartItems={cartItems} />
          </Card>

          {/* Shipping Address */}
          <Card className="p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Shipping Address</h3>
            <Button
              color="success"
              onClick={() => setShowModal(true)}
              className="w-full mb-4"
            >
              Add New Address
            </Button>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {addressList.map((address) => (
                <div
                  key={address._id}
                  className={`bg-white dark:bg-gray-800 shadow-md rounded-md p-4 cursor-pointer border-2 transition-transform duration-300 transform hover:scale-105 ${
                    selectedAddress === address
                      ? "border-blue-500 bg-blue-50"
                      : "border-transparent"
                  }`}
                  onClick={() => handleAddressChange(address)}
                >
                  <div className="flex items-center mb-2">
                    <FontAwesomeIcon
                      icon={faMapMarker}
                      size="lg"
                      className="text-blue-500"
                    />
                    <span className="ml-2">
                      {address.street}, {address.city}, {address.state}{" "}
                      {address.zip}
                    </span>
                  </div>
                  <h5 className="text-lg font-bold">{address.name}</h5>
                  <p className="text-gray-500 dark:text-gray-400">
                    {address.address}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {address.phone}
                  </p>
                  <Button
                    color="gray"
                    onClick={() => {
                      setAddressToEdit(address);
                      setShowEditModal(true);
                    }}
                    className="w-full mt-2 hover:bg-gray-300 transition-colors duration-200"
                  >
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Order Summary and Payment */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card className="p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Order Summary</h3>
            <table className="w-full text-left mb-4">
              <tbody>
                <tr>
                  <td className="py-2">Cart Total</td>
                  <td className="text-right">
                    ₹{orderSummary.subtotal?.toFixed(2)}
                  </td>
                </tr>
                {orderSummary.subtotal > orderSummary.offerPrice && (
                  <tr>
                    <td className="py-2">Offer Price</td>
                    <td className="text-right">
                      ₹{orderSummary.offerPrice?.toFixed(2)}
                    </td>
                  </tr>
                )}
                {discountAmount > 0 && (
                  <tr>
                    <td className="py-2 text-green-500">Coupon Discount</td>
                    <td className="text-right text-green-500">
                      - ₹{discountAmount.toFixed(2)}
                    </td>
                  </tr>
                )}
                <tr className="font-bold">
                  <td className="py-2">Total</td>
                  <td className="text-right">
                    ₹{orderSummary.total?.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>

          {/* Coupon Code */}
          <Card className="p-6 rounded-lg shadow-md">
            {/* List of Available Coupons */}
            <div className="mt-4">
              <h4 className="text-lg font-semibold">Available Coupons:</h4>
              <ul className="list-disc list-inside">
                {availableCoupons.map((coupon, index) => (
                  <li key={index} className="text-gray-700">
                    {coupon.code} -{" "}
                    <span className="text-red-500">{coupon.discount}% off</span>
                  </li>
                ))}
              </ul>
            </div>
            <h3 className="text-xl font-bold mb-4">Have a Coupon?</h3>
            <div className="flex mb-4">
              <input
                type="text"
                className="flex-1 border rounded-lg p-2"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <Button onClick={applyCoupon} className="ml-4">
                Apply
              </Button>
            </div>
            {couponError && <p className="text-red-500">{couponError}</p>}
          </Card>

          {/* Payment Options */}
          <Card className="p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Payment Method</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-5">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  disabled={orderSummary.total > 1000}
                  onClick={() => handlePaymentMethodChange("COD")}
                />
                <div className="flex items-center relative">
                  <FontAwesomeIcon icon={faMoneyBill} size="lg" />
                  <span className="ml-2">Cash on Delivery</span>
                  {orderSummary.total > 1000 && (
                    <span className="ml-2 text-red-500 text-xs">
                      COD not available for orders above ₹1000
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-5">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Razorpay"
                  onClick={() => handlePaymentMethodChange("Razorpay")}
                />
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faCreditCard} size="lg" />
                  <span className="ml-2">Razorpay</span>
                </div>
              </div>
            </div>
          </Card>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          {/* Place Order Button */}
          <Button
            onClick={handlePlaceOrder}
            className="w-full py-3 text-lg font-semibold bg-green-500 hover:bg-green-700 text-white rounded-lg"
          >
            Place Order
          </Button>
        </div>
      </div>

      {/* Modals for Address and Confirmation */}
      {/* Add New Address Modal */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          {/* Add Address Form */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-600 mb-4">
              Add New Address
            </h3>
            {/* Add form inputs here for adding a new address */}
            <form className="flex flex-col gap-4 mt-4">
              <input
                type="text"
                value={newAddress.name}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, name: e.target.value })
                }
                placeholder="Name"
                className="input input-bordered w-full"
              />
              <input
                type="text"
                value={newAddress.address}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, address: e.target.value })
                }
                placeholder="Address"
                className="input input-bordered w-full"
              />
              <input
                type="text"
                value={newAddress.city}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, city: e.target.value })
                }
                placeholder="City"
                className="input input-bordered w-full"
              />
              <input
                type="text"
                value={newAddress.state}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, state: e.target.value })
                }
                placeholder="State"
                className="input input-bordered w-full"
              />
              <input
                type="text"
                value={newAddress.pinCode}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, pinCode: e.target.value })
                }
                placeholder="Pin Code"
                className="input input-bordered w-full"
              />
              <input
                type="text"
                value={newAddress.phone}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, phone: e.target.value })
                }
                placeholder="Phone"
                className="input input-bordered w-full"
              />
              <div className="flex justify-center gap-4">
                <Button
                  color="success"
                  onClick={handleAddNewAddress}
                  className="w-full"
                >
                  Save
                </Button>
                <Button
                  color="gray"
                  onClick={() => setShowModal(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Modal.Body>
      </Modal>
      {/* Edit Address Modal */}
      <Modal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          {/* Edit Address Form */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-600 mb-4">
              Edit Address
            </h3>
            {addressError && (
              <p className="text-red-500 mt-2">{addressError}</p>
            )}
            {/* Add form inputs here for editing an address */}
            <form className="flex flex-col gap-4 mt-4">
              <input
                type="text"
                value={addressToEdit.name}
                onChange={(e) =>
                  setAddressToEdit({
                    ...addressToEdit,
                    name: e.target.value,
                  })
                }
                placeholder="name"
                className="input input-bordered w-full"
              />
              <input
                type="text"
                value={addressToEdit.address}
                onChange={(e) =>
                  setAddressToEdit({
                    ...addressToEdit,
                    address: e.target.value,
                  })
                }
                placeholder="address"
                className="input input-bordered w-full"
              />
              <input
                type="text"
                value={addressToEdit.city}
                onChange={(e) =>
                  setAddressToEdit({
                    ...addressToEdit,
                    city: e.target.value,
                  })
                }
                placeholder="City"
                className="input input-bordered w-full"
              />
              <input
                type="text"
                value={addressToEdit.state}
                onChange={(e) =>
                  setAddressToEdit({
                    ...addressToEdit,
                    state: e.target.value,
                  })
                }
                placeholder="State"
                className="input input-bordered w-full"
              />
              <input
                type="text"
                value={addressToEdit.pinCode}
                onChange={(e) =>
                  setAddressToEdit({
                    ...addressToEdit,
                    pinCode: e.target.value,
                  })
                }
                placeholder="Pin Code"
                className="input input-bordered w-full"
              />
              <input
                type="text"
                value={addressToEdit.phone}
                onChange={(e) =>
                  setAddressToEdit({
                    ...addressToEdit,
                    phone: e.target.value,
                  })
                }
                placeholder="Phone"
                className="input input-bordered w-full"
              />
              <div className="flex justify-center gap-4">
                <Button
                  color="success"
                  onClick={handleEditAddress}
                  className="w-full"
                >
                  Save
                </Button>
                <Button
                  color="gray"
                  onClick={() => setShowEditModal(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Modal.Body>
      </Modal>
      {/* Order Confirmation Modal */}
      <Modal
        show={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-600">
              Thank You for Your Order!
            </h3>
            <p className="mt-2">
              Your order ID is: <strong>{orderId}</strong>
            </p>
            <div className="flex gap-4 mt-4">
              <Button
                color="success"
                onClick={() => navigate("/")}
                className="w-full"
              >
                Continue Shopping
              </Button>
              <Button
                color="gray"
                onClick={() => navigate(`/order/${orderId}`)}
                className="w-full"
              >
                View Order
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      {/* Payment Failure Modal */}
      <Modal
        show={paymentFailed}
        onClose={() => setPaymentFailed(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600">
              Payment Failed
            </h3>
            <p className="mt-2">{paymentErrorMessage}</p>
            <div className="flex justify-center gap-4 mt-4">
              <Button
                color="success"
                onClick={() => {
                  setPaymentFailed(false);
                  handlePlaceOrder(); // Retry the payment
                }}
                className="w-full"
              >
                Retry
              </Button>
              <Button
                color="gray"
                onClick={() => setPaymentFailed(false)}
                className="w-full"
              >
                Exit
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CheckoutPage;

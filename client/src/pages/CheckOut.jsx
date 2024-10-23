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
import { Button, Modal } from "flowbite-react";
import { AiOutlineEdit } from "react-icons/ai";
import { clearCart } from "../redux/cart/cartSlice";
import { createNewOrder } from "../redux/order/orderSlice";

const CheckoutPage = () => {
  const location = useLocation();
  const cartItems = location.state?.cartItems;

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
  const [paymentStart, setPayamentStart] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  console.log("prp", cartItems);

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

    try {
      const response = await dispatch(createNewOrder(orderData));

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
                }
              );

              if (
                verifyResponse.data.message === "Payment verified successfully"
              ) {
                dispatch(clearCart(currentUser._id));
                navigate("/order-success");
              } else {
                setError("Payment verification failed");
              }
            } catch (error) {
              console.error("Payment verification error:", error);
              setError("Payment verification failed");
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
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();
      } else if (paymentMethod === "COD") {
        // Handle Cash on Delivery
        dispatch(clearCart(currentUser._id));
        navigate("/order-success");
      }
    } catch (error) {
      console.error(error);
      setError("Error placing order");
    }
  };

  const handleAddNewAddress = async () => {
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
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleEditAddress = async () => {
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
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const offerPrice = cartItems.items.reduce(
        (sum, item) => sum + item.discountedPrice * item.quantity,
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
        setCouponError("Invalid or expired coupon.");
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
    <div className="max-w-4xl mx-auto p-4 pt-6">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>
      <div className="bg-white rounded shadow-md p-4">
        <CartItems cartItems={cartItems} />
        <h3 className="text-lg font-bold mb-4">Shipping Address</h3>
        <Button
          color="success"
          onClick={() => setShowModal(true)}
          className="w-full"
        >
          Add New Address
        </Button>
        <div className="mt-5 mb-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addressList.map((address) => (
            <div
              key={address._id}
              className={`bg-white dark:bg-gray-800 shadow-md rounded-md p-4 ${
                selectedAddress === address ? "bg-gray-100" : ""
              }`}
            >
              <input
                type="radio"
                name="address"
                value={address._id}
                checked={selectedAddress === address}
                onChange={() => handleAddressChange(address)}
              />
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faMapMarker} size="lg" />
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
                {address.city}, {address.state} {address.zip}
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
                className="w-full"
              >
                <AiOutlineEdit className="h-5 w-5" />
              </Button>
            </div>
          ))}
        </div>
        <h3 className="text-lg font-bold mb-2">Payment Method</h3>
        <div className="flex flex-wrap -mx-4">
          {/* <div className="flex items-center gap-5 w-full md:w-1/2 xl:w-1/3 p-4 mb-4">
            <input
              type="radio"
              name="paymentMethod"
              value="credit_card"
              checked={paymentMethod === "credit_card"}
              onChange={() => handlePaymentMethodChange("credit_card")}
            />
            <div className="flex items-center">
              <FontAwesomeIcon icon={faCreditCard} size="lg" />
              <span className="ml-2">Credit Card</span>
            </div>
          </div>
          <div className="flex items-center gap-5 w-full md:w-1/2 xl:w-1/3 p-4 mb-4">
            <input
              type="radio"
              name="paymentMethod"
              value="debit_card"
              checked={paymentMethod === "debit_card"}
              onChange={() => handlePaymentMethodChange("debit_card")}
            />
            <div className="flex items-center">
              <FontAwesomeIcon icon={faCreditCard} size="lg" />
              <span className="ml-2">Debit Card</span>
            </div>
          </div> */}
          <div className="flex items-center gap-5 w-full md:w-1/2 xl:w-1/3 p-4 mb-4">
            <input
              type="radio"
              name="paymentMethod"
              value="COD"
              //   checked={paymentMethod === "cash_on_delivery"}
              onClick={() => handlePaymentMethodChange("COD")}
            />
            <div className="flex items-center">
              <FontAwesomeIcon icon={faMoneyBill} size="lg" />
              <span className="ml-2">Cash on Delivery</span>
            </div>
          </div>
          <div className="flex items-center gap-5 w-full md:w-1/2 xl:w-1/3 p-4 mb-4">
            <input
              type="radio"
              name="paymentMethod"
              value="Paypal"
              //   checked={paymentMethod === "cash_on_delivery"}
              onClick={() => handlePaymentMethodChange("Razorpay")}
            />
            <div className="flex items-center">
              <FontAwesomeIcon icon={faMoneyBill} size="lg" />
              <span className="ml-2">Paypal</span>
            </div>
          </div>
          {/* Add more payment methods here */}
        </div>
        {/* Coupon Code */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">Have a Coupon?</h3>
          <div className="flex">
            <input
              type="text"
              className="flex-1 border rounded-lg p-2"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <Button onClick={applyCoupon} className="ml-4">
              Apply Coupon
            </Button>
          </div>
          {couponError && <p className="text-red-500 mt-2">{couponError}</p>}
        </div>
        {/* Order Summary */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">Order Summary</h3>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="py-2">Cart Total</td>
                <td className="text-right">
                  ${orderSummary.subtotal?.toFixed(2)}
                </td>
              </tr>
              {orderSummary.subtotal > orderSummary.offerPrice && (
                <tr>
                  <td className="py-2">Offer Price</td>
                  <td className="text-right">
                    ${orderSummary.offerPrice?.toFixed(2)}
                  </td>
                </tr>
              )}

              {discountAmount > 0 && (
                <tr>
                  <td className="py-2 text-green-500">Coupon Discount</td>
                  <td className="text-right text-green-500">
                    - ${discountAmount.toFixed(2)}
                  </td>
                </tr>
              )}
              <tr className="font-bold">
                <td className="py-2">Total</td>
                <td className="text-right">
                  ${orderSummary.total?.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button
          onClick={handlePlaceOrder}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
        >
          Place Order
        </button>
      </div>
      <Modal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="text-lg font-normal text-gray-500 dark:text-gray-400">
              Edit Address
            </h3>
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
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="text-lg font-normal text-gray-500 dark:text-gray-400">
              Add New Address
            </h3>
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
    </div>
  );
};

export default CheckoutPage;

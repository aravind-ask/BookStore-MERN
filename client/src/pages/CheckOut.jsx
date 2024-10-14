import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarker, faCreditCard, faMoneyBill } from '@fortawesome/free-solid-svg-icons';
import { addNewAddress, editAddress, fetchAddress } from "../redux/address/addressSlice";
import { useLocation } from "react-router-dom";
import { CartItems } from '../components/CartItems';
import { Button, Modal } from 'flowbite-react';
import { AiOutlineEdit } from 'react-icons/ai';


const CheckoutPage = () => {
    const location = useLocation();
    const cartItems = location.state?.cartItems;

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [orderSummary, setOrderSummary] = useState({});
  const { currentUser } = useSelector((state) => state.user);
  const { addressList } = useSelector((state) => state.address);
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

  const dispatch = useDispatch();
  const navigate = useNavigate();

  console.log("prp",cartItems)

  useEffect(() => {
    dispatch(fetchAddress(currentUser._id));
  }, [dispatch, currentUser]);

  const handleAddressChange = (address) => {
    setSelectedAddress(address);
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handlePlaceOrder = () => {
    const orderData = {
      userId: currentUser._id,
      cartItems,
      address: selectedAddress,
      paymentMethod,
    };
    dispatch(createOrder(orderData)).then((data) => {
      if (data?.payload) {
        navigate('/book/order-success', { state: { orderId: data.payload.orderId } });
      }
    });
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
      const tax = subtotal * 0.08;
      const total = subtotal + tax;
      setOrderSummary({ subtotal, tax, total });
    } else {
      setOrderSummary({}); // or some default values
    }
  }, [cartItems]);

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
          <div className="w-full md:w-1/2 xl:w-1/3 p-4 mb-4">
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
          <div className="w-full md:w-1/2 xl:w-1/3 p-4 mb-4">
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
          </div>
          <div className="w-full md:w-1/2 xl:w-1/3 p-4 mb-4">
            <input
              type="radio"
              name="paymentMethod"
              value="cash_on_delivery"
              checked={paymentMethod === "cash_on_delivery"}
              onChange={() => handlePaymentMethodChange("cash_on_delivery")}
            />
            <div className="flex items-center">
              <FontAwesomeIcon icon={faMoneyBill} size="lg" />
              <span className="ml-2">Cash on Delivery</span>
            </div>
          </div>
          {/* Add more payment methods here */}
        </div>
        <h3 className="text-lg font-bold mb-4">Order Summary</h3>
        <table className="table-auto w-full">
          <tbody>
            <tr>
              <td>Subtotal</td>
              <td>
                {orderSummary.subtotal
                  ? `$${orderSummary.subtotal.toFixed(2)}`
                  : ""}
              </td>
            </tr>
            <tr>
              <td>Tax (8%)</td>
              <td>
                {orderSummary.tax ? `$${orderSummary.tax.toFixed(2)}` : ""}
              </td>
            </tr>
            <tr>
              <td>Total</td>
              <td>
                {orderSummary.total ? `$${orderSummary.total.toFixed(2)}` : ""}
              </td>
            </tr>
          </tbody>
        </table>
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

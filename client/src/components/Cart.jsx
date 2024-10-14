import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import {
  deleteCartItem,
  fetchCartItems,
  updateCartQty,
} from "../redux/cart/cartSlice";

const CartPage = () => {
  const [message, setMessage] = useState(""); // Add a state to store the message
  const [error, setError] = useState(false); // Add a state to store the error flag
  const { currentUser } = useSelector((state) => state.user);
  const { cartItems } = useSelector((state) => state.cart);
  const navigate = useNavigate();

  const totalCartAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, current) => sum + current.price * current.quantity,
          0
        )
      : 0;
  console.log("Cart:", cartItems);

  const dispatch = useDispatch();


  function handleQuantityChange(bookId, quantity, action) {
    dispatch(
      updateCartQty({
        userId: currentUser._id,
        bookId: bookId,
        quantity: action === "plus" ? quantity + 1 : quantity - 1,
      })
    ).then((data) => {
      if (data?.payload) {
        dispatch(fetchCartItems(currentUser._id));
      }
    });
  }

  function handleRemove(bookId) {
    console.log(bookId);
    dispatch(deleteCartItem({ userId: currentUser._id, bookId: bookId })).then(
      (data) => {
        if (data?.payload) {
          dispatch(fetchCartItems(currentUser._id));
        }
      }
    );
  }

   const handleCheckout = () => {
     // Here you can perform any validation or processing before checkout
     if (cartItems.items.length === 0) {
       setMessage("Your cart is empty. Please add items before checking out.");
       setError(true);
       return;
     }

    navigate("/book/checkout", { state: { cartItems } });
   };

  useEffect(() => {
    // fetchCartItems(userId);
    dispatch(fetchCartItems(currentUser._id));
  }, [dispatch]);

  if (!cartItems?.items || cartItems?.items?.length === 0) {
    return (
      <div className="flex justify-center mt-20">
        <div className="bg-white rounded shadow-md p-4 max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-lg text-gray-600 mb-4">
            It looks like you haven't added any books to your cart yet!
          </p>
          <button
            className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => console.log("Redirect to book store")}
          >
            Explore Our Bookstore
          </button>
          <div className="mt-4">
            <FontAwesomeIcon icon={faShoppingCart} size="4x" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto p-4 pt-6">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      {message && (
        <div
          className={`bg-${error ? "red" : "green"}-100 border border-${
            error ? "red" : "green"
          }-400 text-${error ? "red" : "green"}-700 px-4 py-3 rounded mb-4`}
        >
          {message}
        </div>
      )}
      <div className="bg-white rounded shadow-md p-4">
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Book</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Quantity</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="px-4 py-2 flex items-center">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-12 h-12 rounded mr-4"
                  />
                  <span>{item.title}</span>
                </td>
                <td className="px-4 py-2">${item.price}</td>
                <td className="px-4 py-2 flex">
                  <button
                    onClick={() =>
                      handleQuantityChange(item.bookId, item.quantity, "minus")
                    }
                    className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-1 px-2 rounded"
                  >
                    -
                  </button>
                  <span className="mx-2">{item.quantity}</span>
                  <button
                    onClick={() =>
                      handleQuantityChange(item.bookId, item.quantity, "plus")
                    }
                    className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-1 px-2 rounded"
                  >
                    +
                  </button>
                </td>
                <td className="px-4 py-2">${item.price * item.quantity}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleRemove(item.bookId)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between mt-4">
          <h3 className="text-lg font-bold">Total Price: {totalCartAmount}</h3>
          <button
            onClick={handleCheckout}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const OrderList = () => {
  const { orders } = useSelector((state) => state.order);

  return (
    <div className="max-w-4xl mx-auto p-4 pt-6">
      <h2 className="text-2xl font-bold mb-4">Order List</h2>
      <table className="table-auto w-full">
        <thead>
          <tr>
            <th>Book</th>
            <th>Author</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Ordered Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>
                {order.cartItems.map((item, index) => (
                  <div key={index}>
                    <Link to={`/book/${item.bookId}`}>{item.bookTitle}</Link>
                  </div>
                ))}
              </td>
              <td>
                {order.cartItems.map((item, index) => (
                  <div key={index}>{item.author}</div>
                ))}
              </td>
              <td>
                {order.cartItems.map((item, index) => (
                  <div key={index}>${item.price}</div>
                ))}
              </td>
              <td>
                {order.cartItems.map((item, index) => (
                  <div key={index}>{item.quantity}</div>
                ))}
              </td>
              <td>{order.createdAt}</td>
              <td>{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderList;

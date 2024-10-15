import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Button, Modal, Table } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const [showModal, setShowModal] = useState(false);
  const [cancelledOrderId, setCancelledOrderId] = useState("");
  const [cancelledItemId, setCancelledItemId] = useState("");

  console.log(currentUser);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`/api/order/${currentUser._id}`);
        setOrders(response.data);
        console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchOrders();
  }, []);

  const handleCancel = (orderId, itemId) => {
    setCancelledOrderId(orderId);
    setCancelledItemId(itemId);
    setShowModal(true); // Show the modal for confirmation
  };

  const handleConfirmCancel = () => {
    if (cancelledOrderId && cancelledItemId) {
      handleStatusChange(cancelledOrderId, cancelledItemId, "cancelled");
      setCancelledOrderId("");
      setCancelledItemId("");
      setShowModal(false);
    }
  };

  const handleStatusChange = (orderId, itemId, newStatus) => {
    console.log("order:", orderId);
    console.log("item:", itemId);
    console.log("status:", newStatus);
    // API call to update the status of the book order
    axios
      .patch(`/api/order/update/${orderId}/${itemId}`, { status: newStatus })
      .then((response) => {
        // Update the state of the component
        const updatedOrders = orders.map((order) => {
          if (order._id === orderId) {
            const updatedCartItems = order.cartItems.map((item) => {
              if (item._id === itemId) {
                return { ...item, status: newStatus };
              }
              return item;
            });
            return { ...order, cartItems: updatedCartItems };
          }
          return order;
        });
        setOrders(updatedOrders);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleCancelModalClose = () => {
    setShowModal(false);
    setCancelledOrderId("");
    setCancelledItemId("");
  };

  return (
    <div className="max-w mx-auto p-4 pt-6">
      <h2 className="text-2xl font-bold mb-4">Order List</h2>
      <Table className="w-full shadow-md rounded-lg overflow-hidden">
        <Table.Head className="bg-gray-50">
          <Table.HeadCell className="px-4 py-2 text-left">
            Order No:
          </Table.HeadCell>
          <Table.HeadCell className="px-4 py-2 text-left">
            Total Order Value
          </Table.HeadCell>
          <Table.HeadCell className="px-4 py-2 text-left">
            Book Details
          </Table.HeadCell>
          <Table.HeadCell className="px-4 py-2 text-left">
            Quantity
          </Table.HeadCell>
          <Table.HeadCell className="px-4 py-2 text-left">Price</Table.HeadCell>
          <Table.HeadCell className="px-4 py-2 text-left">
            Status
          </Table.HeadCell>
          <Table.HeadCell className="px-4 py-2 text-left">
            Actions
          </Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {orders.map((order) => (
            <React.Fragment key={order._id}>
              <Table.Row className="hover:bg-gray-100">
                <Table.Cell
                  className="px-4 py-2 text-center"
                  rowSpan={order.cartItems.length + 1}
                >
                  {order.orderNumber}
                </Table.Cell>
                <Table.Cell
                  className="px-4 py-2 text-center"
                  rowSpan={order.cartItems.length + 1}
                >
                  ${order.orderSummary.total}
                </Table.Cell>
                <Table.Cell className="px-4 py-2 text-center" />
                <Table.Cell className="px-4 py-2 text-center" />
              </Table.Row>
              {order.cartItems.map((item, index) => (
                <Table.Row key={index} className="hover:bg-gray-100">
                  <Table.Cell className="flex gap-3 px-4 py-2 text-center">
                    <img
                      src={item.images[0]}
                      alt={item.book}
                      width={50}
                      height={50}
                    />
                    <span className="text-gray-500 text-sm">{item.book}</span>
                  </Table.Cell>
                  <Table.Cell className="px-4 py-2 text-center">
                    {item.quantity}
                  </Table.Cell>
                  <Table.Cell className="px-4 py-2 text-center">
                    ${item.price}
                  </Table.Cell>
                  <Table.Cell className="px-4 py-2 text-center">
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
                        className="block w-full pl-10 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option
                          value="pending"
                          selected={item.status === "pending"}
                        >
                          Pending
                        </option>
                        <option
                          value="shipped"
                          selected={item.status === "shipped"}
                        >
                          Shipped
                        </option>
                        <option
                          value="delivered"
                          selected={item.status === "delivered"}
                        >
                          Delivered
                        </option>
                        <option
                          value="cancelled"
                          selected={item.status === "cancelled"}
                        >
                          Cancelled
                        </option>
                      </select>
                    ) : (
                      item.status
                    )}
                  </Table.Cell>
                  <Table.Cell className="px-4 py-2 text-center">
                    {item.status ==="cancelled" ? (
                      <span>You cancelled the order</span>
                    ) : (
                      <Button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => handleCancel(order._id, item._id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </React.Fragment>
          ))}
        </Table.Body>
      </Table>
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to Cancel the order?
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                color="failure"
                onClick={() => handleConfirmCancel()}
              >
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default OrderList;

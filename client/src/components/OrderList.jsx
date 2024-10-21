import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Button, Modal, Table } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import {
  cancelOrderItem,
  fetchOrders,
  updateOrderStatus,
} from "../redux/order/orderSlice";

const OrderList = () => {
  // const [orders, setOrders] = useState([]);
  const dispatch = useDispatch();

  const { currentUser } = useSelector((state) => state.user);
  const { orders, isLoading, error } = useSelector((state) => state.order);

  const [showModal, setShowModal] = useState(false);
  const [cancelledOrderId, setCancelledOrderId] = useState("");
  const [cancelledItemId, setCancelledItemId] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  console.log(currentUser);

  // useEffect(() => {
  //   const fetchOrders = async () => {
  //     try {
  //       const response = await axios.get(`/api/order/${currentUser._id}`);
  //       setOrders(response.data);
  //       console.log(response.data);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };
  //   fetchOrders();
  // }, []);

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchOrders(currentUser._id));
    }
  }, [dispatch, currentUser]);

  const handleCancel = (orderId, itemId) => {
    setCancelledOrderId(orderId);
    setCancelledItemId(itemId);
    setShowModal(true); // Show the modal for confirmation
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

  const handleStatusChange = (orderId, itemId, newStatus) => {
    dispatch(updateOrderStatus({ orderId, itemId, newStatus }));
  };

  // const handleCancelModalClose = () => {
  //   setShowModal(false);
  //   setCancelledOrderId("");
  //   setCancelledItemId("");
  // };

  return (
    <div className="max-w mx-auto p-4 pt-6">
      <h2 className="text-2xl font-bold mb-4">Order List</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
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
            <Table.HeadCell className="px-4 py-2 text-left">
              Price
            </Table.HeadCell>
            <Table.HeadCell className="px-4 py-2 text-left">
              Status
            </Table.HeadCell>
            <Table.HeadCell className="px-4 py-2 text-left">
              Actions
            </Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {orders?.map((order) => (
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
                      {item.status === "cancelled" ? (
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
      )}
      {error && (
        <div className="text-red-500">
          <HiOutlineExclamationCircle className="inline-block" />
          {error}
        </div>
      )}
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>Cancel Order Item</Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to cancel this order item?</p>
          <p>Reason for cancellation:</p>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Enter reason for cancellation"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleConfirmCancel}>Confirm Cancel</Button>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderList;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  approvalURL: null,
  isLoading: false,
  orderId: null,
  orders: [],
  error: null,
};

export const createNewOrder = createAsyncThunk(
  "/checkout/createNewOrder",
  async (orderData) => {
    const response = await axios.post("/api/order/checkout", orderData);
    return response.data;
  }
);

export const fetchOrders = createAsyncThunk(
  "order/fetchOrders",
  async (userId) => {
    const response = await axios.get(`/api/order/${userId}`);
    return response.data;
  }
);

export const updateOrderStatus = createAsyncThunk(
  "order/updateOrderStatus",
  async ({ orderId, itemId, newStatus }) => {
    const response = await axios.patch(
      `/api/order/update/${orderId}/${itemId}`,
      { status: newStatus }
    );
    return response.data;
  }
);

export const cancelOrderItem = createAsyncThunk(
  "order/cancelOrderItem",
  async ({ orderId, itemId, cancelReason }) => {
    const response = await axios.post(
      `/api/order/cancel/${orderId}/${itemId}`,
      { cancelReason }
    );
    return response.data;
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createNewOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.approvalURL = action.payload.approvalURL;
        state.orderId = action.payload.orderId;
      })
      .addCase(createNewOrder.rejected, (state) => {
        state.isLoading = false;
        state.approvalURL = null;
        state.orderId = null;
      })
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(cancelOrderItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(cancelOrderItem.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the specific order item in the state
        const { orderId, itemId } = action.meta.arg;
        const orderIndex = state.orders.findIndex(
          (order) => order._id === orderId
        );
        if (orderIndex !== -1) {
          const itemIndex = state.orders[orderIndex].cartItems.findIndex(
            (item) => item._id === itemId
          );
          if (itemIndex !== -1) {
            state.orders[orderIndex].cartItems[itemIndex].status = "cancelled";
            state.orders[orderIndex].cartItems[itemIndex].refundStatus =
              action.payload.refundStatus;
            state.orders[orderIndex].cartItems[itemIndex].refundAmount =
              action.payload.refundAmount;
          }
        }
      })
      .addCase(cancelOrderItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const { orderId, itemId, newStatus } = action.meta.arg;
        const orderIndex = state.orders.findIndex(
          (order) => order._id === orderId
        );
        if (orderIndex !== -1) {
          const itemIndex = state.orders[orderIndex].cartItems.findIndex(
            (item) => item._id === itemId
          );
          if (itemIndex !== -1) {
            state.orders[orderIndex].cartItems[itemIndex].status = newStatus;
          }
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export default orderSlice.reducer;

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

export const fetchOrders = createAsyncThunk("order/fetchOrders", async () => {
  const response = await axios.get(`/api/order`);
  return response.data.orders;
});

export const fetchOrderDetails = createAsyncThunk(
  "order/fetchOrderDetails",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/order/${orderId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
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

export const returnOrderItem = createAsyncThunk(
  "order/returnOrderItem",
  async ({ orderId, itemId, returnReason }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/order/return`, {
        orderId,
        itemId,
        returnReason,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
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
        state.error = null;
      })
      .addCase(createNewOrder.rejected, (state) => {
        state.isLoading = false;
        state.approvalURL = null;
        state.orderId = null;
        state.error = "Failed to create new order";
      })
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
        state.error = null;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.orders = [];
        state.error = action.error.message;
      })
      .addCase(cancelOrderItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelOrderItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
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
        state.error = null;
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
      })
      .addCase(returnOrderItem.pending, (state) => {
        state.error = null;
      })
      .addCase(returnOrderItem.fulfilled, (state, action) => {
        const { orderId, itemId } = action.payload;
        const orderIndex = state.orders.findIndex(
          (order) => order._id === orderId
        );
        if (orderIndex !== -1) {
          const itemIndex = state.orders[orderIndex].cartItems.findIndex(
            (item) => item._id === itemId
          );
          if (itemIndex !== -1) {
            state.orders[orderIndex].cartItems[itemIndex].status = "returned";
            state.orders[orderIndex].cartItems[itemIndex].returnReason =
              action.meta.arg.returnReason;
            state.orders[orderIndex].cartItems[itemIndex].returnDate =
              new Date().toISOString();
          }
        }
      })
      .addCase(returnOrderItem.rejected, (state, action) => {
        state.error = action.payload.message;
      })
      .addCase(fetchOrderDetails.pending, (state) => {
        state.isLoadingDetails = true;
        state.errorDetails = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.isLoadingDetails = false;
        state.orderDetails = action.payload;
        state.errorDetails = null;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.isLoadingDetails = false;
        state.errorDetails = action.payload;
      });
  },
});

export default orderSlice.reducer;

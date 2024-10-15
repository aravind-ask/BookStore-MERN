import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  cartItems: [],
  isLoading: false,
};

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ userId, bookId, quantity }) => {
    const response = await axios.post(`/api/cart/add`, {
      userId,
      bookId,
      quantity,
    });
    console.log("add response", response.data);
    return response.data;
  }
);

export const fetchCartItems = createAsyncThunk(
  "cart/fetchCarttems",
  async (userId) => {
    console.log(userId);
    const response = await axios.get(`/api/cart/${userId}`);
    console.log("response", response.data);
    return response.data;
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async ({ userId, bookId }) => {
    const response = await axios.delete(`/api/cart/remove/${userId}/${bookId}`);
    console.log(response.data);
    return response.data;
  }
);

export const clearCart = createAsyncThunk("api/cart/clearCart", async (userId) => {
  const response = await axios.delete(`/api/cart/clear/${userId}`);
  console.log(response.data);
  return response.data;
});

export const updateCartQty = createAsyncThunk(
  "cart/updateCart",
  async ({ userId, bookId, quantity }) => {
    const response = await axios.put(`/api/cart/update`, {
      userId,
      bookId,
      quantity,
    });
    console.log(response.data);
    return response.data;
  }
);

const ShoppingCartSlice = createSlice({
  name: "shoppingCart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(addToCart.rejected, (state) => {
        state.isLoading = false;
        state.cartItems = [];
      })
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(fetchCartItems.rejected, (state) => {
        state.isLoading = false;
        state.cartItems = [];
      })
      .addCase(updateCartQty.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCartQty.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(updateCartQty.rejected, (state) => {
        state.isLoading = false;
        state.cartItems = [];
      })
      .addCase(deleteCartItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(deleteCartItem.rejected, (state) => {
        state.isLoading = false;
        state.cartItems = [];
      })
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.isLoading = false;
        state.cartItems = [];
      })
      .addCase(clearCart.rejected, (state) => {
        state.isLoading = false;
        state.cartItems = [];
      });
  },
});

export default ShoppingCartSlice.reducer;

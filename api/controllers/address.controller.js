import Address from "../models/address.model.js";
import { errorHandler } from "../utils/error.js";

export const addAddress = async (req, res, next) => {
  try {
    const { name, address, city, state, pinCode, phone } = req.body;
    const userId = req.user.id;
    if (!userId || !name || !address || !city || !state || !pinCode || !phone) {
      return next(errorHandler(400, "All fields are required"));
    }
    const newAddress = new Address({
      userId,
      name,
      address,
      city,
      state,
      pinCode,
      phone,
    });
    await newAddress.save();
    res.status(201).json({ success: true, data: newAddress });
  } catch (error) {
    next(error);
  }
};

export const fetchAddress = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return next(errorHandler(400, "User ID is required"));
    }
    const query = { userId };
    const addresses = await Address.find(query);
    if (addresses.length === 0) {
      return next(errorHandler(404, "Address not found"));
    }
    res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const editAddress = async (req, res, next) => {
  try {
    const { userId, addressId } = req.params;
    const formData = req.body;
    if (!userId || !addressId) {
      return next(errorHandler(400, "All fields are required"));
    }

    const address = await Address.findOneAndUpdate(
      {
        _id: addressId,
        userId,
      },
      formData,
      { new: true }
    );

    if (!address) {
      return next(errorHandler(404, "Address not found"));
    }
    res.status(200).json({ success: true, data: address });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const { userId, addressId } = req.params;
    if (!userId || !addressId) {
      return next(errorHandler(400, "All fields are required"));
    }
    const address = await Address.findOneAndDelete({ _id: addressId, userId });
    if (!address) {
      return next(errorHandler(404, "Address not found"));
    }
    res.status(200).json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
};

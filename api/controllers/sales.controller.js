import Order from "../models/order.model.js";
import { errorHandler } from "../utils/error.js";


export const getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate, period, year, month } = req.query;

    let filter = {};
    const now = new Date();

    if (period === "daily") {
      filter.createdAt = {
        $gte: new Date(now.setHours(0, 0, 0, 0)),
        $lt: new Date(now.setHours(23, 59, 59, 999)),
      };
    } else if (period === "weekly") {
      const lastWeek = new Date(now.setDate(now.getDate() - 7));
      filter.createdAt = { $gte: lastWeek, $lt: new Date() };
    } else if (period === "monthly") {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filter.createdAt = { $gte: firstDayOfMonth, $lt: new Date() };
    } else if (period === "yearly") {
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
      filter.createdAt = { $gte: firstDayOfYear, $lt: new Date() };
    } else if (year && month) {
      filter.createdAt = {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1),
      };
    } else if (year) {
      filter.createdAt = {
        $gte: new Date(year, 0, 1),
        $lt: new Date(Number(year) + 1, 0, 1),
      };
    } else if (startDate && endDate) {
      filter.createdAt = { $gte: new Date(startDate), $lt: new Date(endDate) };
    }

    // Fetch orders based on the filters applied
    const orders = await Order.find(filter);

    // Calculate totals for sales, discounts, and coupons
    const totalSales = orders.reduce(
      (sum, order) => sum + order.orderSummary.total,
      0
    );
    const totalDiscounts = orders.reduce(
      (sum, order) => sum + (order.orderSummary.totalDiscount || 0),
      0
    );
    const totalCoupons = orders.reduce(
      (sum, order) => sum + (order.orderSummary.discount || 0),
      0
    );

    res.status(200).json({
      orders,
      totalSales,
      totalDiscounts,
      totalCoupons,
      orderCount: orders.length,
    });
  } catch (error) {
    next(error);
  }
};

// Get Best Selling Books and Categories
export const getBestSellers = async (req, res, next) => {
  try {
    // Best-selling books
    const bestSellingBooks = await Order.aggregate([
      { $unwind: "$cartItems" },
      {
        $group: {
          _id: "$cartItems.bookId",
          title: { $first: "$cartItems.book" },
          totalSales: { $sum: "$cartItems.quantity" }
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "bookDetails"
        }
      },
      { $unwind: "$bookDetails" }
    ]);

    // Best-selling categories
    const bestSellingCategories = await Order.aggregate([
      { $unwind: "$cartItems" },
      {
        $lookup: {
          from: "books",
          localField: "cartItems.bookId",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      { $unwind: "$bookDetails" },
      {
        $lookup: {
          from: "categories", // Assuming your categories collection is named "categories"
          localField: "bookDetails.category", // This should reference the category ID
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      {
        $group: {
          _id: "$categoryDetails._id", // Group by category ID
          categoryName: { $first: "$categoryDetails.name" }, // Extract the actual category name
          totalSales: { $sum: "$cartItems.quantity" },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      bestSellingBooks,
      bestSellingCategories,
    });
  } catch (error) {
    next(error);
  }
};

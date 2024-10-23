import Order from "../models/order.model.js";
import { errorHandler } from "../utils/error.js";


export const getSalesReport =  async (req, res, next) => {
 try {
   const { startDate, endDate, period } = req.query;

   // Define filters based on date range or period
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
   } else if (startDate && endDate) {
     filter.createdAt = { $gte: new Date(startDate), $lt: new Date(endDate) };
   }

   // Fetching orders within the date range
   const orders = await Order.find(filter);

   // Calculate total sales, discounts, and coupon deductions
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

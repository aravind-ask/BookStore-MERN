import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bar, Line } from "react-chartjs-2";
import axios from "axios";
import DatePicker from "react-datepicker"; // Import from react-datepicker
import "react-datepicker/dist/react-datepicker.css"; // Import default styling
import dayjs from "dayjs";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement, // Import PointElement
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register necessary components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement, // Register PointElement here
  Title,
  Tooltip,
  Legend
);

const SalesReportChart = () => {
  const [reportData, setReportData] = useState([]);
  const [filter, setFilter] = useState("daily");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [chartType, setChartType] = useState("Bar");

  const fetchData = async () => {
    try {
      //   const queryParams =  filter ;
      //   if (filter === "custom" && startDate && endDate) {
      //     queryParams.startDate = dayjs(startDate).format("YYYY-MM-DD");
      //     queryParams.endDate = dayjs(endDate).format("YYYY-MM-DD");
      //   }
      const queryParams =
        filter === "custom"
          ? `?startDate=${startDate}&endDate=${endDate}`
          : `?period=${filter}`;
      const response = await axios.get(`/api/sales/report${queryParams}`);
      setReportData(response.data.orders);
    } catch (error) {
      console.error("Error fetching sales report:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter, startDate, endDate]);

  const chartData = {
    labels: reportData.map((order) => dayjs(order.createdAt).format("DD MMM")),
    datasets: [
      {
        label: "Total Sales",
        data: reportData.map((order) => order.orderSummary.total),
        backgroundColor: "#4CAF50",
      },
      {
        label: "Discounts",
        data: reportData.map((order) => order.orderSummary.totalDiscount || 0),
        backgroundColor: "#FF6384",
      },
      {
        label: "Coupons",
        data: reportData.map((order) => order.orderSummary.discount || 0),
        backgroundColor: "#36A2EB",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: (context) =>
            ` ${context.dataset.label}: ₹${context.raw.toFixed(2)}`,
        },
      },
    },
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Sales Chart</h2>

      {/* Filter Options */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded p-2"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
          <option value="custom">Custom Range</option>
        </select>

        {/* Date Picker for Custom Range */}
        {filter === "custom" && (
          <>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              placeholderText="Start Date"
              className="border rounded p-2"
            />
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              placeholderText="End Date"
              className="border rounded p-2"
            />
          </>
        )}

        {/* Chart Type Toggle */}
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          className="border rounded p-2"
        >
          <option value="Bar">Bar Chart</option>
          <option value="Line">Line Chart</option>
        </select>
      </div>

      {/* Chart Display */}
      <div className="w-full h-96">
        {chartType === "Bar" ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
};

export default SalesReportChart;

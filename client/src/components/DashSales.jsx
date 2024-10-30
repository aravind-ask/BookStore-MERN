import React, { useState, useEffect, useRef } from "react";
import { Button, Select, Table, Spinner, Card } from "flowbite-react";
import {
  FaChartLine,
  FaMoneyBillWave,
  FaTags,
  FaShoppingCart,
  FaDownload,
} from "react-icons/fa";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import axios from "axios";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from "xlsx";
import SalesReportChart from "./SalesReportChart";

export default function DashSales() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("daily");
  const [customDates, setCustomDates] = useState({
    startDate: "",
    endDate: "",
  });
  const reportRef = useRef(); // Reference for the sales report

  const fetchReport = async () => {
    setLoading(true);
    setError("");

    try {
      const queryParams =
        period === "custom"
          ? `?startDate=${customDates.startDate}&endDate=${customDates.endDate}`
          : `?period=${period}`;

      const response = await axios.get(`/api/sales/report${queryParams}`);
      setReportData(response.data);
      console.log(response.data);
    } catch (err) {
      setError("Failed to fetch report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [period, customDates]);

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };

  // Function to generate and download PDF
 const downloadPDF = () => {
   const input = reportRef.current;

   if (!input) {
     console.error("Invalid element provided as first argument.");
     return;
   }

   // Use a timeout to ensure the element is fully rendered before generating the PDF
   setTimeout(() => {
     html2canvas(input, { scrollX: 0, scrollY: -window.scrollY }).then(
       (canvas) => {
         const imgData = canvas.toDataURL("image/png");
         const pdf = new jsPDF("p", "mm", "a4");
         const imgWidth = 210;
         const pageHeight = 295;
         const imgHeight = (canvas.height * imgWidth) / canvas.width;
         let heightLeft = imgHeight;
         let position = 0;

         pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
         heightLeft -= pageHeight;

         while (heightLeft >= 0) {
           position = heightLeft - imgHeight;
           pdf.addPage();
           pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
           heightLeft -= pageHeight;
         }

         pdf.save("sales_report.pdf");
       }
     );
   }, 500); // Add a short delay to ensure the element is fully rendered
 };


  // Function to generate and download Excel
  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      reportData.orders.map((order) => ({
        "Order No": order.orderNumber,
        "Total Amount": order.orderSummary.total.toFixed(2),
        Discount: order.orderSummary.discount?.toFixed(2),
        "Coupon Deduction": order.orderSummary.couponAmount?.toFixed(2),
        Date: new Date(order.createdAt).toLocaleDateString(),
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
    XLSX.writeFile(wb, "sales_report.xlsx");
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Sales Report</h1>

      <div><SalesReportChart/></div>

      {/* Filters */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="flex gap-4 items-center">
          <Button.Group>
            <Button
              onClick={() => setPeriod("daily")}
              color={period === "daily" ? "success" : "gray"}
            >
              1 Day
            </Button>
            <Button
              onClick={() => setPeriod("weekly")}
              color={period === "weekly" ? "success" : "gray"}
            >
              1 Week
            </Button>
            <Button
              onClick={() => setPeriod("monthly")}
              color={period === "monthly" ? "success" : "gray"}
            >
              1 Month
            </Button>
          </Button.Group>

          {/* Custom Date Range Picker */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customDates.startDate}
              onChange={(e) =>
                setCustomDates({ ...customDates, startDate: e.target.value })
              }
              className="border p-2 rounded-md"
            />
            <span>to</span>
            <input
              type="date"
              value={customDates.endDate}
              onChange={(e) =>
                setCustomDates({ ...customDates, endDate: e.target.value })
              }
              className="border p-2 rounded-md"
            />
            <Button
              onClick={() => setPeriod("custom")}
              color={period === "custom" ? "success" : "gray"}
            >
              Apply Custom Date
            </Button>
          </div>
        </div>

        {/* Download Buttons */}
        <div className="flex gap-4">
          <Button onClick={downloadPDF} color="failure">
            <FaDownload className="mr-2" /> PDF
          </Button>
          <Button onClick={downloadExcel} color="info">
            <FaDownload className="mr-2" /> Excel
          </Button>
        </div>
      </div>

      {/* Report Summary */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner aria-label="Loading report" size="xl" />
        </div>
      ) : error ? (
        <div className="text-red-500">
          <HiOutlineExclamationCircle className="inline-block mr-2" />
          {error}
        </div>
      ) : reportData ? (
        <div ref={reportRef}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Sales */}
            <Card className="shadow-md hover:shadow-lg transition-all">
              <div className="flex items-center">
                <FaChartLine className="text-4xl text-green-500 mr-4" />
                <div>
                  <h3 className="text-lg font-bold">Total Sales</h3>
                  <p className="text-xl text-gray-700">
                    ₹{reportData.totalSales.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Total Discounts */}
            <Card className="shadow-md hover:shadow-lg transition-all">
              <div className="flex items-center">
                <FaTags className="text-4xl text-orange-500 mr-4" />
                <div>
                  <h3 className="text-lg font-bold">Total Discounts</h3>
                  <p className="text-xl text-gray-700">
                    ₹{reportData.totalDiscounts.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Coupon Deductions */}
            <Card className="shadow-md hover:shadow-lg transition-all">
              <div className="flex items-center">
                <FaMoneyBillWave className="text-4xl text-blue-500 mr-4" />
                <div>
                  <h3 className="text-lg font-bold">Coupon Deductions</h3>
                  <p className="text-xl text-gray-700">
                    ₹{reportData.totalCoupons.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Total Orders */}
            <Card className="shadow-md hover:shadow-lg transition-all">
              <div className="flex items-center">
                <FaShoppingCart className="text-4xl text-purple-500 mr-4" />
                <div>
                  <h3 className="text-lg font-bold">Total Orders</h3>
                  <p className="text-xl text-gray-700">
                    {reportData.orderCount}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Detailed Report Table */}
          <Table id="report-table" hoverable>
            <Table.Head>
              <Table.HeadCell>Order No</Table.HeadCell>
              <Table.HeadCell>Total Amount</Table.HeadCell>
              <Table.HeadCell>Total Discount</Table.HeadCell>
              <Table.HeadCell>Coupon Deduction</Table.HeadCell>
              <Table.HeadCell>Date</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {reportData.orders.map((order) => (
                <Table.Row key={order._id}>
                  <Table.Cell>{order.orderNumber}</Table.Cell>
                  <Table.Cell>
                    ₹{order.orderSummary.total.toFixed(2)}
                  </Table.Cell>
                  <Table.Cell>
                    {order.orderSummary.totalDiscount ? (
                      <>₹ {order.orderSummary.totalDiscount.toFixed(2)}</>
                    ) : (
                      <span>Nil</span>
                    )}
                  </Table.Cell>
                  <Table.Cell className="flex gap-2">
                    {order.orderSummary.discount ? (
                      <>
                        <span>{order.orderSummary.coupon}:</span>
                        <span>₹ {order.orderSummary.discount.toFixed(2)}</span>
                      </>
                    ) : (
                      <span>Nil</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      ) : (
        <div>No data available</div>
      )}
    </div>
  );
}

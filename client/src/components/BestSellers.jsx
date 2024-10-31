import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Badge, Spinner } from "flowbite-react";

const BestSellers = () => {
  const [bestSellingBooks, setBestSellingBooks] = useState([]);
  const [bestSellingCategories, setBestSellingCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await axios.get("/api/sales/best-sellers");
        console.log(response.data);
        setBestSellingBooks(response.data.bestSellingBooks);
        setBestSellingCategories(response.data.bestSellingCategories);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching best sellers:", error);
        setLoading(false);
      }
    };
    fetchBestSellers();
  }, []);

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Best Selling Books</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bestSellingBooks.map((book) => (
          <Card key={book._id} className="p-4 shadow-lg">
            <div className="flex ">
              <img
                src={book.bookDetails.images}
                alt={book.title}
                className="w-20 h-20 object-cover mr-4 mb-2 rounded"
              />
              <div>
                <h3 className="text-lg font-bold">{book.title}</h3>
                <p className="text-gray-500">Sales: {book.totalSales}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Best Selling Categories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bestSellingCategories.map((category) => (
          <Card key={category._id} className="p-4 shadow-lg">
            <h3 className="text-lg font-bold">{category.categoryName}</h3>
            <p className="text-gray-500">Sales: {category.totalSales}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BestSellers;

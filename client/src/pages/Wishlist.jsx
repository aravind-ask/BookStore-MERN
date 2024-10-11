import React, { useState, useEffect } from "react";
import BookCard from "../components/BookCard";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/wishlist/get-wishlist/${currentUser._id}`
        );
        const data = await response.json();
        setWishlist(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  return (
    <div className="p-8">
      <nav className="flex mt-8 mb-8">
        <ol className="breadcrumb flex items-center text-sm gap-5">
          <li className="breadcrumb-item">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 transition duration-300 ease-in-out"
            >
              <i className="fas fa-home mr-1"></i> Home
            </Link>
          </li>
          <li className="breadcrumb-item">
            <span className="text-gray-600">/</span>
          </li>
          <li className="breadcrumb-item">
            <Link
              to="/books"
              className="text-gray-600 hover:text-gray-900 transition duration-300 ease-in-out"
            >
              <i className="fas fa-book mr-1"></i> Profile
            </Link>
          </li>
          <li className="breadcrumb-item">
            <span className="text-gray-600">/</span>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            <span className="text-gray-900 font-bold">Wishlist</span>
          </li>
        </ol>
      </nav>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Wishlist ({wishlist.length})</h1>
        <button className="border border-black px-4 py-2">
          Move All To Bag
        </button>
      </div>
      <div className="grid grid-cols-4 gap-6 mb-12">
        {loading ? (
          <p className="text-xl text-gray-500">Loading...</p>
        ) : (
          wishlist.map((book) => <BookCard key={book._id} book={book} />)
        )}
      </div>
    </div>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "flowbite-react";

const BookCard = ({ book }) => {
  const hasDiscount = book.discountedPrice < book.price;
  const discountPercentage = hasDiscount
    ? ((book.price - book.discountedPrice) / book.price) * 100
    : 0;

  return (
    <Link to={`/book/${book.slug}`}>
      <div className="relative dark:bg-gray-800 bg-white p-4 rounded-lg shadow-lg w-64 hover:shadow-2xl hover:scale-105 transition duration-300 ease-in-out transform">
        {/* Display offer badge if there's a discount */}
        {hasDiscount && (
          <Badge color="failure" className="absolute top-2 left-2 text-sm">
            {Math.round(discountPercentage)}% OFF
          </Badge>
        )}

        {/* Book Image */}
        <img
          src={book.images[0]}
          alt={book.title}
          className="object-cover w-full h-48 rounded-lg mb-4"
        />

        {/* Book Details */}
        <div className="flex flex-col h-full justify-between">
          {/* Book Title */}
          <h3 className="text-lg font-bold mb-1 dark:text-gray-100 text-gray-800">
            {book.title}
          </h3>

          {/* Author */}
          <p className="text-gray-600 dark:text-gray-400 mb-1">{book.author}</p>

          {/* Price with Discount */}
          {hasDiscount ? (
            <div className="text-red-500 font-bold">
              ₹{book.discountedPrice.toFixed(2)}{" "}
              <span className="line-through text-gray-500">
                ₹{book.price.toFixed(2)}
              </span>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              ₹{book.price ? book.price.toFixed(2) : "Price not available"}
            </p>
          )}
          {/* Bottom Section */}
          {/* {book.bestOffer && (
            <div className="mt-3">
              <span className="text-sm text-green-600 dark:text-green-400">
                {book.bestOffer.title}
              </span>
            </div>
          )} */}
        </div>
      </div>
    </Link>
  );
};

export default BookCard;

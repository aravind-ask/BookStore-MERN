import React from "react";
import { Link } from "react-router-dom";

const BookCard = ({ book }) => {
  return (
    <Link to={`/book/${book.slug}`}>
      <div className="dark:bg-gray-800 p-4 rounded-lg shadow-lg w-64 h-80 hover:shadow-2xl hover:scale-105 hover:bg-gray-100 transition duration-300 ease-in-out">
        <img
          src={book.images[0]}
          alt={book.title}
          className="object-fit: contain w-full h-48 rounded-lg mb-4"
        />
        <div className="flex-grow">
          <h3 className="text-lg font-bold mb-2 dark:text-gray-100">
            {book.title}
          </h3>
          <p className="text-gray-600 mb-2 dark:text-gray-100">{book.author}</p>
          <p className="text-gray-600 mb-2 dark:text-gray-100">
            {book.price ? `₹${book.price.toFixed(2)}` : "Price not available"}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;

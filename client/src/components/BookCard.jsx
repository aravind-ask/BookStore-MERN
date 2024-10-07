import React from "react";

const BookCard = ({ book }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg w-64 h-80">
      <img
        src={book.images[0]}
        alt={book.title}
        className="object-fit: contain w-full h-48 rounded-lg mb-4"
      />
      <div className="flex-grow">
        <h3 className="text-lg font-bold mb-2">{book.title}</h3>
        <p className="text-gray-600 mb-2">{book.author}</p>
        <p className="text-gray-600 mb-2">
          {book.price ? `₹${book.price.toFixed(2)}` : "Price not available"}
        </p>
      </div>
    </div>
  );
};

export default BookCard;

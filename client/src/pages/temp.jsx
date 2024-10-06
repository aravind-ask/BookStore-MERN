import React from "react";

export default function temp() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col md:flex-row">
        <div className="flex-none w-full md:w-1/3">
          <Carousel images={book.images} />
        </div>
        <div className="mt-8 md:mt-0 md:ml-8 flex-grow">
          <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
          <p className="text-gray-600 mb-2">{book.author}</p>
          <div className="flex items-center mb-2">
            <div className="text-yellow-500">
              {[...Array(Math.floor(book.rating))].map((_, i) => (
                <i key={i} className="fas fa-star"></i>
              ))}
              {book.rating % 1 !== 0 && (
                <i className="fas fa-star-half-alt"></i>
              )}
            </div>
            <p className="text-gray-600 ml-2">({book.reviews})</p>
          </div>
          <div className="text-2xl font-bold text-red-500 mb-2">
            ${book.price.toFixed(2)}{" "}
            <span className="line-through text-gray-500">
              ${book.originalPrice.toFixed(2)}
            </span>
          </div>
          <p className="text-gray-600 mb-2">
            Listed By: <span className="font-bold">{book.listedBy}</span>
          </p>
          <p className="text-gray-600 mb-2">
            Categories: <span className="font-bold">{book.category}</span>
          </p>
          <p className="text-gray-600 mb-2">
            Condition: <span className="font-bold">{book.condition}</span>
          </p>
          <div className="flex items-center mb-4">
            <p className="text-gray-600 mr-2">Share:</p>
            <i className="fab fa-facebook text-blue-600 mr-2"></i>
            <i className="fab fa-twitter text-blue-400 mr-2"></i>
            <i className="fab fa-instagram text-pink-600"></i>
          </div>
          <div className="flex space-x-4">
            <button className="bg-red-500 text-white px-6 py-2 rounded-lg">
              Buy Now
            </button>
            <button className="bg-red-500 text-white px-6 py-2 rounded-lg">
              Add To Cart
            </button>
            <button className="bg-white border border-gray-300 text-gray-600 px-6 py-2 rounded-lg">
              <i className="far fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Description</h2>
        <p className="text-gray-600 mb-4">{book.description}</p>
        <h2 className="text-xl font-bold mb-2">More details</h2>
        <ul className="list-disc list-inside text-gray-600">
          {book.moreDetails.map((detail, index) => (
            <li key={index}>{detail}</li>
          ))}
        </ul>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Related Books</h2>
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <img
              src="https://placehold.co/150x200"
              alt="Book cover"
              className="w-full h-auto rounded-lg mb-4"
            />
            <h3 className="text-lg font-bold mb-2">Mens Fashion Wear</h3>
            <p className="text-gray-600 mb-2">$41.00</p>
            <div className="text-yellow-500">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star-half-alt"></i>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <img
              src="https://placehold.co/150x200"
              alt="Book cover"
              className="w-full h-auto rounded-lg mb-4"
            />
            <h3 className="text-lg font-bold mb-2">Women's Fashion</h3>
            <p className="text-gray-600 mb-2">$67.00</p>
            <div className="text-yellow-500">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star-half-alt"></i>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <img
              src="https://placehold.co/150x200"
              alt="Book cover"
              className="w-full h-auto rounded-lg mb-4"
            />
            <h3 className="text-lg font-bold mb-2">Web Dummy Fashion</h3>
            <p className="text-gray-600 mb-2">$67.00</p>
            <div className="text-yellow-500">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star-half-alt"></i>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <img
              src="https://placehold.co/150x200"
              alt="Book cover"
              className="w-full h-auto rounded-lg mb-4"
            />
            <h3 className="text-lg font-bold mb-2">Beyond Heaven</h3>
            <p className="text-gray-600 mb-2">$67.00</p>
            <div className="text-yellow-500">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star-half-alt"></i>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <img
              src="https://placehold.co/150x200"
              alt="Book cover"
              className="w-full h-auto rounded-lg mb-4"
            />
            <h3 className="text-lg font-bold mb-2">Top Wall Digital Clock</h3>
            <p className="text-gray-600 mb-2">$31.00</p>
            <div className="text-yellow-500">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star-half-alt"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

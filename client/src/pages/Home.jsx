import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import BookCard from "../components/BookCard";

export default function Home() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      const res = await fetch("/api/books/getbooks");
      const data = await res.json();
      setBooks(data.books);
      console.log(data);
    };

    const fetchCategories = async () => {
      const res = await fetch("/api/category/get-categories");
      const data = await res.json();
      console.log(data);
      setCategories(data);
    };

    fetchBooks();
    fetchCategories();
  }, []);

  // Filter books by category
  const getBooksByCategory = (categoryId) =>
    books.filter((book) => book.category._id === categoryId);

  return (
    <div>
      {/* Hero Section */}
      <div className="flex flex-col gap-6 p-28 px-3 max-w-6xl mx-auto text-center">
        <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
          Welcome to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500">
            ReBook
          </span>
          <br />
          <span className="text-xs sm:text-sm text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            Connecting readers across the world.
          </span>
        </h1>

        <p className="text-gray-500 text-xs sm:text-sm max-w-xl mx-auto">
          Your go-to destination for buying, selling, and swapping second-hand
          books! Dive into a world of stories and unlock hidden treasures while
          giving books a second life. Whether you're hunting for a rare find or
          ready to pass on your favorites, we’re here to connect you with fellow
          book lovers. Happy reading and trading!
        </p>

        <div className="flex gap-6 justify-center">
          <Link
            to="/books"
            className="text-xs sm:text-sm text-teal-500 font-bold hover:underline"
          >
            View all books
          </Link>
          <Link
            to="/create-post"
            className="text-xs sm:text-sm text-teal-500 font-bold hover:underline"
          >
            List a Book
          </Link>
        </div>
      </div>

      {/* Category Sections */}
      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-10 py-7">
        {categories &&
          categories.length > 0 &&
          categories.map((category) => {
            const categoryBooks = getBooksByCategory(category._id);
            return (
              categoryBooks.length > 0 && (
                <div key={category._id} className="flex flex-col gap-6">
                  {/* Category Title */}
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-gray-800">
                      {category.name}
                    </h2>
                    <Link
                      to={`/books?searchTerm=&sort=desc&category=${category._id}&showOutOfStock=true`}
                      className="text-teal-500 hover:underline"
                    >
                      View all in {category.name}
                    </Link>
                  </div>

                  {/* Book Cards */}
                  <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                    {categoryBooks.slice(0, 4).map((book) => (
                      <BookCard key={book._id} book={book} />
                    ))}
                  </div>
                </div>
              )
            );
          })}
      </div>

      {/* Call to Action */}
      <div className="mt-16 p-6 text-center">
        <h3 className="text-lg sm:text-xl font-semibold mb-4">
          Don't see the book you're looking for?
        </h3>
        <Link
          to="/create-post"
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:bg-green-600 transition-all"
        >
          List a Book Now
        </Link>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import PostCard from "../components/BookCard";
import BookCard from "../components/BookCard";

export default function Home() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      const res = await fetch("/api/books/getbooks");
      const data = await res.json();
      setBooks(data.books);
    };
    fetchBooks();
  }, []);
  return (
    <div>
      <div className="flex flex-col gap-6 p-28 px-3 max-w-6xl mx-auto ">
        <h1 className="text-3xl font-bold lg:text-6xl">
          Welcome to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500">
            ReBook
          </span>
          <br />
          <span className="text-xs sm:text-sm text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            Connecting readers across the world.
          </span>
        </h1>

        <p className="text-gray-500 text-xs sm:text-sm">
          Your go-to destination for buying, selling,
          and swapping second-hand books! Dive into a world of stories and
          unlock hidden treasures while giving books a second life. Whether
          you're hunting for a rare find or ready to pass on your favorites,
          we’re here to connect you with fellow book lovers. Happy reading and
          trading!
        </p>
        <div className="flex gap-6">
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

      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 py-7">
        {books && books.length > 0 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-semibold text-center">Recent Books</h2>
            <div className="flex flex-wrap gap-4">
              {books.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
            <Link
              to={"/books"}
              className="text-lg text-teal-500 hover:underline text-center"
            >
              View all books
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

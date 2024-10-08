import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Button, Spinner } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import CommentSection from "../components/CommentSection";
import BookCard from "../components/BookCard";

export default function PostPage() {
  const { bookSlug } = useParams();
  const [loading, setloading] = useState(true);
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);
  const [lightbox, setLightbox] = useState({
    images: [],
    isOpen: false,
  });

  const [relatedBooks, setRelatedBooks] = useState([]);
  useEffect(() => {
    const fetchRelatedBooks = async () => {
      if (!book) return;

      try {
        const authorRelatedBooksResponse = await fetch(
          `/api/books/getbooks?author=${book.author}`
        );
        const categoryRelatedBooksResponse = await fetch(
          `/api/books/getbooks?category=${book.category}`
        );

        const authorRelatedBooks = await authorRelatedBooksResponse.json();
        const categoryRelatedBooks = await categoryRelatedBooksResponse.json();
        console.log(authorRelatedBooks);
        console.log(categoryRelatedBooks);
        let filteredBooks = [
          ...authorRelatedBooks.books,
          ...categoryRelatedBooks.books,
        ].filter((fbook) => fbook._id !== book._id);

        // Remove duplicates
        filteredBooks = filteredBooks.filter(
          (book, index, self) =>
            index === self.findIndex((b) => b._id === book._id)
        );
        console.log(filteredBooks);
        setRelatedBooks(filteredBooks.slice(0, 5));
      } catch (error) {
        console.error(error);
      }
    };

    fetchRelatedBooks();
  }, [book]);

  const handleImageClick = (index) => {
    setLightbox({
      images: book.images,
      isOpen: true,
      startIndex: index,
    });
  };

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setloading(true);
        const res = await fetch(`/api/books/getbooks?slug=${bookSlug}`);
        const data = await res.json();
        if (!res.ok) {
          setloading(false);
          setError(data.message);
          return;
        }
        if (res.ok) {
          setloading(false);
          setBook(data.books[0]);
          setError(null);
        }
      } catch (error) {
        setloading(false);
        setError(error.message);
      }
    };
    fetchBook();
  }, [bookSlug]);

  const [listedBy, setListedBy] = useState(null);

  useEffect(() => {
    const fetchListedBy = async () => {
      if (book) {
        try {
          const res = await fetch(`/api/user/${book.seller}`);
          const data = await res.json();
          setListedBy(data);
          console.log(data);
        } catch (error) {
          console.error(error);
        }
      }
    };
    fetchListedBy();
  }, [book]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  if (error) {
    return <div>{error}</div>;
  }
  if (!book) {
    return <div>Book not found</div>;
  }
  return (
    <main className="max-w-6xl mx-auto pt-5">
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
              <i className="fas fa-book mr-1"></i> Books
            </Link>
          </li>
          <li className="breadcrumb-item">
            <span className="text-gray-600">/</span>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            <span className="text-gray-900 font-bold">{book.title}</span>
          </li>
        </ol>
      </nav>
      <div className=" p-8 rounded-lg shadow-lg flex flex-col md:flex-row dark:bg-gray-800">
        <div className="max-w-md mx-auto p-8">
          <Carousel
            axis="horizontal"
            autoPlay={true}
            interval={3000}
            swipeable={true}
            dynamicHeight={true}
            centerMode={true}
            centerSlidePercentage={80}
            showArrows={true}
            showIndicators={true}
            showStatus={false}
            showThumbs={false}
            transitionTime={1000}
            width="100%"
          >
            {book.images.map((image, index) => (
              <div key={index} className="inline-block w-80 h-80">
                <img
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className="object-contain w-full h-full rounded-lg"
                  onClick={() => handleImageClick(index)}
                />
              </div>
            ))}
          </Carousel>
          {lightbox.isOpen && (
            <Lightbox
              images={lightbox.images.map((image) => ({ src: image }))}
              open={lightbox.isOpen}
              index={lightbox.startIndex}
              close={() => setLightbox({ ...lightbox, isOpen: false })}
              clickOutside={() => setLightbox({ ...lightbox, isOpen: false })}
              clickImage={() => console.log("image")}
              clickPrev={() => console.log("prev")}
              clickNext={() => console.log("next")}
            />
          )}
        </div>
        <div className="mt-10 md:mt-0 md:ml-8 flex-grow">
          <h1 className="text-3xl font-bold mb-2 dark:text-gray-100">
            {book.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-100 mb-2">{book.author}</p>

          <div className="text-2xl font-bold text-red-500 mb-2">
            {book.price ? `₹${book.price.toFixed(2)}` : "Price not available"}{" "}
            {/* <span className="line-through text-gray-500">
              ${book.originalPrice.toFixed(2)}
            </span> */}
          </div>
          <p className="text-gray-600 mb-2 dark:text-gray-100">
            Listed By:{" "}
            <span className="font-bold">{listedBy && listedBy.username}</span>
          </p>
          <p className="text-gray-600 mb-2 dark:text-gray-100">
            Categories: <span className="font-bold">{book.category}</span>
          </p>
          <p className="text-gray-600 mb-2 dark:text-gray-100">
            Publisher: <span className="font-bold">{book.publisher}</span>
          </p>
          <h2 className="text-xl font-bold mb-2 dark:text-gray-100">
            Description
          </h2>
          <div
            className="text-gray-600 mb-4 dark:text-gray-100"
            dangerouslySetInnerHTML={{ __html: book && book.description }}
          ></div>
          <p className="text-gray-600 mb-2 dark:text-gray-100">
            Condition: <span className="font-bold">{book.condition}</span>
          </p>

          <div className="flex space-x-4">
            <Button className="bg-red-500 text-white px-6 py-2 rounded-lg">
              Buy Now
            </Button>
            <Button className="bg-red-500 text-white px-6 py-2 rounded-lg">
              Add To Cart
            </Button>
            <Button className="bg-white border border-gray-300 text-gray-600 px-6 py-2 rounded-full">
              <i className="fas fa-heart text-lg dark:text-gray-100"></i>
            </Button>
          </div>
          <div className="flex items-center mt-4 mb-4 dark:text-gray-100">
            <p className="text-gray-600 mr-2 dark:text-gray-100">Share:</p>
            <i className="fab fa-facebook text-blue-600 mr-2"></i>
            <i className="fab fa-twitter text-blue-400 mr-2"></i>
            <i className="fab fa-instagram text-pink-600"></i>
          </div>
        </div>
      </div>
      <CommentSection bookId={book._id} />
      <div className="mt-8">
        <div className="text-yellow-500">
          {book.rating
            ? [...Array(Math.floor(book.rating))].map((_, i) => (
                <i key={i} className="fas fa-star"></i>
              ))
            : null}
          {/* {book.rating % 1 !== 0 && <i className="fas fa-star-half-alt"></i>} */}
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Related Books</h2>
        <div className="grid grid-cols-5 gap-4">
          {relatedBooks.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      </div>
    </main>
  );
}

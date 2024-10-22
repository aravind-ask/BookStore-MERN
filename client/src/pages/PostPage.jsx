import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Button, Spinner } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CommentSection from "../components/CommentSection";
import BookCard from "../components/BookCard";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "../redux/cart/cartSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Modal from "react-modal";

export default function PostPage() {
  const { currentUser } = useSelector((state) => state.user);
  const { cartItems } = useSelector((state) => state.cart);
  console.log("Cart:", cartItems);

  const { bookSlug } = useParams();
  const [loading, setloading] = useState(true);
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const [relatedBooks, setRelatedBooks] = useState([]);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  // Function to open modal with selected image
  const handleImageClick = (image) => {
    setSelectedImage(image);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedImage("");
  };

  // Slider settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "20%",
    autoplay: true,
    autoplaySpeed: 3000,
    swipe: true,
    arrows: true,
  };

  useEffect(() => {
    const fetchRelatedBooks = async () => {
      if (!book) return;
      try {
        const authorRelatedBooksResponse = await fetch(
          `/api/books/getbooks?author=${book.author}`
        );
        const categoryRelatedBooksResponse = await fetch(
          `/api/books/getbooks?category=${book.category._id}`
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

  const handleAddToCart = () => {
    const existingItem = cartItems?.items?.find(
      (item) => item.bookId === book._id
    );
    if (existingItem && existingItem.quantity + 1 > book.stock) {
      toast.error("You have reached the stock limit");
      return;
    } else if (existingItem && existingItem.quantity + 1 > 5) {
      toast.error("You have reached the order limit");
      return;
    }
    dispatch(
      addToCart({ userId: currentUser._id, bookId: book._id, quantity: 1 })
    ).then((data) => {
      if (data?.payload) {
        dispatch(fetchCartItems(currentUser._id));
        toast.success("Book added to cart");
      }
    });
  };

  const handleWishlist = async () => {
    try {
      if (!currentUser || !book) {
        throw new Error("User  or book data is missing");
      }

      const requestBody = {
        bookId: book._id,
        userId: currentUser._id,
        userName: currentUser.username,
        title: book.title,
        price: book.price,
        images: book.images,
        slug: book.slug,
        author: book.author,
      };

      const response = await fetch("/api/wishlist/add-to-wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to add book to wishlist");
      }

      const data = await response.json();
      // Update the UI to reflect the change
      // For example, display a success message or update a wishlist count
      toast.success("Book added to wishlist");
    } catch (error) {
      console.error(error);
      // Display an error message to the user
      alert("Failed to add book to wishlist. Please try again later.");
    }
  };

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
      <ToastContainer />
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
          <Slider {...settings}>
            {book.images.map((image, index) => (
              <div key={index} className="inline-block w-80 h-80">
                <img
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className="object-contain w-full h-full rounded-lg cursor-pointer"
                  onClick={() => handleImageClick(image)} // Open modal on click
                />
              </div>
            ))}
          </Slider>
        </div>
        <div className="mt-10 md:mt-0 md:ml-8 flex-grow">
          <h1 className="text-3xl font-bold mb-2 dark:text-gray-100">
            {book.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-100 mb-2">{book.author}</p>

          {book.discountedPrice < book.price ? (
            <div>
              <p>
                <span className="line-through">₹{book.price.toFixed(2)}</span>{" "}
                <span className="text-red-500">
                  ₹{book.discountedPrice.toFixed(2)}
                </span>
              </p>
              {book.bestOffer && (
                <p className="text-green-500">
                  {book.bestOffer.discountPercentage}% off:{" "}
                  {book.bestOffer.title}
                </p>
              )}
            </div>
          ) : (
            <p>₹{book.price.toFixed(2)}</p>
          )}
          <p className="text-gray-600 mb-2 dark:text-gray-100">
            Listed By:{" "}
            <span className="font-bold">{listedBy && listedBy.username}</span>
          </p>
          <p className="text-gray-600 mb-2 dark:text-gray-100">
            Categories: <span className="font-bold">{book.category.name}</span>
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
            Condition: <span className="font-bold">{book.Condition}</span>
          </p>
          <p className="text-gray-600 mb-2 dark:text-gray-100">
            Stock:{" "}
            <span className="font-bold">
              {book.stock > 0 ? book.stock : "Out of stock"}
            </span>
          </p>

          <div className="flex space-x-4">
            <Button
              className="bg-red-500 text-white px-6 py-2 rounded-lg"
              disabled={book.stock === 0}
            >
              Buy Now
            </Button>
            <Button
              onClick={handleAddToCart}
              className="bg-red-500 text-white px-6 py-2 rounded-lg"
              disabled={book.stock === 0}
            >
              Add To Cart
            </Button>
            <Button
              onClick={handleWishlist}
              className="bg-white border border-gray-300 text-gray-600 px-6 py-2 rounded-full"
            >
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
        <div className="grid grid-cols-5 gap-10">
          {relatedBooks.map((book) => (
            <div key={book.bookSlug} className="m-10">
              <BookCard key={book._id} book={book} />
            </div>
          ))}
        </div>
        {/* Modal for zoomed image */}
        <Modal
          isOpen={isOpen}
          onRequestClose={closeModal}
          shouldCloseOnOverlayClick={true}
          contentLabel="Zoomed Image"
          className="flex justify-center items-center h-full"
          overlayClassName="fixed inset-0 bg-black bg-opacity-75 z-50"
        >
          <div className="relative">
            <button
              className="absolute top-2 right-2 text-white text-2xl"
              onClick={closeModal}
            >
              &times;
            </button>
            <img
              src={selectedImage}
              alt="Zoomed"
              className="max-h-screen max-w-screen object-contain"
            />
          </div>
        </Modal>
      </div>
    </main>
  );
}

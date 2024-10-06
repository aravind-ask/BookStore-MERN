import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Button, Spinner } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";


export default function PostPage() {
  const { bookSlug } = useParams();
  const [loading, setloading] = useState(true);
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);
   const [lightbox, setLightbox] = useState({
     images: [],
     isOpen: false,
   });

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
          console.log(data.books[0]);
        }
      } catch (error) {
        setloading(false);
        setError(error.message);
      }
    };
    fetchBook();
  }, [bookSlug]);
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
      <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col md:flex-row">
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
              <div key={index} className="inline-block w-full h-96">
                <img
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className="object-cover w-full h-full rounded-lg"
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
          <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
          <p className="text-gray-600 mb-2">{book.author}</p>

          <div className="text-2xl font-bold text-red-500 mb-2">
            {book.price ? `₹${book.price.toFixed(2)}` : "Price not available"}{" "}
            {/* <span className="line-through text-gray-500">
              ${book.originalPrice.toFixed(2)}
            </span> */}
          </div>
          <p className="text-gray-600 mb-2">
            Listed By: <span className="font-bold">{book.seller}</span>
          </p>
          <p className="text-gray-600 mb-2">
            Categories: <span className="font-bold">{book.category}</span>
          </p>
          <p className="text-gray-600 mb-2">
            Publisher: <span className="font-bold">{book.publisher}</span>
          </p>
          <h2 className="text-xl font-bold mb-2">Description</h2>
          <div
            className="text-gray-600 mb-4"
            dangerouslySetInnerHTML={{ __html: book && book.description }}
          ></div>
          <p className="text-gray-600 mb-2">
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
              <i className="fas fa-heart text-lg"></i>
            </Button>
          </div>
          <div className="flex items-center mt-4 mb-4">
            <p className="text-gray-600 mr-2">Share:</p>
            <i className="fab fa-facebook text-blue-600 mr-2"></i>
            <i className="fab fa-twitter text-blue-400 mr-2"></i>
            <i className="fab fa-instagram text-pink-600"></i>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <div className="text-yellow-500">
          {book.rating
            ? [...Array(Math.floor(book.rating))].map((_, i) => (
                <i key={i} className="fas fa-star"></i>
              ))
            : null}
          {book.rating % 1 !== 0 && <i className="fas fa-star-half-alt"></i>}
        </div>
        <div className="flex items-center mb-2">
          <p className="text-gray-600 ml-2">Good Book. Interesting</p>
        </div>
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
    </main>
  );
}

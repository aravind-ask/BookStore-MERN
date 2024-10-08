import { Modal, Table, Button } from "flowbite-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { set } from "mongoose";

export default function Dashbooks() {
  const { currentUser } = useSelector((state) => state.user);
  console.log(currentUser);
  const [userBooks, setUserBooks] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState("");
  const [bookToListUnlist, setBookToListUnlist] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch(`/api/books/getbooks?isAdmin=true`);
        const data = await res.json();
        if (res.ok) {
          setUserBooks(data.books);
          if (data.books.length < 9) {
            setShowMore(false);
          }
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    if (currentUser.isAdmin) {
      fetchBooks();
    }
  }, [currentUser._id]);

  const handleShowMore = async () => {
    const startIndex = userBooks.length;
    try {
      const res = await fetch(
        `/api/post/getbooks?isAdmin=true&userId=${currentUser._id}&startIndex=${startIndex}`
      );
      const data = await res.json();
      if (res.ok) {
        setUserBooks((prev) => [...prev, ...data.books]);
        if (data.books.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleListUnlistPost = async (book) => {
    setShowModal(false);
    try {
      const res = await fetch(
        `/api/books/${
          book.isListed ? "unlist" : "list"
        }book/${postIdToDelete}/${currentUser._id}`,
        {
          method: "PATCH",
        }
      );
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        setUserBooks((prev) =>
          prev.map((post) =>
            post._id === book._id ? { ...post, isListed: !post.isListed } : post
          )
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      {currentUser.isAdmin && userBooks.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date updated</Table.HeadCell>
              <Table.HeadCell>Book image</Table.HeadCell>
              <Table.HeadCell>Book title</Table.HeadCell>
              <Table.HeadCell>Author</Table.HeadCell>
              <Table.HeadCell>Publisher</Table.HeadCell>
              <Table.HeadCell>Price</Table.HeadCell>
              <Table.HeadCell>Category</Table.HeadCell>
              <Table.HeadCell>Stock</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>
                <span>Edit</span>
              </Table.HeadCell>
            </Table.Head>
            {userBooks.map((book) => (
              <Table.Body key={book._id} className="divide-y">
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>
                    {new Date(book.updatedAt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    <Link to={`/book/${book.slug}`}>
                      <img
                        src={book.images[0]}
                        alt={book.title}
                        className="w-20 h-10 object-cover bg-gray-500"
                      />
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      className="font-medium text-gray-900 dark:text-white"
                      to={`/book/${book.slug}`}
                    >
                      {book.title}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      className="font-medium text-gray-900 dark:text-white"
                      to={`/book/${book.slug}`}
                    >
                      {book.author}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      className="font-medium text-gray-900 dark:text-white"
                      to={`/book/${book.slug}`}
                    >
                      {book.publisher}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      className="font-medium text-gray-900 dark:text-white"
                      to={`/book/${book.slug}`}
                    >
                      {book.price}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>{book.category}</Table.Cell>
                  <Table.Cell>
                    <Link
                      className="font-medium text-gray-900 dark:text-white"
                      to={`/book/${book.slug}`}
                    >
                      {book.stock}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      onClick={() => {
                        setShowModal(true);
                        setPostIdToDelete(book._id);
                        setBookToListUnlist(book);
                      }}
                      className={`font-medium ${
                        book.isListed ? "text-green-500" : "text-red-500"
                      } hover:underline cursor-pointer`}
                    >
                      {book.isListed ? "Listed" : "UnListed"}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      className="text-teal-500 hover:underline"
                      to={`/update-book/${book._id}`}
                    >
                      <span>Edit</span>
                    </Link>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            ))}
          </Table>
          {showMore && (
            <button
              onClick={handleShowMore}
              className="w-full text-teal-500 self-center text-sm py-7"
            >
              Show more
            </button>
          )}
        </>
      ) : (
        <p>You have no books yet!</p>
      )}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to{" "}
              {bookToListUnlist?.isListed ? "unlist" : "list"} this book?
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                color="failure"
                onClick={() => handleListUnlistPost(bookToListUnlist)}
              >
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

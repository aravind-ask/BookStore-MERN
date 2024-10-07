import { Alert, Button, Modal, TextInput, Textarea } from "flowbite-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Comment from "./Comment";
import { HiOutlineExclamationCircle } from "react-icons/hi";

export default function CommentSection({ bookId }) {
  const { currentUser } = useSelector((state) => state.user);
  const [rating, setRating] = useState("");
  const [ratingError, setRatingError] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [ratingToDelete, setRatingToDelete] = useState(null);
  const navigate = useNavigate();

  const [starRating, setStarRating] = useState(0);

  const handleRatingChange = (newStarRating) => {
    setStarRating(newStarRating);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating.length > 200) {
      return;
    }
    try {
      const res = await fetch("/api/rating/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: rating,
          starRating,
          bookId,
          userId: currentUser._id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setRating("");
        setRatingError(null);
        setRatings([data, ...ratings]);
      }
    } catch (error) {
      setRatingError(error.message);
    }
  };

  useEffect(() => {
    const getratings = async () => {
      try {
        const res = await fetch(`/api/rating/getBookRatings/${bookId}`);
        if (res.ok) {
          const data = await res.json();
          setRatings(data);
          console.log(data);
        }
        if (!res.ok) {
          const data = await res.json();
          console.log(data.message);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    getratings();
  }, [bookId]);

  const handleLike = async (ratingId) => {
    try {
      if (!currentUser) {
        navigate("/sign-in");
        return;
      }
      const res = await fetch(`/api/rating/likeRating/${ratingId}`, {
        method: "PUT",
      });
      if (res.ok) {
        const data = await res.json();
        setRatings(
          ratings.map((rating) =>
            rating._id === ratingId
              ? {
                  ...rating,
                  likes: data.likes,
                  numberOfLikes: data.likes.length,
                }
              : rating
          )
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleEdit = async (rating, editedContent) => {
    setRatings(
      ratings.map((c) =>
        c._id === rating._id ? { ...c, rating: editedContent } : c
      )
    );
  };

  const handleDelete = async (ratingId) => {
    setShowModal(false);
    try {
      if (!currentUser) {
        navigate("/sign-in");
        return;
      }
      const res = await fetch(`/api/rating/deleteRating/${ratingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        setRatings(ratings.filter((rating) => rating._id !== ratingId));
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <div className="max-w-2xl mx-auto w-full p-3">
      {currentUser ? (
        <div className="flex items-center gap-1 my-5 text-gray-500 text-sm">
          <p>Signed in as:</p>
          <img
            className="h-5 w-5 object-cover rounded-full"
            src={currentUser.profilePicture}
            alt=""
          />
          <Link
            to={"/dashboard?tab=profile"}
            className="text-xs text-cyan-600 hover:underline"
          >
            @{currentUser.username}
          </Link>
        </div>
      ) : (
        <div className="text-sm text-teal-500 my-5 flex gap-1">
          You must be signed in to rating.
          <Link className="text-blue-500 hover:underline" to={"/sign-in"}>
            Sign In
          </Link>
        </div>
      )}
      {currentUser && (
        <form
          onSubmit={handleSubmit}
          className="border border-teal-500 rounded-md p-3"
        >
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} onClick={() => handleRatingChange(star)}>
                {star <= starRating ? "★" : "☆"}
              </span>
            ))}
          </div>
          <Textarea
            placeholder="Add a Rerview..."
            rows="3"
            maxLength="200"
            onChange={(e) => setRating(e.target.value)}
            value={rating}
          />
          <div className="flex justify-between items-center mt-5">
            <p className="text-gray-500 text-xs">
              {200 - rating.length} characters remaining
            </p>
            <Button outline gradientDuoTone="purpleToBlue" type="submit">
              Submit
            </Button>
          </div>
          {ratingError && (
            <Alert color="failure" className="mt-5">
              {ratingError}
            </Alert>
          )}
        </form>
      )}
      {ratings.length === 0 ? (
        <p className="text-sm my-5">No Ratings yet!</p>
      ) : (
        <>
          <div className="text-sm my-5 flex items-center gap-1">
            <p>Ratings</p>
            <div className="border border-gray-400 py-1 px-2 rounded-sm">
              <p>{ratings.length}</p>
            </div>
          </div>
          {ratings.map((rating) => (
            <Comment
              key={rating._id}
              rating={rating}
              onLike={handleLike}
              onEdit={handleEdit}
              onDelete={(ratingId) => {
                setShowModal(true);
                setRatingToDelete(ratingId);
              }}
            />
          ))}
        </>
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
              Are you sure you want to delete this rating?
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                color="failure"
                onClick={() => handleDelete(ratingToDelete)}
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

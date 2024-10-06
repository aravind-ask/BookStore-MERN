import { Alert, Button, FileInput, Select, TextInput } from "flowbite-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { useState } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useNavigate } from "react-router-dom";

export default function CreatePost() {
  const [files, setFiles] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [publishError, setPublishError] = useState(null);
  const [validationError, setValidationError] = useState(null);

  const [uploadedImages, setUploadedImages] = useState([]); // new state to store uploaded images

  const navigate = useNavigate();

  const handleUploadImages = async () => {
    try {
      if (files.length === 0) {
        setImageUploadError("Please select images");
        return;
      }
      setImageUploadError(null);
      const storage = getStorage(app);
      const images = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = new Date().getTime() + "-" + file.name;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setImageUploadProgress(progress.toFixed(0));
          },
          (error) => {
            setImageUploadError("Image upload failed");
            setImageUploadProgress(null);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              images.push(downloadURL);
              if (images.length === files.length) {
                setImageUploadProgress(null);
                setImageUploadError(null);
                setFormData({ ...formData, images });
                setUploadedImages(images); // update uploadedImages state
              }
            });
          }
        );
      }
    } catch (error) {
      setImageUploadError("Image upload failed");
      setImageUploadProgress(null);
      console.log(error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/books/add-book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message);
        return;
      }

      if (res.ok) {
        setPublishError(null);
        navigate(`/`);
      }
    } catch (error) {
      setPublishError("Something went wrong");
    }
  };
  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">List a Book</h1>
      <div>
        {publishError && (
          <Alert className="mt-5" color="failure">
            {publishError}
          </Alert>
        )}
      </div>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
            type="text"
            placeholder="Title"
            required
            id="title"
            className="flex-1"
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <Select
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          >
            <option value="uncategorized">Select a category</option>
            <option value="fiction">Fiction</option>
            <option value="non-fiction">Non-Fiction</option>
            <option value="biography">Biography</option>
            <option value="auto-biography">Auto-Biography</option>
            <option value="academic">Academic</option>
          </Select>
        </div>
        <div className="flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3">
          <FileInput
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files))}
          />
          <Button
            type="button"
            gradientDuoTone="purpleToBlue"
            size="sm"
            outline
            onClick={handleUploadImages}
            disabled={imageUploadProgress}
          >
            {imageUploadProgress ? (
              <div className="w-16 h-16">
                <CircularProgressbar
                  value={imageUploadProgress}
                  text={`${imageUploadProgress || 0}%`}
                />
              </div>
            ) : (
              "Upload Image"
            )}
          </Button>
        </div>
        {imageUploadError && <Alert color="failure">{imageUploadError}</Alert>}
        <div className="flex flex-col gap-4">
          {uploadedImages.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {uploadedImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt="Uploaded Image"
                  className="w-32 h-32 object-cover"
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
            type="text"
            placeholder="Author"
            required
            id="author"
            className="flex-1"
            onChange={(e) =>
              setFormData({ ...formData, author: e.target.value })
            }
          />
          <TextInput
            type="text"
            placeholder="Publisher"
            required
            id="publisher"
            className="flex-1"
            onChange={(e) =>
              setFormData({ ...formData, publisher: e.target.value })
            }
          />
          <Select
            onChange={(e) =>
              setFormData({ ...formData, condition: e.target.value })
            }
          >
            <option value="uncategorized">Condition</option>
            <option value="fiction">New</option>
            <option value="non-fiction">Used</option>
            <option value="biography">Good</option>
            <option value="auto-biography">Average</option>
            <option value="academic">Worst</option>
          </Select>
        </div>
        {validationError && (
          <Alert className="mt-5" color="failure">
            {validationError}
          </Alert>
        )}
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
            type="text"
            placeholder="Price"
            required
            id="price"
            className="flex-1"
            onChange={(e) => {
              const value = e.target.value;
              if (!/^\d+$/.test(value)) {
                setValidationError("Please enter a valid number");
                setFormData({ ...formData, price: "" });
              } else {
                setValidationError(null);
                setFormData({ ...formData, price: value });
              }
            }}
          />
          <TextInput
            type="text"
            placeholder="Stock"
            required
            id="stock"
            className="flex-1"
            onChange={(e) => {
              const value = e.target.value;
              if (!/^\d+$/.test(value)) {
                setValidationError("Please enter a valid number");
                setFormData({ ...formData, stock: "" });
              } else {
                setValidationError(null);
                setFormData({ ...formData, stock: value });
              }
            }}
          />
        </div>
        <ReactQuill
          theme="snow"
          placeholder="Description"
          className="h-72 mb-12"
          required
          onChange={(value) => {
            setFormData({ ...formData, description: value });
          }}
        />
        <Button type="submit" gradientDuoTone="purpleToPink">
          Publish
        </Button>
      </form>
    </div>
  );
}

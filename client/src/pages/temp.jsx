import {
  Alert,
  Button,
  FileInput,
  Select,
  Textarea,
  TextInput,
} from "flowbite-react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { useEffect, useState } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useNavigate } from "react-router-dom";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css"; // Make sure to import cropper styles

export default function CreatePost() {
  const [files, setFiles] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [publishError, setPublishError] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [categories, setCategories] = useState([]);

  const [cropper, setCropper] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/category/get-categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Handle Upload and Image Cropping
  const handleUploadImages = async () => {
    try {
      if (!croppedImage) {
        setImageUploadError("Please crop the image before uploading.");
        return;
      }

      setImageUploadError(null);
      const storage = getStorage(app);
      const images = [];
      const fileName = new Date().getTime() + "-" + selectedFile.name; // unique file name
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(
        storageRef,
        dataURLToBlob(croppedImage)
      );

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadProgress(progress.toFixed(0));
        },
        (error) => {
          console.log(error);
          setImageUploadError("Image upload failed");
          setImageUploadProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            images.push(downloadURL);

            if (images.length === 1) {
              setImageUploadProgress(null);
              setImageUploadError(null);
              setFormData({ ...formData, images });
            }
          });
        }
      );
    } catch (error) {
      setImageUploadError("Image upload failed");
      setImageUploadProgress(null);
      console.log(error);
    }
  };

  // Handle image cropping
  const handleCrop = () => {
    if (cropper) {
      const croppedDataUrl = cropper.getCroppedCanvas().toDataURL();
      setCroppedImage(croppedDataUrl);
    }
  };

  // Convert dataURL to Blob for uploading
  const dataURLToBlob = (dataURL) => {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const defaultImageUrls = [
        "https://firebasestorage.googleapis.com/v0/b/rebook-mern.appspot.com/o/1728369326265-sample-sd.jpg?alt=media&token=37523efe-507b-484e-9a80-75e14dee9ada",
        "https://firebasestorage.googleapis.com/v0/b/rebook-mern.appspot.com/o/1728369326265-sample-sd.jpg?alt=media&token=37523efe-507b-484e-9a80-75e14dee9ada",
        "https://firebasestorage.googleapis.com/v0/b/rebook-mern.appspot.com/o/1728369326265-sample-sd.jpg?alt=media&token=37523efe-507b-484e-9a80-75e14dee9ada",
        "https://firebasestorage.googleapis.com/v0/b/rebook-mern.appspot.com/o/1728369326265-sample-sd.jpg?alt=media&token=37523efe-507b-484e-9a80-75e14dee9ada",
      ];
      const imagesArray = [
        ...formData.images,
        ...defaultImageUrls.slice(0, 5 - formData.images.length),
      ];
      const res = await fetch("/api/books/add-book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, images: imagesArray }),
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
      console.log(error);
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
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>
        {/* Existing form components */}

        {/* Image Upload and Cropper */}
        <div className="flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3">
          <FileInput
            id="images"
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />
        </div>
        {selectedFile && (
          <div className="mt-5">
            <Cropper
              src={URL.createObjectURL(selectedFile)}
              style={{ height: 400, width: "100%" }}
              aspectRatio={1}
              guides={true}
              crop={handleCrop}
              ref={(cropper) => setCropper(cropper)}
            />
            <button type="button" onClick={handleCrop}>
              Crop Image
            </button>
          </div>
        )}

        {/* Cropped Image Preview */}
        {croppedImage && (
          <div className="mt-5">
            <h3>Cropped Image Preview:</h3>
            <img src={croppedImage} alt="Cropped" style={{ width: 200 }} />
            <Button onClick={handleUploadImages}>Upload Cropped Image</Button>
          </div>
        )}
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
            <option value="New">New</option>
            <option value="Used">Used</option>
            <option value="Good">Good</option>
            <option value="Average">Average</option>
            <option value="Worst">Worst</option>
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
        <Textarea
          id="description"
          placeholder="Description"
          required
          rows={8}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          value={formData.description || ""}
        />

        {/* Form submission */}
        <Button type="submit" gradientDuoTone="purpleToPink">
          Publish
        </Button>
      </form>
    </div>
  );
}

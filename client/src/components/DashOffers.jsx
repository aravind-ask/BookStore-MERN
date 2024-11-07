import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  TextInput,
  Select,
  Modal,
  Badge,
  Spinner,
  Pagination,
  Checkbox,
  Label,
} from "flowbite-react";
import { HiPencilAlt, HiTrash, HiSearch, HiFilter } from "react-icons/hi";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";

export default function DashOffers() {
  const [offers, setOffers] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    type: "product",
    discountPercentage: "",
    applicableProducts: [],
    applicableCategory: "",
    referralCode: "",
    expiryDate: new Date(),
    isActive: true,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editOfferId, setEditOfferId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterType, setFilterType] = useState("");
  const [filterActive, setFilterActive] = useState("");
  const [filterExpiryDate, setFilterExpiryDate] = useState(null);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchOffers();
  }, [
    currentPage,
    searchTerm,
    sortField,
    sortOrder,
    filterType,
    filterActive,
    filterExpiryDate,
  ]);

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await axios.get("/api/books/getbooks");
      setBooks(res.data.books);
    } catch (error) {
      toast.error("Error fetching books");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/category/get-categories");
      setCategories(res.data);
    } catch (error) {
      toast.error("Error fetching categories");
    }
  };

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        sortField,
        sortOrder,
        search: searchTerm,
        type: filterType,
        isActive: filterActive,
        expiryDate: filterExpiryDate ? filterExpiryDate.toISOString() : "",
      });

      const res = await axios.get(`/api/offer?${params}`);
      setOffers(res.data.offers);
      setTotalPages(res.data.totalPages);
      setStats(res.data.stats);
    } catch (error) {
      toast.error("Error fetching offers");
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const offerExists = offers.some(
      (offer) => offer.title.toLowerCase() === formData.title.toLowerCase()
    );

    if (offerExists) {
      toast.error("Offer with the same title already exists");
      return;
    }

    if (parseFloat(formData.discountPercentage) > 100) {
      toast.error("Discount cannot exceed 100%");
      return;
    }

    try {
      if (isEditing) {
        await axios.patch(`/api/offer/${editOfferId}`, formData);
        toast.success("Offer updated successfully");
      } else {
        await axios.post("/api/offer/", formData);
        toast.success("Offer created successfully");
      }
      setShowModal(false);
      setIsEditing(false);
      fetchOffers();
    } catch (error) {
      toast.error("Error creating or updating the offer");
    }
  };

  const handleEditOffer = (offer) => {
    setFormData({
      ...offer,
      expiryDate: offer.expiryDate ? new Date(offer.expiryDate) : null,
    });
    setEditOfferId(offer._id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteOffer = async (id) => {
    try {
      await axios.delete(`/api/offer/${id}`);
      toast.success("Offer deleted successfully");
      fetchOffers();
    } catch (error) {
      toast.error("Error deleting the offer");
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto pt-4">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Offers</h1>
      <div className="flex justify-between mb-4">
        <TextInput
          id="search"
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search offers"
          icon={HiSearch}
        />
        <Button onClick={() => setShowModal(true)}>Create Offer</Button>
      </div>
      <div className="flex justify-between mb-4">
        <p>Total Offers: {totalPages * 10}</p>
        <p>Average Discount: {stats?.avgDiscount?.toFixed(2)}%</p>
        <p>Maximum Discount: {stats.maxDiscount}%</p>
        <p>Active Offers: {stats.activeOffers}</p>
      </div>
      <div className="flex justify-between mb-4">
        <Select
          id="sortField"
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
        >
          <option value="createdAt">Created At</option>
          <option value="title">Title</option>
          <option value="discountPercentage">Discount Percentage</option>
        </Select>
        <Select
          id="sortOrder"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </Select>
        <Select
          id="filterType"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="product">Product</option>
          <option value="category">Category</option>
        </Select>
        <Select
          id="filterActive"
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </Select>
        <DatePicker
          id="filterExpiryDate"
          selected={filterExpiryDate}
          onChange={(date) => setFilterExpiryDate(date)}
          placeholderText="Filter by Expiry Date"
        />
      </div>
      <Table>
        <Table.Head>
          <Table.HeadCell>Offer Title</Table.HeadCell>
          <Table.HeadCell>Discount Percentage</Table.HeadCell>
          <Table.HeadCell>Expiry Date</Table.HeadCell>
          <Table.HeadCell>Status</Table.HeadCell>
          <Table.HeadCell>Type</Table.HeadCell>
          <Table.HeadCell>Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {offers.map((offer) => (
            <Table.Row key={offer._id}>
              <Table.Cell>{offer.title}</Table.Cell>
              <Table.Cell>{offer.discountPercentage}%</Table.Cell>
              <Table.Cell>
                {offer.expiryDate && !isNaN(new Date(offer.expiryDate))
                  ? new Date(offer.expiryDate).toLocaleDateString()
                  : "Invalid Date"}
              </Table.Cell>
              <Table.Cell>
                <Badge color={offer.isActive ? "success" : "danger"}>
                  {offer.isActive ? "Active" : "Inactive"}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                {offer.type === "product" ? (
                  <span>Book: {offer?.applicableProducts?.join(", ")}</span>
                ) : (
                  <span>Category: {offer?.applicableCategory}</span>
                )}
              </Table.Cell>
              <Table.Cell className="flex gap-5">
                {/* <Button size="xs" onClick={() => handleEditOffer(offer)}>
                  <HiPencilAlt />
                </Button> */}
                <Button
                  size="xs"
                  color="failure"
                  onClick={() => handleDeleteOffer(offer._id)}
                >
                  <HiTrash />
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      {loading ? (
        <Spinner />
      ) : (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>{isEditing ? "Edit Offer" : "Create Offer"}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="title">Offer Title</Label>
              <TextInput
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Offer Title"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="type">Offer Type</Label>
              <Select
                id="type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="product">Product</option>
                <option value="category">Category</option>
              </Select>
            </div>
            {formData.type === "product" && (
              <div className="mb-4">
                <Label htmlFor="applicableProducts">Applicable Product</Label>
                <Select
                  id="applicableProducts"
                  value={formData.applicableProducts[0] || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      applicableProducts: [e.target.value],
                    })
                  }
                >
                  <option value="">Select a book</option>
                  {books.map((book) => (
                    <option key={book._id} value={book._id}>
                      {book.title}
                    </option>
                  ))}
                </Select>
              </div>
            )}
            {formData.type === "category" && (
              <div className="mb-4">
                <Label htmlFor="applicableCategory">Applicable Category</Label>
                <Select
                  id="applicableCategory"
                  value={formData.applicableCategory}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      applicableCategory: e.target.value,
                    })
                  }
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}
            <div className="mb-4">
              <Label htmlFor="discountPercentage">Discount Percentage</Label>
              <TextInput
                id="discountPercentage"
                type="number"
                value={formData.discountPercentage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountPercentage: e.target.value,
                  })
                }
                placeholder="Discount Percentage"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <DatePicker
                id="expiryDate"
                selected={formData.expiryDate}
                onChange={(date) =>
                  setFormData({ ...formData, expiryDate: date })
                }
                placeholderText="Expiry Date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="isActive" className="flex items-center">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
                <span className="ml-2">Is Active</span>
              </Label>
            </div>
            <Button type="submit">
              {isEditing ? "Update Offer" : "Create Offer"}
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

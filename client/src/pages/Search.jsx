import {
  Button,
  Select,
  TextInput,
  ToggleSwitch,
  Pagination,
} from "flowbite-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BookCard from "../components/BookCard";

export default function Search() {
  const [sidebarData, setSidebarData] = useState({
    searchTerm: "",
    sort: "desc",
    category: "uncategorized",
  });

  const [showOutOfStock, setShowOutOfStock] = useState(true); // default: show out-of-stock products

  console.log(sidebarData);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [categories, setCategories] = useState([]);

  const booksPerPage = 9;

  const location = useLocation();

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

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    const sortFromUrl = urlParams.get("sort");
    const categoryFromUrl = urlParams.get("category");
    if (searchTermFromUrl || sortFromUrl || categoryFromUrl) {
      setSidebarData({
        ...sidebarData,
        searchTerm: searchTermFromUrl,
        sort: sortFromUrl,
        category: categoryFromUrl || "uncategorized",
      });
    }

    const fetchPosts = async () => {
      setLoading(true);
      const searchQuery = urlParams.toString();
      const res = await fetch(
        `/api/books/getbooks?${searchQuery}&page=${currentPage}&limit=${booksPerPage}`
      );
      if (!res.ok) {
        setLoading(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        const filteredBooks = data.books.filter(
          (book) =>
            (showOutOfStock || book.stock > 0)
        );

        if (sidebarData.sort === "priceAsc") {
          filteredBooks.sort((a, b) => a.price - b.price);
        } else if (sidebarData.sort === "priceDesc") {
          filteredBooks.sort((a, b) => b.price - a.price);
        } else if (sidebarData.sort === "aA") {
          filteredBooks.sort((a, b) =>
            a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
          );
        } else if (sidebarData.sort === "zZ") {
          filteredBooks.sort((a, b) =>
            b.title.localeCompare(a.title, undefined, { sensitivity: "base" })
          );
        }
        setTotalPages(Math.ceil(data.totalBooks / booksPerPage));
        setBooks(filteredBooks);
        console.log("fil",filteredBooks)
        setLoading(false);
      }
    };
    fetchPosts();
  }, [location.search, showOutOfStock, currentPage]);

  const onPageChange = (page) => {
    setCurrentPage(page);
  };
  
  const applyFilters = (filters) => {
    const urlParams = new URLSearchParams();
    urlParams.set("searchTerm", filters.searchTerm);
    urlParams.set("sort", filters.sort);
    urlParams.set("category", filters.category);
    urlParams.set("showOutOfStock", showOutOfStock);
    const searchQuery = urlParams.toString();
    navigate(`/books?${searchQuery}`);
  };
  const handleChange = (e) => {
    let newSidebarData = { ...sidebarData };

    if (e.target.id === "searchTerm") {
      newSidebarData.searchTerm = e.target.value;
    }
    if (e.target.id === "sort") {
      newSidebarData.sort = e.target.value || "desc";
    }
    if (e.target.id === "category") {
      newSidebarData.category = e.target.value || "uncategorized";
    }

    setSidebarData(newSidebarData);
    applyFilters(newSidebarData);
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   const urlParams = new URLSearchParams(location.search);
  //   urlParams.set("searchTerm", sidebarData.searchTerm);
  //   urlParams.set("sort", sidebarData.sort);
  //   urlParams.set("category", sidebarData.category);
  //   urlParams.set("showOutOfStock", showOutOfStock);
  //   const searchQuery = urlParams.toString();
  //   navigate(`/books?${searchQuery}`);
  // };

  const handleToggle = () => {
    const newShowOutOfStock = !showOutOfStock;
    setShowOutOfStock(newShowOutOfStock);
    applyFilters({ ...sidebarData, showOutOfStock: newShowOutOfStock });
  };

  const handleClearAll = () => {
    const defaultFilters = {
      searchTerm: "",
      sort: "desc",
      category: "uncategorized",
    };
    setSidebarData(defaultFilters);
    setShowOutOfStock(true);
    applyFilters({ ...defaultFilters, showOutOfStock: true });
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="p-7 border-b md:border-r md:min-h-screen border-gray-500">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap font-semibold">
              Search Term:
            </label>
            <TextInput
              placeholder="Search..."
              id="searchTerm"
              type="text"
              value={sidebarData.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold">Sort:</label>
            <Select onChange={handleChange} value={sidebarData.sort} id="sort">
              <option value="desc">Latest</option>
              <option value="asc">Oldest</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="aA">A-Z</option>
              <option value="zZ">Z-A</option>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold">Category:</label>
            <Select
              onChange={handleChange}
              value={sidebarData.category}
              id="category"
            >
              <option value="uncategorized">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold">Show out-of-stock:</label>
            <ToggleSwitch
              id="showOutOfStock"
              checked={showOutOfStock}
              onChange={handleToggle}
            />
          </div>
          <button
            className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleClearAll}
          >
            Clear All
          </button>
          {!loading && books && totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </div>
      </div>
      <div className="w-full">
        <h1 className="text-3xl font-semibold sm:border-b border-gray-500 p-3 mt-5 ">
          Posts results:
        </h1>
        <div className="p-7">
          {!loading && books.length === 0 && (
            <p className="text-xl text-gray-500">No books found.</p>
          )}
          {loading && <p className="text-xl text-gray-500">Loading...</p>}
          {!loading && books && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {books.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

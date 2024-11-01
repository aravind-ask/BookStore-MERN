import React, { useState, useEffect } from "react";
import { Modal, Button, Table, TextInput } from "flowbite-react";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function DashCategory() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [description, setDescription] = useState("");
  const [editCategory, setEditCategory] = useState(null);
  const [error, setError] = useState(null);
  const [addError, setAddError] = useState(null);
  const [editError, setEditError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null); // Add this line

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
      setError("Failed to fetch categories");
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) {
      setAddError("Category name is required");
      return;
    }

    // Check for duplicate category (case-insensitive)
    const categoryExists = categories.some(
      (category) => category.name.toLowerCase() === newCategory.toLowerCase()
    );

    if (categoryExists) {
      setAddError("Category already exists");
      return;
    }

    try {
      const response = await fetch("/api/category/add-category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newCategory, description }),
      });

      // Check if the response is OK
      if (!response.ok) {
        throw new Error("Failed to add category");
      }

      // Parse the response data
      const data = await response.json();
      console.log(data);

      // Ensure the returned data has the expected structure
      if (data.data && data.data.name && data.data.description) {
        // Update the categories state with the new category
        setCategories([...categories, data.data]);
        setNewCategory("");
        setDescription("");
        setAddError(null);
      } else {
        setAddError("Invalid response from server");
      }
    } catch (error) {
      console.error(error);
      setAddError("Failed to add category");
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();

    const categoryExists = categories.some(
      (category) => category.name.toLowerCase() === newCategory.toLowerCase()
    );

    if (categoryExists) {
      setAddError("Category already exists");
      return;
    }

    try {
      const url = `/api/category/edit-category/${editCategory._id}`;
      const payload = {
        name: editCategory.name,
        description: editCategory.description,
      };
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Failed to edit category: ${response.status}`);
      }
      const updatedCategory = await response.json();
      setCategories(
        categories.map((cat) =>
          cat._id === editCategory._id ? updatedCategory : cat
        )
      );
      setEditCategory(null);
      setEditError(null);
    } catch (error) {
      console.error(error);
      setEditError(`Failed to edit category: ${error.message}`);
    }
  };

  const handleDeleteCategory = async (category) => {
    setDeleteModal(category); // Add this line
  };

  const handleConfirmDelete = async () => {
    try {
      await fetch(`/api/category/delete-category/${deleteModal._id}`, {
        method: "DELETE",
      });
      setCategories(categories.filter((cat) => cat._id !== deleteModal._id));
      setDeleteModal(null);
      setDeleteError(null);
    } catch (error) {
      console.error(error);
      setDeleteError("Failed to delete category");
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal(null);
  };

  const handleEditChange = (e) => {
    setEditCategory((prevEditCategory) => ({
      ...prevEditCategory,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col md:flex-row justify-between gap-40">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 w-full md:w-3/4">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="w-full md:w-2/4 mb-4 md:mb-0">
        <h2 className="text-3xl font-bold mb-4">Categories</h2>
        <Table className="w-full">
          <Table.Head>
            <Table.HeadCell className="text-left">Name</Table.HeadCell>
            <Table.HeadCell className="text-left">Description</Table.HeadCell>
            <Table.HeadCell className="text-left">Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {categories.map((category) => (
              <Table.Row key={category._id}>
                <Table.Cell className="text-left">{category.name}</Table.Cell>
                <Table.Cell className="text-left">
                  {category.description}
                </Table.Cell>
                <Table.Cell className="text-left">
                  <Button
                    color="success"
                    size="sm"
                    onClick={() => setEditCategory(category)}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    color="danger"
                    size="sm"
                    onClick={() => handleDeleteCategory(category)}
                  >
                    <FaTrash />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
      <div className="w-full md:w-2/4 mb-4 md:mb-0">
        <h2 className="text-3xl font-bold mb-4">Add Category</h2>
        <form onSubmit={handleAddCategory}>
          <TextInput
            id="newCategoryName"
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Category name"
            className="w-full mb-4"
          />
          <TextInput
            id="newCategoryDescription"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full mb-4"
          />
          <Button type="submit" color="success">
            Add Category
          </Button>
        </form>
        {addError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 w-full">
            <span className="block sm:inline">{addError}</span>
          </div>
        )}
      </div>
      {editCategory && (
        <Modal show={true} onClose={() => setEditCategory(null)}>
          <Modal.Header>Edit Category</Modal.Header>
          <Modal.Body>
            <form onSubmit={handleEditCategory}>
              <TextInput
                id="editCategoryName"
                type="text"
                value={editCategory.name}
                onChange={handleEditChange}
                name="name"
                placeholder="Category name"
                className="w-full mb-4"
              />
              <TextInput
                id="editCategoryDescription"
                type="text"
                value={editCategory.description}
                onChange={handleEditChange}
                name="description"
                placeholder="Description"
                className="w-full mb-4"
              />
              <Button type="submit" color="success">
                Save Changes
              </Button>
            </form>
            {editError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 w-full">
                <span className="block sm:inline">{editError}</span>
              </div>
            )}
          </Modal.Body>
        </Modal>
      )}
      {deleteModal && (
        <Modal show={true} onClose={handleCancelDelete}>
          <Modal.Header>Delete Category</Modal.Header>
          <Modal.Body>
            Are you sure you want to delete the category "{deleteModal.name}"?
            <Button onClick={handleConfirmDelete} color="danger">
              Delete
            </Button>
            <Button onClick={handleCancelDelete} color="success">
              Cancel
            </Button>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
}

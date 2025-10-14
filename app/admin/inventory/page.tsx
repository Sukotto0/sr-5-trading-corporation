"use client";

import React, { useEffect, useState } from "react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  createInventoryItem,
  deleteProduct,
  getInventory,
  updateProduct,
  uploadImageToBlob,
} from "@/app/actions";
import { create } from "domain";

// --- Static Data and Helpers (Moved here for component self-containment) ---

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

type InventoryItem = {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  location: string;
  lastUpdated: string;
  price: number;
  createdAt: string;
  imageUrl?: string;
};

// --- Component Definition ---
const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [currentTime] = useState(
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }) + " PHT"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: 0,
    quantity: 1,
    location: "",
    imageUrl: "",
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    category: "",
    price: 0,
    quantity: 1,
    location: "",
    imageUrl: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [editImagePreview, setEditImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isEditUploading, setIsEditUploading] = useState(false);

  useEffect(() => {
    getInventory().then((data) => {
      if (data && data.success) {
        console.log("Fetched inventory data:", data.data);
        setInventoryData(data.data);
      } else {
        console.error("Failed to fetch inventory data");
      }
    });
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: "",
      category: "",
      price: 0,
      quantity: 1,
      location: "",
      imageUrl: "",
    });
    setSelectedFile(null);
    setImagePreview("");
    setIsUploading(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value) || 0 : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let imageUrl = formData.imageUrl;

      // Upload image if a file is selected
      if (selectedFile) {
        imageUrl = await uploadImageToBlob(selectedFile);
      }

      const newItem: any = {
        ...formData,
        imageUrl,
      };

      // TODO: Replace with actual API call to create inventory item
      await createInventoryItem(newItem);

      getInventory().then((data) => {
        if (data && data.success) {
          console.log("Fetched inventory data:", data.data);
          setInventoryData(data.data);
        } else {
          console.error("Failed to fetch inventory data");
        }
      });
      handleCloseModal();
    } catch (error) {
      console.error("Error creating item:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsUploading(false);
    }
  };

  // Edit modal handlers
  const handleOpenEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setEditFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      quantity: item.quantity,
      location: item.location,
      imageUrl: item.imageUrl || "",
    });
    setEditImagePreview(item.imageUrl || "");
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingItem(null);
    setEditFormData({
      name: "",
      category: "",
      price: 0,
      quantity: 1,
      location: "",
      imageUrl: "",
    });
    setEditSelectedFile(null);
    setEditImagePreview("");
    setIsEditUploading(false);
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "price"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsEditUploading(true);

    try {
      let imageUrl = editFormData.imageUrl;

      // Upload image if a new file is selected
      if (editSelectedFile) {
        imageUrl = await uploadImageToBlob(editSelectedFile);
      }

      const updatedItem = {
        ...editFormData,
        imageUrl,
      };

      await updateProduct({
        productId: editingItem._id,
        sendData: updatedItem,
      });

      getInventory().then((data) => {
        if (data && data.success) {
          console.log("Fetched inventory data:", data.data);
          setInventoryData(data.data);
        } else {
          console.error("Failed to fetch inventory data");
        }
      });

      handleCloseEditModal();
    } catch (error) {
      console.error("Error updating item:", error);
    } finally {
      setIsEditUploading(false);
    }
  };

  // Delete modal handlers
  const handleOpenDeleteModal = (item: InventoryItem) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingItem(null);
    setIsDeleting(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;

    setIsDeleting(true);

    try {
      deleteProduct({ documentId: deletingItem._id });
      getInventory().then((data) => {
        if (data && data.success) {
          console.log("Fetched inventory data:", data.data);
          setInventoryData(data.data);
        } else {
          console.error("Failed to fetch inventory data");
        }
      });

      handleCloseDeleteModal();
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter the inventory data based on search term (simple case-insensitive match on name or ID)
  const filteredInventory = inventoryData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Main Content Area

  return (
    <div className="flex flex-col bg-white">
      {/* Control Panel: Search and Add Button */}
      <div className="mt-6 mb-8 flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
          />
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center bg-red-800 hover:bg-red-900 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 hover:cursor-pointer"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add New Item
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full grow-1">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 h-full">
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-300"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xs">
                            No image
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {item.price ? `₱${item.price.toFixed(2)}` : "₱0.00"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={classNames(
                          item.quantity < 1
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800",
                          "px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        )}
                      >
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                      {item.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.lastUpdated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(item)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-10 text-center text-gray-500 text-lg"
                  >
                    No inventory items found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Bar for bottom of page */}
      <footer className="mt-6 text-sm text-gray-500">
        Inventory status last checked at: {currentTime}
      </footer>

      {/* Add New Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Add New Item
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Item Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Item Price
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter item price"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a category</option>
                  <option value="engine">Trucks</option>
                  <option value="equipment">Equipment</option>
                  <option value="parts-accessories">Parts & Accessories</option>
                  <option value="trucks">Trucks</option>
                  <option value="units">Units</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter quantity"
                />
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Location
                </label>
                <select
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a location</option>
                  <option value="bacoor">Bacoor</option>
                  <option value="imus">Imus</option>
                  <option value="albay">Albay</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="image"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Item Image
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full h-32 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition duration-150"
                >
                  {isUploading ? "Adding Item..." : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Edit Item</h2>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="edit-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Item Name
                </label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category
                </label>
                <select
                  id="edit-category"
                  name="category"
                  value={editFormData.category}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a category</option>
                  <option value="engine">Engine</option>
                  <option value="equipment">Equipment</option>
                  <option value="parts-accessories">Parts & Accessories</option>
                  <option value="services">Services</option>
                  <option value="trucks">Trucks</option>
                  <option value="units">Units</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Price (₱)
                </label>
                <input
                  type="number"
                  id="edit-price"
                  name="price"
                  value={editFormData.price}
                  onChange={handleEditInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter price"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-quantity"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Quantity
                </label>
                <input
                  type="number"
                  id="edit-quantity"
                  name="quantity"
                  value={editFormData.quantity}
                  onChange={handleEditInputChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter quantity"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-location"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Location
                </label>
                <select
                  id="edit-location"
                  name="location"
                  value={editFormData.location}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a location</option>
                  <option value="bacoor">Bacoor</option>
                  <option value="imus">Imus</option>
                  <option value="albay">Albay</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-image"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Item Image
                </label>
                <input
                  type="file"
                  id="edit-image"
                  name="image"
                  accept="image/*"
                  onChange={handleEditFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                {editImagePreview && (
                  <div className="mt-3">
                    <img
                      src={editImagePreview}
                      alt="Preview"
                      className="max-w-full h-32 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditUploading}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition duration-150"
                >
                  {isEditUploading ? "Updating Item..." : "Update Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingItem && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <TrashIcon
                  className="h-6 w-6 text-red-600"
                  aria-hidden="true"
                />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                  Delete Item
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete "
                    <span className="font-semibold text-gray-700">
                      {deletingItem.name}
                    </span>
                    "? This action cannot be undone.
                  </p>

                  {/* Item details for confirmation */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {deletingItem.imageUrl && (
                        <img
                          src={deletingItem.imageUrl}
                          alt={deletingItem.name}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-300"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {deletingItem.name}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">
                          {deletingItem.category} • Qty: {deletingItem.quantity}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">
                          ₱{deletingItem.price?.toLocaleString()} •{" "}
                          {deletingItem.location}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete Item"
                )}
              </button>
              <button
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;

"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronDownIcon,
  XMarkIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import {
  createInventoryItem,
  deleteProduct,
  getInventory,
  updateProduct,
  uploadImageToBlob,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

// Static Data and Helpers

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
  images?: string[];
  description?: string;
};

// --- Component Definition ---
const Inventory = () => {
  const { user } = useUser();
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
    description: "",
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    category: "",
    price: 0,
    quantity: 1,
    location: "",
    imageUrl: "",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [editImagePreview, setEditImagePreview] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editSelectedFiles, setEditSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [editUploadedImages, setEditUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditUploading, setIsEditUploading] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterStock, setFilterStock] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewSource, setPreviewSource] = useState<'add' | 'edit' | null>(null);
  const [previewImageIndex, setPreviewImageIndex] = useState<number>(0);

  useEffect(() => {
    getInventory().then((data) => {
      if (data && data.success) {
        const sortedData = data.data.sort(
          (a: InventoryItem, b: InventoryItem) =>
            new Date(b.lastUpdated).getTime() -
            new Date(a.lastUpdated).getTime()
        );
        setInventoryData(sortedData);
      } else {
        console.error("Failed to fetch inventory data");
      }
    });
  }, []);

  const handleOpenModal = () => {
    // Auto-set location for regular admins
    if (!isSuperAdmin && assignedBranch) {
      setFormData(prev => ({
        ...prev,
        location: assignedBranch.toLowerCase()
      }));
    }
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
      description: "",
    });
    setSelectedFile(null);
    setImagePreview("");
    setSelectedFiles([]);
    setImagePreviews([]);
    setUploadedImages([]);
    setIsUploading(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "price"
          ? parseFloat(value) || 0
          : value,
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

  const handleMultipleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Limit to 10 images
      const limitedFiles = files.slice(0, 10);
      setSelectedFiles(limitedFiles);

      // Create previews
      const previews: string[] = [];
      limitedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result as string);
          if (previews.length === limitedFiles.length) {
            setImagePreviews(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleEditMultipleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Limit total images to 10
      const availableSlots = 10 - editUploadedImages.length;
      const limitedFiles = files.slice(0, availableSlots);
      setEditSelectedFiles(limitedFiles);

      // Create previews
      const previews: string[] = [];
      limitedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result as string);
          if (previews.length === limitedFiles.length) {
            setEditImagePreviews([...editUploadedImages, ...previews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeEditImage = (index: number) => {
    if (index < editUploadedImages.length) {
      setEditUploadedImages(prev => prev.filter((_, i) => i !== index));
    }
    setEditImagePreviews(prev => prev.filter((_, i) => i !== index));
    if (index >= editUploadedImages.length) {
      const newFileIndex = index - editUploadedImages.length;
      setEditSelectedFiles(prev => prev.filter((_, i) => i !== newFileIndex));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      // Upload all images
      const images: string[] = [];
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const url = await uploadImageToBlob(file);
          images.push(url);
        }
      }

      // First image becomes the main imageUrl for backward compatibility
      const imageUrl = images.length > 0 ? images[0] : formData.imageUrl;

      const newItem: any = {
        ...formData,
        imageUrl,
        images,
      };

      await createInventoryItem(newItem);

      getInventory().then((data) => {
        if (data && data.success) {
          const sortedData = data.data.sort(
            (a: InventoryItem, b: InventoryItem) =>
              new Date(b.lastUpdated).getTime() -
              new Date(a.lastUpdated).getTime()
          );
          setInventoryData(sortedData);
        } else {
          console.error("Failed to fetch inventory data");
        }
      });
      handleCloseModal();
    } catch (error) {
      console.error("Error creating item:", error);
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
      description: item.description || "",
    });
    // Load all existing images
    const existingImages = item.images && item.images.length > 0 ? item.images : (item.imageUrl ? [item.imageUrl] : []);
    setEditUploadedImages(existingImages);
    setEditImagePreviews(existingImages);
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
      description: "",
    });
    setEditSelectedFile(null);
    setEditImagePreview("");
    setEditSelectedFiles([]);
    setEditImagePreviews([]);
    setEditUploadedImages([]);
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
      // Upload new images if files are selected
      const newImages: string[] = [];
      if (editSelectedFiles.length > 0) {
        for (const file of editSelectedFiles) {
          const url = await uploadImageToBlob(file);
          newImages.push(url);
        }
      }

      // Combine existing and new images
      const images = [...editUploadedImages, ...newImages];
      
      // First image becomes the main imageUrl for backward compatibility
      const imageUrl = images.length > 0 ? images[0] : editFormData.imageUrl;

      const updatedItem = {
        ...editFormData,
        imageUrl,
        images,
      };

      await updateProduct({
        productId: editingItem._id,
        sendData: updatedItem,
      });

      getInventory().then((data) => {
        if (data && data.success) {
          const sortedData = data.data.sort(
            (a: InventoryItem, b: InventoryItem) =>
              new Date(b.lastUpdated).getTime() -
              new Date(a.lastUpdated).getTime()
          );
          setInventoryData(sortedData);
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
          const sortedData = data.data.sort(
            (a: InventoryItem, b: InventoryItem) =>
              new Date(b.lastUpdated).getTime() -
              new Date(a.lastUpdated).getTime()
          );
          setInventoryData(sortedData);
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

  // Preview handlers
  const handleOpenPreview = (data: any, imageUrl: string, source: 'add' | 'edit') => {
    const images = source === 'add' ? imagePreviews : editImagePreviews;
    const mainImageUrl = images.length > 0 ? images[0] : imageUrl;
    setPreviewData({ ...data, imageUrl: mainImageUrl, images });
    setPreviewSource(source);
    if (source === 'add') {
      setIsModalOpen(false);
    } else {
      setIsEditModalOpen(false);
    }
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewData(null);
    setPreviewImageIndex(0);
    // Reopen the original modal
    if (previewSource === 'add') {
      setIsModalOpen(true);
    } else if (previewSource === 'edit') {
      setIsEditModalOpen(true);
    }
    setPreviewSource(null);
  };

  const handleNextPreviewImage = () => {
    if (previewData?.images && previewData.images.length > 0) {
      const nextIndex = (previewImageIndex + 1) % previewData.images.length;
      setPreviewImageIndex(nextIndex);
    }
  };

  const handlePreviousPreviewImage = () => {
    if (previewData?.images && previewData.images.length > 0) {
      const prevIndex = (previewImageIndex - 1 + previewData.images.length) % previewData.images.length;
      setPreviewImageIndex(prevIndex);
    }
  };

  const handlePreviewThumbnailClick = (index: number) => {
    setPreviewImageIndex(index);
  };

  // Get admin role and assigned branch from user metadata
  const adminRole = (user?.publicMetadata as any)?.adminRole;
  const assignedBranch = (user?.publicMetadata as any)?.assignedBranch;
  const isSuperAdmin = adminRole === 'superadmin';

  // Filter the inventory data based on all filters
  const filteredInventory = inventoryData.filter((item) => {
    // Branch filter for regular admins (superadmins see all)
    if (!isSuperAdmin && assignedBranch) {
      const matchesBranch = item.location.toLowerCase() === assignedBranch.toLowerCase();
      if (!matchesBranch) return false;
    }

    // Search filter (name or ID)
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item._id.toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter
    const matchesCategory = 
      !filterCategory || item.category.toLowerCase() === filterCategory.toLowerCase();

    // Location filter
    const matchesLocation = 
      !filterLocation || item.location.toLowerCase() === filterLocation.toLowerCase();

    // Stock filter
    const matchesStock = 
      !filterStock || 
      (filterStock === 'in' && item.quantity > 0) ||
      (filterStock === 'out' && item.quantity <= 0);

    return matchesSearch && matchesCategory && matchesLocation && matchesStock;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInventory = filteredInventory.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterLocation, filterStock, itemsPerPage]);

  // Main Content Area

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6">
      {/* Control Panel */}
      <Card className="py-6">
        <CardHeader>
          <CardTitle>Inventory Management</CardTitle>
          <CardDescription>Manage your inventory items, stock levels, and locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Search + Add Button Row */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="relative w-full sm:max-w-sm">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Button
                onClick={handleOpenModal}
                className="bg-red-800 hover:bg-red-900 w-full sm:w-auto"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add New Item
              </Button>
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={filterCategory || "all"} onValueChange={(val) => setFilterCategory(val === "all" ? "" : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="trucks">Trucks</SelectItem>
                    <SelectItem value="heavy-equipment">Heavy Equipment</SelectItem>
                    <SelectItem value="units">Units</SelectItem>
                    <SelectItem value="engine">Engine</SelectItem>
                    <SelectItem value="tools">Tools</SelectItem>
                    <SelectItem value="parts-accessories">Parts & Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={filterLocation || "all"} onValueChange={(val) => setFilterLocation(val === "all" ? "" : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="bacoor">Bacoor</SelectItem>
                    <SelectItem value="imus">Imus</SelectItem>
                    <SelectItem value="camalig">Camalig</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Stock Status</Label>
                <Select value={filterStock || "all"} onValueChange={(val) => setFilterStock(val === "all" ? "" : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Stock" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stock</SelectItem>
                    <SelectItem value="in">In Stock</SelectItem>
                    <SelectItem value="out">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Items per page</Label>
                <Select value={itemsPerPage.toString()} onValueChange={(val) => setItemsPerPage(Number(val))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Image</TableHead>
                  <TableHead className="max-w-[200px]">Item Name</TableHead>
                  <TableHead className="hidden md:table-cell">Price</TableHead>
                  <TableHead className="hidden lg:table-cell">Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="hidden xl:table-cell">Location</TableHead>
                  <TableHead className="hidden xl:table-cell">Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInventory.length > 0 ? (
                  paginatedInventory.map((item) => (
                    <TableRow key={item._id} className="hover:bg-gray-50">
                      <TableCell>
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-300"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No image</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{item.name}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {item.price ? `₱${item.price.toFixed(2)}` : "₱0.00"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell capitalize">{item.category}</TableCell>
                      <TableCell>
                        <Badge
                          variant={item.quantity < 1 ? "destructive" : "default"}
                          className={item.quantity < 1 ? "" : "bg-green-100 text-green-800 hover:bg-green-200"}
                        >
                          {item.quantity}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell capitalize">{item.location}</TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {new Date(item.lastUpdated).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => handleOpenEditModal(item)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleOpenDeleteModal(item)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-900 hover:bg-red-50"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                      No inventory items found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {filteredInventory.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t">
              <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredInventory.length)} of {filteredInventory.length} items
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="hidden sm:inline-flex"
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2 sm:px-3"
                >
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-8 sm:min-w-9 ${currentPage === pageNum ? "bg-red-800 hover:bg-red-900" : ""}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2 sm:px-3"
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">Next</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="hidden sm:inline-flex"
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Bar */}
      <div className="text-sm text-gray-500 text-center">
        Inventory status last checked at: {currentTime}
      </div>

      {/* Add New Item Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>Add a new item to your inventory</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter item name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Item Price *</Label>
                <Input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min={0}
                  step="0.01"
                  required
                  placeholder="Enter item price"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trucks">Trucks</SelectItem>
                    <SelectItem value="heavy-equipment">Heavy Equipment</SelectItem>
                    <SelectItem value="units">Units</SelectItem>
                    <SelectItem value="engine">Engine</SelectItem>
                    <SelectItem value="tools">Tools</SelectItem>
                    <SelectItem value="parts-accessories">Parts & Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  min="0"
                  placeholder="Enter quantity"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                disabled={!isSuperAdmin}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bacoor">Bacoor</SelectItem>
                  <SelectItem value="imus">Imus</SelectItem>
                  <SelectItem value="camalig">Camalig</SelectItem>
                </SelectContent>
              </Select>
              {!isSuperAdmin && assignedBranch && (
                <p className="text-xs text-muted-foreground">Location locked to your assigned branch</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Product Images (up to 10)</Label>
              <Input
                type="file"
                id="images"
                name="images"
                accept="image/*"
                multiple
                onChange={handleMultipleFilesChange}
              />
              <p className="text-xs text-muted-foreground">First image will be used as the main display image</p>
              {imagePreviews.length > 0 && (
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-gray-300"
                      />
                      {index === 0 && (
                        <span className="absolute top-1 left-1 bg-primary text-white text-xs px-2 py-0.5 rounded">Main</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {imagePreviews.length >= 10 && (
                <p className="text-sm text-amber-600 mt-2">Maximum of 10 images reached</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter product description..."
                rows={4}
                className="resize-none"
              />
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              {(formData.name || imagePreview) && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleOpenPreview(formData, imagePreview, 'add')}
                  className="w-full sm:w-auto"
                >
                  <EyeIcon className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              )}
              <Button
                type="submit"
                disabled={isUploading}
                className="bg-red-800 hover:bg-red-900 w-full sm:w-auto"
              >
                {isUploading ? "Adding Item..." : "Add Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Item Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>Update item details</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Item Name *</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  required
                  placeholder="Enter item name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (₱) *</Label>
                <Input
                  type="number"
                  id="edit-price"
                  name="price"
                  value={editFormData.price}
                  onChange={handleEditInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Enter price"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select
                  value={editFormData.category}
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, category: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trucks">Trucks</SelectItem>
                    <SelectItem value="heavy-equipment">Heavy Equipment</SelectItem>
                    <SelectItem value="units">Units</SelectItem>
                    <SelectItem value="engine">Engine</SelectItem>
                    <SelectItem value="tools">Tools</SelectItem>
                    <SelectItem value="parts-accessories">Parts & Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantity *</Label>
                <Input
                  type="number"
                  id="edit-quantity"
                  name="quantity"
                  value={editFormData.quantity}
                  onChange={handleEditInputChange}
                  required
                  min="0"
                  placeholder="Enter quantity"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location">Location *</Label>
              <Select
                value={editFormData.location}
                onValueChange={(value) => setEditFormData(prev => ({ ...prev, location: value }))}
                disabled={!isSuperAdmin}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bacoor">Bacoor</SelectItem>
                  <SelectItem value="imus">Imus</SelectItem>
                  <SelectItem value="camalig">Camalig</SelectItem>
                </SelectContent>
              </Select>
              {!isSuperAdmin && assignedBranch && (
                <p className="text-xs text-muted-foreground">Location locked to your assigned branch</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-images">Product Images (up to 10)</Label>
              <Input
                type="file"
                id="edit-images"
                name="images"
                accept="image/*"
                multiple
                onChange={handleEditMultipleFilesChange}
              />
              <p className="text-xs text-muted-foreground">First image will be used as the main display image</p>
              {editImagePreviews.length > 0 && (
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {editImagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-gray-300"
                      />
                      {index === 0 && (
                        <span className="absolute top-1 left-1 bg-primary text-white text-xs px-2 py-0.5 rounded">Main</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeEditImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {editImagePreviews.length >= 10 && (
                <p className="text-sm text-amber-600 mt-2">Maximum of 10 images reached</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={editFormData.description}
                onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter product description..."
                rows={4}
                className="resize-none"
              />
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseEditModal}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              {(editFormData.name || editImagePreview) && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleOpenPreview(editFormData, editImagePreview, 'edit')}
                  className="w-full sm:w-auto"
                >
                  <EyeIcon className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              )}
              <Button
                type="submit"
                disabled={isEditUploading}
                className="bg-red-800 hover:bg-red-900 w-full sm:w-auto"
              >
                {isEditUploading ? "Updating Item..." : "Update Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <TrashIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <DialogTitle className="text-center">Delete Item</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete "<span className="font-semibold text-gray-700 inline-block max-w-[250px] truncate align-bottom">{deletingItem?.name}</span>"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deletingItem && (
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  {deletingItem.imageUrl && (
                    <img
                      src={deletingItem.imageUrl}
                      alt={deletingItem.name}
                      className="w-12 h-12 object-cover rounded-lg border border-gray-300 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium max-w-[250px] md:max-w-[400px] text-gray-900 truncate" title={deletingItem.name}>
                      {deletingItem.name}
                    </p>
                    <p className="text-sm text-gray-500 capitalize truncate">
                      {deletingItem.category} • Qty: {deletingItem.quantity}
                    </p>
                    <p className="text-sm text-gray-500 capitalize truncate">
                      ₱{deletingItem.price?.toLocaleString()} • {deletingItem.location}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleCloseDeleteModal}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              {isDeleting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
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
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Preview Modal - Mimics actual customer view */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[80vw]! w-[80vw] max-h-[85vh] overflow-y-auto p-8">
          <DialogHeader>
            <DialogTitle>Customer View Preview</DialogTitle>
            <DialogDescription>This is exactly how customers will see this product</DialogDescription>
          </DialogHeader>

          {previewData && (
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="space-y-4">
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="aspect-square relative overflow-hidden group">
                        {previewData.images && previewData.images.length > 0 ? (
                          <Image
                            src={previewData.images[previewImageIndex]}
                            alt={previewData.name || "Product preview"}
                            fill
                            className="object-cover transition-transform duration-300 hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        ) : previewData.imageUrl ? (
                          <Image
                            src={previewData.imageUrl}
                            alt={previewData.name || "Product preview"}
                            fill
                            className="object-cover transition-transform duration-300 hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                            <span>No image uploaded</span>
                          </div>
                        )}
                        {/* Navigation Arrows */}
                        {previewData.images && previewData.images.length > 1 && (
                          <>
                            <button
                              onClick={handlePreviousPreviewImage}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Previous image"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <button
                              onClick={handleNextPreviewImage}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Next image"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                            {/* Image Counter */}
                            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                              {previewImageIndex + 1} / {previewData.images.length}
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Image Gallery Thumbnails */}
                  {previewData.images && previewData.images.length > 1 && (
                    <div className="relative">
                      <div className="overflow-x-auto pb-2">
                        <div className="flex gap-2">
                          {previewData.images.map((img: string, index: number) => (
                            <button
                              key={index}
                              onClick={() => handlePreviewThumbnailClick(index)}
                              className={`aspect-square relative overflow-hidden rounded-lg border-2 transition-all shrink-0 w-20 h-20 ${
                                previewImageIndex === index ? 'border-primary ring-2 ring-primary' : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <Image
                                src={img}
                                alt={`Image ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Product Details Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="flex items-center p-4">
                        <svg className="h-5 w-5 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium">Stock</p>
                          <p className="text-xs text-muted-foreground">
                            {previewData.quantity || 0} available
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="flex items-center p-4">
                        <svg className="h-5 w-5 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium">Category</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {previewData.category || "N/A"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="flex items-center p-4">
                        <svg className="h-5 w-5 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {previewData.location || "N/A"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Product Information */}
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-4">
                      {previewData.name || "Product Name"}
                    </h1>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-3xl font-bold text-primary">
                        ₱{previewData.price ? Number(previewData.price).toLocaleString() : "0"}
                      </div>
                      <Badge 
                        variant={previewData.quantity < 1 ? "destructive" : "default"}
                        className="text-sm"
                      >
                        {previewData.quantity < 1 ? "Out of Stock" : "Available"}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Action Buttons (Preview Only) */}
                  <div className="space-y-3">
                    <Button
                      className="w-full"
                      size="lg"
                      disabled
                    >
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {previewData.quantity < 1 ? "Out of Stock" : "Reserve Unit"}
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full"
                      disabled
                    >
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Book Test Drive
                    </Button>
                  </div>

                  {/* Reservation Fee Info */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Reservation Fee (5%)</span>
                          <span className="font-medium">
                            ₱{previewData.price ? (Number(previewData.price) * 0.05).toLocaleString() : "0"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Balance on Claiming</span>
                          <span className="font-medium">
                            ₱{previewData.price ? (Number(previewData.price) * 0.95).toLocaleString() : "0"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Product Details Tabs */}
              <div className="mt-12">
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="specifications">Specifications</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="description" className="mt-6">
                    <Card className="py-6">
                      <CardHeader>
                        <CardTitle>Vehicle Description</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {previewData.description || "No description available for this vehicle."}
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="specifications" className="mt-6">
                    <Card className="py-6">
                      <CardHeader>
                        <CardTitle>Specifications</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between py-2 border-b">
                            <span className="font-medium">Category</span>
                            <span className="text-muted-foreground capitalize">{previewData.category || "N/A"}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="font-medium">Location</span>
                            <span className="text-muted-foreground capitalize">{previewData.location || "N/A"}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="font-medium">Stock Quantity</span>
                            <span className="text-muted-foreground">{previewData.quantity || 0}</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="font-medium">Reservation Fee</span>
                            <span className="text-muted-foreground">5% of total price</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={handleClosePreview} variant="outline">
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;

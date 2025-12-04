"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  uploadImageToBlob,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, FileText, Image, X, Pencil, Trash2 } from "lucide-react";

interface Announcement {
  _id: string;
  title: string;
  description: string;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  lastUpdated: string;
}

export default function AnnouncementsPage() {
  const { user } = useUser();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const isSuperAdmin = user?.publicMetadata?.adminRole === "superadmin";

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    const data = await getAnnouncements();
    setAnnouncements(data || []);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf",
      ];
      if (!validTypes.includes(selectedFile.type)) {
        alert("Please select an image (JPEG, PNG, GIF) or PDF file");
        return;
      }

      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      setFile(selectedFile);

      // Create preview for images
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      let fileUrl: string | undefined;
      let fileName: string | undefined;
      let fileType: string | undefined;

      if (file) {
        fileUrl = await uploadImageToBlob(file);
        fileName = file.name;
        fileType = file.type;
      }

      if (editingId) {
        await updateAnnouncement(editingId, {
          ...formData,
          fileUrl,
          fileName,
          fileType,
        }, user?.id || "");
      } else {
        await createAnnouncement({
          ...formData,
          fileUrl,
          fileName,
          fileType,
          userId: user?.id || "",
        });
      }

      await loadAnnouncements();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving announcement:", error);
      alert("Failed to save announcement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement._id);
    setFormData({
      title: announcement.title,
      description: announcement.description,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    setIsLoading(true);
    try {
      await deleteAnnouncement(id, user?.id || "");
      await loadAnnouncements();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      alert("Failed to delete announcement");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", description: "" });
    setFile(null);
    setFilePreview(null);
    setEditingId(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Announcements
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {isSuperAdmin
              ? "Create and manage important announcements for your team"
              : "View announcements from administration"}
          </p>
        </div>
        {isSuperAdmin && (
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <PlusCircle className="w-4 h-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Announcement" : "Create New Announcement"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter announcement title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter announcement details"
                    rows={6}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="file">Attachment (Optional)</Label>
                  <div className="mt-2">
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*,.pdf"
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: JPEG, PNG, GIF, PDF (Max 5MB)
                    </p>
                  </div>
                  {filePreview && (
                    <div className="mt-4 relative">
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="max-w-full h-auto rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setFile(null);
                          setFilePreview(null);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  {file && !filePreview && (
                    <div className="mt-4 flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFile(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isLoading ? "Saving..." : editingId ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {announcements.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <FileText className="w-16 h-16 text-gray-300" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No announcements yet
              </h3>
              <p className="text-sm text-gray-600">
                {isSuperAdmin
                  ? "Create your first announcement to get started"
                  : "Check back later for updates from administration"}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card
              key={announcement._id}
              className="p-4 sm:p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h2 className="text-xl font-bold text-gray-900">
                      {announcement.title}
                    </h2>
                    {isSuperAdmin && (
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(announcement)}
                          disabled={isLoading}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(announcement._id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap mb-4">
                    {announcement.description}
                  </p>
                  {announcement.fileUrl && (
                    <div className="mb-4">
                      {announcement.fileType?.startsWith("image/") ? (
                        <div className="relative inline-block">
                          <img
                            src={announcement.fileUrl}
                            alt={announcement.fileName || "Attachment"}
                            className="max-w-full sm:max-w-md h-auto rounded-lg border"
                          />
                        </div>
                      ) : (
                        <a
                          href={announcement.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <FileText className="w-5 h-5 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            {announcement.fileName || "View Attachment"}
                          </span>
                        </a>
                      )}
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                    <span>Posted by: {announcement.createdByName}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{formatDate(announcement.createdAt)}</span>
                    {announcement.lastUpdated !== announcement.createdAt && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-emerald-600">
                          Updated: {formatDate(announcement.lastUpdated)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

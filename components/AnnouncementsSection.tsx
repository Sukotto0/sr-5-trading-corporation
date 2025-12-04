"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  uploadImageToBlob,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Pencil, Trash2, X as XIcon } from "lucide-react";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";

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

export default function AnnouncementsSection() {
  const { user } = useUser();
  const isSuperAdmin = user?.publicMetadata?.adminRole === "superadmin";
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    console.log("Loading announcements...");
    const data = await getAnnouncements();
    console.log("Loaded announcements:", data);
    setAnnouncements(data || []);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
      if (!validTypes.includes(selectedFile.type)) {
        alert("Please select an image (JPEG, PNG, GIF) or PDF file");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setFile(selectedFile);
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result as string);
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
    if (!user) {
      alert("User not authenticated");
      return;
    }
    setIsLoading(true);
    try {
      let fileUrl, fileName, fileType;
      if (file) {
        fileUrl = await uploadImageToBlob(file);
        fileName = file.name;
        fileType = file.type;
      }
      if (editingId) {
        console.log("Updating announcement:", editingId);
        await updateAnnouncement(editingId, { ...formData, fileUrl, fileName, fileType  }, user.id);
      } else {
        console.log("Creating new announcement:", formData);
        const result = await createAnnouncement({ ...formData, fileUrl, fileName, fileType, userId: user.id });
        console.log("Create result:", result);
      }
      console.log("Reloading announcements...");
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
    setFormData({ title: announcement.title, description: announcement.description });
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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[800px]">
      <div className="bg-red-950 text-white p-6 border-b border-red-800">
        <div className="flex justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Announcements</h2>
            <p className="text-sm text-white/90 mt-1">
              {isSuperAdmin
                ? "Important updates and notices for your team"
                : "View announcements from administration"}
            </p>
          </div>
          {isSuperAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-bold shrink-0">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add New
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4">
                  <DialogTitle className="text-2xl">
                    {editingId ? "Edit Announcement" : "Create New Announcement"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-base font-semibold">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter announcement title"
                      className="h-12 text-base"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-base font-semibold">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter announcement details"
                      rows={8}
                      className="text-base leading-relaxed"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="file" className="text-base font-semibold">Attachment (Optional)</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*,.pdf"
                      className="cursor-pointer h-12"
                    />
                    <p className="text-sm text-gray-500 mt-2">Supported: JPEG, PNG, GIF, PDF (Max 5MB)</p>
                    {filePreview && (
                      <div className="mt-4 relative">
                        <img src={filePreview} alt="Preview" className="max-w-full h-auto rounded-lg border" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => { setFile(null); setFilePreview(null); }}
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    {file && !filePreview && (
                      <div className="mt-4 flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <FileText className="w-6 h-6 text-gray-600" />
                        <span className="text-base flex-1">{file.name}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setFile(null)}>
                          <XMarkIcon className="w-5 h-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }} className="h-11 px-6">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 h-11 px-6">
                      {isLoading ? "Saving..." : editingId ? "Update Announcement" : "Create Announcement"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {announcements.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">No announcements yet</h3>
              <p className="text-sm text-gray-400">
                {isSuperAdmin ? "Create your first announcement to get started" : "Check back later for updates"}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement._id} className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-xl font-bold text-gray-900 flex-1">{announcement.title}</h3>
                  {isSuperAdmin && (
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(announcement)} disabled={isLoading}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(announcement._id)} disabled={isLoading}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-gray-700 whitespace-pre-wrap mb-4">{announcement.description}</p>
                {announcement.fileUrl && (
                  <div className="mb-4">
                    {announcement.fileType?.startsWith("image/") ? (
                      <img src={announcement.fileUrl} alt={announcement.fileName || "Attachment"} className="max-w-full h-auto rounded-lg border" />
                    ) : (
                      <a href={announcement.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg">
                        <FileText className="w-5 h-5" />
                        <span className="text-sm font-medium">{announcement.fileName || "View Attachment"}</span>
                      </a>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                  <span>Posted by: {announcement.createdByName}</span>
                  <span>•</span>
                  <span>{formatDate(announcement.createdAt)}</span>
                  {announcement.lastUpdated !== announcement.createdAt && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-600">Updated: {formatDate(announcement.lastUpdated)}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

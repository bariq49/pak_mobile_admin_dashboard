"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/provider/auth.provider";
import { useUpdateProfileMutation } from "@/hooks/api/use-auth-api";
import toast from "react-hot-toast";
import { Pencil } from "lucide-react";

const UserMeta = () => {
  const { user, loading } = useAuth();
  const { mutate: updateProfile, isPending: isUpdating } =
    useUpdateProfileMutation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFirstLetter = () =>
    user?.name ? user.name.charAt(0).toUpperCase() : "U";

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Please select an image smaller than 5MB");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    updateProfile(
      { avatar: selectedFile },
      {
        onSuccess: () => {
          toast.success("Avatar uploaded successfully");
          setSelectedFile(null);
          setPreviewUrl(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
      }
    );
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEditClick = () => fileInputRef.current?.click();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex flex-col items-center">
          <div className="w-[124px] h-[124px] rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse border-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 flex flex-col items-center">
        {/* Avatar */}
        <div className="w-[124px] h-[124px] relative rounded-full border-2 border-primary flex items-center justify-center bg-muted">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full rounded-full object-cover"
            />
          ) : user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full flex items-center justify-center text-4xl font-bold text-primary">
              {getFirstLetter()}
            </div>
          )}

          {/* Edit button */}
          <Button
            onClick={handleEditClick}
            size="icon"
            className="h-8 w-8 rounded-full absolute bottom-0 right-0"
            disabled={isUpdating}
          >
            <Pencil className="w-4 h-4 text-primary-foreground" />{" "}
          </Button>

          {/* Hidden file input */}
          <Input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUpdating}
          />
        </div>
        {/* User name */}
        <div className="mt-4 text-xl font-semibold text-default-900 dark:text-default-100">
          {user?.name || "Jennyfer Frankin"}
        </div>

        {/* User email */}
        <div className="mt-1.5 text-sm font-medium text-default-500 dark:text-default-400">
          {user?.email || "Data Analytics"}
        </div>
        {/* Selected file info */}
        {selectedFile && (
          <div className="mt-4 text-sm text-center text-default-600">
            Selected: {selectedFile.name}
          </div>
        )}

        {/* Action buttons */}
        {selectedFile && (
          <div className="flex justify-end gap-4 mt-6 w-full">
            <Button
              color="secondary"
              onClick={handleCancel}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isUpdating}>
              {isUpdating ? "Uploading..." : "Save"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserMeta;

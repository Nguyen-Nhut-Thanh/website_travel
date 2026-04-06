"use client";

import { useRef, useState } from "react";
import { Loader2, UploadCloud, X } from "lucide-react";
import { API_BASE, getToken } from "@/lib/auth";
import { uploadAuthenticatedFile } from "@/lib/uploadApi";

interface ImageUploadProps {
  value?: string | string[];
  onChange: (url: string | string[]) => void;
  multiple?: boolean;
  endpoint?: string;
  label?: string;
  maxFiles?: number;
}

export const ImageUpload = ({
  value,
  onChange,
  multiple = false,
  endpoint = "/auth/upload-avatar",
  label = "Kéo thả ảnh vào đây hoặc click để chọn",
  maxFiles = 5,
}: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const images = Array.isArray(value) ? value : value ? [value] : [];

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (multiple && images.length + files.length > maxFiles) {
      setError(`Bạn chỉ có thể tải lên tối đa ${maxFiles} ảnh.`);
      return;
    }

    setIsUploading(true);
    setError(null);
    const uploadedUrls: string[] = [];

    try {
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];

        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} vượt quá 5MB.`);
        }

        const token = getToken();
        if (!token) {
          throw new Error("Bạn chưa đăng nhập.");
        }

        const data = await uploadAuthenticatedFile(
          `${API_BASE}${endpoint}`,
          token,
          file,
          "Upload thất bại",
        );
        if (data?.url) {
          uploadedUrls.push(data.url);
        }
      }

      if (multiple) {
        onChange([...images, ...uploadedUrls]);
      } else {
        onChange(uploadedUrls[0]);
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload thất bại");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    if (multiple) {
      onChange(images.filter((_, index) => index !== indexToRemove));
      return;
    }

    onChange("");
  };

  return (
    <div className="space-y-4">
      {((!multiple && images.length === 0) || multiple) && (
        <div
          className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 bg-slate-50 hover:border-blue-400"
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            void handleUpload(event.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            multiple={multiple}
            onChange={(event) => void handleUpload(event.target.files)}
          />

          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-4">
              <Loader2 className="mb-2 h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm font-medium text-slate-600">Đang tải ảnh lên...</p>
            </div>
          ) : (
            <div className="flex cursor-pointer flex-col items-center justify-center py-4">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <UploadCloud size={24} />
              </div>
              <p className="text-sm font-bold text-slate-700">{label}</p>
              <p className="mt-1 text-xs text-slate-500">Hỗ trợ JPG, PNG, WEBP. Tối đa 5MB/ảnh.</p>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm font-medium text-red-500">{error}</p>}

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {images.map((url, index) => (
            <div
              key={index}
              className="group relative aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm"
            >
              <img src={url} alt={`Upload ${index}`} className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeImage(index);
                  }}
                  className="flex h-8 w-8 scale-0 items-center justify-center rounded-full bg-red-500 text-white transition-all group-hover:scale-100 hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

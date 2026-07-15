"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar, ImageCropDialog } from "@/components/ui";
import { useToast } from "@/components/ui/feedback-provider";
import { useImageCropper } from "@/hooks/use-image-cropper";
import { profileKeys, useUploadProfileAvatar } from "../queries";
import { queryKeys } from "@/constants/query-keys";
import type { Profile } from "../schema";

export function AvatarUploader({
  avatar,
  displayName,
  initials,
}: {
  avatar: string | null;
  displayName: string;
  initials: string;
}) {
  const mutation = useUploadProfileAvatar();
  const queryClient = useQueryClient();
  const cropper = useImageCropper();
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function selectAvatar(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showToast("Avatar chỉ hỗ trợ JPG, PNG hoặc WEBP.", "error");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showToast("Ảnh gốc không được lớn hơn 8MB.", "error");
      return;
    }

    const croppedFile = await cropper.cropFile(file, 1);
    if (!croppedFile) return;

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = URL.createObjectURL(croppedFile);
    setPreviewUrl(objectUrlRef.current);

    try {
      const updatedProfile = await mutation.mutateAsync(croppedFile);
      const localAvatarUrl = objectUrlRef.current;
      if (localAvatarUrl) {
        const profileWithPreview: Profile = { ...updatedProfile, avatar: localAvatarUrl };
        queryClient.setQueryData(profileKeys.me(), profileWithPreview);
        queryClient.setQueryData(queryKeys.auth.me(), profileWithPreview);
      }
      showToast("Đã cập nhật ảnh đại diện.", "success");
    } catch {
      showToast("Không thể cập nhật ảnh đại diện.", "error");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        disabled={mutation.isLoading}
        onChange={(event) => void selectAvatar(event.target.files?.[0])}
      />
      <Avatar
        src={previewUrl ?? avatar}
        alt={displayName}
        fallback={initials}
        size="profile"
        editable
        loading={mutation.isLoading}
        onEdit={() => inputRef.current?.click()}
      />
      {cropper.pending && (
        <ImageCropDialog
          sourceUrl={cropper.pending.sourceUrl}
          aspectRatio={1}
          onCancel={cropper.cancel}
          onConfirm={cropper.confirm}
        />
      )}
    </>
  );
}

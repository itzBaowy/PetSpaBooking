"use client";

import { useRef } from "react";
import Cropper, { type ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Button } from "./button";

export function ImageCropDialog({
  sourceUrl,
  aspectRatio,
  onCancel,
  onConfirm,
}: {
  sourceUrl: string;
  aspectRatio?: number;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}) {
  const cropperRef = useRef<ReactCropperElement>(null);

  function confirmCrop() {
    const canvas = cropperRef.current?.cropper.getCroppedCanvas({
      maxWidth: 2000,
      maxHeight: 2000,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "high",
    });
    canvas?.toBlob(
      (blob) => {
        if (blob) onConfirm(blob);
      },
      "image/jpeg",
      0.9,
    );
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cắt ảnh"
        className="w-full max-w-3xl rounded-3xl border border-border-subtle bg-surface p-5 shadow-2xl"
      >
        <div>
          <h2 className="text-xl font-bold text-foreground">Cắt và chỉnh ảnh</h2>
          <p className="mt-1 text-sm text-muted">
            Kéo để chọn vùng ảnh, cuộn để phóng to hoặc thu nhỏ.
          </p>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl bg-black">
          <Cropper
            ref={cropperRef}
            src={sourceUrl}
            style={{ height: 480, width: "100%" }}
            aspectRatio={aspectRatio}
            viewMode={1}
            dragMode="move"
            guides
            background={false}
            responsive
            autoCropArea={0.9}
            checkOrientation
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => cropperRef.current?.cropper.rotate(-90)}
            >
              Xoay trái
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => cropperRef.current?.cropper.rotate(90)}
            >
              Xoay phải
            </Button>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Hủy
            </Button>
            <Button type="button" onClick={confirmCrop}>
              Dùng ảnh này
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

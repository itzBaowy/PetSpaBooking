"use client";

import { useEffect, useRef, useState } from "react";

type PendingCrop = {
  file: File;
  sourceUrl: string;
  aspectRatio?: number;
  resolve: (file: File | null) => void;
};

export function useImageCropper() {
  const [pending, setPending] = useState<PendingCrop | null>(null);
  const pendingRef = useRef<PendingCrop | null>(null);

  useEffect(
    () => () => {
      if (pendingRef.current) {
        URL.revokeObjectURL(pendingRef.current.sourceUrl);
        pendingRef.current.resolve(null);
      }
    },
    [],
  );

  function finish(file: File | null) {
    const current = pendingRef.current;
    if (!current) return;
    URL.revokeObjectURL(current.sourceUrl);
    current.resolve(file);
    pendingRef.current = null;
    setPending(null);
  }

  function cropFile(file: File, aspectRatio?: number) {
    // Cancel any in-flight crop before starting a new one
    if (pendingRef.current) {
      URL.revokeObjectURL(pendingRef.current.sourceUrl);
      pendingRef.current.resolve(null);
      pendingRef.current = null;
    }

    return new Promise<File | null>((resolve) => {
      const next = {
        file,
        sourceUrl: URL.createObjectURL(file),
        aspectRatio,
        resolve,
      };
      pendingRef.current = next;
      setPending(next);
    });
  }

  function confirm(blob: Blob) {
    const original = pendingRef.current?.file;
    if (!original) return;
    const baseName = original.name.replace(/\.[^.]+$/, "");
    finish(
      new File([blob], `${baseName}-cropped.jpg`, {
        type: "image/jpeg",
        lastModified: Date.now(),
      }),
    );
  }

  return {
    pending,
    cropFile,
    cancel: () => finish(null),
    confirm,
  };
}

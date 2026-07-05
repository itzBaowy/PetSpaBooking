"use client";

import { useEffect, useRef, useState } from "react";
import { useImageCropper } from "@/hooks/use-image-cropper";

export type ProviderMediaField =
  | "idCardFront"
  | "idCardBack"
  | "businessLicense"
  | "businessImages";

type SingleMediaField = Exclude<ProviderMediaField, "businessImages">;

type MediaState = {
  singleFiles: Partial<Record<SingleMediaField, File>>;
  businessFiles: File[];
  previews: Record<ProviderMediaField, string[]>;
};

const emptyPreviews: MediaState["previews"] = {
  idCardFront: [],
  idCardBack: [],
  businessLicense: [],
  businessImages: [],
};

export function useProviderRegistrationMedia() {
  const cropper = useImageCropper();
  const [media, setMedia] = useState<MediaState>({
    singleFiles: {},
    businessFiles: [],
    previews: emptyPreviews,
  });
  const objectUrls = useRef(new Set<string>());

  useEffect(
    () => () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.current.clear();
    },
    [],
  );

  function replacePreviews(field: ProviderMediaField, files: File[]) {
    const urls = files.map((file) => {
      const url = URL.createObjectURL(file);
      objectUrls.current.add(url);
      return url;
    });

    setMedia((current) => {
      current.previews[field].forEach((url) => {
        URL.revokeObjectURL(url);
        objectUrls.current.delete(url);
      });

      return {
        singleFiles:
          field === "businessImages"
            ? current.singleFiles
            : { ...current.singleFiles, [field]: files[0] },
        businessFiles:
          field === "businessImages" ? files : current.businessFiles,
        previews: { ...current.previews, [field]: urls },
      };
    });

    return urls;
  }

  async function selectFiles(
    field: ProviderMediaField,
    fileList: FileList | null,
  ) {
    const files = Array.from(fileList ?? []);
    const invalidFile = files.find(
      (file) =>
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 8 * 1024 * 1024,
    );
    if (invalidFile) {
      throw new Error("Chỉ chấp nhận JPG, PNG, WEBP và tối đa 8MB mỗi ảnh.");
    }

    const selectedFiles =
      field === "businessImages" ? files : files.slice(0, 1);
    const croppedFiles: File[] = [];

    for (const file of selectedFiles) {
      const croppedFile = await cropper.cropFile(file);
      if (croppedFile) croppedFiles.push(croppedFile);
    }

    if (croppedFiles.length === 0) return [];
    return replacePreviews(field, croppedFiles);
  }

  const documentUploads = [
    media.singleFiles.idCardFront && {
      documentType: "id_card_front",
      file: media.singleFiles.idCardFront,
    },
    media.singleFiles.idCardBack && {
      documentType: "id_card_back",
      file: media.singleFiles.idCardBack,
    },
    media.singleFiles.businessLicense && {
      documentType: "business_license",
      file: media.singleFiles.businessLicense,
    },
    ...media.businessFiles.map((file) => ({
      documentType: "other",
      file,
    })),
  ].filter(
    (item): item is { documentType: string; file: File } => Boolean(item),
  );

  return {
    previews: media.previews,
    documentUploads,
    selectFiles,
    cropper,
  };
}

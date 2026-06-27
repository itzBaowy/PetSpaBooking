"use client";

import { useState } from "react";
import { createWorker } from "tesseract.js";

export type IdentityOcrResult = {
  identityNumber: string;
  identityFullName: string;
  identityDob: string;
  identityAddress: string;
};

function parseIdentityText(text: string): IdentityOcrResult {
  const normalized = text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
  const compactText = normalized.replace(/\s+/g, " ");
  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const identityNumber =
    compactText.match(/\b\d{12}\b/)?.[0] ??
    compactText.match(/\b\d{9}\b/)?.[0] ??
    "";
  const identityDob =
    compactText.match(/\b\d{2}[/-]\d{2}[/-]\d{4}\b/)?.[0] ?? "";
  const nameIndex = lines.findIndex((line) =>
    /full\s*name|name|ho\s*va\s*ten|họ\s*và\s*tên/i.test(line),
  );
  const addressIndex = lines.findIndex((line) =>
    /place\s*of\s*residence|residence|address|noi\s*thuong\s*tru|nơi\s*thường\s*trú|que\s*quan|quê\s*quán/i.test(
      line,
    ),
  );
  const nameLine = nameIndex >= 0 ? lines[nameIndex] : "";
  const nextNameLine = nameIndex >= 0 ? lines[nameIndex + 1] ?? "" : "";
  const addressLine = addressIndex >= 0 ? lines[addressIndex] : "";
  const nextAddressLines =
    addressIndex >= 0
      ? lines.slice(addressIndex + 1, addressIndex + 3).join(", ")
      : "";

  return {
    identityNumber,
    identityDob,
    identityFullName:
      nameLine
        .replace(/.*(?:full\s*name|name|ho\s*va\s*ten|họ\s*và\s*tên)[:\s]*/i, "")
        .trim() || nextNameLine,
    identityAddress:
      addressLine
        .replace(
          /.*(?:place\s*of\s*residence|residence|address|noi\s*thuong\s*tru|nơi\s*thường\s*trú|que\s*quan|quê\s*quán)[:\s]*/i,
          "",
        )
        .trim() || nextAddressLines,
  };
}

export function useIdentityOcr() {
  const [status, setStatus] = useState("");

  async function scan(file: File) {
    setStatus("Đang quét CCCD bằng OCR...");

    try {
      const worker = await createWorker("eng");
      const result = await worker.recognize(file);
      await worker.terminate();
      const parsed = parseIdentityText(result.data.text);

      setStatus(
        parsed.identityNumber || parsed.identityFullName
          ? "Đã quét CCCD. Vui lòng kiểm tra và sửa nếu OCR đọc sai."
          : "OCR chưa đọc rõ thông tin. Vui lòng nhập thủ công.",
      );

      return parsed;
    } catch {
      setStatus("Không thể quét CCCD. Vui lòng nhập thủ công.");
      return null;
    }
  }

  return { status, scan };
}

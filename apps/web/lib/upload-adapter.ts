export interface UploadAdapterOptions {
  maxSize?: number; // in MB
  allowedTypes?: string[];
}

export async function uploadFile(
  file: File,
  options: UploadAdapterOptions = {},
): Promise<string> {
  const {
    maxSize = 5,
    allowedTypes = ["image/jpeg", "image/png", "image/gif"],
  } = options;

  // Validate file size
  if (file.size > maxSize * 1024 * 1024) {
    throw new Error(`File size exceeds ${maxSize}MB limit`);
  }

  // Validate file type
  if (!allowedTypes.includes(file.type)) {
    throw new Error("File type not allowed");
  }

  // TODO: Upload to server
  return "uploaded-file-url";
}

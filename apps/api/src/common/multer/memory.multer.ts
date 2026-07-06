import multer from "multer";
import type { Request } from "express";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB — aligned with frontend limit

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (
    _req: Request,
    file,
    cb,
) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                `Unsupported file type: ${file.mimetype}. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
            ),
        );
    }
};

export const uploadMemory = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE_BYTES },
    fileFilter,
});

// syntax của multer lưu file lên bộ nhớ tạm (memory)
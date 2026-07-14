import multer from "multer";
import type { Request, RequestHandler } from "express";
import { BadRequestException } from "../helpers/exception.helper.ts";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DISPUTE_ALLOWED_MIME_TYPES = [
    ...ALLOWED_MIME_TYPES,
    "application/pdf",
    "video/mp4",
    "video/quicktime",
];
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

const disputeEvidenceParser = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE_BYTES,
        files: 10,
    },
    fileFilter: (_req, file, cb) => {
        if (DISPUTE_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
            return;
        }

        cb(
            new Error(
                `Unsupported dispute evidence type: ${file.mimetype}. Allowed: ${DISPUTE_ALLOWED_MIME_TYPES.join(", ")}`,
            ),
        );
    },
});

export const uploadDisputeEvidenceFiles: RequestHandler = (req, res, next) => {
    disputeEvidenceParser.array("evidenceFiles", 10)(req, res, (error) => {
        if (error) {
            next(new BadRequestException(error.message));
            return;
        }

        next();
    });
};

// syntax của multer lưu file lên bộ nhớ tạm (memory)

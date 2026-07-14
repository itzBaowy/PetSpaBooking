import cloudinary from "../common/cloudinary/init.cloudinary.ts";

export type DisputeEvidenceItem = {
  url: string;
  type?: string;
  title?: string;
  note?: string;
  publicId?: string;
  resourceType?: string;
  mimeType?: string;
  originalName?: string;
  size?: number;
};

export function encodeDisputeEvidence(evidence: DisputeEvidenceItem[]) {
  return evidence.length > 0 ? JSON.stringify(evidence) : null;
}

function getEvidenceType(mimeType: string) {
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (mimeType.startsWith("video/")) return "VIDEO";
  if (mimeType === "application/pdf") return "PDF";
  return "FILE";
}

export async function deleteDisputeEvidenceFiles(
  evidence: DisputeEvidenceItem[],
) {
  await Promise.allSettled(
    evidence
      .filter((item) => item.publicId)
      .map((item) =>
        cloudinary.uploader.destroy(item.publicId!, {
          resource_type: item.resourceType ?? "image",
        }),
      ),
  );
}

export async function uploadDisputeEvidenceFiles(
  files: Express.Multer.File[],
  owner: "customer" | "provider",
): Promise<DisputeEvidenceItem[]> {
  const uploaded: DisputeEvidenceItem[] = [];

  try {
    for (const file of files) {
      const result = await new Promise<{
        publicId: string;
        secureUrl: string;
        resourceType: string;
      }>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: `petlink/disputes/${owner}`,
              resource_type: "auto",
              use_filename: true,
              unique_filename: true,
            },
            (error, result) => {
              if (error || !result) {
                reject(error ?? new Error("Cloudinary upload failed"));
                return;
              }

              resolve({
                publicId: result.public_id,
                secureUrl: result.secure_url,
                resourceType: result.resource_type,
              });
            },
          )
          .end(file.buffer);
      });

      uploaded.push({
        url: result.secureUrl,
        type: getEvidenceType(file.mimetype),
        title: file.originalname,
        publicId: result.publicId,
        resourceType: result.resourceType,
        mimeType: file.mimetype,
        originalName: file.originalname,
        size: file.size,
      });
    }

    return uploaded;
  } catch (error) {
    await deleteDisputeEvidenceFiles(uploaded);
    throw error;
  }
}

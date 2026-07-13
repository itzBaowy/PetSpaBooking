import { Request } from "express";
import prisma from "../../../connect.prisma.ts";
import { BadRequestException } from "../../common/helpers/exception.helper.ts";
import { ObjectId } from "mongodb";
import cloudinary from "../../common/cloudinary/init.cloudinary.ts";

const FOLDER_IMAGE = "public/images";

function getCloudinaryPublicId(avatar?: string | null) {
  if (!avatar) return null;

  let path = avatar;
  try {
    if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
      const pathname = new URL(avatar).pathname;
      const uploadIndex = pathname.indexOf("/upload/");
      path =
        uploadIndex >= 0
          ? pathname.slice(uploadIndex + "/upload/".length)
          : pathname;
      path = path.replace(/^v\d+\//, "");
    }
  } catch {
    path = avatar;
  }

  path = path.replace(/^\/+/, "").replace(/^v\d+\//, "");
  if (!path.startsWith(`${FOLDER_IMAGE}/`)) return null;

  return path.replace(/\.[^/.]+$/, "");
}

export const mobileCustomerServices = {
  async editMyProfile(req: Request) {
    const userId = (req as Request & { user?: { userId: string } }).user
      ?.userId;

    if (!userId) {
      throw new BadRequestException("User id not found");
    }

    if (!ObjectId.isValid(userId)) {
      throw new BadRequestException("Invalid user ID format");
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    const { fullName, phone, location } = req.body;

    let phoneExist;

    if (phone) {
      phoneExist = await prisma.users.findUnique({
        where: { phone: phone },
      });
    }

    if (phoneExist && phoneExist.id !== userId) {
      throw new BadRequestException("Phone number already exists");
    }

    let relativeAvatarPath = user.avatar;

    if (req.file) {
      const fileBuffer = req.file.buffer;
      const uploadResult = await new Promise<{
        public_id: string;
        secure_url: string;
      }>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: FOLDER_IMAGE }, (error, result) => {
            if (error || !result) {
              return reject(error ?? new Error("Cloudinary upload failed"));
            }
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
            });
          })
          .end(fileBuffer);
      });

      relativeAvatarPath = uploadResult.secure_url.includes(FOLDER_IMAGE)
        ? uploadResult.secure_url.substring(
            uploadResult.secure_url.indexOf(FOLDER_IMAGE),
          )
        : uploadResult.secure_url;

      const oldPublicId = getCloudinaryPublicId(user.avatar);
      if (oldPublicId) {
        cloudinary.uploader.destroy(oldPublicId).catch((err: unknown) => {
          console.error(
            "[editMyProfile] Failed to destroy old Cloudinary asset:",
            err,
          );
        });
      }
    }

    await prisma.customers.update({
      where: { userId: user.id },
      data: {
        users: {
          update: {
            fullName: fullName,
            phone: phone,
            avatar: relativeAvatarPath,
          },
        },
        location: location,
      },
    });
  },
};

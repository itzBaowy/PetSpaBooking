import { Request } from "express";
import prisma from "../../../connect.prisma.ts";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../../common/helpers/exception.helper.ts";
import { buildQueryPrisma } from "../../common/helpers/build-query-prisma.helper.ts";
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

  async getDisputes(req: Request) {
    const userId = (req as Request & { user?: { userId: string } }).user
      ?.userId;
    if (!userId) throw new UnauthorizedException("Unauthorized");

    const customer = await prisma.customers.findUnique({ where: { userId } });
    if (!customer) throw new NotFoundException("Customer not found");

    const {
      page,
      pageSize,
      index,
      where: baseWhere,
    } = buildQueryPrisma(req.query);
    const where = { ...baseWhere, customerId: customer.id };

    const [disputes, totalItems] = await Promise.all([
      prisma.booking_disputes.findMany({
        where,
        skip: index,
        take: pageSize,
        orderBy: { createAt: "desc" },
        include: {
          booking: {
            select: {
              id: true,
              status: true,
              totalAmount: true,
              provider: {
                select: {
                  id: true,
                  businessName: true,
                  avatarUrl: true,
                },
              },
              service: {
                select: {
                  id: true,
                  name: true,
                  imageUrls: true,
                },
              },
            },
          },
        },
      }),
      prisma.booking_disputes.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / pageSize);

    console.log(disputes);

    return {
      items: disputes.map((dispute) => ({
        ...dispute,
        evidence: dispute.evidence ? JSON.parse(dispute.evidence) : [],
        providerEvidence: dispute.providerEvidence
          ? JSON.parse(dispute.providerEvidence)
          : [],
        adminEvidence: dispute.adminEvidence
          ? JSON.parse(dispute.adminEvidence)
          : [],
      })),
      meta: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  async getDisputeById(req: Request) {
    const userId = (req as Request & { user?: { userId: string } }).user
      ?.userId;
    if (!userId) throw new UnauthorizedException("Unauthorized");

    const customer = await prisma.customers.findUnique({ where: { userId } });
    if (!customer) throw new NotFoundException("Customer not found");

    const id = req.params.id as string;
    if (!id || !ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid dispute ID");
    }

    const dispute = await prisma.booking_disputes.findUnique({
      where: { id },
      include: {
        booking: {
          select: {
            id: true,
            status: true,
            paymentMethod: true,
            paymentStatus: true,
            totalAmount: true,
            refundAmount: true,
            refundRequestedAt: true,
            refundResolvedAt: true,
            refundMethod: true,
            refundReference: true,
            refundReason: true,
            checkedOutAt: true,
            completedAt: true,
            cancelledAt: true,
            provider: {
              select: {
                id: true,
                businessName: true,
                avatarUrl: true,
                phone: true,
              },
            },
            service: {
              select: {
                id: true,
                name: true,
                imageUrls: true,
              },
            },
          },
        },
      },
    });

    if (!dispute || dispute.customerId !== customer.id) {
      throw new NotFoundException("Dispute not found");
    }

    return {
      ...dispute,
      evidence: dispute.evidence ? JSON.parse(dispute.evidence) : [],
      providerEvidence: dispute.providerEvidence
        ? JSON.parse(dispute.providerEvidence)
        : [],
      adminEvidence: dispute.adminEvidence
        ? JSON.parse(dispute.adminEvidence)
        : [],
    };
  },
};

import { Request } from "express";
import { ObjectId } from "mongodb";
import prisma from "../../../connect.prisma.ts";
import cloudinary from "../../common/cloudinary/init.cloudinary.ts";
import { buildQueryPrisma } from "../../common/helpers/build-query-prisma.helper.ts";

function getCloudinaryPublicId(url?: string | null) {
  if (!url) return null;

  let path = url;
  try {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      const pathname = new URL(url).pathname;
      const uploadIndex = pathname.indexOf("/upload/");
      path =
        uploadIndex >= 0
          ? pathname.slice(uploadIndex + "/upload/".length)
          : pathname;
      path = path.replace(/^v\d+\//, "");
    }
  } catch {
    path = url;
  }

  path = path.replace(/^\/+/, "").replace(/^v\d+\//, "");
  
  const extIndex = path.lastIndexOf(".");
  if (extIndex !== -1) {
    path = path.slice(0, extIndex);
  }

  return path;
}
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../../common/helpers/exception.helper.ts";
import { getQueryString } from "../../common/helpers/paramHelper.ts";

const PET_SELECT = {
  id: true,
  name: true,
  breed: true,
  gender: true,
  ageLabel: true,
  imageUrl: true,
  status: true,
  weight: true,
  height: true,
  color: true,
  criticalNote: true,
  nextVaccineDate: true,
  healthReminder: true,
  medicalRecords: true,
  photos: true,
  customerId: true,
  createAt: true,
  updateAt: true,
} as const;

function getRequesterUserId(req: Request) {
  const userId = (req as Request & { user?: { userId: string } }).user?.userId;

  if (!userId) {
    throw new BadRequestException("UserId not found");
  }

  if (!ObjectId.isValid(userId)) {
    throw new BadRequestException("Invalid user ID format");
  }

  return userId;
}

async function getCurrentCustomerId(userId: string) {
  const customer = await prisma.customers.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!customer) {
    throw new NotFoundException("Customer profile not found");
  }

  return customer.id;
}

function getRoutePetId(req: Request) {
  const petId = getQueryString(req.params.petId);

  if (!petId) {
    throw new BadRequestException("Pet ID is required");
  }

  if (!ObjectId.isValid(petId)) {
    throw new BadRequestException("Invalid pet ID format");
  }

  return petId;
}

function getRequiredString(value: unknown, fieldName: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new BadRequestException(`${fieldName} is required`);
  }

  return value.trim();
}

function getOptionalString(value: unknown) {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new BadRequestException("Expected a string value");
  }

  return value.trim();
}

function getOptionalStringArray(value: unknown) {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      throw new BadRequestException("photos must be a valid JSON array string");
    }
  }

  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new BadRequestException("photos must be an array of strings");
  }

  return value;
}

function getOptionalHealthReminder(value: unknown) {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      throw new BadRequestException("healthReminder must be a valid JSON object string");
    }
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    throw new BadRequestException("healthReminder must be an object");
  }

  const reminder = value as Record<string, unknown>;
  const title = getOptionalString(reminder.title);
  const date = getOptionalString(reminder.date);

  if (!title && !date) {
    return undefined;
  }

  return {
    title: title ?? "",
    date: date ?? "",
  };
}

function getOptionalMedicalRecords(value: unknown) {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      throw new BadRequestException("medicalRecords must be a valid JSON array string");
    }
  }

  if (!Array.isArray(value)) {
    throw new BadRequestException("medicalRecords must be an array");
  }

  return value.map((record, index) => {
    if (typeof record !== "object" || Array.isArray(record)) {
      throw new BadRequestException("medicalRecords items must be objects");
    }

    const data = record as Record<string, unknown>;

    return {
      id: getRequiredString(
        data.id ?? `rec_${index + 1}`,
        "medicalRecords[].id",
      ),
      title: getRequiredString(data.title, "medicalRecords[].title"),
      description: getRequiredString(
        data.description,
        "medicalRecords[].description",
      ),
      date: getRequiredString(data.date, "medicalRecords[].date"),
    };
  });
}

function buildCreatePetPayload(body: Record<string, unknown>) {
  const name = getRequiredString(body.name, "name");
  const breed = getRequiredString(body.breed, "breed");
  const gender = getRequiredString(body.gender, "gender");
  const ageLabel = getRequiredString(body.ageLabel, "ageLabel");
  const imageUrl = getRequiredString(body.imageUrl, "imageUrl");
  const weight = getRequiredString(body.weight, "weight");
  const height = getRequiredString(body.height, "height");
  const color = getRequiredString(body.color, "color");
  const status = getOptionalString(body.status) ?? "ACTIVE";
  const criticalNote = getOptionalString(body.criticalNote);
  const nextVaccineDate = getOptionalString(body.nextVaccineDate);
  const photos = getOptionalStringArray(body.photos) ?? [];
  const healthReminder = getOptionalHealthReminder(body.healthReminder);
  const medicalRecords = getOptionalMedicalRecords(body.medicalRecords) ?? [];

  return {
    name,
    breed,
    gender,
    ageLabel,
    imageUrl,
    weight,
    height,
    color,
    status,
    criticalNote: criticalNote ?? null,
    nextVaccineDate: nextVaccineDate ?? null,
    photos,
    healthReminder: healthReminder ?? null,
    medicalRecords,
  };
}

function buildUpdatePetPayload(body: Record<string, unknown>) {
  const payload: Record<string, unknown> = {};

  if (body.name !== undefined)
    payload.name = getRequiredString(body.name, "name");
  if (body.breed !== undefined) {
    payload.breed = getRequiredString(body.breed, "breed");
  }
  if (body.gender !== undefined) {
    payload.gender = getRequiredString(body.gender, "gender");
  }
  if (body.ageLabel !== undefined) {
    payload.ageLabel = getRequiredString(body.ageLabel, "ageLabel");
  }
  if (body.imageUrl !== undefined) {
    payload.imageUrl = getRequiredString(body.imageUrl, "imageUrl");
  }
  if (body.weight !== undefined) {
    payload.weight = getRequiredString(body.weight, "weight");
  }
  if (body.height !== undefined) {
    payload.height = getRequiredString(body.height, "height");
  }
  if (body.color !== undefined) {
    payload.color = getRequiredString(body.color, "color");
  }
  if (body.status !== undefined) {
    payload.status = getOptionalString(body.status) ?? "ACTIVE";
  }
  if (body.criticalNote !== undefined) {
    payload.criticalNote = getOptionalString(body.criticalNote) ?? null;
  }
  if (body.nextVaccineDate !== undefined) {
    payload.nextVaccineDate = getOptionalString(body.nextVaccineDate) ?? null;
  }
  if (body.photos !== undefined) {
    payload.photos = getOptionalStringArray(body.photos) ?? [];
  }
  if (body.healthReminder !== undefined) {
    payload.healthReminder =
      getOptionalHealthReminder(body.healthReminder) ?? null;
  }
  if (body.medicalRecords !== undefined) {
    payload.medicalRecords =
      getOptionalMedicalRecords(body.medicalRecords) ?? [];
  }

  if (Object.keys(payload).length === 0) {
    throw new BadRequestException(
      "At least one field must be provided to update the pet",
    );
  }

  return payload;
}

export const mobilePetService = {
  async createPet(req: Request) {
    const userId = getRequesterUserId(req);
    const customerId = await getCurrentCustomerId(userId);

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    if (files && files["imageUrl"] && files["imageUrl"].length > 0) {
      const fileBuffer = files["imageUrl"][0].buffer;
      const FOLDER_PETS = "public/pets";
      const uploadResult = await new Promise<{
        public_id: string;
        secure_url: string;
      }>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: FOLDER_PETS }, (error, result) => {
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

      req.body.imageUrl = uploadResult.secure_url.includes(FOLDER_PETS)
        ? uploadResult.secure_url.substring(
            uploadResult.secure_url.indexOf(FOLDER_PETS),
          )
        : uploadResult.secure_url;
    }

    if (files && files["photos"] && files["photos"].length > 0) {
      const FOLDER_PETS = "public/pets";
      const uploadPromises = files["photos"].map((file) => {
        return new Promise<{ public_id: string; secure_url: string }>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: FOLDER_PETS }, (error, result) => {
              if (error || !result) {
                return reject(error ?? new Error("Cloudinary upload failed"));
              }
              resolve({
                public_id: result.public_id,
                secure_url: result.secure_url,
              });
            })
            .end(file.buffer);
        });
      });

      const uploadResults = await Promise.all(uploadPromises);
      const photoUrls = uploadResults.map(result => 
        result.secure_url.includes(FOLDER_PETS)
          ? result.secure_url.substring(result.secure_url.indexOf(FOLDER_PETS))
          : result.secure_url
      );

      let existingPhotos: string[] = [];
      if (req.body.photos) {
         if (typeof req.body.photos === 'string') {
             try { existingPhotos = JSON.parse(req.body.photos); } catch (e) {}
         } else if (Array.isArray(req.body.photos)) {
             existingPhotos = req.body.photos as string[];
         }
      }
      req.body.photos = [...existingPhotos, ...photoUrls];
    }

    const payload = buildCreatePetPayload(req.body as Record<string, unknown>);

    const pet = await prisma.pets.create({
      data: {
        customerId,
        ...payload,
      },
      select: PET_SELECT,
    });

    return pet;
  },

  async getMyPets(req: Request) {
    const userId = getRequesterUserId(req);
    const customerId = await getCurrentCustomerId(userId);
    const { page, pageSize, index, where } = buildQueryPrisma(
      req.query as Record<string, unknown>,
    );

    const [pets, total] = await Promise.all([
      prisma.pets.findMany({
        where: {
          customerId,
          ...where,
        },
        select: {
          id: true,
          name: true,
          breed: true,
          gender: true,
          ageLabel: true,
          imageUrl: true,
          status: true,
          nextVaccineDate: true,
          createAt: true,
          updateAt: true,
        },
        skip: index,
        take: pageSize,
        orderBy: { createAt: "desc" },
      }),
      prisma.pets.count({
        where: {
          customerId,
          ...where,
        },
      }),
    ]);

    return {
      page,
      pageSize,
      total,
      totalPage: Math.ceil(total / pageSize),
      pets,
    };
  },

  async getPetDetail(req: Request) {
    const userId = getRequesterUserId(req);
    const customerId = await getCurrentCustomerId(userId);
    const petId = getRoutePetId(req);

    const pet = await prisma.pets.findUnique({
      where: { id: petId },
      select: PET_SELECT,
    });

    if (!pet) {
      throw new NotFoundException("Pet not found");
    }

    if (pet.customerId !== customerId) {
      throw new ForbiddenException("You can only access your own pets");
    }

    return pet;
  },

  async updatePet(req: Request) {
    const userId = getRequesterUserId(req);
    const customerId = await getCurrentCustomerId(userId);
    const petId = getRoutePetId(req);

    const existingPet = await prisma.pets.findUnique({
      where: { id: petId },
      select: { id: true, customerId: true, imageUrl: true },
    });

    if (!existingPet) {
      throw new NotFoundException("Pet not found");
    }

    if (existingPet.customerId !== customerId) {
      throw new ForbiddenException("You can only update your own pets");
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    if (files && files["imageUrl"] && files["imageUrl"].length > 0) {
      const fileBuffer = files["imageUrl"][0].buffer;
      const FOLDER_PETS = "public/pets";
      const uploadResult = await new Promise<{
        public_id: string;
        secure_url: string;
      }>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: FOLDER_PETS }, (error, result) => {
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

      req.body.imageUrl = uploadResult.secure_url.includes(FOLDER_PETS)
        ? uploadResult.secure_url.substring(
            uploadResult.secure_url.indexOf(FOLDER_PETS),
          )
        : uploadResult.secure_url;

      if (existingPet.imageUrl) {
        const oldPublicId = getCloudinaryPublicId(existingPet.imageUrl);
        if (oldPublicId) {
          cloudinary.uploader.destroy(oldPublicId).catch((err: unknown) => {
            console.error(
              "[updatePet] Failed to destroy old Cloudinary asset:",
              err,
            );
          });
        }
      }
    }

    if (files && files["photos"] && files["photos"].length > 0) {
      const FOLDER_PETS = "public/pets";
      const uploadPromises = files["photos"].map((file) => {
        return new Promise<{ public_id: string; secure_url: string }>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: FOLDER_PETS }, (error, result) => {
              if (error || !result) {
                return reject(error ?? new Error("Cloudinary upload failed"));
              }
              resolve({
                public_id: result.public_id,
                secure_url: result.secure_url,
              });
            })
            .end(file.buffer);
        });
      });

      const uploadResults = await Promise.all(uploadPromises);
      const photoUrls = uploadResults.map(result => 
        result.secure_url.includes(FOLDER_PETS)
          ? result.secure_url.substring(result.secure_url.indexOf(FOLDER_PETS))
          : result.secure_url
      );

      let existingPhotos: string[] = [];
      if (req.body.photos) {
         if (typeof req.body.photos === 'string') {
             try { existingPhotos = JSON.parse(req.body.photos); } catch (e) {}
         } else if (Array.isArray(req.body.photos)) {
             existingPhotos = req.body.photos as string[];
         }
      }
      req.body.photos = [...existingPhotos, ...photoUrls];
    }

    const payload = buildUpdatePetPayload(req.body as Record<string, unknown>);
    const updatedPet = await prisma.pets.update({
      where: { id: petId },
      data: payload,
      select: PET_SELECT,
    });

    return updatedPet;
  },

  async deletePet(req: Request) {
    const userId = getRequesterUserId(req);
    const customerId = await getCurrentCustomerId(userId);
    const petId = getRoutePetId(req);

    const existingPet = await prisma.pets.findUnique({
      where: { id: petId },
      select: { id: true, customerId: true },
    });

    if (!existingPet) {
      throw new NotFoundException("Pet not found");
    }

    if (existingPet.customerId !== customerId) {
      throw new ForbiddenException("You can only delete your own pets");
    }

    await prisma.pets.delete({ where: { id: petId } });
  },
};

"use client";

import { formatVietnameseDateTime } from "@/lib/date";
import type { AdminUserPet } from "../schema";

function getPetImageSrc(pet: AdminUserPet) {
  const imageUrl = pet.imageUrl || pet.photos[0];
  if (!imageUrl) return undefined;
  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("data:") ||
    imageUrl.startsWith("blob:")
  ) {
    return imageUrl;
  }

  const baseUrl = process.env.NEXT_PUBLIC_CLOUDINARY_URL || "";
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  return `${cleanBase}${cleanPath}`;
}

export function UserPetCard({ pet }: { pet: AdminUserPet }) {
  const imageSrc = getPetImageSrc(pet);

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="aspect-[4/3] bg-gray-100">
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt={pet.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm font-semibold text-gray-400">
            Chưa có ảnh
          </div>
        )}
      </div>

      <div className="space-y-4 p-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-950">{pet.name}</h3>
              <p className="mt-1 text-sm font-semibold text-gray-500">
                {pet.breed} / {pet.gender}
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              {pet.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <PetMeta label="Tuổi" value={pet.ageLabel} />
          <PetMeta label="Màu" value={pet.color} />
          <PetMeta label="Cân nặng" value={pet.weight} />
          <PetMeta label="Chiều cao" value={pet.height} />
        </div>

        {pet.criticalNote ? (
          <div className="rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">
            {pet.criticalNote}
          </div>
        ) : null}

        <div className="border-t border-gray-100 pt-3 text-xs font-semibold text-gray-500">
          Cập nhật: {formatVietnameseDateTime(pet.updateAt)}
        </div>
      </div>
    </article>
  );
}

function PetMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mt-1 break-words font-bold text-gray-900">{value}</p>
    </div>
  );
}

"use client";

import type { AdminUser } from "../schema";
import { UserPetCard } from "./user-pet-card";

export function UserPetsPanel({ user }: { user: AdminUser }) {
  const pets = user.customers?.pets ?? [];

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-950">Thú cưng</h2>
            <p className="mt-1 text-sm font-semibold text-gray-500">
              {pets.length} hồ sơ thú cưng của người dùng này
            </p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-700">
            {pets.length}
          </span>
        </div>
      </div>

      {pets.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {pets.map((pet) => (
            <UserPetCard key={pet.id} pet={pet} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-bold text-gray-700">
            Người dùng này chưa có thú cưng
          </p>
          <p className="mt-1 text-xs font-semibold text-gray-500">
            Khi khách hàng tạo hồ sơ pet, danh sách sẽ hiển thị ở đây.
          </p>
        </div>
      )}
    </section>
  );
}

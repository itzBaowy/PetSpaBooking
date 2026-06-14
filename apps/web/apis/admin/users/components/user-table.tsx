"use client";

import { useState } from "react";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface MockAdminUser {
  id: string;
  name: string;
  email: string;
  role: "PET_OWNER" | "SERVICE_PROVIDER" | "ADMIN";
  status: "Active" | "Suspended";
}

const MOCK_USERS: MockAdminUser[] = [
  {
    id: "USR-1001",
    name: "Minh Nguyen",
    email: "minh.nguyen@example.com",
    role: "PET_OWNER",
    status: "Active",
  },
  {
    id: "USR-1002",
    name: "Happy Paws Spa",
    email: "owner@happypaws.vn",
    role: "SERVICE_PROVIDER",
    status: "Active",
  },
  {
    id: "USR-1003",
    name: "An Tran",
    email: "an.tran@example.com",
    role: "PET_OWNER",
    status: "Suspended",
  },
  {
    id: "USR-1004",
    name: "VetCare 24h",
    email: "admin@vetcare24h.vn",
    role: "SERVICE_PROVIDER",
    status: "Active",
  },
  {
    id: "USR-1005",
    name: "Super Admin",
    email: "admin@petlink.vn",
    role: "ADMIN",
    status: "Active",
  },
];

export function UserTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const total = MOCK_USERS.length;
  const totalPages = Math.ceil(total / pageSize);
  const records = MOCK_USERS.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Role</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {records.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4">
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.id}</p>
              </td>
              <td className="px-6 py-4 text-gray-700">{user.email}</td>
              <td className="px-6 py-4 text-gray-700">{user.role}</td>
              <td className="px-6 py-4">
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs font-semibold",
                    user.status === "Active"
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-red-200 bg-red-50 text-red-700",
                  )}
                >
                  {user.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-gray-100 px-5 py-4">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={(value) => {
            setPageSize(value);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}

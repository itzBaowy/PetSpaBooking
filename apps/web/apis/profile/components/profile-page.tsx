"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatisticCard, StatisticCardGrid } from "@/components/ui/statistic-card";
import { profileUpdateSchema } from "../schema";
import { useProfile } from "../queries";
import type { ProfileRouteRole, ProfileUpdateData } from "../schema";

const roleLabels = {
  admin: "Administrator",
  provider: "Service Provider",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function ProfilePage({ role }: { role: ProfileRouteRole }) {
  const { data: profile } = useProfile(role);
  const [form, setForm] = useState<ProfileUpdateData>({
    name: profile.name,
    phone: profile.phone,
    title: profile.title,
    department: profile.department,
    timezone: profile.timezone,
  });
  const initials = profile.name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSave = () => {
    const result = profileUpdateSchema.safeParse(form);

    if (!result.success) {
      window.alert(result.error.issues[0]?.message ?? "Invalid profile data.");
      return;
    }

    window.alert("Profile changes saved (mock).");
  };

  return (
    <div className="w-full max-w-full space-y-6 p-6">
      <PageHeader
        eyebrow={`${roleLabels[role]} / Profile`}
        title="Profile"
        description="Manage your identity, contact details, and account metadata."
        actions={
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800"
          >
            Save changes
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-blue-600 text-3xl font-extrabold text-white shadow-sm">
              {initials}
            </div>
            <h2 className="mt-4 text-xl font-extrabold text-gray-950">
              {profile.name}
            </h2>
            <p className="mt-1 text-sm font-medium text-gray-500">
              {profile.email}
            </p>
            <span className="mt-3 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              {roleLabels[role]}
            </span>
          </div>

          <div className="mt-6 space-y-3 border-t border-gray-100 pt-5">
            {[
              ["Account ID", profile.id],
              ["Department", profile.department],
              ["Joined", formatDate(profile.joinedAt)],
              ["Last login", formatDate(profile.lastLoginAt)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4">
                <span className="text-sm font-medium text-gray-500">
                  {label}
                </span>
                <span className="text-right text-sm font-semibold text-gray-900">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <StatisticCardGrid columns={3}>
            <StatisticCard title="Role" value={profile.role} tone="blue" />
            <StatisticCard title="Security" value="Active" tone="green" />
            <StatisticCard title="Sessions" value="2" tone="purple" />
          </StatisticCardGrid>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-950">
              Profile information
            </h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                ["Full name", "name"],
                ["Phone", "phone"],
                ["Title", "title"],
                ["Department", "department"],
                ["Timezone", "timezone"],
              ].map(([label, key]) => (
                <label
                  key={key}
                  className="space-y-1 text-sm font-semibold text-gray-700 last:md:col-span-2"
                >
                  {label}
                  <input
                    value={form[key as keyof ProfileUpdateData]}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        [key]: event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 outline-none transition-colors focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-950">
              Account controls
            </h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                "Change password",
                "Manage sessions",
                "Notification preferences",
              ].map((label) => (
                <button
                  key={label}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  {label}
                </button>
              ))}
              <button className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm font-semibold text-red-700 transition-colors hover:bg-red-100">
                Logout all devices
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

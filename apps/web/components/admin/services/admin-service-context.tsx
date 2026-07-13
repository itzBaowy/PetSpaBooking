"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { adminServicesMock } from "@/mocks/admin/admin-services.mock";
import type { AdminServiceMock } from "@/types/admin";
const Context = createContext<{ services: AdminServiceMock[]; update: (id: string, fn: (item: AdminServiceMock) => AdminServiceMock) => void } | null>(null);
export function AdminServiceMockProvider({ children }: { children: ReactNode }) { const [services, setServices] = useState(() => structuredClone(adminServicesMock)); return <Context.Provider value={{ services, update: (id, fn) => setServices((items) => items.map((item) => item.id === id ? fn(item) : item)) }}>{children}</Context.Provider>; }
export function useAdminServiceMock() { const value = useContext(Context); if (!value) throw new Error("Admin service mock unavailable"); return value; }

"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { adminProvidersMock } from "@/mocks/admin/admin-provider-verification.mock";
import type { AdminProviderMock } from "@/types/admin";

type Value = { providers: AdminProviderMock[]; updateProvider: (id: string, update: (provider: AdminProviderMock) => AdminProviderMock) => void };
const Context = createContext<Value | null>(null);
export function AdminProviderMockProvider({ children }: { children: ReactNode }) { const [providers, setProviders] = useState(() => structuredClone(adminProvidersMock)); return <Context.Provider value={{ providers, updateProvider: (id, update) => setProviders((items) => items.map((item) => item.id === id || item.verificationId === id ? update(item) : item)) }}>{children}</Context.Provider>; }
export function useAdminProviderMock() { const value = useContext(Context); if (!value) throw new Error("Admin provider mock context unavailable"); return value; }

"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { providerNotificationsMock } from "@/mocks/provider/provider-notifications.mock";
import type { ProviderNotificationMock } from "@/types/provider-notification";

type ContextValue = { notifications: ProviderNotificationMock[]; unreadCount: number; markRead: (id: string) => void; markAllRead: () => void; remove: (id: string) => void };
const Context = createContext<ContextValue | null>(null);
export function ProviderNotificationMockProvider({ children }: { children: ReactNode }) { const [notifications, setNotifications] = useState(() => structuredClone(providerNotificationsMock)); const value = useMemo<ContextValue>(() => ({ notifications, unreadCount: notifications.filter((item) => !item.read).length, markRead: (id) => setNotifications((items) => items.map((item) => item.id === id ? { ...item, read: true } : item)), markAllRead: () => setNotifications((items) => items.map((item) => ({ ...item, read: true }))), remove: (id) => setNotifications((items) => items.filter((item) => item.id !== id)) }), [notifications]); return <Context.Provider value={value}>{children}</Context.Provider>; }
export function useProviderNotificationMock() { const value = useContext(Context); if (!value) throw new Error("Provider notification mock context is unavailable"); return value; }
export function useProviderNotificationMockOptional() { return useContext(Context); }

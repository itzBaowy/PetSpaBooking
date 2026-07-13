"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { Input, Textarea } from "@/components/ui/input";
import type { ProviderBookingMock } from "@/types/provider-booking";

export const MOCK_BOOKING_NOW = new Date("2026-07-18T12:00:00+07:00");
export const NO_ARRIVAL_GRACE_MINUTES = 15;
const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export function canReportNoArrival(booking: ProviderBookingMock) {
  const graceEndsAt = new Date(new Date(booking.appointmentAt).getTime() + NO_ARRIVAL_GRACE_MINUTES * 60000);
  return booking.status === "confirmed" && booking.qrStatus !== "verified" && MOCK_BOOKING_NOW >= graceEndsAt;
}

export function AcceptBookingDialog({ booking, onClose, onConfirm }: DialogProps) {
  const commission = booking.totalAmount * booking.commissionRate;
  const availableBalance = booking.paymentMethod === "cash" ? 30000 : 1800000;
  const insufficient = booking.paymentMethod === "cash" && availableBalance < commission;
  return <Dialog title="Accept booking" onClose={onClose}><BookingSummary booking={booking} /><div className="mt-4 grid gap-3 sm:grid-cols-2"><Metric label="Payment method" value={booking.paymentMethod.replaceAll("_", " ")} /><Metric label="Expected commission" value={money.format(commission)} /><Metric label="Available commission balance" value={money.format(availableBalance)} /><Metric label="Balance after acceptance" value={money.format(Math.max(0, availableBalance - commission))} /></div>{insufficient && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4"><p className="text-sm font-extrabold text-red-900">Insufficient commission balance for this cash booking.</p><p className="mt-1 text-sm leading-6 text-red-800">Deposit enough balance before accepting. No wallet transaction will be created by this demo.</p><Link href="/provider/wallet/deposit" className="mt-3 inline-flex text-sm font-extrabold text-brand hover:underline">Go to wallet deposit →</Link></div>}<footer className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={onClose}>Cancel</Button><Button disabled={insufficient} onClick={() => onConfirm("Booking accepted after commission balance check.")}>Confirm Accept</Button></footer></Dialog>;
}

const rejectOptions = [
  { label: "Schedule unavailable", value: "schedule_unavailable" },
  { label: "Unsupported pet condition", value: "unsupported_pet_condition" },
  { label: "Service unavailable", value: "service_unavailable" },
  { label: "Capacity full", value: "capacity_full" },
  { label: "Other", value: "other" },
];

export function RejectBookingDialog({ booking, onClose, onConfirm }: DialogProps) {
  const [reason, setReason] = useState(""); const [other, setOther] = useState(""); const [error, setError] = useState("");
  function submit() { const selected = rejectOptions.find((item) => item.value === reason)?.label; if (!reason) return setError("Select a rejection reason."); if (reason === "other" && !other.trim()) return setError("Enter a reason before rejecting."); onConfirm(reason === "other" ? other.trim() : selected ?? reason); }
  return <Dialog title="Reject booking" onClose={onClose}><BookingSummary booking={booking} /><label className="mt-5 block"><span className="mb-2 block text-sm font-bold">Reason *</span><CustomSelect value={reason} placeholder="Choose a reason" options={rejectOptions} onValueChange={(value) => { setReason(value); setError(""); }} /></label>{reason === "other" && <label className="mt-4 block"><span className="mb-2 block text-sm font-bold">Details *</span><Textarea value={other} onChange={(e) => { setOther(e.target.value); setError(""); }} placeholder="Explain why this booking cannot be accepted..." /></label>}{error && <p className="mt-3 text-sm font-bold text-danger">{error}</p>}<footer className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={onClose}>Cancel</Button><Button className="bg-danger hover:bg-danger/90" onClick={submit}>Reject Booking</Button></footer></Dialog>;
}

export function NoArrivalDialog({ booking, onClose, onConfirm }: DialogProps) {
  const [reason, setReason] = useState(""); const [evidence, setEvidence] = useState<File | null>(null); const [error, setError] = useState(""); const enabled = canReportNoArrival(booking);
  function submit() { if (!enabled) return; if (!reason.trim()) return setError("Describe the no-arrival situation."); onConfirm(`${reason.trim()}${evidence ? ` Evidence selected: ${evidence.name}.` : ""}`); }
  return <Dialog title="Report no arrival" onClose={onClose}><BookingSummary booking={booking} /><div className="mt-4 grid gap-3 sm:grid-cols-2"><Metric label="Appointment time" value={formatDate(booking.appointmentAt)} /><Metric label="Grace period" value={`${NO_ARRIVAL_GRACE_MINUTES} minutes`} /><Metric label="Mock current time" value={formatDate(MOCK_BOOKING_NOW.toISOString())} /><Metric label="Check-in status" value={booking.qrStatus === "verified" ? "Checked in" : "Not checked in"} /></div><div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">Reporting no arrival can affect the customer record and payment handling. Confirm the customer has not arrived after the grace period.</div>{!enabled && <p className="mt-3 text-sm font-bold text-danger">This booking is not eligible: it must be confirmed, not checked in, and past the grace period.</p>}<label className="mt-4 block"><span className="mb-2 block text-sm font-bold">Reason *</span><Textarea disabled={!enabled} value={reason} onChange={(e) => { setReason(e.target.value); setError(""); }} placeholder="Describe contact attempts and the current situation..." /></label><label className="mt-4 block"><span className="mb-2 block text-sm font-bold">Evidence (mock upload)</span><Input disabled={!enabled} type="file" accept="image/*,.pdf" onChange={(e) => setEvidence(e.target.files?.[0] ?? null)} />{evidence && <span className="mt-2 block text-xs font-semibold text-muted">Selected locally: {evidence.name}</span>}</label>{error && <p className="mt-3 text-sm font-bold text-danger">{error}</p>}<footer className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={onClose}>Cancel</Button><Button disabled={!enabled} onClick={submit}>Confirm No-arrival</Button></footer></Dialog>;
}

type DialogProps = { booking: ProviderBookingMock; onClose: () => void; onConfirm: (reason: string) => void };
function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) { return <div className="fixed inset-0 z-[65] grid place-items-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><div role="dialog" aria-modal="true" className="my-6 w-full max-w-xl rounded-3xl bg-surface p-6 shadow-2xl"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-extrabold">{title}</h2><Button variant="ghost" className="h-9 px-3" onClick={onClose}>Close</Button></div>{children}</div></div>; }
function BookingSummary({ booking }: { booking: ProviderBookingMock }) { return <div className="mt-5 rounded-2xl bg-surface-muted p-4"><p className="text-xs font-extrabold uppercase tracking-wide text-subtle">{booking.code}</p><p className="mt-1 font-extrabold">{booking.service.name}</p><p className="mt-1 text-sm text-muted">{booking.customer.name} · {booking.pet.name} · {formatDate(booking.appointmentAt)}</p></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-border-subtle p-3"><p className="text-xs font-extrabold uppercase text-subtle">{label}</p><p className="mt-1 text-sm font-bold capitalize">{value}</p></div>; }
function formatDate(value: string) { return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }

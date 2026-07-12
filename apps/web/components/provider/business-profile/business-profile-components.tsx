"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useConfirmDialog, useToast } from "@/components/ui/feedback-provider";
import { cn } from "@/lib/utils";
import { getMockProviderBusinessProfile } from "@/mocks/provider/provider-business-profile-mock-service";
import { serviceCategoryOptions, supportedServiceOptions } from "@/mocks/provider/provider-business-profile.mock";
import type { ProviderBusinessImage, ProviderBusinessProfileErrors, ProviderBusinessProfileForm } from "@/types/provider";

const MAX_IMAGES = 8;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function Field({ label, error, wide, children }: { label: string; error?: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={cn("block", wide && "sm:col-span-2")}><span className="mb-2 block text-sm font-bold text-foreground">{label}</span>{children}{error && <span className="mt-1.5 block text-xs font-bold text-danger">{error}</span>}</label>;
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="rounded-3xl border border-border-subtle bg-surface p-5 shadow-sm sm:p-6"><h2 className="text-lg font-extrabold text-foreground">{title}</h2><p className="mt-1 text-sm leading-6 text-muted">{description}</p><div className="mt-5">{children}</div></section>;
}

function ToggleChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return <button type="button" aria-pressed={selected} onClick={onClick} className={cn("rounded-full border px-3.5 py-2 text-sm font-bold transition", selected ? "border-brand bg-brand-soft text-brand" : "border-border-muted bg-surface text-muted hover:border-brand")}>{selected ? "✓ " : "+ "}{label}</button>;
}

export function BusinessOverviewForm({ value, errors, update }: FormSectionProps) {
  return <Section title="Business overview" description="Describe your business and the care experience customers can expect."><div className="grid gap-4 sm:grid-cols-2"><Field label="Business name *" error={errors.businessName} wide><Input value={value.businessName} onChange={(e) => update("businessName", e.target.value)} /></Field><Field label="Short description" wide><Input maxLength={140} value={value.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} /><span className="mt-1 block text-right text-xs text-subtle">{value.shortDescription.length}/140</span></Field><Field label="Full description" wide><Textarea className="min-h-32" value={value.fullDescription} onChange={(e) => update("fullDescription", e.target.value)} /></Field><Field label="Operating model"><Input value={value.operatingModel} onChange={(e) => update("operatingModel", e.target.value)} /></Field><Field label="Years of operation"><Input type="number" min={0} max={100} value={value.yearsOfOperation} onChange={(e) => update("yearsOfOperation", Number(e.target.value))} /></Field><Field label="Tax code / Registration number" wide><Input value={value.registrationNumber} onChange={(e) => update("registrationNumber", e.target.value)} /></Field></div><div className="mt-5"><p className="mb-2 text-sm font-bold text-foreground">Service categories</p><div className="flex flex-wrap gap-2">{serviceCategoryOptions.map((item) => <ToggleChip key={item} label={item} selected={value.serviceCategories.includes(item)} onClick={() => update("serviceCategories", toggleItem(value.serviceCategories, item))} />)}</div></div></Section>;
}

export function BusinessContactForm({ value, errors, update }: FormSectionProps) {
  return <Section title="Contact information" description="Information customers and PetLink can use to contact the business."><div className="grid gap-4 sm:grid-cols-2"><Field label="Representative name"><Input value={value.representativeName} onChange={(e) => update("representativeName", e.target.value)} /></Field><Field label="Contact phone" error={errors.contactPhone}><Input inputMode="tel" value={value.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} /></Field><Field label="Contact email" error={errors.contactEmail}><Input type="email" value={value.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} /></Field><Field label="Website"><Input type="url" value={value.website} onChange={(e) => update("website", e.target.value)} /></Field><Field label="Social link" wide><Input type="url" value={value.socialLink} onChange={(e) => update("socialLink", e.target.value)} /></Field></div></Section>;
}

export function BusinessAddressForm({ value, errors, update }: FormSectionProps) {
  return <Section title="Business address" description="Set the public facility address. The map below is a visual mock only."><div className="grid gap-4 sm:grid-cols-2"><Field label="Province / City"><Input value={value.province} onChange={(e) => update("province", e.target.value)} /></Field><Field label="District"><Input value={value.district} onChange={(e) => update("district", e.target.value)} /></Field><Field label="Ward"><Input value={value.ward} onChange={(e) => update("ward", e.target.value)} /></Field><Field label="Detailed address *" error={errors.detailedAddress}><Input value={value.detailedAddress} onChange={(e) => update("detailedAddress", e.target.value)} /></Field><Field label="Latitude"><Input inputMode="decimal" value={value.latitude} onChange={(e) => update("latitude", e.target.value)} /></Field><Field label="Longitude"><Input inputMode="decimal" value={value.longitude} onChange={(e) => update("longitude", e.target.value)} /></Field></div><div className="relative mt-5 h-56 overflow-hidden rounded-2xl border border-border-muted bg-[linear-gradient(45deg,#e8f5ef_25%,transparent_25%),linear-gradient(-45deg,#e8f5ef_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e8f5ef_75%),linear-gradient(-45deg,transparent_75%,#e8f5ef_75%)] bg-[length:32px_32px] bg-[position:0_0,0_16px,16px_-16px,-16px_0px]"><div className="absolute inset-0 bg-gradient-to-br from-sky-100/80 via-transparent to-emerald-100/80" /><div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand text-xl text-white shadow-lg">⌖</span><p className="mt-2 rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold text-foreground shadow">{value.latitude}, {value.longitude}</p></div><span className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-bold text-muted">Mock map · No map API</span></div></Section>;
}

export function BusinessGallery({ value, errors, onAdd, onRemove, onMove, onPreview }: { value: ProviderBusinessImage[]; errors: ProviderBusinessProfileErrors; onAdd: (files: FileList | null) => void; onRemove: (id: string) => void; onMove: (id: string, direction: -1 | 1) => void; onPreview: (image: ProviderBusinessImage) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const renderGroup = (kind: ProviderBusinessImage["kind"], title: string, className: string) => {
    const images = value.filter((item) => item.kind === kind);
    return <div><h3 className="mb-2 text-sm font-extrabold text-foreground">{title}</h3><div className={cn("grid gap-3", className)}>{images.length ? images.map((image) => <div key={image.id} className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-surface-muted"><button type="button" onClick={() => onPreview(image)} className="block h-full min-h-36 w-full bg-cover bg-center" style={{ backgroundImage: `linear-gradient(0deg,rgba(0,0,0,.18),transparent),url(${image.url})` }} aria-label={`Preview ${image.name}`} /><div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2 rounded-xl bg-white/90 p-2 shadow"><span className="min-w-0 truncate text-xs font-bold text-foreground">{image.name}</span><div className="flex shrink-0 gap-1">{kind === "gallery" && <><button type="button" aria-label="Move image left" onClick={() => onMove(image.id, -1)} className="rounded px-1.5 text-xs font-black hover:bg-surface-muted">←</button><button type="button" aria-label="Move image right" onClick={() => onMove(image.id, 1)} className="rounded px-1.5 text-xs font-black hover:bg-surface-muted">→</button></>}<button type="button" aria-label="Remove image" onClick={() => onRemove(image.id)} className="rounded px-1.5 text-xs font-black text-danger hover:bg-red-50">×</button></div></div></div>) : <div className="grid min-h-36 place-items-center rounded-2xl border border-dashed border-border-muted text-sm font-semibold text-subtle">No {title.toLowerCase()}</div>}</div></div>;
  };
  return <Section title="Business images" description={`Add a logo, cover, and gallery photos. Maximum ${MAX_IMAGES} images, 5 MB each.`}><div className="grid gap-5 sm:grid-cols-2">{renderGroup("logo", "Logo", "grid-cols-1")}{renderGroup("cover", "Cover image", "grid-cols-1")}</div><div className="mt-5">{renderGroup("gallery", "Gallery", "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3")}</div>{errors.images && <p className="mt-3 text-sm font-bold text-danger">{errors.images}</p>}<div className="mt-5"><Button variant="outline" onClick={() => inputRef.current?.click()}>Add gallery images</Button><input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={(event) => { onAdd(event.target.files); event.target.value = ""; }} /></div></Section>;
}

export function BusinessHoursSummary({ value, error, update }: { value: ProviderBusinessProfileForm["businessHours"]; error?: string; update: (hours: ProviderBusinessProfileForm["businessHours"]) => void }) {
  return <Section title="Business hours" description="A summary of regular opening hours. Detailed availability is managed separately."><div className="space-y-2">{value.map((hours, index) => <div key={hours.day} className="grid gap-3 rounded-2xl bg-surface-muted p-3 sm:grid-cols-[120px_100px_1fr_1fr] sm:items-center"><span className="text-sm font-extrabold text-foreground">{hours.day}</span><button type="button" aria-pressed={hours.isOpen} onClick={() => update(value.map((item, itemIndex) => itemIndex === index ? { ...item, isOpen: !item.isOpen } : item))} className={cn("rounded-full px-3 py-1.5 text-xs font-extrabold", hours.isOpen ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700")}>{hours.isOpen ? "Open" : "Closed"}</button><Input aria-label={`${hours.day} opening time`} type="time" disabled={!hours.isOpen} value={hours.openingTime} onChange={(e) => update(value.map((item, itemIndex) => itemIndex === index ? { ...item, openingTime: e.target.value } : item))} /><Input aria-label={`${hours.day} closing time`} type="time" disabled={!hours.isOpen} value={hours.closingTime} onChange={(e) => update(value.map((item, itemIndex) => itemIndex === index ? { ...item, closingTime: e.target.value } : item))} /></div>)}</div>{error && <p className="mt-3 text-sm font-bold text-danger">{error}</p>}</Section>;
}

export function ProfileCompletionCard({ profile }: { profile: ProviderBusinessProfileForm }) {
  const checklist = completionChecklist(profile);
  const complete = checklist.filter((item) => item.complete).length;
  const percentage = Math.round((complete / checklist.length) * 100);
  return <aside className="rounded-3xl border border-border-subtle bg-surface p-5 shadow-sm xl:sticky xl:top-5"><div className="flex items-end justify-between"><div><p className="text-xs font-extrabold uppercase tracking-wide text-subtle">Profile completion</p><p className="mt-1 text-3xl font-black text-foreground">{percentage}%</p></div><span className="text-sm font-bold text-brand">{complete}/{checklist.length}</span></div><div className="mt-4 h-2.5 overflow-hidden rounded-full bg-surface-muted"><div className="h-full rounded-full bg-brand transition-all" style={{ width: `${percentage}%` }} /></div><ul className="mt-5 space-y-3">{checklist.map((item) => <li key={item.label} className="flex items-center gap-3 text-sm"><span className={cn("grid h-6 w-6 place-items-center rounded-full text-xs font-black", item.complete ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-subtle")}>{item.complete ? "✓" : "·"}</span><span className={cn("font-semibold", item.complete ? "text-foreground" : "text-muted")}>{item.label}</span></li>)}</ul></aside>;
}

export function PublicProfilePreview({ profile, onClose }: { profile: ProviderBusinessProfileForm | null; onClose: () => void }) {
  if (!profile) return null;
  const cover = profile.images.find((item) => item.kind === "cover");
  const logo = profile.images.find((item) => item.kind === "logo");
  return <div className="fixed inset-0 z-[60] flex justify-end bg-black/50 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><div role="dialog" aria-modal="true" aria-label="Public profile preview" className="h-full w-full max-w-2xl overflow-y-auto bg-background shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-subtle bg-surface/95 px-5 py-4 backdrop-blur"><div><p className="text-xs font-extrabold uppercase tracking-wide text-brand">Customer view</p><h2 className="font-extrabold text-foreground">Public profile preview</h2></div><Button variant="ghost" onClick={onClose}>Close</Button></div><div className="h-56 bg-gradient-to-br from-brand-soft to-emerald-200 bg-cover bg-center" style={cover ? { backgroundImage: `url(${cover.url})` } : undefined} /><div className="p-5 sm:p-8"><div className="-mt-20 flex items-end gap-4"><div className="h-28 w-28 rounded-3xl border-4 border-white bg-brand-soft bg-cover bg-center shadow-lg" style={logo ? { backgroundImage: `url(${logo.url})` } : undefined} /><div className="pb-2"><h1 className="text-2xl font-black text-foreground">{profile.businessName || "Unnamed business"}</h1><p className="mt-1 text-sm font-semibold text-muted">{profile.district}, {profile.province}</p></div></div><p className="mt-6 leading-7 text-muted">{profile.fullDescription || profile.shortDescription}</p><div className="mt-6 flex flex-wrap gap-2">{profile.supportedServices.map((item) => <span key={item} className="rounded-full bg-brand-soft px-3 py-1.5 text-sm font-bold text-brand">{item}</span>)}</div><div className="mt-8 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-surface p-4 shadow-sm"><p className="text-xs font-extrabold uppercase text-subtle">Contact</p><p className="mt-2 font-bold text-foreground">{profile.contactPhone}</p><p className="mt-1 text-sm text-muted">{profile.contactEmail}</p></div><div className="rounded-2xl bg-surface p-4 shadow-sm"><p className="text-xs font-extrabold uppercase text-subtle">Address</p><p className="mt-2 text-sm font-semibold leading-6 text-foreground">{profile.detailedAddress}, {profile.ward}, {profile.district}</p></div></div></div></div></div>;
}

type FormSectionProps = { value: ProviderBusinessProfileForm; errors: ProviderBusinessProfileErrors; update: <K extends keyof ProviderBusinessProfileForm>(key: K, value: ProviderBusinessProfileForm[K]) => void };

export function ProviderBusinessProfileMockWorkflow() {
  const [profile, setProfile] = useState<ProviderBusinessProfileForm | null>(null);
  const [savedProfile, setSavedProfile] = useState<ProviderBusinessProfileForm | null>(null);
  const [errors, setErrors] = useState<ProviderBusinessProfileErrors>({});
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const localUrls = useRef<string[]>([]);
  const { showToast } = useToast();
  const confirm = useConfirmDialog();

  useEffect(() => {
    let active = true;
    const createdObjectUrls = localUrls.current;
    getMockProviderBusinessProfile().then((result) => { if (active) { setProfile(result); setSavedProfile(result); } }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; createdObjectUrls.forEach(URL.revokeObjectURL); };
  }, []);

  const dirty = useMemo(() => profile && savedProfile ? JSON.stringify(profile) !== JSON.stringify(savedProfile) : false, [profile, savedProfile]);
  const update: FormSectionProps["update"] = (key, value) => { setProfile((current) => current ? { ...current, [key]: value } : current); setErrors((current) => ({ ...current, [key]: undefined })); };

  function validate(current: ProviderBusinessProfileForm) {
    const next: ProviderBusinessProfileErrors = {};
    if (!current.businessName.trim()) next.businessName = "Business name is required.";
    if (!/^\S+@\S+\.\S+$/.test(current.contactEmail)) next.contactEmail = "Enter a valid email address.";
    if (!/^[+\d][\d\s().-]{7,19}$/.test(current.contactPhone)) next.contactPhone = "Enter a valid phone number.";
    if (!current.detailedAddress.trim()) next.detailedAddress = "Detailed address is required.";
    if (current.businessHours.some((item) => item.isOpen && item.openingTime >= item.closingTime)) next.businessHours = "Opening time must be earlier than closing time for every open day.";
    if (current.images.length > MAX_IMAGES) next.images = `A maximum of ${MAX_IMAGES} images is allowed.`;
    setErrors(next); return Object.keys(next).length === 0;
  }

  function addImages(files: FileList | null) {
    if (!profile || !files?.length) return;
    const incoming = Array.from(files);
    if (profile.images.length + incoming.length > MAX_IMAGES) { setErrors((current) => ({ ...current, images: `You can add ${MAX_IMAGES - profile.images.length} more image(s).` })); return; }
    const oversized = incoming.find((file) => file.size > MAX_IMAGE_SIZE);
    if (oversized) { setErrors((current) => ({ ...current, images: `${oversized.name} exceeds the 5 MB limit.` })); return; }
    const images = incoming.map((file) => { const url = URL.createObjectURL(file); localUrls.current.push(url); return { id: `local-${crypto.randomUUID()}`, kind: "gallery" as const, name: file.name, url, isLocal: true }; });
    update("images", [...profile.images, ...images]); showToast(`${images.length} image(s) added locally.`, "success");
  }

  function removeImage(id: string) { if (!profile) return; const image = profile.images.find((item) => item.id === id); if (image?.isLocal) URL.revokeObjectURL(image.url); update("images", profile.images.filter((item) => item.id !== id)); }
  function moveImage(id: string, direction: -1 | 1) { if (!profile) return; const gallery = profile.images.filter((item) => item.kind === "gallery"); const index = gallery.findIndex((item) => item.id === id); const target = index + direction; if (index < 0 || target < 0 || target >= gallery.length) return; [gallery[index], gallery[target]] = [gallery[target], gallery[index]]; update("images", [...profile.images.filter((item) => item.kind !== "gallery"), ...gallery]); }

  async function save(mode: "draft" | "submit") {
    if (!profile) return;
    if (mode === "submit" && !validate(profile)) { showToast("Please correct the highlighted fields before submitting.", "error"); return; }
    if (mode === "submit") { const result = await confirm({ title: "Submit profile changes?", description: "This action only updates local React state for the current demo session.", confirmLabel: "Submit changes", tone: "success" }); if (!result.confirmed) return; }
    setSavedProfile(structuredClone(profile)); showToast(mode === "draft" ? "Draft saved for this demo session." : "Profile changes submitted in mock mode.", "success");
  }

  if (loading) return <div className="space-y-5 animate-pulse"><div className="h-32 rounded-3xl bg-surface-muted" /><div className="grid gap-5 xl:grid-cols-[1fr_300px]"><div className="space-y-5"><div className="h-96 rounded-3xl bg-surface-muted" /><div className="h-80 rounded-3xl bg-surface-muted" /></div><div className="h-80 rounded-3xl bg-surface-muted" /></div></div>;
  if (!profile) return <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-900"><h1 className="text-xl font-extrabold">Business profile unavailable</h1><p className="mt-2 text-sm">The local mock record could not be loaded.</p></div>;

  return <div className="space-y-5"><header className="flex flex-col justify-between gap-4 rounded-3xl border border-border-subtle bg-surface p-5 shadow-sm sm:p-6 lg:flex-row lg:items-center"><div><div className="flex items-center gap-3"><h1 className="text-2xl font-black text-foreground sm:text-3xl">Business Profile</h1>{dirty && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800">Unsaved changes</span>}</div><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Manage the business information customers see across PetLink. This screen runs entirely in mock mode.</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => void save("draft")}>Save Draft</Button><Button variant="outline" onClick={() => setPreviewOpen(true)}>Preview Public Profile</Button><Button onClick={() => void save("submit")}>Submit Changes</Button></div></header><div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]"><div className="space-y-5"><BusinessOverviewForm value={profile} errors={errors} update={update} /><BusinessContactForm value={profile} errors={errors} update={update} /><BusinessAddressForm value={profile} errors={errors} update={update} /><BusinessGallery value={profile.images} errors={errors} onAdd={addImages} onRemove={removeImage} onMove={moveImage} onPreview={() => setPreviewOpen(true)} /><Section title="Supported services" description="Select the service groups offered by this business."><div className="flex flex-wrap gap-2">{supportedServiceOptions.map((item) => <ToggleChip key={item} label={item} selected={profile.supportedServices.includes(item)} onClick={() => update("supportedServices", toggleItem(profile.supportedServices, item))} />)}</div></Section><BusinessHoursSummary value={profile.businessHours} error={errors.businessHours} update={(hours) => update("businessHours", hours)} /></div><ProfileCompletionCard profile={profile} /></div><PublicProfilePreview profile={previewOpen ? profile : null} onClose={() => setPreviewOpen(false)} /></div>;
}

function toggleItem(items: string[], item: string) { return items.includes(item) ? items.filter((current) => current !== item) : [...items, item]; }
function completionChecklist(profile: ProviderBusinessProfileForm) { return [
  { label: "Business information", complete: Boolean(profile.businessName && profile.shortDescription && profile.registrationNumber) },
  { label: "Contact information", complete: Boolean(profile.representativeName && profile.contactPhone && profile.contactEmail) },
  { label: "Address", complete: Boolean(profile.province && profile.district && profile.detailedAddress) },
  { label: "Facility images", complete: profile.images.some((item) => item.kind === "cover") && profile.images.some((item) => item.kind === "gallery") },
  { label: "Verification documents", complete: profile.verificationDocumentsComplete },
  { label: "Payout information", complete: profile.payoutInformationComplete },
]; }

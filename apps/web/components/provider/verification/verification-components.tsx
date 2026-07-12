"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { useConfirmDialog, useToast } from "@/components/ui/feedback-provider";
import { cn } from "@/lib/utils";
import { getMockProviderVerification } from "@/mocks/provider/provider-mock-service";
import { timelineForStatus, verificationStatusOptions } from "@/mocks/provider/provider-verification.mock";
import type {
  ProviderVerificationDocument,
  ProviderVerificationFeedback as Feedback,
  ProviderVerificationProfile,
  ProviderVerificationStatus,
  ProviderVerificationTimelineItem,
} from "@/types/provider";

const statusMeta: Record<ProviderVerificationStatus, { label: string; detail: string; badge: string }> = {
  not_submitted: { label: "Not submitted", detail: "Complete the required information and documents to start review.", badge: "bg-slate-100 text-slate-700" },
  pending: { label: "Pending review", detail: "Your application is with the PetLink compliance team.", badge: "bg-amber-100 text-amber-800" },
  requires_changes: { label: "Requires changes", detail: "Update the highlighted fields and documents, then resubmit.", badge: "bg-orange-100 text-orange-800" },
  approved: { label: "Approved", detail: "Your business has completed provider verification.", badge: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Rejected", detail: "Review the decision and prepare a corrected application.", badge: "bg-red-100 text-red-800" },
  suspended: { label: "Suspended", detail: "Verification is temporarily suspended. Contact support before operating.", badge: "bg-purple-100 text-purple-800" },
};

const steps = ["Business Information", "Business Documents", "Facility Information", "Review", "Approval"];

function formatDate(value?: string) {
  if (!value) return "Not submitted";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function activeStep(status: ProviderVerificationStatus) {
  if (status === "not_submitted") return 0;
  if (status === "pending") return 3;
  if (["requires_changes", "rejected"].includes(status)) return 2;
  return 4;
}

export function VerificationStatusCard({ profile }: { profile: ProviderVerificationProfile }) {
  const meta = statusMeta[profile.status];
  return (
    <section className="rounded-3xl border border-border-subtle bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Provider Verification</h1>
            <span className={cn("rounded-full px-3 py-1 text-xs font-extrabold", meta.badge)}>{meta.label}</span>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Confirm your business identity, credentials, and facility standards before serving PetLink customers.</p>
          <p className="mt-3 text-sm font-semibold text-foreground">{meta.detail}</p>
        </div>
        <dl className="grid shrink-0 grid-cols-2 gap-3 rounded-2xl bg-surface-muted p-4 text-sm md:min-w-80">
          <div><dt className="text-xs font-bold uppercase tracking-wide text-subtle">Application ID</dt><dd className="mt-1 font-extrabold text-foreground">{profile.applicationId}</dd></div>
          <div><dt className="text-xs font-bold uppercase tracking-wide text-subtle">Last submitted</dt><dd className="mt-1 font-semibold text-foreground">{formatDate(profile.lastSubmittedAt)}</dd></div>
        </dl>
      </div>
    </section>
  );
}

export function VerificationStepper({ status }: { status: ProviderVerificationStatus }) {
  const current = activeStep(status);
  return (
    <section aria-label="Verification progress" className="overflow-x-auto rounded-3xl border border-border-subtle bg-surface p-5 shadow-sm">
      <ol className="flex min-w-[720px] items-start">
        {steps.map((step, index) => {
          const complete = index < current || status === "approved";
          const selected = index === current && status !== "approved";
          return (
            <li key={step} className="relative flex flex-1 flex-col items-center px-2 text-center">
              {index > 0 && <span className={cn("absolute right-1/2 top-4 h-0.5 w-full", complete ? "bg-brand" : "bg-border-muted")} />}
              <span className={cn("relative z-10 grid h-8 w-8 place-items-center rounded-full border-2 text-xs font-extrabold", complete ? "border-brand bg-brand text-white" : selected ? "border-brand bg-surface text-brand" : "border-border-muted bg-surface text-subtle")}>{complete ? "✓" : index + 1}</span>
              <span className={cn("mt-2 text-xs font-bold", complete || selected ? "text-foreground" : "text-subtle")}>{step}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function StatusPill({ children, tone }: { children: React.ReactNode; tone: string }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize", tone)}>{children}</span>;
}

export function VerificationDocumentList({ documents, onPreview }: { documents: ProviderVerificationDocument[]; onPreview: (document: ProviderVerificationDocument) => void }) {
  if (!documents.length) {
    return <div className="rounded-2xl border border-dashed border-border-muted px-6 py-10 text-center"><div className="text-3xl">📄</div><h3 className="mt-3 font-bold text-foreground">No documents added</h3><p className="mt-1 text-sm text-muted">Choose files below before submitting your application.</p></div>;
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-border-subtle">
      <div className="hidden grid-cols-[1.5fr_1fr_.8fr_.8fr_auto] gap-4 bg-surface-muted px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-subtle lg:grid"><span>Document</span><span>Uploaded</span><span>OCR</span><span>Review</span><span>Action</span></div>
      <ul className="divide-y divide-border-subtle">
        {documents.map((document) => (
          <li key={document.id} className="grid gap-3 p-4 lg:grid-cols-[1.5fr_1fr_.8fr_.8fr_auto] lg:items-center lg:gap-4">
            <div className="min-w-0"><p className="truncate text-sm font-bold text-foreground">{document.filename}</p><p className="text-xs text-muted">{document.type}</p></div>
            <span className="text-xs font-medium text-muted">{formatDate(document.uploadedAt)}</span>
            <StatusPill tone={document.ocrStatus === "matched" ? "bg-emerald-100 text-emerald-800" : document.ocrStatus === "needs_review" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}>{document.ocrStatus.replaceAll("_", " ")}</StatusPill>
            <StatusPill tone={document.reviewStatus === "approved" ? "bg-emerald-100 text-emerald-800" : document.reviewStatus === "rejected" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}>{document.reviewStatus.replaceAll("_", " ")}</StatusPill>
            <Button variant="ghost" className="h-9 justify-self-start px-3 lg:justify-self-end" onClick={() => onPreview(document)}>Preview</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function VerificationFeedback({ feedback, status }: { feedback?: Feedback; status: ProviderVerificationStatus }) {
  if (!feedback || !["requires_changes", "rejected"].includes(status)) return null;
  return (
    <section className="rounded-3xl border border-orange-200 bg-orange-50 p-5 sm:p-6">
      <div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-orange-100 font-black text-orange-700">!</span><div><h2 className="text-lg font-extrabold text-orange-950">Review feedback</h2><p className="mt-1 text-sm leading-6 text-orange-900">{feedback.reason}</p></div></div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white/70 p-4"><h3 className="text-sm font-extrabold text-foreground">Fields to update</h3><ul className="mt-2 space-y-1 text-sm text-muted">{feedback.fields.map((item) => <li key={item}>• {item}</li>)}</ul></div>
        <div className="rounded-2xl bg-white/70 p-4"><h3 className="text-sm font-extrabold text-foreground">Documents to replace</h3><ul className="mt-2 space-y-1 text-sm text-muted">{feedback.documents.map((item) => <li key={item}>• {item}</li>)}</ul></div>
      </div>
      <div className="mt-4 rounded-2xl bg-white/70 p-4 text-sm"><span className="font-extrabold text-foreground">Admin note: </span><span className="text-muted">{feedback.adminNote}</span>{feedback.deadline && <p className="mt-2 font-bold text-orange-900">Requested by {formatDate(feedback.deadline)}</p>}</div>
    </section>
  );
}

export function VerificationTimeline({ items }: { items: ProviderVerificationTimelineItem[] }) {
  return (
    <div className="space-y-0">
      {items.map((item, index) => <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0">{index < items.length - 1 && <span className="absolute left-[15px] top-8 h-full w-0.5 bg-border-muted" />}<span className={cn("relative z-10 mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-xs font-black", item.state === "complete" ? "border-brand bg-brand text-white" : item.state === "current" ? "border-brand bg-surface text-brand" : "border-border-muted bg-surface text-subtle")}>{item.state === "complete" ? "✓" : index + 1}</span><div><h3 className="text-sm font-extrabold text-foreground">{item.title}</h3><p className="mt-0.5 text-sm text-muted">{item.description}</p>{item.occurredAt && <p className="mt-1 text-xs font-semibold text-subtle">{formatDate(item.occurredAt)}</p>}</div></div>)}
    </div>
  );
}

export function DocumentPreviewDialog({ document, onClose }: { document: ProviderVerificationDocument | null; onClose: () => void }) {
  if (!document) return null;
  return <div className="fixed inset-0 z-[55] grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div role="dialog" aria-modal="true" aria-label={`Preview ${document.filename}`} className="w-full max-w-2xl rounded-3xl bg-surface p-5 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-extrabold text-foreground">Document preview</h2><p className="mt-1 text-sm text-muted">{document.filename}</p></div><Button variant="ghost" className="h-9 px-3" onClick={onClose}>Close</Button></div><div className="mt-5 grid min-h-80 place-items-center rounded-2xl border border-dashed border-border-muted bg-surface-muted p-8 text-center"><div><div className="text-6xl">{document.previewKind === "image" ? "🖼️" : "📑"}</div><p className="mt-4 font-bold text-foreground">Local mock preview</p><p className="mt-1 text-sm text-muted">No file is downloaded or requested from a server.</p></div></div></div></div>;
}

function VerificationSkeleton() {
  return <div className="space-y-5 animate-pulse"><div className="h-44 rounded-3xl bg-surface-muted" /><div className="h-28 rounded-3xl bg-surface-muted" /><div className="grid gap-5 lg:grid-cols-3"><div className="h-72 rounded-3xl bg-surface-muted lg:col-span-2" /><div className="h-72 rounded-3xl bg-surface-muted" /></div></div>;
}

export function ProviderVerificationMockWorkflow() {
  const [profile, setProfile] = useState<ProviderVerificationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ProviderVerificationDocument | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [emptyDocuments, setEmptyDocuments] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const confirm = useConfirmDialog();
  const { showToast } = useToast();

  async function load(fail = false) {
    setLoading(true); setError(null);
    try { setProfile(await getMockProviderVerification({ fail })); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load verification."); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    let active = true;
    getMockProviderVerification()
      .then((result) => {
        if (active) setProfile(result);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load verification.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function changeStatus(status: string) {
    setProfile((current) => current ? { ...current, status: status as ProviderVerificationStatus, lastSubmittedAt: status === "not_submitted" ? undefined : current.lastSubmittedAt, timeline: timelineForStatus(status as ProviderVerificationStatus) } : current);
  }

  async function submit() {
    if (!profile) return;
    const availableDocuments = (emptyDocuments ? 0 : profile.documents.length) + selectedFiles.length;
    if (availableDocuments === 0) { showToast("Add at least one document before submitting.", "error"); return; }
    const result = await confirm({ title: profile.status === "not_submitted" ? "Submit verification application?" : "Resubmit verification application?", description: "This demo action only changes the current React state and does not contact PetLink servers.", confirmLabel: profile.status === "not_submitted" ? "Submit application" : "Resubmit", tone: "success" });
    if (!result.confirmed) return;
    setProfile({ ...profile, status: "pending", lastSubmittedAt: new Date().toISOString(), timeline: timelineForStatus("pending") });
    setSelectedFiles([]); setEmptyDocuments(false);
    showToast("Application moved to Pending review in this demo session.", "success");
  }

  if (loading) return <VerificationSkeleton />;
  if (error) return <section className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center"><div className="text-4xl">⚠️</div><h1 className="mt-3 text-xl font-extrabold text-red-950">Verification could not be loaded</h1><p className="mt-2 text-sm text-red-800">{error}</p><Button className="mt-5" onClick={() => void load()}>Try again</Button></section>;
  if (!profile) return null;

  const documents = emptyDocuments ? [] : profile.documents;
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-border-muted bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-wide text-subtle">Development demo</p><p className="text-sm font-bold text-foreground">Mock verification state</p></div><div className="flex flex-col gap-2 sm:flex-row"><CustomSelect className="w-full sm:w-52" value={profile.status} options={verificationStatusOptions} onValueChange={changeStatus} /><Button variant="outline" className="h-11 px-4" onClick={() => setEmptyDocuments((value) => !value)}>{emptyDocuments ? "Restore documents" : "Show empty list"}</Button><Button variant="outline" className="h-11 px-4" onClick={() => void load(true)}>Simulate error</Button></div></div>
      <VerificationStatusCard profile={profile} />
      <VerificationStepper status={profile.status} />
      <VerificationFeedback feedback={profile.feedback} status={profile.status} />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,.65fr)]">
        <div className="space-y-5">
          <section className="rounded-3xl border border-border-subtle bg-surface p-5 shadow-sm sm:p-6"><h2 className="text-lg font-extrabold text-foreground">Business information</h2><dl className="mt-5 grid gap-4 sm:grid-cols-2"><Info label="Business name" value={profile.business.businessName} /><Info label="Representative" value={profile.business.representativeName} /><Info label="Phone" value={profile.business.phone} /><Info label="Email" value={profile.business.email} /><Info label="Address" value={profile.business.address} wide /><Info label="Service categories" value={profile.business.serviceCategories.join(", ")} /><Info label="Operating model" value={profile.business.operatingModel} /></dl></section>
          <section className="rounded-3xl border border-border-subtle bg-surface p-5 shadow-sm sm:p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="text-lg font-extrabold text-foreground">Business documents</h2><p className="mt-1 text-sm text-muted">OCR and review states are simulated for demonstration.</p></div><Button variant="outline" onClick={() => fileInput.current?.click()}>Choose files</Button><input ref={fileInput} type="file" multiple className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(event) => { const files = Array.from(event.target.files ?? []); setSelectedFiles((current) => [...current, ...files]); event.target.value = ""; }} /></div>
            {selectedFiles.length > 0 && <div className="mt-4 space-y-2 rounded-2xl bg-brand-soft p-3"><p className="text-xs font-extrabold uppercase tracking-wide text-brand">Selected locally</p>{selectedFiles.map((file, index) => <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-xl bg-surface px-3 py-2"><span className="truncate text-sm font-semibold text-foreground">{file.name}</span><button className="text-xs font-extrabold text-danger hover:underline" onClick={() => setSelectedFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))}>Remove</button></div>)}</div>}
            <div className="mt-5"><VerificationDocumentList documents={documents} onPreview={setPreview} /></div>
            {(profile.status === "not_submitted" || profile.status === "requires_changes" || profile.status === "rejected") && <div className="mt-5 flex justify-end"><Button onClick={() => void submit()}>{profile.status === "not_submitted" ? "Submit application" : "Resubmit application"}</Button></div>}
          </section>
        </div>
        <section className="self-start rounded-3xl border border-border-subtle bg-surface p-5 shadow-sm sm:p-6"><h2 className="text-lg font-extrabold text-foreground">Review timeline</h2><p className="mt-1 text-sm text-muted">A session-only view of application activity.</p><div className="mt-6"><VerificationTimeline items={profile.timeline} /></div></section>
      </div>
      <DocumentPreviewDialog document={preview} onClose={() => setPreview(null)} />
    </div>
  );
}

function Info({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return <div className={cn("rounded-2xl bg-surface-muted p-4", wide && "sm:col-span-2")}><dt className="text-xs font-extrabold uppercase tracking-wide text-subtle">{label}</dt><dd className="mt-1.5 text-sm font-semibold leading-6 text-foreground">{value}</dd></div>;
}

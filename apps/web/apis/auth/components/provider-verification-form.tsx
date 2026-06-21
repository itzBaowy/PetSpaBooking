"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";
import { Button, CustomSelect, Input, Textarea } from "@/components/ui";

type FormData = {
  shopName: string;
  ownerName: string;
  businessEmail: string;
  businessPhone: string;
  serviceType: string;
  shopAddress: string;
  description: string;
  businessType: string;
  taxCode: string;
  registeredAddress: string;
  invoiceEmail: string;
  businessLicense: string;
  professionalCertificate: string;
};

const initialData: FormData = {
  shopName: "", ownerName: "", businessEmail: "", businessPhone: "", serviceType: "",
  shopAddress: "", description: "", businessType: "", taxCode: "", registeredAddress: "",
  invoiceEmail: "", businessLicense: "", professionalCertificate: "",
};

const steps = ["Thông tin cơ sở", "Thông tin pháp lý", "Hoàn tất"];
const serviceOptions = [
  { label: "Phòng khám thú y", value: "CLINIC" }, { label: "Spa thú cưng", value: "SPA" },
  { label: "Grooming", value: "GROOMING" }, { label: "Khách sạn thú cưng", value: "PET_HOTEL" },
];
const businessOptions = ["Hộ kinh doanh", "Công ty TNHH", "Công ty cổ phần", "Khác"];

export function ProviderVerificationForm() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState<FormData>(initialData);
  const [validationMessage, setValidationMessage] = useState("");

  function updateField(name: keyof FormData, value: string) {
    setData((current) => ({ ...current, [name]: value }));
  }

  function handleInput(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    updateField(event.target.name as keyof FormData, event.target.value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === 1 && !data.serviceType) {
      setValidationMessage("Vui lòng chọn loại hình dịch vụ.");
      return;
    }
    if (step === 2 && (!data.businessType || !data.businessLicense)) {
      setValidationMessage("Vui lòng chọn loại hình doanh nghiệp và tải giấy phép kinh doanh.");
      return;
    }
    setValidationMessage("");
    if (step < 3) {
      setStep((value) => value + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setSubmitted(true);
    }
  }

  if (submitted) return <SuccessState />;

  return (
    <form onSubmit={handleSubmit}>
      <Stepper step={step} />
      {step === 1 && <ShopInformation data={data} updateField={updateField} handleInput={handleInput} />}
      {step === 2 && <LegalInformation data={data} updateField={updateField} handleInput={handleInput} />}
      {step === 3 && <ReviewInformation data={data} />}
      {validationMessage && <p role="alert" className="mt-6 rounded-xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">{validationMessage}</p>}
      <div className="mt-12 flex items-center justify-between border-t border-border-subtle pt-6">
        {step > 1 ? <Button variant="outline" onClick={() => { setValidationMessage(""); setStep((value) => value - 1); }}>Quay lại</Button> : <span />}
        <Button type="submit">{step === 3 ? "Gửi hồ sơ xác minh" : "Bước tiếp theo"}<span aria-hidden>→</span></Button>
      </div>
    </form>
  );
}

function Stepper({ step }: { step: number }) {
  return <div className="mx-auto mb-12 grid max-w-3xl grid-cols-3">{steps.map((label, index) => {
    const number = index + 1; const active = number === step; const complete = number < step;
    return <div key={label} className="relative flex flex-col items-center text-center">
      {index > 0 && <span className={`absolute right-1/2 top-5 h-0.5 w-full ${number <= step ? "bg-brand" : "bg-border-subtle"}`} />}
      <span className={`relative z-10 grid h-10 w-10 place-items-center rounded-full border-2 text-sm font-bold ${active || complete ? "border-brand bg-brand text-white" : "border-surface-soft bg-surface-soft text-muted"}`}>{complete ? "✓" : number}</span>
      <span className={`mt-2 text-xs font-semibold sm:text-sm ${active ? "text-brand" : "text-muted"}`}>{label}</span>
    </div>;
  })}</div>;
}

type StepProps = { data: FormData; updateField: (name: keyof FormData, value: string) => void; handleInput: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void };

function ShopInformation({ data, updateField, handleInput }: StepProps) {
  return <section><Header title="Thông tin cơ sở" description="Giới thiệu cơ sở chăm sóc thú cưng để khách hàng hiểu hơn về bạn." />
    <div className="grid gap-5 md:grid-cols-2">
      <Field label="Tên cơ sở" required><Input required name="shopName" value={data.shopName} onChange={handleInput} placeholder="VD: Paws & Whiskers Spa" /></Field>
      <Field label="Tên người đại diện" required><Input required name="ownerName" value={data.ownerName} onChange={handleInput} placeholder="Họ và tên đầy đủ" /></Field>
      <Field label="Email doanh nghiệp" required><Input required type="email" name="businessEmail" value={data.businessEmail} onChange={handleInput} placeholder="business@example.com" /></Field>
      <Field label="Số điện thoại" required><Input required name="businessPhone" value={data.businessPhone} onChange={handleInput} placeholder="0901 234 567" /></Field>
      <Field label="Loại hình dịch vụ" required><CustomSelect options={serviceOptions} value={data.serviceType} placeholder="Chọn loại hình dịch vụ" onValueChange={(value) => updateField("serviceType", value)} /></Field>
      <Field label="Địa chỉ cơ sở" required><Input required name="shopAddress" value={data.shopAddress} onChange={handleInput} placeholder="Số nhà, đường, phường/xã, tỉnh/thành" /></Field>
      <Field label="Mô tả ngắn" className="md:col-span-2"><Textarea name="description" value={data.description} onChange={handleInput} placeholder="Mô tả cơ sở và các dịch vụ nổi bật..." /></Field>
    </div>
  </section>;
}

function LegalInformation({ data, updateField, handleInput }: StepProps) {
  return <section><Header title="Thông tin pháp lý" description="Cung cấp thông tin đăng ký kinh doanh để PetLink xác minh cơ sở của bạn." />
    <div className="grid gap-5 md:grid-cols-2">
      <Field label="Loại hình doanh nghiệp" required><CustomSelect options={businessOptions} value={data.businessType} placeholder="Chọn loại hình doanh nghiệp" onValueChange={(value) => updateField("businessType", value)} /></Field>
      <Field label="Mã số thuế" required><Input required name="taxCode" value={data.taxCode} onChange={handleInput} placeholder="Nhập mã số thuế" /></Field>
      <Field label="Địa chỉ đăng ký kinh doanh" required className="md:col-span-2"><Input required name="registeredAddress" value={data.registeredAddress} onChange={handleInput} placeholder="Địa chỉ trên giấy phép kinh doanh" /></Field>
      <Field label="Email nhận hóa đơn" required><Input required type="email" name="invoiceEmail" value={data.invoiceEmail} onChange={handleInput} placeholder="billing@example.com" /></Field>
      <Field label="Giấy phép kinh doanh" required><UploadBox text="Tải lên PDF, JPG hoặc PNG" fileName={data.businessLicense} onChange={(value) => updateField("businessLicense", value)} /></Field>
      <Field label="Chứng chỉ chuyên môn (nếu có)" className="md:col-span-2"><UploadBox text="Chứng chỉ thú y hoặc chứng nhận chuyên ngành" fileName={data.professionalCertificate} onChange={(value) => updateField("professionalCertificate", value)} /></Field>
    </div>
    <div className="mt-6 rounded-xl border border-info/20 bg-info-soft p-4 text-sm leading-6 text-muted"><strong className="text-foreground">Dữ liệu được bảo mật.</strong> Tài liệu chỉ được dùng để xác minh nhà cung cấp.</div>
  </section>;
}

function ReviewInformation({ data }: { data: FormData }) {
  const serviceLabel = serviceOptions.find((item) => item.value === data.serviceType)?.label;
  return <section><Header title="Kiểm tra và hoàn tất" description="Xem lại thông tin trước khi gửi hồ sơ xác minh nhà cung cấp." />
    <div className="space-y-6">
      <ReviewCard title="Thông tin cơ sở" items={[["Tên cơ sở", data.shopName], ["Người đại diện", data.ownerName], ["Email doanh nghiệp", data.businessEmail], ["Số điện thoại", data.businessPhone], ["Loại hình dịch vụ", serviceLabel], ["Địa chỉ cơ sở", data.shopAddress]]} />
      <ReviewCard title="Thông tin pháp lý" items={[["Loại hình doanh nghiệp", data.businessType], ["Mã số thuế", data.taxCode], ["Địa chỉ đăng ký", data.registeredAddress], ["Email nhận hóa đơn", data.invoiceEmail], ["Giấy phép kinh doanh", data.businessLicense], ["Chứng chỉ chuyên môn", data.professionalCertificate]]} />
      <label className="flex items-start gap-3 text-sm leading-6"><input required type="checkbox" className="mt-1 h-4 w-4 accent-brand" />Tôi xác nhận các thông tin đã cung cấp là chính xác.</label>
      <label className="flex items-start gap-3 text-sm leading-6"><input required type="checkbox" className="mt-1 h-4 w-4 accent-brand" />Tôi đồng ý với điều khoản dành cho nhà cung cấp và chính sách bảo mật.</label>
    </div>
  </section>;
}

function Field({ label, required, className, children }: { label: string; required?: boolean; className?: string; children: React.ReactNode }) {
  return <label className={`block space-y-1.5 text-sm font-semibold text-foreground ${className ?? ""}`}><span>{label} {required && <span className="text-danger">*</span>}</span>{children}</label>;
}
function Header({ title, description }: { title: string; description: string }) { return <div className="mb-8 text-center"><h1 className="text-2xl font-bold sm:text-3xl">{title}</h1><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">{description}</p></div>; }
function UploadBox({ text, fileName, onChange }: { text: string; fileName: string; onChange: (value: string) => void }) { return <span className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border-muted bg-surface-muted px-4 text-center text-sm font-medium text-muted hover:border-brand hover:bg-brand-soft"><input type="file" className="sr-only" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => onChange(event.target.files?.[0]?.name ?? "")} /><span className="text-xl text-brand">↑</span>{fileName || text}</span>; }
function ReviewCard({ title, items }: { title: string; items: Array<[string, string | undefined]> }) { return <div><h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-brand">{title}</h3><div className="grid gap-x-8 gap-y-4 rounded-2xl bg-surface-muted p-5 sm:grid-cols-2">{items.map(([label, value]) => <div key={label}><p className="text-xs text-muted">{label}</p><p className="mt-1 text-sm font-semibold">{value || "Chưa cung cấp"}</p></div>)}</div></div>; }
function SuccessState() { return <div className="flex min-h-[560px] flex-col items-center justify-center px-6 text-center"><div className="grid h-20 w-20 place-items-center rounded-full bg-success-soft text-4xl text-success">✓</div><h2 className="mt-6 text-3xl font-bold">Đã gửi hồ sơ xác minh</h2><p className="mt-3 max-w-lg leading-7 text-muted">PetLink sẽ kiểm tra hồ sơ và thông báo kết quả đến email của bạn.</p><Link href="/provider" className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-brand px-8 font-bold text-white hover:bg-brand-hover">Về trang nhà cung cấp</Link></div>; }

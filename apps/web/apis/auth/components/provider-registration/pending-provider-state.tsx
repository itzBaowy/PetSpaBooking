import { Button } from "@/components/ui";
import {
  providerDocumentTypeLabels,
  providerStatusLabels,
} from "@/apis/provider/verification/schema";
import type {
  ProviderDocument,
  ProviderInfo,
} from "@/apis/provider/verification/schema";
import { ProviderRegistrationInfoCard } from "./info-card";

export function PendingProviderState({
  provider,
  documents,
  isLoadingDocuments,
  onLogout,
}: {
  provider?: ProviderInfo;
  documents: ProviderDocument[];
  isLoadingDocuments: boolean;
  onLogout: () => void;
}) {
  return (
    <div className="flex min-h-[560px] flex-col items-center justify-center space-y-6 text-center">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-warning-soft text-4xl text-warning">
        ⏳
      </div>
      <div>
        <h1 className="text-3xl font-bold">
          Đăng ký thành công, hồ sơ đang chờ duyệt
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted">
          Tài khoản của bạn đang ở trạng thái chờ duyệt. Bạn chỉ có thể xem hồ
          sơ đã gửi; sau khi quản trị viên duyệt, tài khoản sẽ tự động trở
          thành nhà cung cấp.
        </p>
      </div>

      <div className="w-full max-w-3xl rounded-2xl border border-border-subtle bg-surface-muted p-5 text-left">
        <div className="grid gap-4 md:grid-cols-3">
          <ProviderRegistrationInfoCard
            label="Mã hồ sơ"
            value={provider?.id ?? "Đang cập nhật"}
          />
          <ProviderRegistrationInfoCard
            label="Trạng thái"
            value={
              provider
                ? providerStatusLabels[provider.providerStatus] ??
                  provider.providerStatus
                : "PENDING_VERIFICATION"
            }
          />
          <ProviderRegistrationInfoCard
            label="Tên doanh nghiệp"
            value={provider?.businessName ?? "Đang cập nhật"}
          />
        </div>
        {provider?.adminNote && (
          <p className="mt-5 rounded-xl bg-warning-soft p-4 text-sm font-semibold text-warning">
            Ghi chú quản trị: {provider.adminNote}
          </p>
        )}
      </div>

      <div className="w-full max-w-3xl rounded-2xl border border-border-subtle bg-surface p-5 text-left">
        <h3 className="text-lg font-bold">Tài liệu đã gửi</h3>
        {isLoadingDocuments ? (
          <p className="mt-3 text-sm text-muted">Đang tải tài liệu...</p>
        ) : documents.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {documents.map((document) => (
              <div
                key={document.id}
                className="rounded-xl border border-border-subtle bg-surface-muted p-4"
              >
                <p className="text-sm font-bold">
                  {providerDocumentTypeLabels[document.documentType] ??
                    document.documentType}
                </p>
                <p className="mt-1 break-all text-xs text-muted">
                  {document.imageUrl}
                </p>
                <p className="mt-3 text-xs font-semibold text-brand">
                  Trạng thái: {document.status}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">Chưa có tài liệu nào.</p>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onLogout}
        className="h-12"
      >
        Đăng xuất
      </Button>
    </div>
  );
}

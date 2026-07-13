"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/feedback-provider";
import {
  providerErrorText,
  providerMoney,
} from "@/apis/provider/_shared/provider-ui";
import { useCreateProviderDepositPayment } from "../queries";

const DEFAULT_DEPOSIT_AMOUNT = 300000;

export function ProviderDepositDialog({
  depositBalance,
  depositStatus,
  onClose,
}: {
  depositBalance?: number;
  depositStatus?: string;
  onClose: () => void;
}) {
  const createPayment = useCreateProviderDepositPayment();
  const { showToast } = useToast();
  const [amount, setAmount] = useState(DEFAULT_DEPOSIT_AMOUNT);
  const invalid = !Number.isFinite(amount) || amount < DEFAULT_DEPOSIT_AMOUNT;

  return (
    <Dialog title="Nạp ký quỹ provider" onClose={onClose}>
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border-subtle bg-surface-muted p-4">
            <p className="text-sm text-muted">Số dư ký quỹ hiện tại</p>
            <p className="mt-1 text-2xl font-black">
              {depositBalance === undefined
                ? "Đang tải..."
                : providerMoney.format(depositBalance)}
            </p>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-surface-muted p-4">
            <p className="text-sm text-muted">Trạng thái</p>
            <p className="mt-1 text-2xl font-black">
              {depositStatus ?? "UNKNOWN"}
            </p>
          </div>
        </div>

        <label className="block text-sm font-bold">
          Số tiền nạp
          <Input
            className="mt-2"
            min={DEFAULT_DEPOSIT_AMOUNT}
            step={10000}
            type="number"
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
          />
        </label>

        {invalid ? (
          <p className="text-sm font-bold text-red-700">
            Số tiền nạp tối thiểu là {providerMoney.format(DEFAULT_DEPOSIT_AMOUNT)}.
          </p>
        ) : null}

        <p className="text-sm text-muted">
          Sau khi tạo thanh toán, hệ thống sẽ mở trang MoMo sandbox. Khi MoMo xác
          nhận thanh toán thành công, ký quỹ sẽ được cộng tự động.
        </p>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            disabled={invalid || createPayment.isLoading}
            onClick={() =>
              createPayment.mutate(
                { amount },
                {
                  onSuccess: (payment) => {
                    showToast("Đã tạo thanh toán ký quỹ MoMo.", "success");
                    if (payment.payUrl) {
                      window.open(payment.payUrl, "_blank", "noopener,noreferrer");
                    }
                    onClose();
                  },
                  onError: (error) =>
                    showToast(providerErrorText(error), "error"),
                },
              )
            }
          >
            {createPayment.isLoading ? "Đang tạo..." : "Tạo thanh toán MoMo"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

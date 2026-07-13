"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/feedback-provider";
import {
  providerErrorText,
  providerMoney,
} from "@/apis/provider/_shared/provider-ui";
import { useCreateProviderWithdrawal } from "../queries";

export function ProviderWithdrawalDialog({
  walletBalance,
  onClose,
}: {
  walletBalance?: number;
  onClose: () => void;
}) {
  const create = useCreateProviderWithdrawal();
  const { showToast } = useToast();
  const [amount, setAmount] = useState(100000);
  const [reason, setReason] = useState("");
  const balance = walletBalance ?? 0;
  const invalid = walletBalance === undefined || amount < 100000 || amount > balance;

  return (
    <Dialog title="Tạo yêu cầu rút tiền" onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-2xl border border-border-subtle bg-surface-muted p-4">
          <p className="text-sm text-muted">Số dư ví</p>
          <p className="mt-1 text-2xl font-black">
            {walletBalance === undefined ? "Đang tải..." : providerMoney.format(balance)}
          </p>
        </div>
        <label className="block text-sm font-bold">
          Số tiền
          <Input
            className="mt-2"
            type="number"
            min={100000}
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
          />
        </label>
        {invalid ? (
          <p className="text-sm font-bold text-red-700">
            Tối thiểu 100.000 VND và không vượt quá số dư ví.
          </p>
        ) : null}
        <label className="block text-sm font-bold">
          Ghi chú
          <Input
            className="mt-2"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Không bắt buộc"
          />
        </label>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            disabled={invalid || create.isLoading}
            onClick={() =>
              create.mutate(
                { amount, reason: reason.trim() || undefined },
                {
                  onSuccess: () => {
                    showToast("Đã tạo yêu cầu rút tiền.", "success");
                    onClose();
                  },
                  onError: (error) => showToast(providerErrorText(error), "error"),
                },
              )
            }
          >
            {create.isLoading ? "Đang gửi..." : "Gửi yêu cầu"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

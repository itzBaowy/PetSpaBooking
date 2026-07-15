"use client";

import type { InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";

type MoneyInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type" | "inputMode"
> & {
  value: number;
  onValueChange: (value: number) => void;
  allowNegative?: boolean;
};

const moneyInputFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
  useGrouping: true,
});

export function formatMoneyInput(value: number) {
  return Number.isFinite(value) ? moneyInputFormatter.format(value) : "";
}

export function MoneyInput({
  value,
  onValueChange,
  allowNegative = false,
  ...props
}: MoneyInputProps) {
  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      value={formatMoneyInput(value)}
      onChange={(event) => {
        const isNegative = allowNegative && event.target.value.trimStart().startsWith("-");
        const digits = event.target.value.replace(/\D/g, "");
        const parsedValue = digits ? Number(digits) : 0;
        onValueChange(isNegative ? -parsedValue : parsedValue);
      }}
    />
  );
}

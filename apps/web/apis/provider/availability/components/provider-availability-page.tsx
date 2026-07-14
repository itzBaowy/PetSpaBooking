"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/feedback-provider";
import type { WorkingHourApi } from "@/types/provider-api";
import {
  ProviderEmpty,
  ProviderError,
  ProviderLoading,
  ProviderPageHeader,
  providerDate,
  providerErrorText,
  sortByDateDesc,
} from "@/apis/provider/_shared/provider-ui";
import {
  useCreateProviderAvailabilityBlock,
  useDeleteProviderAvailabilityBlock,
  useProviderAvailabilityBlocks,
  useProviderWorkingHours,
  useSaveProviderWorkingHours,
} from "../queries";

const dayLabels = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
const defaultHours = Array.from({ length: 7 }, (_, dayOfWeek) => ({
  dayOfWeek,
  openTime: "08:00",
  closeTime: "18:00",
  isClosed: dayOfWeek === 0,
}));

export function ProviderAvailabilityPage() {
  const hoursQuery = useProviderWorkingHours();
  const blocksQuery = useProviderAvailabilityBlocks();
  const saveHours = useSaveProviderWorkingHours();
  const deleteBlock = useDeleteProviderAvailabilityBlock();
  const { showToast } = useToast();
  const [draft, setDraft] = useState<WorkingHourApi[] | null>(null);
  const [blockOpen, setBlockOpen] = useState(false);

  if (hoursQuery.isLoading || blocksQuery.isLoading) return <ProviderLoading />;
  if (hoursQuery.isError || blocksQuery.isError) {
    return (
      <ProviderError
        error={hoursQuery.error ?? blocksQuery.error}
        retry={() => {
          void hoursQuery.refetch();
          void blocksQuery.refetch();
        }}
      />
    );
  }

  const hours = draft ?? (hoursQuery.data?.length ? hoursQuery.data : defaultHours);
  const invalid = hours.some((item) => !item.isClosed && item.openTime >= item.closeTime);
  const update = (day: number, patch: Partial<WorkingHourApi>) =>
    setDraft(hours.map((item) => (item.dayOfWeek === day ? { ...item, ...patch } : item)));

  return (
    <div className="space-y-5">
      <ProviderPageHeader
        title="Lịch làm việc"
        description="Cấu hình giờ làm việc và các khoảng thời gian bị khóa bằng API provider."
        action={<Button onClick={() => setBlockOpen(true)}>Tạo khoảng khóa</Button>}
      />

      <section className="grid gap-3">
        {hours.map((item) => (
          <div
            className="grid gap-3 rounded-2xl border border-border-subtle bg-surface p-4 shadow-sm sm:grid-cols-[130px_110px_1fr_1fr] sm:items-center"
            key={item.dayOfWeek}
          >
            <strong>{dayLabels[item.dayOfWeek]}</strong>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={!item.isClosed}
                onChange={(event) => update(item.dayOfWeek, { isClosed: !event.target.checked })}
              />
              Mở cửa
            </label>
            <Input
              type="time"
              disabled={item.isClosed}
              value={item.openTime}
              onChange={(event) => update(item.dayOfWeek, { openTime: event.target.value })}
            />
            <Input
              type="time"
              disabled={item.isClosed}
              value={item.closeTime}
              onChange={(event) => update(item.dayOfWeek, { closeTime: event.target.value })}
            />
          </div>
        ))}
      </section>
      {invalid ? <p className="text-sm font-bold text-red-700">Giờ mở cửa phải trước giờ đóng cửa.</p> : null}
      <Button
        disabled={invalid || saveHours.isLoading}
        onClick={() =>
          saveHours.mutate(
            hours.map(({ dayOfWeek, openTime, closeTime, isClosed }) => ({
              dayOfWeek,
              openTime,
              closeTime,
              isClosed,
            })),
            {
              onSuccess: (data) => {
                setDraft(data);
                showToast("Đã lưu lịch làm việc.", "success");
              },
              onError: (error) => showToast(providerErrorText(error), "error"),
            },
          )
        }
      >
        {saveHours.isLoading ? "Đang lưu..." : "Lưu lịch"}
      </Button>

      <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-extrabold">Khoảng thời gian đã khóa</h2>
        {blocksQuery.data?.length ? (
          <div className="mt-4 grid gap-2">
            {sortByDateDesc(blocksQuery.data, (block) => block.startAt).map((block) => (
              <div className="flex flex-col justify-between gap-3 rounded-xl bg-surface-muted p-4 sm:flex-row sm:items-center" key={block.id}>
                <div>
                  <strong>
                    {providerDate(block.startAt)} - {providerDate(block.endAt)}
                  </strong>
                  <p className="mt-1 text-sm text-muted">{block.reason ?? "Không có lý do"}</p>
                </div>
                <Button
                  variant="outline"
                  disabled={deleteBlock.isLoading}
                  onClick={() =>
                    deleteBlock.mutate(block.id, {
                      onSuccess: () => showToast("Đã xóa khoảng khóa.", "success"),
                      onError: (error) => showToast(providerErrorText(error), "error"),
                    })
                  }
                >
                  Xóa
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <ProviderEmpty text="Chưa có khoảng thời gian bị khóa." />
        )}
      </section>

      {blockOpen ? <CreateBlockDialog onClose={() => setBlockOpen(false)} /> : null}
    </div>
  );
}

function CreateBlockDialog({ onClose }: { onClose: () => void }) {
  const create = useCreateProviderAvailabilityBlock();
  const { showToast } = useToast();
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [reason, setReason] = useState("");
  const invalid = !startAt || !endAt || startAt >= endAt;

  return (
    <Dialog title="Tạo khoảng thời gian khóa" onClose={onClose}>
      <div className="space-y-4">
        <label className="block text-sm font-bold">
          Bắt đầu
          <Input className="mt-2" type="datetime-local" value={startAt} onChange={(event) => setStartAt(event.target.value)} />
        </label>
        <label className="block text-sm font-bold">
          Kết thúc
          <Input className="mt-2" type="datetime-local" value={endAt} onChange={(event) => setEndAt(event.target.value)} />
        </label>
        <label className="block text-sm font-bold">
          Lý do
          <Input className="mt-2" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Không bắt buộc" />
        </label>
        {invalid ? <p className="text-sm font-bold text-red-700">Thời gian bắt đầu phải trước thời gian kết thúc.</p> : null}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            disabled={invalid || create.isLoading}
            onClick={() =>
              create.mutate(
                { startAt: new Date(startAt).toISOString(), endAt: new Date(endAt).toISOString(), reason: reason.trim() || undefined },
                {
                  onSuccess: () => {
                    showToast("Đã tạo khoảng khóa.", "success");
                    onClose();
                  },
                  onError: (error) => showToast(providerErrorText(error), "error"),
                },
              )
            }
          >
            {create.isLoading ? "Đang tạo..." : "Tạo khoảng khóa"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

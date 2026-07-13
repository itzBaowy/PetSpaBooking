"use client";

import jsQR from "jsqr";
import { useEffect, useRef, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProviderBookingApi } from "@/types/provider-api";
import { providerDate } from "@/apis/provider/_shared/provider-ui";

type ScannerState = "starting" | "scanning" | "detected" | "unsupported" | "denied" | "error";

export function ProviderQrDialog({
  booking,
  title,
  submitLabel,
  pending,
  onClose,
  onSubmit,
}: {
  booking: ProviderBookingApi;
  title: string;
  submitLabel: string;
  pending: boolean;
  onClose: () => void;
  onSubmit: (qrToken: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const submittedRef = useRef(false);
  const onSubmitRef = useRef(onSubmit);
  const pendingRef = useRef(pending);
  const [qrToken, setQrToken] = useState("");
  const [scannerState, setScannerState] = useState<ScannerState>("starting");

  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  useEffect(() => {
    let disposed = false;

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setScannerState("unsupported");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (disposed) {
          stopStream(stream);
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;
        video.setAttribute("playsinline", "true");
        await video.play();
        setScannerState("scanning");
        scanFrame();
      } catch (error) {
        const name = error instanceof DOMException ? error.name : "";
        setScannerState(name === "NotAllowedError" || name === "PermissionDeniedError" ? "denied" : "error");
      }
    }

    function scanFrame() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d", { willReadFrequently: true });

      if (!video || !canvas || !context || submittedRef.current) {
        frameRef.current = window.requestAnimationFrame(scanFrame);
        return;
      }

      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const image = context.getImageData(0, 0, canvas.width, canvas.height);
        const result = jsQR(image.data, image.width, image.height, {
          inversionAttempts: "dontInvert",
        });

        if (result?.data) {
          submitDetectedToken(result.data.trim());
          return;
        }
      }

      frameRef.current = window.requestAnimationFrame(scanFrame);
    }

    void startCamera();

    return () => {
      disposed = true;
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      stopStream(streamRef.current);
      streamRef.current = null;
    };
  }, []);

  function submitDetectedToken(token: string) {
    if (!token || submittedRef.current || pendingRef.current) return;
    submittedRef.current = true;
    setQrToken(token);
    setScannerState("detected");
    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    stopStream(streamRef.current);
    streamRef.current = null;
    onSubmitRef.current(token);
  }

  const invalid = !qrToken.trim();

  return (
    <Dialog title={title} onClose={onClose}>
      <div className="space-y-5">
        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-slate-950">
          <div className="relative mx-auto aspect-[4/3] max-h-[520px]">
            <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
            <canvas ref={canvasRef} className="hidden" />
            <div className="pointer-events-none absolute inset-[12%] rounded-2xl border-2 border-white/40">
              <span className="absolute -left-1 -top-1 h-12 w-12 rounded-tl-2xl border-l-4 border-t-4 border-emerald-400" />
              <span className="absolute -right-1 -top-1 h-12 w-12 rounded-tr-2xl border-r-4 border-t-4 border-emerald-400" />
              <span className="absolute -bottom-1 -left-1 h-12 w-12 rounded-bl-2xl border-b-4 border-l-4 border-emerald-400" />
              <span className="absolute -bottom-1 -right-1 h-12 w-12 rounded-br-2xl border-b-4 border-r-4 border-emerald-400" />
              {scannerState === "scanning" ? (
                <span className="absolute inset-x-4 top-1/2 h-0.5 animate-pulse bg-emerald-400 shadow-[0_0_14px_#34d399]" />
              ) : null}
            </div>
            <div className="absolute inset-x-4 bottom-4 rounded-xl bg-black/60 px-4 py-3 text-center text-sm font-semibold text-white backdrop-blur">
              {scannerMessage[scannerState]}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface p-4">
          <p className="text-sm font-bold">#{booking.id.slice(-8)}</p>
          <p className="mt-1 text-xs text-muted">
            {booking.customer?.users?.fullName ?? "Khách hàng"} · {booking.pet?.name ?? "Thú cưng"}
          </p>
          <p className="mt-1 text-xs text-muted">
            {booking.service?.name ?? "Dịch vụ"} · {providerDate(booking.appointmentStart)}
          </p>
        </div>

        <label className="block text-sm font-bold">
          QR token
          <Input
            className="mt-2"
            value={qrToken}
            onChange={(event) => {
              submittedRef.current = false;
              setQrToken(event.target.value);
            }}
            placeholder="Token sẽ tự điền khi quét được QR"
          />
        </label>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button disabled={invalid || pending} onClick={() => submitDetectedToken(qrToken.trim())}>
            {pending ? "Đang gửi..." : submitLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

const scannerMessage: Record<ScannerState, string> = {
  starting: "Đang mở camera...",
  scanning: "Đưa mã QR của khách vào khung để hệ thống tự quét.",
  detected: "Đã nhận QR, đang gửi xác thực...",
  unsupported: "Trình duyệt không hỗ trợ camera. Bạn có thể dán token thủ công.",
  denied: "Bạn chưa cấp quyền camera. Hãy cấp quyền hoặc dán token thủ công.",
  error: "Không mở được camera. Hãy kiểm tra thiết bị hoặc dán token thủ công.",
};

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

import cron, { ScheduledTask } from "node-cron";
import { momoPaymentService } from "../services/mobile-services/momo-payment.service.ts";

const DEFAULT_CRON_SECONDS = 30;
const DEFAULT_BATCH_SIZE = 20;

function getPositiveIntegerEnv(name: string, defaultValue: number): number {
  const rawValue = process.env[name];
  if (!rawValue) return defaultValue;

  const trimmedValue = rawValue.trim();
  if (!/^\d+$/.test(trimmedValue)) {
    console.warn(
      `[momo-payment-sync] Invalid ${name}="${rawValue}". Falling back to ${defaultValue}.`,
    );
    return defaultValue;
  }

  return Math.max(Number.parseInt(trimmedValue, 10), 1);
}

export function getMomoPaymentSyncCronExpression(): string {
  const seconds = getPositiveIntegerEnv(
    "MOMO_PAYMENT_SYNC_CRON_SECONDS",
    DEFAULT_CRON_SECONDS,
  );

  if (seconds < 60) {
    return `*/${seconds} * * * * *`;
  }

  if (seconds % 60 === 0) {
    const minutes = seconds / 60;
    return `0 */${minutes} * * * *`;
  }

  console.warn(
    `[momo-payment-sync] Cron cannot represent every ${seconds} seconds reliably. Falling back to every ${DEFAULT_CRON_SECONDS} seconds.`,
  );
  return `*/${DEFAULT_CRON_SECONDS} * * * * *`;
}

export function getMomoPaymentSyncBatchSize(): number {
  return getPositiveIntegerEnv(
    "MOMO_PAYMENT_SYNC_BATCH_SIZE",
    DEFAULT_BATCH_SIZE,
  );
}

export async function syncPendingMomoPayments() {
  const result = await momoPaymentService.syncPendingMomoPayments(
    getMomoPaymentSyncBatchSize(),
  );

  if (result.scanned > 0) {
    console.log(
      `[momo-payment-sync] scanned=${result.scanned}, synced=${result.synced}, failed=${result.failed}`,
    );
  }

  return result;
}

export function startMomoPaymentSyncJob(): ScheduledTask {
  const cronExpression = getMomoPaymentSyncCronExpression();
  let isRunning = false;

  console.log(
    `[momo-payment-sync] Started. cron="${cronExpression}", batchSize=${getMomoPaymentSyncBatchSize()}`,
  );

  return cron.schedule(cronExpression, () => {
    if (isRunning) {
      console.warn("[momo-payment-sync] Previous run is still running. Skipped.");
      return;
    }

    isRunning = true;
    void syncPendingMomoPayments()
      .catch((error: unknown) => {
        console.error("[momo-payment-sync] Run failed:", error);
      })
      .finally(() => {
        isRunning = false;
      });
  });
}

import { Request } from "express";
import prisma from "../../connect.prisma.ts";
import {
  BadRequestException,
  UnauthorizedException,
} from "../common/helpers/exception.helper.ts";
import { adminAuditLogService } from "./admin-audit-log.service.ts";

function getEnvNumber(name: string, fallback: number, min: number, max?: number) {
  const value = Number(process.env[name]);
  if (!Number.isFinite(value) || value < min || (max !== undefined && value > max)) {
    return fallback;
  }

  return value;
}

const SETTING_DEFINITIONS = {
  minProviderDeposit: {
    key: "MIN_PROVIDER_DEPOSIT",
    defaultValue: getEnvNumber("MIN_PROVIDER_DEPOSIT", 300_000, 0),
    min: 0,
    description: "Minimum active provider deposit balance in VND.",
  },
  platformCommissionRate: {
    key: "PLATFORM_COMMISSION_RATE",
    defaultValue: getEnvNumber("PLATFORM_COMMISSION_RATE", 0.15, 0, 1),
    min: 0,
    max: 1,
    description: "Platform commission rate from completed bookings.",
  },
  bookingAutoCompleteHours: {
    key: "BOOKING_AUTO_COMPLETE_HOURS",
    defaultValue: getEnvNumber("BOOKING_AUTO_COMPLETE_HOURS", 10, 1),
    min: 1,
    description: "Hold period in hours before CHECKED_OUT bookings auto-complete.",
  },
  bookingNoArrivalGraceMinutes: {
    key: "BOOKING_NO_ARRIVAL_GRACE_MINUTES",
    defaultValue: getEnvNumber("BOOKING_NO_ARRIVAL_GRACE_MINUTES", 15, 0),
    min: 0,
    description: "Minutes after appointmentStart before provider can mark NO_ARRIVAL.",
  },
  minWithdrawalAmount: {
    key: "MIN_WITHDRAWAL_AMOUNT",
    defaultValue: getEnvNumber("MIN_WITHDRAWAL_AMOUNT", 100_000, 0),
    min: 0,
    description: "Minimum provider withdrawal amount in VND.",
  },
} as const;

type PublicSettingKey = keyof typeof SETTING_DEFINITIONS;
type SettingDefinition = (typeof SETTING_DEFINITIONS)[PublicSettingKey];

function getRequesterId(req: Request): string {
  const userId = (req as Request & { user?: { userId?: string } }).user
    ?.userId;
  if (!userId) throw new UnauthorizedException("Unauthorized");
  return userId;
}

function validateSettingValue(
  publicKey: PublicSettingKey,
  value: unknown,
): number {
  const definition = SETTING_DEFINITIONS[publicKey];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new BadRequestException(`${publicKey} must be a valid number`);
  }

  if (value < definition.min) {
    throw new BadRequestException(
      `${publicKey} must be greater than or equal to ${definition.min}`,
    );
  }

  if ("max" in definition && value > definition.max) {
    throw new BadRequestException(
      `${publicKey} must be less than or equal to ${definition.max}`,
    );
  }

  return value;
}

function findDefinitionByStoredKey(storedKey: string) {
  return Object.entries(SETTING_DEFINITIONS).find(
    ([, definition]) => definition.key === storedKey,
  ) as [PublicSettingKey, SettingDefinition] | undefined;
}

function isSupportedPublicKey(publicKey: string): publicKey is PublicSettingKey {
  return Object.prototype.hasOwnProperty.call(SETTING_DEFINITIONS, publicKey);
}

async function getSettingRows() {
  return prisma.system_settings.findMany({
    where: {
      key: {
        in: Object.values(SETTING_DEFINITIONS).map(
          (definition) => definition.key,
        ),
      },
    },
  });
}

export async function getSystemSettings() {
  const rows = await getSettingRows();
  const valueByKey = new Map(rows.map((row) => [row.key, row]));

  return Object.fromEntries(
    Object.entries(SETTING_DEFINITIONS).map(([publicKey, definition]) => {
      const row = valueByKey.get(definition.key);
      return [
        publicKey,
        {
          key: definition.key,
          value: row?.value ?? definition.defaultValue,
          defaultValue: definition.defaultValue,
          description: definition.description,
          source: row ? "DB" : "DEFAULT",
          updatedBy: row?.updatedBy ?? null,
          updatedAt: row?.updateAt ?? null,
        },
      ];
    }),
  ) as Record<
    PublicSettingKey,
    {
      key: string;
      value: number;
      defaultValue: number;
      description: string;
      source: "DB" | "DEFAULT";
      updatedBy: string | null;
      updatedAt: Date | null;
    }
  >;
}

export async function getSystemSettingValue(
  publicKey: PublicSettingKey,
): Promise<number> {
  const definition = SETTING_DEFINITIONS[publicKey];
  const row = await prisma.system_settings.findUnique({
    where: { key: definition.key },
    select: { value: true },
  });

  return row?.value ?? definition.defaultValue;
}

export const adminSystemSettingService = {
  async getAll() {
    return getSystemSettings();
  },

  async update(req: Request) {
    const adminId = getRequesterId(req);
    const body = req.body as Record<string, unknown>;
    const entries = Object.entries(body).filter(([publicKey]) =>
      isSupportedPublicKey(publicKey),
    ) as [PublicSettingKey, unknown][];

    if (entries.length === 0) {
      throw new BadRequestException("At least one supported setting is required");
    }

    const unsupportedKeys = Object.keys(body).filter(
      (publicKey) => !isSupportedPublicKey(publicKey),
    );

    if (unsupportedKeys.length > 0) {
      throw new BadRequestException(
        `Unsupported settings: ${unsupportedKeys.join(", ")}`,
      );
    }

    const previousRows = await getSettingRows();
    const previousValues = Object.fromEntries(
      previousRows
        .map((row) => {
          const definition = findDefinitionByStoredKey(row.key);
          return definition ? [definition[0], row.value] : null;
        })
        .filter((item): item is [PublicSettingKey, number] => item !== null),
    );

    await prisma.$transaction(
      entries.map(([publicKey, rawValue]) => {
        const definition = SETTING_DEFINITIONS[publicKey];
        const value = validateSettingValue(publicKey, rawValue);

        return prisma.system_settings.upsert({
          where: { key: definition.key },
          create: {
            key: definition.key,
            value,
            description: definition.description,
            updatedBy: adminId,
          },
          update: {
            value,
            description: definition.description,
            updatedBy: adminId,
          },
        });
      }),
    );

    const settings = await getSystemSettings();

    await adminAuditLogService.safeLog({
      adminId,
      action: "SYSTEM_SETTINGS_UPDATE",
      targetType: "SYSTEM_SETTINGS",
      metadata: {
        changed: Object.fromEntries(
          entries.map(([publicKey]) => [
            publicKey,
            {
              before:
                previousValues[publicKey] ??
                SETTING_DEFINITIONS[publicKey].defaultValue,
              after: settings[publicKey].value,
            },
          ]),
        ),
      },
    });

    return settings;
  },
};

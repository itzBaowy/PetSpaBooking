export function getQueryString(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function getQueryNumber(
  value: string | string[] | undefined,
): number | undefined {
  const stringValue = getQueryString(value);

  if (stringValue === undefined) {
    return undefined;
  }

  const parsed = parseInt(stringValue, 10);

  return Number.isNaN(parsed) ? undefined : parsed;
}

export function getQueryBoolean(
  value: string | string[] | undefined,
): boolean | undefined {
  const stringValue = getQueryString(value);

  if (stringValue === undefined) {
    return undefined;
  }

  return stringValue.toLowerCase() === "true";
}

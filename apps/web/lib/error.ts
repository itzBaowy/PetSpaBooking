import axios from "axios";

/**
 * Parses raw error strings that might be JSON arrays of validation errors (e.g. Zod issues)
 */
function formatRawStringError(raw: string, fallbackMessage: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const first = parsed[0];
        if (typeof first === "object" && first !== null && "message" in first && typeof first.message === "string") {
          return first.message;
        }
      }
    } catch {
      // Ignore JSON parse failure and return raw string
    }
  }
  return raw || fallbackMessage;
}

/**
 * Extracts a user-friendly error message from an unknown error object.
 * Supports Axios errors, standard JavaScript Errors, and custom server response formats.
 *
 * @param error The caught error object
 * @param fallbackMessage Fallback message if no specific error message can be extracted
 * @returns The extracted error message string
 */
export function getErrorMessage(
  error: unknown,
  fallbackMessage = "Thao tác thất bại.",
): string {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;
    if (responseData) {
      if (typeof responseData === "string") {
        return formatRawStringError(responseData, fallbackMessage);
      }
      if (typeof responseData === "object" && responseData !== null) {
        const errObj = responseData as Record<string, unknown>;
        if (typeof errObj.message === "string") {
          return formatRawStringError(errObj.message, fallbackMessage);
        }
        if (Array.isArray(errObj.message) && errObj.message.length > 0) {
          const first = errObj.message[0];
          if (typeof first === "string") return first;
          if (typeof first === "object" && first !== null && "message" in first && typeof first.message === "string") {
            return first.message;
          }
        }
        if (typeof errObj.error === "string") {
          return formatRawStringError(errObj.error, fallbackMessage);
        }
      }
    }
    return error.message || fallbackMessage;
  }

  if (error instanceof Error) {
    return formatRawStringError(error.message, fallbackMessage);
  }

  return fallbackMessage;
}

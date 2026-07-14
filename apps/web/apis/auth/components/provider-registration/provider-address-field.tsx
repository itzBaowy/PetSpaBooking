"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui";
import { ProviderLocationMap } from "@/apis/provider/business-profile/components/provider-location-map";
import type { ProviderRegistrationFormState } from "../../hooks/use-provider-registration-draft";
import { ProviderRegistrationField } from "./field";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org";
const SEARCH_DELAY_MS = 450;

type Location = { lat: number; lng: number };
type AddressSuggestion = Location & { address: string; placeId: string };

export function ProviderRegistrationAddressField({
  form,
  onFieldChange,
}: {
  form: ProviderRegistrationFormState;
  onFieldChange: (
    name: keyof ProviderRegistrationFormState,
    value: ProviderRegistrationFormState[keyof ProviderRegistrationFormState],
  ) => void;
}) {
  const [query, setQuery] = useState(() => sanitizeAddress(form.address));
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState("");
  const skipNextSearchRef = useRef(false);
  const reverseControllerRef = useRef<AbortController | null>(null);

  const lat = parseCoordinate(form.lat);
  const lng = parseCoordinate(form.lng);

  useEffect(() => {
    const safeAddress = sanitizeAddress(form.address);
    if (safeAddress !== form.address) onFieldChange("address", safeAddress);
  }, [form.address, onFieldChange]);

  useEffect(() => () => reverseControllerRef.current?.abort(), []);

  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }

    const searchText = query.trim();
    if (searchText.length < 3 || searchText === form.address) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true);
      setError("");
      try {
        const params = new URLSearchParams({
          q: searchText,
          format: "jsonv2",
          addressdetails: "1",
          limit: "5",
          countrycodes: "vn",
          "accept-language": "vi",
        });
        const response = await fetch(`${NOMINATIM_URL}/search?${params}`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!response.ok)
          throw new Error("Không thể tìm kiếm địa chỉ lúc này.");

        const data = (await response.json()) as NominatimResult[];
        const nextSuggestions = data
          .map(toSuggestion)
          .filter((item): item is AddressSuggestion => item !== null);
        setSuggestions(nextSuggestions);
        if (nextSuggestions.length === 0) {
          setError(
            "Không tìm thấy địa chỉ phù hợp. Vui lòng nhập chi tiết hơn.",
          );
        }
      } catch (searchError) {
        if (!isAbortError(searchError)) {
          setSuggestions([]);
          setError("Không thể tìm kiếm địa chỉ. Vui lòng thử lại.");
        }
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, SEARCH_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [form.address, query]);

  function selectAddress(suggestion: AddressSuggestion) {
    skipNextSearchRef.current = true;
    setQuery(suggestion.address);
    setSuggestions([]);
    setError("");
    syncLocation(suggestion.address, suggestion);
  }

  async function resolveMapLocation(location: Location) {
    reverseControllerRef.current?.abort();
    const controller = new AbortController();
    reverseControllerRef.current = controller;
    setIsResolving(true);
    setSuggestions([]);
    setError("");
    try {
      const params = new URLSearchParams({
        lat: String(location.lat),
        lon: String(location.lng),
        format: "jsonv2",
        addressdetails: "1",
        "accept-language": "vi",
      });
      const response = await fetch(`${NOMINATIM_URL}/reverse?${params}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Không thể xác định địa chỉ.");

      const result = (await response.json()) as NominatimResult;
      const address = sanitizeAddress(result.display_name ?? "");
      if (!address) throw new Error("Địa chỉ trả về không hợp lệ.");

      skipNextSearchRef.current = true;
      setQuery(address);
      syncLocation(address, location);
    } catch (resolveError) {
      if (!isAbortError(resolveError)) {
        setError("Không thể lấy địa chỉ tại vị trí này. Vui lòng thử lại.");
      }
    } finally {
      if (reverseControllerRef.current === controller) {
        reverseControllerRef.current = null;
        setIsResolving(false);
      }
    }
  }

  function syncLocation(address: string, location: Location) {
    onFieldChange("address", address);
    onFieldChange("lat", String(roundCoordinate(location.lat)));
    onFieldChange("lng", String(roundCoordinate(location.lng)));
  }

  return (
    <>
      <ProviderRegistrationField
        label="Địa chỉ doanh nghiệp"
        required
        className="relative order-1 md:col-span-2"
      >
        <div className="relative">
          <Input
            required
            name="address"
            autoComplete="off"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSuggestions([]);
              setIsSearching(false);
              setError("");
            }}
            placeholder="Số nhà, đường, phường/xã, tỉnh/thành"
            aria-autocomplete="list"
            aria-expanded={suggestions.length > 0}
          />
          {isSearching && (
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-semibold text-muted">
              Đang tìm...
            </span>
          )}
          {suggestions.length > 0 && (
            <ul className="absolute z-[1000] mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-border-subtle bg-white p-1.5 shadow-xl">
              {suggestions.map((suggestion) => (
                <li key={suggestion.placeId}>
                  <button
                    type="button"
                    className="w-full rounded-lg px-3 py-2.5 text-left text-sm leading-5 text-foreground transition hover:bg-surface-muted focus:bg-surface-muted focus:outline-none"
                    onClick={() => selectAddress(suggestion)}
                  >
                    {suggestion.address}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p
          className={`mt-2 text-xs font-semibold ${error ? "text-danger" : "text-muted"}`}
          role={error ? "alert" : undefined}
        >
          {error ||
            "Nhập ít nhất 3 ký tự và chọn một địa chỉ trong danh sách gợi ý."}
        </p>
      </ProviderRegistrationField>

      <ProviderRegistrationField
        label="Vị trí trên bản đồ"
        required
        className="order-3 md:col-span-2"
      >
        <div className="space-y-3">
          <ProviderLocationMap
            lat={lat}
            lng={lng}
            onChange={resolveMapLocation}
          />
          {isResolving && (
            <p className="text-xs font-semibold text-brand" role="status">
              Đang xác định địa chỉ tại vị trí đã chọn...
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              readOnly
              value={form.lat}
              placeholder="Vĩ độ"
              aria-label="Vĩ độ"
            />
            <Input
              readOnly
              value={form.lng}
              placeholder="Kinh độ"
              aria-label="Kinh độ"
            />
          </div>
        </div>
      </ProviderRegistrationField>
    </>
  );
}

type NominatimResult = {
  place_id?: number | string;
  display_name?: string;
  lat?: string;
  lon?: string;
};

function toSuggestion(result: NominatimResult): AddressSuggestion | null {
  const address = sanitizeAddress(result.display_name ?? "");
  const lat = Number(result.lat);
  const lng = Number(result.lon);
  if (!address || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    address,
    lat,
    lng,
    placeId: String(result.place_id ?? `${lat}-${lng}`),
  };
}

function sanitizeAddress(value: string) {
  const address = value.trim();
  const isTechnicalIdentifier = /^(?:[0-9a-f]{2}[-:]){5}[0-9a-f]{2}$/i.test(
    address,
  );
  return isTechnicalIdentifier ? "" : address;
}

function parseCoordinate(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function roundCoordinate(value: number) {
  return Number(value.toFixed(6));
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

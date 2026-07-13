"use client";

import { useEffect, useRef } from "react";
import type * as Leaflet from "leaflet";

const DEFAULT_LOCATION = {
  lat: 10.7769,
  lng: 106.7009,
};

export function ProviderLocationMap({
  lat,
  lng,
  onChange,
}: {
  lat?: number | null;
  lng?: number | null;
  onChange: (location: { lat: number; lng: number }) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const markerRef = useRef<Leaflet.Marker | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let disposed = false;

    async function initMap() {
      if (!containerRef.current || mapRef.current) return;

      const leaflet = await import("leaflet");
      if (disposed || !containerRef.current) return;

      const initialLocation = getLocation(lat, lng);
      const markerIcon = leaflet.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const map = leaflet
        .map(containerRef.current, {
          center: [initialLocation.lat, initialLocation.lng],
          zoom: 15,
          scrollWheelZoom: true,
        })
        .on("click", (event: Leaflet.LeafletMouseEvent) => {
          const next = {
            lat: roundCoordinate(event.latlng.lat),
            lng: roundCoordinate(event.latlng.lng),
          };
          markerRef.current?.setLatLng([next.lat, next.lng]);
          onChangeRef.current(next);
        });

      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        })
        .addTo(map);

      markerRef.current = leaflet
        .marker([initialLocation.lat, initialLocation.lng], {
          icon: markerIcon,
          draggable: true,
        })
        .on("dragend", (event: Leaflet.DragEndEvent) => {
          const nextLatLng = event.target.getLatLng();
          onChangeRef.current({
            lat: roundCoordinate(nextLatLng.lat),
            lng: roundCoordinate(nextLatLng.lng),
          });
        })
        .addTo(map);

      mapRef.current = map;
      window.setTimeout(() => map.invalidateSize(), 0);
    }

    void initMap();

    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Map initialization must run once; later lat/lng updates are handled by the sync effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker || !isCoordinate(lat) || !isCoordinate(lng)) return;

    const current = marker.getLatLng();
    if (roundCoordinate(current.lat) === roundCoordinate(lat) && roundCoordinate(current.lng) === roundCoordinate(lng)) {
      return;
    }

    marker.setLatLng([lat, lng]);
    map.setView([lat, lng], Math.max(map.getZoom(), 15));
  }, [lat, lng]);

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="h-[360px] overflow-hidden rounded-2xl border border-border-subtle bg-surface-muted" />
      <p className="text-xs font-semibold text-muted">
        Bấm trực tiếp trên bản đồ hoặc kéo ghim để lấy vĩ độ và kinh độ cho địa chỉ cơ sở.
      </p>
    </div>
  );
}

function getLocation(lat?: number | null, lng?: number | null) {
  if (isCoordinate(lat) && isCoordinate(lng)) return { lat, lng };
  return DEFAULT_LOCATION;
}

function isCoordinate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function roundCoordinate(value: number) {
  return Number(value.toFixed(6));
}

"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { LogEntry } from "@/components/BookMap";

const bookColors = ["#8b5cf6", "#2dd4bf", "#f59e0b", "#22c55e", "#f43f5e", "#38bdf8"];

function escapeHtml(value: string) {
  const entities: Record<string, string> = {
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  };
  return value.replace(/[&<>'"]/g, (character) => entities[character] ?? character);
}

function makeIcon(color: string, isLast: boolean) {
  const size = isLast ? 18 : 14;
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;background:${color};border:3px solid rgba(255,255,255,.9);border-radius:50%;box-shadow:0 0 14px ${color}88,0 2px 8px rgba(0,0,0,.4);position:relative">${isLast ? `<div style="position:absolute;inset:-8px;border:2px solid ${color};border-radius:50%;opacity:.4;animation:pulseDot 2s ease-out infinite"></div>` : ""}</div>`,
    iconSize: [size, size], iconAnchor: [size / 2, size / 2], popupAnchor: [0, -size / 2 - 6],
  });
}

export default function AllBooksMap({ logs }: { logs: LogEntry[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!ref.current || !logs.length) return;
    map.current?.remove();

    const instance = L.map(ref.current, { zoomControl: true, attributionControl: true });
    map.current = instance;
    const key = process.env.NEXT_PUBLIC_CARTO_API_KEY ?? "";

    L.tileLayer(`https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${key}`, {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attribution/">CARTO</a>',
      maxZoom: 19,
    }).addTo(instance);

    const grouped = new Map<string, LogEntry[]>();
    logs.forEach((log) => grouped.set(log.bookId, [...(grouped.get(log.bookId) ?? []), log]));
    const points: L.LatLngExpression[] = [];

    Array.from(grouped.entries()).forEach(([bookId, bookLogs], bookIndex) => {
      const color = bookColors[bookIndex % bookColors.length];
      const routePoints: L.LatLngExpression[] = [];
      bookLogs.forEach((log, index) => {
        const point: L.LatLngExpression = [log.coordenadas.lat, log.coordenadas.lng];
        points.push(point); routePoints.push(point);
        const marker = L.marker(point, { icon: makeIcon(color, index === bookLogs.length - 1) }).addTo(instance);
        marker.bindPopup(`<div style="min-width:210px;font-family:'Plus Jakarta Sans',sans-serif"><div style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><span style="font-size:10px;font-weight:700;color:${color};background:${color}22;padding:3px 10px;border-radius:8px;font-family:monospace">${escapeHtml(bookId)}</span><span style="font-size:11px;color:#71717a">#${index + 1}</span></div><div style="font-weight:600;color:#fafafa;margin-bottom:6px;font-size:14px">${escapeHtml(log.cidade)}, ${escapeHtml(log.bairro)}</div><div style="font-size:13px;color:#a1a1aa;line-height:1.6;font-style:italic">&quot;${escapeHtml(log.aprendizado.length > 110 ? `${log.aprendizado.slice(0, 110)}…` : log.aprendizado)}&quot;</div></div>`);
      });
      if (routePoints.length > 1) L.polyline(routePoints, { color, weight: 2.5, opacity: .55, dashArray: "10,14", lineCap: "round", lineJoin: "round" }).addTo(instance);
    });

    if (points.length > 1) instance.fitBounds(L.latLngBounds(points), { padding: [50, 50] });
    else if (points.length === 1) instance.setView(points[0], 13);

    return () => { instance.remove(); map.current = null; };
  }, [logs]);

  return <div ref={ref} style={{ width: "100%", height: "100%" }} />;
}

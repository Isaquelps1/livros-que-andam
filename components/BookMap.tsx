"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LogEntry {
  id: string; bookId: string; cidade: string; bairro: string;
  aprendizado: string; coordenadas: { lat: number; lng: number }; timestamp: Date;
}

function makeIcon(i: number, total: number) {
  const isFirst = i === 0;
  const isLast = i === total - 1;
  const color = isLast ? "#f59e0b" : isFirst ? "#22c55e" : "#8b5cf6";
  const s = isLast ? 18 : 14;
  const glow = isLast ? "rgba(245,158,11,.5)" : isFirst ? "rgba(34,197,94,.4)" : "rgba(139,92,246,.4)";
  return L.divIcon({
    className: "",
    html: `<div style="width:${s}px;height:${s}px;background:${color};border:3px solid rgba(255,255,255,.9);border-radius:50%;box-shadow:0 0 14px ${glow},0 2px 8px rgba(0,0,0,.4);position:relative">${isLast ? `<div style="position:absolute;inset:-8px;border:2px solid ${color};border-radius:50%;opacity:.4;animation:pulseDot 2s ease-out infinite"></div><style>@keyframes pulseDot{0%{transform:scale(1);opacity:.4}100%{transform:scale(2);opacity:0}}</style>` : ""}</div>`,
    iconSize: [s, s], iconAnchor: [s / 2, s / 2], popupAnchor: [0, -s / 2 - 6],
  });
}

export default function BookMap({ logs }: { logs: LogEntry[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!ref.current || !logs.length) return;
    if (map.current) map.current.remove();

    const m = L.map(ref.current, { zoomControl: true, attributionControl: true });
    map.current = m;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '© <a href="https://osm.org/copyright">OSM</a> © <a href="https://carto.com">CARTO</a>',
      subdomains: "abcd", maxZoom: 19,
    }).addTo(m);

    const pts: L.LatLngExpression[] = [];
    logs.forEach((log, i) => {
      const ll: L.LatLngExpression = [log.coordenadas.lat, log.coordenadas.lng];
      pts.push(ll);
      const mk = L.marker(ll, { icon: makeIcon(i, logs.length) }).addTo(m);
      const isLast = i === logs.length - 1;
      const d = log.timestamp.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
      mk.bindPopup(`
        <div style="min-width:200px;font-family:'Plus Jakarta Sans',sans-serif">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
            <span style="font-size:10px;font-weight:700;color:${isLast ? "#fbbf24" : "#a78bfa"};background:${isLast ? "rgba(245,158,11,.12)" : "rgba(139,92,246,.12)"};padding:3px 10px;border-radius:8px;font-family:monospace">${isLast ? "📍 Último" : "#" + (i + 1)}</span>
            <span style="font-size:11px;color:#52525b">${d}</span>
          </div>
          <div style="font-weight:600;color:#fafafa;margin-bottom:6px;font-size:14px">${log.cidade}, ${log.bairro}</div>
          <div style="font-size:13px;color:#a1a1aa;line-height:1.6;font-style:italic">"${log.aprendizado.length > 100 ? log.aprendizado.slice(0, 100) + "…" : log.aprendizado}"</div>
        </div>`);
    });

    if (pts.length > 1) {
      L.polyline(pts, { color: "#8b5cf6", weight: 2.5, opacity: .45, dashArray: "10,14", lineCap: "round", lineJoin: "round" }).addTo(m);
      m.fitBounds(L.latLngBounds(pts), { padding: [50, 50] });
    } else {
      m.setView(pts[0], 13);
    }

    return () => { map.current?.remove(); map.current = null; };
  }, [logs]);

  return <div ref={ref} style={{ width: "100%", height: "100%" }} />;
}

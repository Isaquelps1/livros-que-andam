"use client";
import { useState, useRef, useEffect } from "react";

interface NominatimResult {
  address?: {
    suburb?: string;
    neighbourhood?: string;
    quarter?: string;
    city_district?: string;
  };
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  cidade: string;
  inputStyle: React.CSSProperties;
}

const dropStyle: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 6px)",
  left: 0,
  right: 0,
  background: "#18181b",
  border: "1.5px solid rgba(255,255,255,.1)",
  borderRadius: 12,
  zIndex: 200,
  listStyle: "none",
  padding: 6,
  margin: 0,
  maxHeight: 200,
  overflowY: "auto",
  boxShadow: "0 8px 32px rgba(0,0,0,.5)",
};

export default function BairroInput({ value, onChange, cidade, inputStyle }: Props) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevCidade = useRef(cidade);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (prevCidade.current !== cidade) {
      prevCidade.current = cidade;
      setQuery("");
      onChange("");
      setSuggestions([]);
      setOpen(false);
    }
  }, [cidade, onChange]);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setActiveIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!cidade || val.length < 2) { setSuggestions([]); setOpen(false); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const q = `${val}, ${cidade}, Brasil`;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=8&countrycodes=br&addressdetails=1`,
          { headers: { "User-Agent": "JornadaDoLivro-SENAI/1.0" } }
        );
        const data: NominatimResult[] = await res.json();
        const bairros = Array.from(new Set(
          data
            .map(r => r.address?.suburb ?? r.address?.neighbourhood ?? r.address?.quarter ?? r.address?.city_district)
            .filter((b): b is string => Boolean(b))
        )).slice(0, 6);
        setSuggestions(bairros);
        setOpen(bairros.length > 0);
      } catch { setSuggestions([]); }
      finally { setLoading(false); }
    }, 400);
  }

  function select(bairro: string) {
    setQuery(bairro);
    onChange(bairro);
    setSuggestions([]);
    setOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && activeIndex >= 0) { e.preventDefault(); select(suggestions[activeIndex]); }
    else if (e.key === "Escape") { setOpen(false); }
  }

  const disabled = !cidade;

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <input
        type="text"
        value={query}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? "Selecione a cidade primeiro" : "Ex: Vila Mariana"}
        style={{ ...inputStyle, opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : undefined }}
        disabled={disabled}
        required
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {loading && (
        <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, border: "2px solid rgba(255,255,255,.1)", borderTopColor: "#8b5cf6", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />
      )}
      {open && suggestions.length > 0 && (
        <ul style={dropStyle} role="listbox">
          {suggestions.map((b, i) => (
            <li
              key={b}
              role="option"
              aria-selected={activeIndex === i}
              onMouseDown={() => select(b)}
              onMouseEnter={() => setActiveIndex(i)}
              style={{
                padding: "10px 14px",
                cursor: "pointer",
                borderRadius: 8,
                fontSize: 14,
                color: "#fafafa",
                background: activeIndex === i ? "rgba(139,92,246,.15)" : "transparent",
                transition: "background .15s",
              }}
            >
              {b}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

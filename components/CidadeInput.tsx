"use client";
import { useState, useRef, useEffect } from "react";

interface Municipio {
  id: number;
  nome: string;
  uf: string;
}

interface IBGEMunicipio {
  id: number;
  nome: string;
  microrregiao: { mesorregiao: { UF: { sigla: string } } };
}

interface Props {
  value: string;
  onChange: (value: string) => void;
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
  maxHeight: 240,
  overflowY: "auto",
  boxShadow: "0 8px 32px rgba(0,0,0,.5)",
};

export default function CidadeInput({ value, onChange, inputStyle }: Props) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Municipio[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    onChange("");
    setActiveIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 2) { setSuggestions([]); setOpen(false); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/municipios?nome=${encodeURIComponent(val)}&orderBy=nome`
        );
        const data: IBGEMunicipio[] = await res.json();
        const list = data.slice(0, 8).map((m) => ({
          id: m.id,
          nome: m.nome,
          uf: m.microrregiao.mesorregiao.UF.sigla,
        }));
        setSuggestions(list);
        setOpen(list.length > 0);
      } catch { setSuggestions([]); }
      finally { setLoading(false); }
    }, 300);
  }

  function select(m: Municipio) {
    setQuery(`${m.nome} — ${m.uf}`);
    onChange(m.nome);
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

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <input
        type="text"
        value={query}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Ex: São Paulo"
        style={inputStyle}
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
          {suggestions.map((m, i) => (
            <li
              key={m.id}
              role="option"
              aria-selected={activeIndex === i}
              onMouseDown={() => select(m)}
              onMouseEnter={() => setActiveIndex(i)}
              style={{
                padding: "10px 14px",
                cursor: "pointer",
                borderRadius: 8,
                fontSize: 14,
                color: "#fafafa",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: activeIndex === i ? "rgba(139,92,246,.15)" : "transparent",
                transition: "background .15s",
              }}
            >
              <span>{m.nome}</span>
              <span style={{ fontSize: 11, color: "#a1a1aa", fontFamily: "monospace", background: "rgba(255,255,255,.05)", padding: "2px 8px", borderRadius: 6 }}>{m.uf}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

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
  confirmed?: boolean;
}

// Cache em nível de módulo — carregado uma vez, persiste entre renders
let municipiosCache: Municipio[] | null = null;
let fetchPromise: Promise<void> | null = null;

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .replace(/[áàãâä]/g, "a")
    .replace(/[éèêë]/g, "e")
    .replace(/[íìîï]/g, "i")
    .replace(/[óòõôö]/g, "o")
    .replace(/[úùûü]/g, "u")
    .replace(/ç/g, "c")
    .replace(/ñ/g, "n");
}

async function carregarMunicipios(): Promise<void> {
  if (municipiosCache) return;
  if (fetchPromise) return fetchPromise;
  fetchPromise = fetch(
    "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome"
  )
    .then((r) => r.json())
    .then((data: IBGEMunicipio[]) => {
      municipiosCache = data
        .filter((m) => m.microrregiao?.mesorregiao?.UF?.sigla)
        .map((m) => ({
          id: m.id,
          nome: m.nome,
          uf: m.microrregiao.mesorregiao.UF.sigla,
        }));
    })
    .catch((err) => {
      console.error("Falha ao carregar municípios IBGE:", err);
      fetchPromise = null;
    });
  return fetchPromise;
}

function filtrar(query: string): Municipio[] {
  if (!municipiosCache || query.length < 2) return [];
  const q = normalizar(query);
  const comeca: Municipio[] = [];
  const contem: Municipio[] = [];
  for (const m of municipiosCache) {
    const n = normalizar(m.nome);
    if (n.startsWith(q)) comeca.push(m);
    else if (n.includes(q)) contem.push(m);
    if (comeca.length + contem.length >= 16) break;
  }
  return [...comeca, ...contem].slice(0, 8);
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

export default function CidadeInput({ value, onChange, inputStyle, confirmed }: Props) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Municipio[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void carregarMunicipios();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    onChange("");
    setActiveIndex(-1);

    if (val.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    if (!municipiosCache) {
      setLoading(true);
      await carregarMunicipios();
      setLoading(false);
    }

    const result = filtrar(val);
    setSuggestions(result);
    setOpen(result.length > 0);
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
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      select(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <input
        type="text"
        value={query}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Ex: São Paulo"
        style={{
          ...inputStyle,
          borderColor: confirmed ? "rgba(34,197,94,.35)" : query && !confirmed ? "rgba(245,158,11,.3)" : undefined,
        }}
        required
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {/* Confirmation badge */}
      {query && !loading && (
        <span style={{
          position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
          fontSize: 10, fontWeight: 700, letterSpacing: ".04em",
          padding: "3px 8px", borderRadius: 6,
          ...(confirmed
            ? { color: "#22c55e", background: "rgba(34,197,94,.08)", border: "1px solid rgba(34,197,94,.15)" }
            : { color: "#f59e0b", background: "rgba(245,158,11,.06)", border: "1px solid rgba(245,158,11,.12)" }),
          pointerEvents: "none" as const,
          transition: "all .25s ease",
        }}>
          {confirmed ? "✓" : "Selecione da lista"}
        </span>
      )}
      {loading && (
        <span style={{
          position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
          width: 16, height: 16, border: "2px solid rgba(255,255,255,.1)",
          borderTopColor: "#8b5cf6", borderRadius: "50%", display: "inline-block",
          animation: "spin .7s linear infinite",
        }} />
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
              <span style={{
                fontSize: 11, color: "#a1a1aa", fontFamily: "monospace",
                background: "rgba(255,255,255,.05)", padding: "2px 8px", borderRadius: 6,
              }}>{m.uf}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

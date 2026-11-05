"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { LogEntry } from "@/components/BookMap";

const AllBooksMap = dynamic(() => import("@/components/AllBooksMap"), {
  ssr: false,
  loading: () => <div style={{ height: "100%", display: "grid", placeItems: "center", color: "#71717a" }}>Carregando mapa...</div>,
});

const C = { bg: "#060609", card: "#111114", border: "rgba(255,255,255,.06)", text1: "#fafafa", text2: "#a1a1aa", text3: "#71717a", purple: "#a78bfa", teal: "#2dd4bf" };

export default function AllBooksPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAllLogs() {
      try {
        const snap = await getDocs(query(collection(db, "logs"), orderBy("timestamp", "asc")));
        setLogs(snap.docs.map((doc) => ({
          id: doc.id, bookId: doc.data().bookId, cidade: doc.data().cidade, bairro: doc.data().bairro,
          aprendizado: doc.data().aprendizado, coordenadas: doc.data().coordenadas,
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        })));
      } catch (loadError) { console.error(loadError); setError("Não foi possível carregar os pontos agora."); }
      finally { setLoading(false); }
    }
    void loadAllLogs();
  }, []);

  const books = useMemo(() => Array.from(new Set(logs.map((log) => log.bookId))).sort(), [logs]);

  return (
    <main style={{ minHeight: "100vh", background: C.bg, color: C.text1, paddingBottom: 56 }}>
      <header style={{ borderBottom: `1px solid ${C.border}`, background: "rgba(6,6,9,.86)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <Link href="/" style={{ color: C.text2, textDecoration: "none", fontSize: 14 }}>← Voltar</Link>
          <span style={{ color: C.purple, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>Jornada do Livro</span>
          <span style={{ width: 58 }} aria-hidden="true" />
        </div>
      </header>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px 24px" }}>
        <span style={{ color: C.teal, textTransform: "uppercase", letterSpacing: ".18em", fontSize: 11, fontWeight: 800 }}>Mapa vivo</span>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", margin: "14px 0 12px" }}>Todos os livros, em um só lugar</h1>
        <p style={{ color: C.text2, lineHeight: 1.7, maxWidth: 620 }}>Veja por onde os exemplares já passaram. Cada cor representa um livro e cada linha mantém a rota daquele exemplar.</p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
          {[{ value: logs.length, label: "pontos registrados" }, { value: books.length, label: "livros em circulação" }].map((stat) => (
            <div key={stat.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 18px", minWidth: 150 }}><strong style={{ display: "block", color: C.purple, fontSize: 22 }}>{loading ? "—" : stat.value}</strong><span style={{ color: C.text3, fontSize: 12 }}>{stat.label}</span></div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ height: "min(66vh, 650px)", minHeight: 430, borderRadius: 24, overflow: "hidden", border: `1px solid ${C.border}`, background: "#0c0c10", boxShadow: "0 24px 80px rgba(0,0,0,.3)" }}>
          {loading ? <div style={{ height: "100%", display: "grid", placeItems: "center", color: C.text3 }}>Buscando os registros...</div> : error ? <div style={{ height: "100%", display: "grid", placeItems: "center", color: "#fb7185" }}>{error}</div> : logs.length ? <AllBooksMap logs={logs} /> : <div style={{ height: "100%", display: "grid", placeItems: "center", color: C.text3 }}>Ainda não há pontos registrados.</div>}
        </div>
      </section>

      {!!books.length && <section style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 24px 0" }}><div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{books.map((bookId) => <span key={bookId} style={{ color: C.text2, background: C.card, border: `1px solid ${C.border}`, borderRadius: 100, padding: "7px 12px", fontFamily: "monospace", fontSize: 12 }}>{bookId}</span>)}</div></section>}
    </main>
  );
}

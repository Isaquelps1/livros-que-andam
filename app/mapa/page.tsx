"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { LogEntry } from "@/components/BookMap";
import { DEMO_LOGS } from "@/lib/demo-logs";
import { INITIAL_BOOKS } from "@/lib/books-data";

const AllBooksMap = dynamic(() => import("@/components/AllBooksMap"), {
  ssr: false,
  loading: () => <div style={{ height: "100%", display: "grid", placeItems: "center", color: "#71717a" }}>Carregando mapa...</div>,
});

const C = { bg: "#060609", card: "#111114", border: "rgba(255,255,255,.06)", text1: "#fafafa", text2: "#a1a1aa", text3: "#71717a", purple: "#a78bfa", teal: "#2dd4bf" };

export default function AllBooksPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  useEffect(() => {
    async function loadAllLogs() {
      try {
        const snap = await getDocs(query(collection(db, "logs"), orderBy("timestamp", "asc")));
        const realLogs = snap.docs.map((doc) => ({
          id: doc.id, bookId: doc.data().bookId, cidade: doc.data().cidade, bairro: doc.data().bairro,
          aprendizado: doc.data().aprendizado, coordenadas: doc.data().coordenadas,
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        }));
        setLogs([...DEMO_LOGS, ...realLogs]);
      } catch (loadError) { console.error(loadError); setLogs(DEMO_LOGS); setError("Os registros reais não carregaram; exibindo dados demonstrativos."); }
      finally { setLoading(false); }
    }
    void loadAllLogs();
  }, []);

  const books = useMemo(() => INITIAL_BOOKS.filter((book) => logs.some((log) => log.bookId === book.id)), [logs]);
  const visibleLogs = useMemo(() => selectedBook ? logs.filter((log) => log.bookId === selectedBook) : logs, [logs, selectedBook]);
  const selectedBookInfo = books.find((book) => book.id === selectedBook);

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
          {[{ value: visibleLogs.length, label: selectedBook ? "pontos deste livro" : "pontos no mapa" }, { value: selectedBook ? "01" : books.length, label: selectedBook ? "livro selecionado" : "livros em circulação" }].map((stat) => (
            <div key={stat.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 18px", minWidth: 150 }}><strong style={{ display: "block", color: C.purple, fontSize: 22 }}>{loading ? "—" : stat.value}</strong><span style={{ color: C.text3, fontSize: 12 }}>{stat.label}</span></div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ borderRadius: 24, overflow: "hidden", border: `1px solid ${C.border}`, background: "#0c0c10", boxShadow: "0 24px 80px rgba(0,0,0,.3)" }}>
          <div style={{ padding: "15px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", background: "linear-gradient(90deg, rgba(139,92,246,.12), rgba(45,212,191,.05))", borderBottom: `1px solid ${C.border}` }}>
            <div><span style={{ display: "block", fontSize: 11, color: C.teal, textTransform: "uppercase", letterSpacing: ".16em", fontWeight: 800 }}>Mapa da jornada</span><strong style={{ display: "block", marginTop: 4, fontFamily: "'Space Grotesk', sans-serif", fontSize: 15 }}>{selectedBookInfo?.titulo ?? "Todos os livros"}</strong></div>
            {selectedBook && <button type="button" onClick={() => setSelectedBook(null)} style={{ border: `1px solid rgba(167,139,250,.3)`, background: "rgba(139,92,246,.1)", color: C.purple, borderRadius: 100, padding: "8px 13px", cursor: "pointer", fontFamily: "inherit", fontSize: 12 }}>Mostrar todos</button>}
          </div>
          <div style={{ height: "min(66vh, 650px)", minHeight: 430 }}>
            {loading ? <div style={{ height: "100%", display: "grid", placeItems: "center", color: C.text3 }}>Buscando os registros...</div> : visibleLogs.length ? <AllBooksMap logs={visibleLogs} /> : <div style={{ height: "100%", display: "grid", placeItems: "center", color: C.text3 }}>Ainda não há pontos registrados.</div>}
          </div>
        </div>
        {error && <p style={{ color: "#fbbf24", fontSize: 12, marginTop: 12 }}>{error}</p>}
      </section>

      {!!books.length && <section style={{ maxWidth: 1180, margin: "0 auto", padding: "38px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
          <div><span style={{ color: C.teal, textTransform: "uppercase", letterSpacing: ".16em", fontSize: 10, fontWeight: 800 }}>Explore por exemplar</span><h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, marginTop: 7 }}>Escolha um livro para filtrar</h2></div>
          <span style={{ color: C.text3, fontSize: 12 }}>Clique em um cartão</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 245px), 1fr))", gap: 12 }}>
          {books.map((book) => {
            const count = logs.filter((log) => log.bookId === book.id).length;
            const active = book.id === selectedBook;
            return <button key={book.id} type="button" onClick={() => setSelectedBook(active ? null : book.id)} aria-pressed={active} style={{ textAlign: "left", minHeight: 112, padding: "17px 18px", borderRadius: 17, border: `1px solid ${active ? C.purple : C.border}`, background: active ? "linear-gradient(135deg, rgba(139,92,246,.18), rgba(17,17,20,.94))" : C.card, color: C.text1, cursor: "pointer", fontFamily: "inherit", transition: "all .25s", boxShadow: active ? "0 10px 28px rgba(139,92,246,.12)" : "none" }}><span style={{ color: active ? C.purple : C.text3, fontFamily: "monospace", fontSize: 11, fontWeight: 700 }}>{book.id}</span><strong style={{ display: "block", marginTop: 9, fontSize: 14, lineHeight: 1.35 }}>{book.titulo}</strong><span style={{ display: "block", marginTop: 9, color: C.text3, fontSize: 11 }}>{count} {count === 1 ? "ponto" : "pontos"} no mapa</span></button>;
          })}
        </div>
      </section>}
    </main>
  );
}

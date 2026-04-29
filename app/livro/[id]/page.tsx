"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getBookById, isValidBookId } from "@/lib/books-data";
import { geocodeLocation } from "@/lib/geocoding";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from "firebase/firestore";

const MapComponent = dynamic(() => import("@/components/BookMap"), {
  ssr: false,
  loading: () => (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0c0c10" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ width: 32, height: 32, border: "3px solid #27272a", borderTopColor: "#8b5cf6", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
        <p style={{ fontSize: 13, color: "#52525b" }}>Carregando mapa...</p>
      </div>
    </div>
  ),
});

/* ---- Colors ---- */
const C = {
  bg: "#060609", surface: "#0c0c10", card: "#111114",
  border: "rgba(255,255,255,.06)", borderHover: "rgba(255,255,255,.12)",
  text1: "#fafafa", text2: "#a1a1aa", text3: "#52525b",
  purple: "#8b5cf6", purpleLight: "#a78bfa", purpleGlow: "rgba(139,92,246,.15)",
  amber: "#f59e0b", amberLight: "#fbbf24",
  teal: "#2dd4bf", green: "#22c55e", red: "#f43f5e",
};

interface LogEntry {
  id: string; bookId: string; cidade: string; bairro: string;
  aprendizado: string; coordenadas: { lat: number; lng: number }; timestamp: Date;
}

function getSaveErrorMessage(error: unknown) {
  const code = typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: unknown }).code)
    : "";

  if (code === "permission-denied") {
    return "Sem permissão para salvar. Confira se as regras do Firestore foram publicadas.";
  }

  if (code === "not-found") {
    return "Banco do Firestore não encontrado. Confira se o Firestore foi criado no Firebase.";
  }

  if (code === "unavailable") {
    return "Firestore indisponível agora. Verifique sua conexão e tente novamente.";
  }

  if (code === "invalid-argument") {
    return "Algum dado do formulário foi recusado pelo Firestore.";
  }

  return "Erro ao salvar. Veja o console do navegador para o detalhe técnico.";
}

export default function BookPage() {
  const params = useParams();
  const bookId = params.id as string;
  const book = getBookById(bookId);
  const isValid = isValidBookId(bookId);

  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [aprendizado, setAprendizado] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [showMap, setShowMap] = useState(false);

  const loadLogs = useCallback(async () => {
    if (!isValid) return;
    try {
      const logsRef = collection(db, "logs");
      const q = query(logsRef, where("bookId", "==", bookId), orderBy("timestamp", "asc"));
      const snap = await getDocs(q);
      setLogs(snap.docs.map((d) => ({
        id: d.id, bookId: d.data().bookId, cidade: d.data().cidade,
        bairro: d.data().bairro, aprendizado: d.data().aprendizado,
        coordenadas: d.data().coordenadas, timestamp: d.data().timestamp?.toDate() || new Date(),
      })));
    } catch (e) { console.error(e); }
    finally { setLoadingLogs(false); }
  }, [bookId, isValid]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadLogs();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [loadLogs]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setIsSubmitting(true);
    try {
      const coords = await geocodeLocation(cidade, bairro);
      if (!coords) { setError("Endereço não encontrado. Verifique cidade e bairro."); setIsSubmitting(false); return; }
      await addDoc(collection(db, "logs"), { bookId, cidade: cidade.trim(), bairro: bairro.trim(), aprendizado: aprendizado.trim(), coordenadas: coords, timestamp: serverTimestamp() });
      setSubmitted(true); setShowMap(true); await loadLogs();
    } catch (e) {
      console.error("Erro ao salvar registro:", e);
      setError(getSaveErrorMessage(e));
    }
    finally { setIsSubmitting(false); }
  }

  /* ---- Input Styles ---- */
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "16px 20px", background: "#18181b",
    border: "1.5px solid rgba(255,255,255,.06)", borderRadius: 12,
    color: C.text1, fontSize: 15, fontFamily: "inherit", outline: "none",
    transition: "all .3s",
  };
  const labelStyle: React.CSSProperties = { display: "block", fontWeight: 600, color: C.text2, marginBottom: 10, fontSize: 14 };
  const btnPrimary: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: 10, padding: "17px 40px", borderRadius: 14, border: "none",
    background: `linear-gradient(135deg, ${C.purple}, #7c3aed)`,
    color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer",
    textDecoration: "none", fontFamily: "inherit", width: "100%",
    transition: "all .35s",
  };
  const btnGhost: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: 10, padding: "17px 40px", borderRadius: 14,
    background: "transparent", border: `1px solid ${C.borderHover}`,
    color: C.text1, fontSize: 15, fontWeight: 500, cursor: "pointer",
    textDecoration: "none", fontFamily: "inherit", transition: "all .3s",
  };

  // ========== NOT FOUND ==========
  if (!isValid || !book) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 400, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: 96, height: 96, borderRadius: 24, background: "rgba(244,63,94,.06)", border: "1.5px solid rgba(244,63,94,.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "2rem", color: C.text1, marginBottom: 16 }}>Livro não encontrado</h1>
          <p style={{ color: C.text2, marginBottom: 40, lineHeight: 1.6 }}>
            O código <span style={{ color: C.purpleLight, fontFamily: "monospace", fontWeight: 600 }}>{bookId}</span> não existe no programa.
          </p>
          <Link href="/" style={{ ...btnPrimary, width: "auto" }}>← Voltar</Link>
        </div>
      </div>
    );
  }

  // ========== MAIN PAGE ==========
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Ambient */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: 350, background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${C.purpleGlow} 0%, transparent 100%)`, pointerEvents: "none", zIndex: 0 }} />

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(6,6,9,.8)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 720, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, color: C.text2, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Voltar
          </Link>
          <span style={{ fontSize: 12, fontFamily: "'Space Grotesk', monospace", fontWeight: 600, color: C.purpleLight, background: C.purpleGlow, border: `1px solid rgba(139,92,246,.2)`, padding: "6px 16px", borderRadius: 100 }}>{book.id}</span>
        </div>
      </header>

      <main style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 720, margin: "0 auto", padding: "44px 24px 80px" }}>

        {/* Book Info Card */}
        <div className="a-fade-up" style={{ marginBottom: 52 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.purple}, ${C.amber})`, opacity: .5 }} />
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: `linear-gradient(135deg, ${C.purpleGlow}, rgba(139,92,246,.04))`, border: `1.5px solid rgba(139,92,246,.15)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.purpleLight} strokeWidth="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "clamp(1.4rem, 4vw, 1.9rem)", color: C.text1, marginBottom: 4, letterSpacing: "-.02em" }}>{book.titulo}</h1>
                <p style={{ fontSize: 15, color: C.text2 }}>{book.autor}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: C.green, background: "rgba(34,197,94,.06)", border: "1px solid rgba(34,197,94,.12)", padding: "6px 14px", borderRadius: 100 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, boxShadow: `0 0 8px ${C.green}` }} />
                    {book.status}
                  </span>
                  <span style={{ fontSize: 13, color: C.text3 }}>{logs.length} {logs.length === 1 ? "registro" : "registros"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        {!loadingLogs && logs.length > 0 && (
          <div className="a-fade-up d1" style={{ marginBottom: 52 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.amberLight} strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              </div>
              <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "1.2rem", color: C.text1 }}>Linha do Tempo</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {logs.map((log, i) => (
                <div key={log.id} className="a-slide-in" style={{ position: "relative", paddingLeft: 36, paddingBottom: 24, animationDelay: `${i * .08}s` }}>
                  {i < logs.length - 1 && <div style={{ position: "absolute", left: 7, top: 22, bottom: 0, width: 2, background: `linear-gradient(180deg, rgba(139,92,246,.25), rgba(139,92,246,.03))` }} />}
                  <div style={{ position: "absolute", left: 0, top: 4, width: 16, height: 16, borderRadius: "50%", background: C.purple, border: `3px solid ${C.bg}`, boxShadow: `0 0 12px ${C.purpleGlow}` }} />
                  <div style={{ background: "rgba(17,17,20,.7)", backdropFilter: "blur(8px)", border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: C.purpleLight, background: C.purpleGlow, padding: "3px 10px", borderRadius: 6 }}>#{i + 1}</span>
                      <span style={{ fontSize: 12, color: C.text2 }}>📍 {log.cidade}, {log.bairro}</span>
                      <span style={{ fontSize: 11, color: C.text3, marginLeft: "auto" }}>
                        {log.timestamp.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.7, fontStyle: "italic" }}>&ldquo;{log.aprendizado}&rdquo;</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map */}
        {logs.length > 0 && (
          <div className="a-fade-up d2" style={{ marginBottom: 52 }}>
            <button onClick={() => setShowMap(!showMap)} style={{ ...btnGhost, width: "100%" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>
              {showMap ? "Ocultar Mapa" : "🗺️ Ver Mapa da Jornada"}
            </button>
            {showMap && (
              <div className="a-scale-up" style={{ marginTop: 20, borderRadius: 16, overflow: "hidden", border: `1px solid ${C.border}`, height: 420 }}>
                <MapComponent logs={logs} />
              </div>
            )}
          </div>
        )}

        {/* Form / Success */}
        {submitted ? (
          <div className="a-scale-up" style={{ textAlign: "center", padding: "72px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ position: "relative", width: 100, height: 100, marginBottom: 32 }}>
              <div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: `2px solid rgba(34,197,94,.15)`, animation: "pulseDot 2s ease-out infinite" }} />
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "rgba(34,197,94,.08)", border: `2px solid rgba(34,197,94,.15)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
            </div>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "1.8rem", color: C.text1, marginBottom: 14 }}>Registro salvo!</h2>
            <p style={{ color: C.text2, marginBottom: 40, maxWidth: 340, lineHeight: 1.7 }}>Obrigado! Agora passe o livro adiante e espalhe o conhecimento. 📖</p>
          </div>
        ) : (
          <div className="a-fade-up d3">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: C.purpleGlow, border: "1px solid rgba(139,92,246,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.purpleLight} strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              </div>
              <div>
                <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "1.2rem", color: C.text1 }}>Registrar Leitura</h2>
                <p style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>Compartilhe o que esse livro significou para você</p>
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.purple}, ${C.amber})`, opacity: .3 }} />
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
                  <div>
                    <label htmlFor="cidade" style={labelStyle}>Cidade *</label>
                    <input id="cidade" type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Ex: São Paulo" style={inputStyle} required />
                  </div>
                  <div>
                    <label htmlFor="bairro" style={labelStyle}>Bairro *</label>
                    <input id="bairro" type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Ex: Vila Mariana" style={inputStyle} required />
                  </div>
                </div>
                <div>
                  <label htmlFor="aprendizado" style={labelStyle}>O que você aprendeu? *</label>
                  <textarea id="aprendizado" value={aprendizado} onChange={(e) => setAprendizado(e.target.value)} placeholder="Compartilhe um insight, reflexão ou algo que marcou você..." style={{ ...inputStyle, minHeight: 130, resize: "vertical" as const, lineHeight: 1.6 }} required minLength={10} maxLength={500} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: C.text3 }}>Mínimo 10 caracteres</span>
                    <span style={{ fontSize: 11, fontFamily: "monospace", color: aprendizado.length > 450 ? C.amber : C.text3 }}>{aprendizado.length}/500</span>
                  </div>
                </div>
                {error && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 16, borderRadius: 12, background: "rgba(244,63,94,.04)", border: "1px solid rgba(244,63,94,.12)", color: "#fb7185", fontSize: 14 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    <p>{error}</p>
                  </div>
                )}
                <button type="submit" disabled={isSubmitting || !cidade || !bairro || !aprendizado} style={{ ...btnPrimary, opacity: isSubmitting || !cidade || !bairro || !aprendizado ? .4 : 1 }}>
                  {isSubmitting ? (
                    <><div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite" }} />Registrando...</>
                  ) : (
                    <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13" /><path d="M22 2L15 22 11 13 2 9l20-7z" /></svg>Enviar Registro</>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

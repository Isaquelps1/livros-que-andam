"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getBookById, isValidBookId } from "@/lib/books-data";
import { geocodeLocation } from "@/lib/geocoding";
import { db } from "@/lib/firebase";
import CidadeInput from "@/components/CidadeInput";
import BairroInput from "@/components/BairroInput";
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
    ? String((error as { code?: unknown }).code) : "";
  if (code === "permission-denied") return "Sem permissão para salvar. Confira as regras do Firestore.";
  if (code === "not-found") return "Firestore não encontrado. Verifique se foi criado no Firebase.";
  if (code === "unavailable") return "Firestore indisponível. Verifique sua conexão e tente novamente.";
  if (code === "invalid-argument") return "Algum dado do formulário foi recusado pelo Firestore.";
  return "Erro ao salvar. Veja o console do navegador para detalhes.";
}

/* ---- Indicador de progresso 2 etapas ---- */
function FormProgress({ step }: { step: 1 | 2 }) {
  const steps = [
    { n: 1, label: "Localização" },
    { n: 2, label: "Aprendizado" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
      {steps.map((s, i) => {
        const active = s.n === step;
        const done = s.n < step;
        return (
          <Fragment key={s.n}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700,
                background: done ? "rgba(34,197,94,.12)" : active ? "rgba(139,92,246,.12)" : "rgba(255,255,255,.04)",
                border: `2px solid ${done ? C.green : active ? C.purple : "rgba(255,255,255,.08)"}`,
                color: done ? C.green : active ? C.purpleLight : C.text3,
                transition: "all .35s",
              }}>
                {done ? "✓" : s.n}
              </div>
              <span style={{
                fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
                color: done ? C.green : active ? C.text1 : C.text3,
                transition: "color .35s",
              }}>{s.label}</span>
            </div>
            {i === 0 && (
              <div style={{
                flex: 1, height: 2, borderRadius: 99, margin: "0 12px",
                background: step >= 2
                  ? `linear-gradient(90deg, ${C.purple}, ${C.green})`
                  : "rgba(255,255,255,.06)",
                transition: "background .5s",
              }} />
            )}
          </Fragment>
        );
      })}
    </div>
  );
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

  const cidadeConfirmed = cidade.length > 0;
  const bairroConfirmed = bairro.length > 0;
  const formStep: 1 | 2 = cidadeConfirmed ? 2 : 1;
  const canSubmit = !isSubmitting && cidadeConfirmed && bairroConfirmed && aprendizado.length >= 10;

  const loadLogs = useCallback(async () => {
    if (!isValid) return;
    try {
      const q = query(collection(db, "logs"), where("bookId", "==", bookId), orderBy("timestamp", "asc"));
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
    const timeout = window.setTimeout(() => { void loadLogs(); }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadLogs]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setIsSubmitting(true);
    try {
      const coords = await geocodeLocation(cidade, bairro);
      if (!coords) { setError("Endereço não encontrado. Verifique cidade e bairro."); setIsSubmitting(false); return; }
      await addDoc(collection(db, "logs"), {
        bookId, cidade: cidade.trim(), bairro: bairro.trim(),
        aprendizado: aprendizado.trim(), coordenadas: coords, timestamp: serverTimestamp(),
      });
      setSubmitted(true); setShowMap(true); await loadLogs();
    } catch (e) {
      console.error("Erro ao salvar registro:", e);
      setError(getSaveErrorMessage(e));
    } finally { setIsSubmitting(false); }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "15px 18px", background: "#18181b",
    border: "1.5px solid rgba(255,255,255,.07)", borderRadius: 12,
    color: C.text1, fontSize: 15, fontFamily: "inherit", outline: "none",
    transition: "border-color .2s, box-shadow .2s",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontWeight: 600, color: C.text2, marginBottom: 8, fontSize: 13, letterSpacing: ".01em",
  };
  const btnPrimary: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: 10, padding: "17px 40px", borderRadius: 14, border: "none",
    background: `linear-gradient(135deg, ${C.purple}, #7c3aed)`,
    color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer",
    textDecoration: "none", fontFamily: "inherit", width: "100%",
    minHeight: 52, transition: "opacity .2s, transform .15s",
  };
  const btnGhost: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: 10, padding: "15px 32px", borderRadius: 14,
    background: "transparent", border: `1px solid ${C.borderHover}`,
    color: C.text1, fontSize: 14, fontWeight: 500, cursor: "pointer",
    textDecoration: "none", fontFamily: "inherit", transition: "all .3s",
    minHeight: 48,
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
          <p style={{ color: C.text2, marginBottom: 40, lineHeight: 1.7 }}>
            O código <span style={{ color: C.purpleLight, fontFamily: "monospace", fontWeight: 600 }}>{bookId}</span> não existe no programa.
          </p>
          <Link href="/" style={{ ...btnPrimary, width: "auto", padding: "15px 32px" }}>← Voltar</Link>
        </div>
      </div>
    );
  }

  // ========== MAIN PAGE ==========
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Ambient glow */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: 350, background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${C.purpleGlow} 0%, transparent 100%)`, pointerEvents: "none", zIndex: 0 }} />

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(6,6,9,.85)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 720, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, color: C.text2, textDecoration: "none", fontSize: 14, fontWeight: 500, minHeight: 44, paddingRight: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Voltar
          </Link>
          <span style={{ fontSize: 12, fontFamily: "'Space Grotesk', monospace", fontWeight: 600, color: C.purpleLight, background: C.purpleGlow, border: `1px solid rgba(139,92,246,.2)`, padding: "6px 14px", borderRadius: 100 }}>{book.id}</span>
        </div>
      </header>

      <main style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 720, margin: "0 auto", padding: "36px 20px 72px" }}>

        {/* Book Info Card */}
        <div className="a-fade-up" style={{ marginBottom: 44 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: "28px 28px 24px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.purple}, ${C.amber})`, opacity: .5 }} />
            <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: `linear-gradient(135deg, ${C.purpleGlow}, rgba(139,92,246,.04))`, border: `1.5px solid rgba(139,92,246,.15)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.purpleLight} strokeWidth="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "clamp(1.25rem, 4vw, 1.75rem)", color: C.text1, marginBottom: 4, letterSpacing: "-.02em", lineHeight: 1.2 }}>{book.titulo}</h1>
                <p style={{ fontSize: 14, color: C.text2 }}>{book.autor}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 600, color: C.green, background: "rgba(34,197,94,.06)", border: "1px solid rgba(34,197,94,.12)", padding: "5px 12px", borderRadius: 100 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, boxShadow: `0 0 8px ${C.green}` }} />
                    {book.status}
                  </span>
                  {!loadingLogs && (
                    <span style={{ fontSize: 13, color: C.text3 }}>
                      {logs.length === 0 ? "Seja o primeiro a registrar" : `${logs.length} ${logs.length === 1 ? "registro" : "registros"}`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        {!loadingLogs && logs.length > 0 && (
          <div className="a-fade-up d1" style={{ marginBottom: 44 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(245,158,11,.08)", border: "1px solid rgba(245,158,11,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.amberLight} strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              </div>
              <div>
                <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "1.1rem", color: C.text1 }}>Linha do Tempo</h2>
                <p style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>{logs.length} {logs.length === 1 ? "parada" : "paradas"} registradas</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {logs.map((log, i) => (
                <div key={log.id} className="a-slide-in" style={{ position: "relative", paddingLeft: 32, paddingBottom: 20, animationDelay: `${i * .07}s` }}>
                  {i < logs.length - 1 && <div style={{ position: "absolute", left: 6, top: 20, bottom: 0, width: 2, background: `linear-gradient(180deg, rgba(139,92,246,.2), rgba(139,92,246,.02))` }} />}
                  <div style={{ position: "absolute", left: 0, top: 3, width: 14, height: 14, borderRadius: "50%", background: C.purple, border: `2.5px solid ${C.bg}`, boxShadow: `0 0 10px ${C.purpleGlow}` }} />
                  <div style={{ background: "rgba(17,17,20,.7)", backdropFilter: "blur(8px)", border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: C.purpleLight, background: C.purpleGlow, padding: "2px 8px", borderRadius: 6 }}>#{i + 1}</span>
                      <span style={{ fontSize: 12, color: C.text2 }}>📍 {log.cidade}, {log.bairro}</span>
                      <span style={{ fontSize: 11, color: C.text3, marginLeft: "auto" }}>
                        {log.timestamp.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.7, fontStyle: "italic" }}>&ldquo;{log.aprendizado}&rdquo;</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map Toggle */}
        {logs.length > 0 && (
          <div className="a-fade-up d2" style={{ marginBottom: 44 }}>
            <button onClick={() => setShowMap(!showMap)} style={{ ...btnGhost, width: "100%" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>
              {showMap ? "Ocultar Mapa" : "Ver Mapa da Jornada"}
            </button>
            {showMap && (
              <div className="a-scale-up" style={{ marginTop: 16, borderRadius: 16, overflow: "hidden", border: `1px solid ${C.border}`, height: 380 }}>
                <MapComponent logs={logs} />
              </div>
            )}
          </div>
        )}

        {/* Form / Success */}
        {submitted ? (
          /* ---- SUCCESS STATE ---- */
          <div className="a-fade-up" style={{ textAlign: "center", padding: "60px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div className="success-pop" style={{ position: "relative", width: 96, height: 96, marginBottom: 28 }}>
              <div style={{ position: "absolute", inset: -10, borderRadius: "50%", border: `2px solid rgba(34,197,94,.12)`, animation: "pulseDot 2s ease-out infinite" }} />
              <div style={{ position: "absolute", inset: -4, borderRadius: "50%", border: `1px solid rgba(34,197,94,.08)`, animation: "pulseDot 2s .4s ease-out infinite" }} />
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "rgba(34,197,94,.08)", border: `2px solid rgba(34,197,94,.2)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline className="check-draw" points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "1.75rem", color: C.text1, marginBottom: 12, letterSpacing: "-.02em" }}>Registro salvo!</h2>
            <p style={{ color: C.text2, marginBottom: 8, maxWidth: 320, lineHeight: 1.75, fontSize: 15 }}>
              Sua passagem ficou marcada na história desse exemplar.
            </p>
            <p style={{ color: C.text3, fontSize: 13, marginBottom: 36 }}>Agora passe o livro adiante. 📖</p>
            {showMap && (
              <div style={{ width: "100%", borderRadius: 16, overflow: "hidden", border: `1px solid ${C.border}`, height: 300, marginBottom: 32 }}>
                <MapComponent logs={logs} />
              </div>
            )}
            <Link href="/" style={{ ...btnGhost, width: "auto" }}>← Voltar ao início</Link>
          </div>
        ) : (
          /* ---- FORM ---- */
          <div className="a-fade-up d3">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: C.purpleGlow, border: "1px solid rgba(139,92,246,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.purpleLight} strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              </div>
              <div>
                <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "1.15rem", color: C.text1 }}>Registrar Leitura</h2>
                <p style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>Compartilhe o que esse livro significou para você</p>
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: "28px 24px", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.purple}, ${C.amber})`, opacity: .3, borderTopLeftRadius: 20, borderTopRightRadius: 20 }} />

              <FormProgress step={formStep} />

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 0 }}>

                {/* Seção 1 — Localização */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 16 }}>📍</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: formStep === 1 ? C.text1 : C.text3, letterSpacing: ".01em", transition: "color .3s" }}>
                      Onde você está?
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                    <div>
                      <label style={labelStyle}>Cidade <span style={{ color: C.purple }}>*</span></label>
                      <CidadeInput value={cidade} onChange={setCidade} inputStyle={inputStyle} confirmed={cidadeConfirmed} />
                    </div>
                    <div>
                      <label style={labelStyle}>Bairro <span style={{ color: C.purple }}>*</span></label>
                      <BairroInput value={bairro} onChange={setBairro} cidade={cidade} inputStyle={inputStyle} confirmed={bairroConfirmed} />
                    </div>
                  </div>
                  {/* Hint when not confirmed */}
                  {!cidadeConfirmed && !bairroConfirmed && (
                    <p style={{ fontSize: 11, color: C.text3, marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12.01" y2="16"/><line x1="12" y1="8" x2="12" y2="12"/></svg>
                      Selecione a cidade e o bairro a partir das sugestões para que possam ser localizados no mapa.
                    </p>
                  )}
                </div>

                {/* Seção 2 — Aprendizado */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 16 }}>✍️</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: formStep === 2 ? C.text1 : C.text3, letterSpacing: ".01em", transition: "color .3s" }}>
                      O que aprendeu?
                    </span>
                  </div>
                  <div>
                    <label style={labelStyle}>Seu aprendizado <span style={{ color: C.purple }}>*</span></label>
                    <textarea
                      value={aprendizado}
                      onChange={(e) => setAprendizado(e.target.value)}
                      placeholder="Compartilhe um insight, reflexão ou algo que marcou você nessa leitura..."
                      style={{ ...inputStyle, minHeight: 130, resize: "vertical" as const, lineHeight: 1.65 }}
                      required minLength={10} maxLength={500}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, alignItems: "center" }}>
                      <span style={{
                        fontSize: 11, color: aprendizado.length < 10 && aprendizado.length > 0 ? C.amber : C.text3,
                        transition: "color .2s",
                      }}>
                        {aprendizado.length < 10 && aprendizado.length > 0
                          ? `Faltam ${10 - aprendizado.length} caracteres`
                          : "Mínimo 10 caracteres"}
                      </span>
                      <span style={{ fontSize: 11, fontFamily: "monospace", color: aprendizado.length > 450 ? C.amber : C.text3 }}>
                        {aprendizado.length}/500
                      </span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 12, background: "rgba(244,63,94,.04)", border: "1px solid rgba(244,63,94,.1)", color: "#fb7185", fontSize: 14, marginBottom: 20 }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    <p>{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  style={{ ...btnPrimary, opacity: !canSubmit ? .4 : 1, transform: "none" }}
                >
                  {isSubmitting ? (
                    <>
                      <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13" /><path d="M22 2L15 22 11 13 2 9l20-7z" /></svg>
                      Enviar Registro
                    </>
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

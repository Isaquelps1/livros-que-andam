import Link from "next/link";
import { INITIAL_BOOKS } from "@/lib/books-data";

/* ---- Color Tokens ---- */
const C = {
  bg: "#060609",
  surface: "#0c0c10",
  card: "#111114",
  cardHover: "#161619",
  border: "rgba(255,255,255,.06)",
  borderHover: "rgba(255,255,255,.12)",
  borderAccent: "rgba(139,92,246,.2)",
  text1: "#fafafa",
  text2: "#a1a1aa",
  text3: "#52525b",
  purple: "#8b5cf6",
  purpleLight: "#a78bfa",
  purpleGlow: "rgba(139,92,246,.15)",
  amber: "#f59e0b",
  amberLight: "#fbbf24",
  amberGlow: "rgba(245,158,11,.12)",
  teal: "#2dd4bf",
  tealGlow: "rgba(45,212,191,.1)",
  green: "#22c55e",
  red: "#f43f5e",
};

/* ---- Shared Inline Styles ---- */
const S = {
  badge: {
    display: "inline-flex", alignItems: "center", gap: 10,
    padding: "10px 22px", borderRadius: 100,
    background: "rgba(12,12,16,.8)", backdropFilter: "blur(20px)",
    border: `1px solid ${C.border}`, fontSize: 13, fontWeight: 600,
    color: C.amberLight, letterSpacing: ".01em",
  } as React.CSSProperties,
  btnPrimary: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: 10, padding: "17px 40px", borderRadius: 14, border: "none",
    background: `linear-gradient(135deg, ${C.purple}, #7c3aed)`,
    color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer",
    textDecoration: "none", transition: "all .35s cubic-bezier(.4,0,.2,1)",
    fontFamily: "inherit", position: "relative" as const, overflow: "hidden" as const,
  } as React.CSSProperties,
  btnGhost: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: 10, padding: "17px 40px", borderRadius: 14,
    background: "transparent", border: `1px solid ${C.borderHover}`,
    color: C.text1, fontSize: 15, fontWeight: 500, cursor: "pointer",
    textDecoration: "none", transition: "all .3s ease", fontFamily: "inherit",
  } as React.CSSProperties,
  sectionBadge: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "8px 18px", borderRadius: 100,
    background: C.card, border: `1px solid ${C.border}`,
    fontSize: 11, fontWeight: 700, letterSpacing: ".14em",
    textTransform: "uppercase" as const, marginBottom: 20,
  } as React.CSSProperties,
  card: {
    background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 16, padding: 24, textDecoration: "none",
    display: "block", transition: "all .4s cubic-bezier(.4,0,.2,1)",
    cursor: "pointer",
  } as React.CSSProperties,
  stepCircle: (color: string, glow: string) => ({
    width: 80, height: 80, borderRadius: "50%",
    background: glow, border: `2px solid ${color}33`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 36, flexShrink: 0, margin: "0 auto 28px",
    transition: "transform .3s", boxShadow: `0 0 40px ${glow}`,
  } as React.CSSProperties),
  bookNum: {
    width: 50, height: 50, borderRadius: "50%",
    background: `linear-gradient(135deg, ${C.purpleGlow}, rgba(139,92,246,.04))`,
    border: `1.5px solid ${C.borderAccent}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 13, fontWeight: 700, color: C.purpleLight,
    fontFamily: "'Space Grotesk', monospace", flexShrink: 0,
    transition: "all .35s",
  } as React.CSSProperties,
};

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>

      {/* ========== HERO ========== */}
      <section style={{
        position: "relative", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        minHeight: "100vh", padding: "80px 24px", overflow: "hidden",
      }}>
        {/* Grid background */}
        <div style={{
          position: "absolute", inset: 0, opacity: .4,
          backgroundImage: "linear-gradient(rgba(139,92,246,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }} />

        {/* Glow orbs */}
        <div className="a-float1" style={{ position: "absolute", top: "-8%", left: "8%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${C.purpleGlow} 0%, transparent 65%)`, filter: "blur(40px)", pointerEvents: "none" }} />
        <div className="a-float2" style={{ position: "absolute", bottom: "-10%", right: "5%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${C.amberGlow} 0%, transparent 65%)`, filter: "blur(50px)", pointerEvents: "none" }} />
        <div className="a-float1" style={{ position: "absolute", top: "30%", right: "18%", width: 250, height: 250, borderRadius: "50%", background: `radial-gradient(circle, ${C.tealGlow} 0%, transparent 65%)`, filter: "blur(30px)", pointerEvents: "none" }} />

        {/* Orbiting particles */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }}>
          <div style={{ animation: "orbit1 30s linear infinite" }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.purpleLight, opacity: .5 }} />
          </div>
        </div>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }}>
          <div style={{ animation: "orbit2 40s linear infinite" }}>
            <div style={{ width: 3, height: 3, borderRadius: "50%", background: C.amberLight, opacity: .3 }} />
          </div>
        </div>

        {/* Content */}
        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", maxWidth: 820 }}>

          {/* Status Badge */}
          <div className="a-fade-up">
            <span style={S.badge}>
              <span style={{ position: "relative", width: 10, height: 10 }}>
                <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: C.green, animation: "pulseDot 1.5s ease-out infinite" }} />
                <span style={{ position: "relative", display: "block", width: 10, height: 10, borderRadius: "50%", background: C.green }} />
              </span>
              15 livros viajando pelo Brasil
            </span>
          </div>

          {/* Title */}
          <h1 className="a-fade-up d2" style={{
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
            fontSize: "clamp(3.2rem, 9vw, 6rem)", letterSpacing: "-.04em",
            lineHeight: 1.05, margin: "40px 0 28px", color: C.text1,
          }}>
            Cada livro é<br />
            <span style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #f97316 30%, #ef4444 55%, #a855f7 80%, #8b5cf6 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>uma jornada</span>
          </h1>

          {/* Subtitle */}
          <p className="a-fade-up d3" style={{ fontSize: "clamp(1.05rem, 2.5vw, 1.3rem)", color: C.text2, lineHeight: 1.75, maxWidth: 520, marginBottom: 52 }}>
            Escaneie o QR Code. Registre sua história.<br />
            Veja o caminho que cada livro percorre pelo Brasil.
          </p>

          {/* CTAs */}
          <div className="a-fade-up d4" style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
            <Link href="#livros" style={S.btnPrimary}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
              Explorar Livros
            </Link>
            <Link href="#como-funciona" style={S.btnGhost}>
              Como Funciona?
            </Link>
          </div>

          {/* Stats */}
          <div className="a-fade-up d6" style={{ marginTop: 88, display: "flex", alignItems: "center", gap: 0 }}>
            {[
              { val: "15", label: "Livros", gradient: `linear-gradient(135deg, ${C.purple}, ${C.purpleLight})` },
              { val: "∞", label: "Leitores", gradient: `linear-gradient(135deg, ${C.amber}, #f97316)` },
              { val: "🗺️", label: "Mapa Vivo", gradient: "none" },
            ].map((stat, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && <div style={{ width: 1, height: 48, background: "rgba(255,255,255,.06)", margin: "0 32px" }} />}
                <div style={{ textAlign: "center", minWidth: 80 }}>
                  <p style={{
                    fontFamily: "'Space Grotesk'", fontWeight: 700,
                    fontSize: "2.8rem", lineHeight: 1.1,
                    ...(stat.gradient !== "none" ? { background: stat.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } : {}),
                    animation: "countUp .6s ease both",
                    animationDelay: `${.8 + i * .15}s`,
                  }}>{stat.val}</p>
                  <p style={{ fontSize: 10, color: C.text3, textTransform: "uppercase", letterSpacing: ".18em", fontWeight: 700, marginTop: 6 }}>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="a-bounce" style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 9, color: C.text3, textTransform: "uppercase", letterSpacing: ".25em", fontWeight: 600 }}>Scroll</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
        </div>
      </section>

      {/* ========== COMO FUNCIONA ========== */}
      <section id="como-funciona" style={{ position: "relative", padding: "120px 24px", display: "flex", justifyContent: "center" }}>
        {/* Divider */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${C.purpleGlow}, transparent)` }} />

        <div style={{ width: "100%", maxWidth: 1040 }}>
          <div style={{ textAlign: "center", marginBottom: 80, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ ...S.sectionBadge, color: C.teal }}>
              ⚡ Em 3 passos simples
            </span>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "clamp(2rem, 5vw, 3.4rem)", letterSpacing: "-.03em", color: C.text1 }}>
              Como funciona?
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {[
              { emoji: "📱", title: "Escaneie o QR Code", desc: "Cada livro tem um adesivo com QR Code único. Aponte a câmera e acesse instantaneamente.", color: C.purple, glow: C.purpleGlow },
              { emoji: "✍️", title: "Registre sua Jornada", desc: "Informe sua cidade, bairro e compartilhe o que aprendeu. Sem login, sem fricção.", color: C.amber, glow: C.amberGlow },
              { emoji: "🗺️", title: "Veja no Mapa", desc: "Visualize a rota completa do livro pelo Brasil. Cada ponto é um leitor, uma história.", color: C.teal, glow: C.tealGlow },
            ].map((step, i) => (
              <div key={i} className="a-border-glow" style={{
                background: C.card, borderRadius: 24, padding: 36, textAlign: "center",
                border: `1px solid ${C.border}`, transition: "all .4s",
                position: "relative", overflow: "hidden",
              }}>
                {/* Top accent line */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${step.color}, transparent)`, opacity: .4 }} />
                <div style={S.stepCircle(step.color, step.glow)}>{step.emoji}</div>
                <h3 style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: "1.15rem", color: C.text1, marginBottom: 12, letterSpacing: "-.01em" }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.75 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== LIVROS ========== */}
      <section id="livros" style={{ position: "relative", padding: "120px 24px", display: "flex", justifyContent: "center" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${C.amberGlow}, transparent)` }} />
        {/* Ambient glow */}
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 600, height: 300, background: `radial-gradient(ellipse, ${C.amberGlow} 0%, transparent 70%)`, pointerEvents: "none", filter: "blur(40px)" }} />

        <div style={{ width: "100%", maxWidth: 1120 }}>
          <div style={{ textAlign: "center", marginBottom: 72, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ ...S.sectionBadge, color: C.purpleLight }}>📚 Catálogo</span>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "clamp(2rem, 5vw, 3.4rem)", letterSpacing: "-.03em", color: C.text1, marginBottom: 16 }}>
              Nossos Viajantes
            </h2>
            <p style={{ fontSize: 15, color: C.text2, maxWidth: 480, lineHeight: 1.7 }}>
              Cada exemplar é um aventureiro. Toque em um livro para ver sua jornada pelo Brasil.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 14 }}>
            {INITIAL_BOOKS.map((book) => (
              <Link key={book.id} href={`/livro/${book.id}`} style={S.card}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={S.bookNum}>{book.id.split("-")[1]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: C.text1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{book.titulo}</h3>
                    <p style={{ fontSize: 13, color: C.text3, marginTop: 3 }}>{book.autor}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth="2" style={{ flexShrink: 0, transition: "all .3s" }}>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CALL TO ACTION ========== */}
      <section style={{ position: "relative", padding: "100px 24px", display: "flex", justifyContent: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 50% 60% at 50% 50%, ${C.purpleGlow} 0%, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "relative", textAlign: "center", maxWidth: 600, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <p style={{ fontSize: 48, marginBottom: 24 }}>📖</p>
          <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "clamp(1.8rem, 4vw, 2.6rem)", letterSpacing: "-.02em", color: C.text1, marginBottom: 16, lineHeight: 1.2 }}>
            Cada página lida é um passo na jornada
          </h2>
          <p style={{ fontSize: 15, color: C.text2, lineHeight: 1.7, marginBottom: 40 }}>
            O conhecimento não tem destino final. Ele se multiplica a cada leitor. Faça parte dessa história.
          </p>
          <Link href="#livros" style={S.btnPrimary}>
            Começar Agora
          </Link>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer style={{ padding: "52px 24px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.purpleGlow, border: `1px solid ${C.borderAccent}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.purpleLight} strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
            </div>
            <span style={{
              fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "1.1rem",
              background: `linear-gradient(135deg, ${C.purple}, ${C.purpleLight})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Jornada do Livro</span>
          </div>
          <p style={{ fontSize: 13, color: C.text3, marginBottom: 6 }}>Um projeto de incentivo à leitura colaborativa.</p>
          <p style={{ fontSize: 11, color: "rgba(82,82,91,.6)" }}>© 2026 SENAI — Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

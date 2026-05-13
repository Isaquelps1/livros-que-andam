"use client";

import { useEffect, useState } from "react";
import ParticleField from "@/components/ParticleField";

const C = {
  bg: "#060609",
  card: "#111114",
  cardSoft: "rgba(17,17,20,.72)",
  border: "rgba(255,255,255,.06)",
  borderHover: "rgba(255,255,255,.12)",
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
};

const journey = [
  {
    icon: "📚",
    title: "Livro em circulação",
    label: "Partida",
    desc: "Cada exemplar começa com um QR Code próprio. A jornada só abre pelo código daquele livro.",
    color: C.purple,
    glow: C.purpleGlow,
  },
  {
    icon: "📱",
    title: "Leitor encontra o QR",
    label: "Encontro",
    desc: "Quem está com o livro acessa a página correta pelo celular, sem precisar procurar o ID na home.",
    color: C.amber,
    glow: C.amberGlow,
  },
  {
    icon: "✍️",
    title: "Registro da leitura",
    label: "Memória",
    desc: "Cidade, bairro e aprendizado viram um novo ponto na linha do tempo do exemplar.",
    color: C.teal,
    glow: C.tealGlow,
  },
  {
    icon: "🗺️",
    title: "Mapa ganha um ponto",
    label: "Rastro",
    desc: "A rota cresce conforme o livro passa de mão em mão e acumula histórias.",
    color: C.green,
    glow: "rgba(34,197,94,.12)",
  },
];

const readerSignals = [
  {
    id: "SENAI-001",
    city: "São Paulo",
    action: "QR lido agora",
    note: "O leitor registrou uma nova passagem e deixou um aprendizado curto.",
    color: C.amber,
  },
  {
    id: "SENAI-008",
    city: "Campinas",
    action: "Novo ponto no mapa",
    note: "O livro saiu da biblioteca e ganhou uma parada fora da escola.",
    color: C.teal,
  },
  {
    id: "SENAI-015",
    city: "Jundiaí",
    action: "Leitura finalizada",
    note: "A próxima pessoa já pode continuar a rota pelo QR do exemplar.",
    color: C.green,
  },
];

const S = {
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 22px",
    borderRadius: 100,
    background: "rgba(12,12,16,.8)",
    backdropFilter: "blur(20px)",
    border: `1px solid ${C.border}`,
    fontSize: 13,
    fontWeight: 600,
    color: C.amberLight,
    letterSpacing: ".01em",
  } as React.CSSProperties,
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "17px 40px",
    borderRadius: 14,
    border: "none",
    background: `linear-gradient(135deg, ${C.purple}, #7c3aed)`,
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "none",
    transition: "all .35s cubic-bezier(.4,0,.2,1)",
    fontFamily: "inherit",
    minHeight: 52,
  } as React.CSSProperties,
  btnGhost: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "17px 40px",
    borderRadius: 14,
    background: "transparent",
    border: `1px solid ${C.borderHover}`,
    color: C.text1,
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    textDecoration: "none",
    transition: "all .3s ease",
    fontFamily: "inherit",
    minHeight: 52,
  } as React.CSSProperties,
  sectionBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 18px",
    borderRadius: 100,
    background: C.card,
    border: `1px solid ${C.border}`,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: ".14em",
    textTransform: "uppercase" as const,
    marginBottom: 20,
  } as React.CSSProperties,
};

export default function Home() {
  const [activeStep, setActiveStep] = useState(1);
  const [activeSignal, setActiveSignal] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [heroPointer, setHeroPointer] = useState({ x: 0.5, y: 0.5 });
  const active = journey[activeStep];
  const signal = readerSignals[activeSignal];

  useEffect(() => {
    let frame = 0;
    function updateScrollProgress() {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      setScrollProgress(Math.min(1, Math.max(0, progress)));
    }
    function requestUpdate() {
      if (frame) return;
      frame = requestAnimationFrame(updateScrollProgress);
    }
    updateScrollProgress();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSignal((current) => (current + 1) % readerSignals.length);
    }, 2800);
    return () => window.clearInterval(interval);
  }, []);

  const heroMotionStyle = {
    "--hero-tilt-x": `${(0.5 - heroPointer.y) * 8}deg`,
    "--hero-tilt-y": `${(heroPointer.x - 0.5) * 10}deg`,
    "--hero-drift": `${scrollProgress * 36}px`,
  } as React.CSSProperties;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>

      <div
        className="scroll-trace"
        style={{ "--trace-progress": `${scrollProgress * 100}%` } as React.CSSProperties}
        aria-hidden="true"
      >
        <div className="scroll-trace__track">
          <div className="scroll-trace__fill" />
          <div className="scroll-trace__traveler" />
        </div>
        {["Início", "Jornada", "QR", "Destino"].map((label, index) => {
          const pointProgress = index / 3;
          const isActive = scrollProgress + 0.04 >= pointProgress;
          return (
            <div key={label} className={`scroll-trace__point scroll-trace__point--${index + 1} ${isActive ? "is-active" : ""}`}>
              <span /><small>{label}</small>
            </div>
          );
        })}
      </div>

      <section
        className="hero-section"
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          setHeroPointer({
            x: (event.clientX - rect.left) / rect.width,
            y: (event.clientY - rect.top) / rect.height,
          });
        }}
        onPointerLeave={() => setHeroPointer({ x: 0.5, y: 0.5 })}
      >
        <ParticleField count={58} />

        <div style={{
          position: "absolute", inset: 0, opacity: .4,
          backgroundImage: "linear-gradient(rgba(139,92,246,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }} />

        <div className="hero-aurora hero-aurora--one" />
        <div className="hero-aurora hero-aurora--two" />

        <div className="hero-shell" style={heroMotionStyle}>
          <div className="hero-copy">
            <div className="a-fade-up">
              <span style={S.badge}>
                <span style={{ position: "relative", width: 10, height: 10 }}>
                  <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: C.green, animation: "pulseDot 1.5s ease-out infinite" }} />
                  <span style={{ position: "relative", display: "block", width: 10, height: 10, borderRadius: "50%", background: C.green }} />
                </span>
                Projeto ativo de leitura compartilhada
              </span>
            </div>

            <h1 className="a-fade-up d2" style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2.8rem, 8vw, 5.8rem)",
              letterSpacing: 0,
              lineHeight: 1.05,
              margin: "36px 0 28px",
              color: C.text1,
            }}>
              Cada livro é<br />
              <span style={{
                background: "linear-gradient(135deg, #f59e0b 0%, #f97316 30%, #ef4444 55%, #a855f7 80%, #8b5cf6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>uma jornada</span>
            </h1>

            <p className="a-fade-up d3" style={{ fontSize: "clamp(1rem, 2.5vw, 1.18rem)", color: C.text2, lineHeight: 1.8, maxWidth: 560, marginBottom: 42 }}>
              Cada exemplar carrega um QR Code único. Quem está com o livro escaneia, registra onde está e deixa sua marca na história daquele exemplar pelo Brasil.
            </p>

            <div className="a-fade-up d4 hero-buttons">
              <a href="#jornada" style={S.btnPrimary}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" /></svg>
                Ver Jornada
              </a>
              <a href="#como-funciona" style={S.btnGhost}>
                Como Funciona?
              </a>
            </div>

            <div className="a-fade-up d6 stats-row" style={{ marginTop: 66 }}>
              {[
                { val: "17", label: "Livros", gradient: `linear-gradient(135deg, ${C.purple}, ${C.purpleLight})` },
                { val: "∞", label: "Leitores", gradient: `linear-gradient(135deg, ${C.amber}, #f97316)` },
                { val: "AO VIVO", label: "Mapa Vivo", gradient: `linear-gradient(135deg, ${C.teal}, ${C.green})` },
              ].map((stat, i) => (
                <div key={stat.label} style={{ display: "flex", alignItems: "center" }}>
                  {i > 0 && <div className="stat-sep" style={{ width: 1, height: 48, background: "rgba(255,255,255,.06)", margin: "0 28px" }} />}
                  <div style={{ textAlign: "center", minWidth: 72 }}>
                    <p style={{
                      fontFamily: "'Space Grotesk'",
                      fontWeight: 700,
                      fontSize: stat.val === "AO VIVO" ? "clamp(1rem, 2.4vw, 1.45rem)" : "clamp(2rem, 5vw, 2.8rem)",
                      lineHeight: 1.1,
                      background: stat.gradient,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      animation: "countUp .6s ease both",
                      animationDelay: `${.8 + i * .15}s`,
                    }}>{stat.val}</p>
                    <p style={{ fontSize: 10, color: C.text3, textTransform: "uppercase", letterSpacing: ".18em", fontWeight: 700, marginTop: 6 }}>{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="hero-kinetic a-scale-up d5" aria-label="Prévia animada da jornada do livro">
            <div className="book-prop">
              <div className="book-prop__spine">SENAI-008</div>
              <div className="book-prop__cover">
                <span>Jornada</span>
                <strong>Livro<br />Vivo</strong>
                <small>QR único</small>
              </div>
            </div>

            <div className="qr-orbit-card">
              <div className="qr-orbit-card__code" aria-hidden="true">
                {Array.from({ length: 25 }).map((_, index) => (
                  <span key={index} className={(index + activeSignal) % 3 === 0 ? "is-lit" : ""} />
                ))}
              </div>
              <div>
                <strong>{signal.id}</strong>
                <span>{signal.action}</span>
              </div>
            </div>

            <div className="hero-live-card">
              <span className="hero-live-card__dot" style={{ background: signal.color }} />
              <small>{signal.city}</small>
              <strong>{signal.action}</strong>
              <p>{signal.note}</p>
            </div>

            <div className="trail-spark trail-spark--one" />
            <div className="trail-spark trail-spark--two" />
            <div className="trail-spark trail-spark--three" />
          </aside>
        </div>

        <div className="a-bounce" style={{ position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 9, color: C.text3, textTransform: "uppercase", letterSpacing: ".25em", fontWeight: 600 }}>Scroll</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
        </div>
      </section>

      <section id="jornada" style={{ position: "relative", padding: "100px 24px", display: "flex", justifyContent: "center" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${C.purpleGlow}, transparent)` }} />
        <div style={{ width: "100%", maxWidth: 1100 }}>
          <div style={{ textAlign: "center", marginBottom: 56, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ ...S.sectionBadge, color: C.teal }}>Jornada interativa</span>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "clamp(1.9rem, 5vw, 3.2rem)", letterSpacing: 0, color: C.text1 }}>
              Como o livro viaja pelo Brasil
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 24, alignItems: "stretch" }}>
            <div style={{ background: C.cardSoft, border: `1px solid ${C.border}`, borderRadius: 24, padding: "28px 28px 24px", position: "relative", overflow: "hidden", minHeight: 380 }}>
              <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 35%, ${active.glow} 0%, transparent 55%)`, pointerEvents: "none" }} />
              <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 24 }}>
                <div>
                  <span style={{ color: active.color, fontSize: 11, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase" }}>{active.label}</span>
                  <h3 style={{ fontFamily: "'Space Grotesk'", color: C.text1, fontSize: "clamp(1.6rem, 4vw, 2.6rem)", lineHeight: 1.1, letterSpacing: 0, marginTop: 12 }}>{active.title}</h3>
                  <p style={{ color: C.text2, lineHeight: 1.75, marginTop: 14, maxWidth: 420, fontSize: 15 }}>{active.desc}</p>
                </div>

                <div className="journey-grid-4">
                  {journey.map((step, index) => (
                    <button
                      key={step.title}
                      type="button"
                      onClick={() => setActiveStep(index)}
                      aria-label={step.title}
                      className="journey-mini-button"
                      style={{
                        border: `1px solid ${index === activeStep ? step.color : C.border}`,
                        background: index === activeStep ? step.glow : "rgba(255,255,255,.025)",
                        color: C.text1,
                      }}
                    >
                      <span style={{ fontSize: 22 }}>{step.icon}</span>
                      <span style={{ fontSize: 11, color: index === activeStep ? C.text1 : C.text3, fontWeight: 700 }}>{String(index + 1).padStart(2, "0")}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, padding: 24, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
              {journey.map((step, index) => {
                const isActive = index === activeStep;
                const isDone = index < activeStep;
                return (
                  <button
                    key={step.title}
                    type="button"
                    onClick={() => setActiveStep(index)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "52px 1fr",
                      gap: 14,
                      textAlign: "left",
                      alignItems: "center",
                      background: isActive ? "rgba(255,255,255,.04)" : "transparent",
                      border: `1px solid ${isActive ? step.color : "transparent"}`,
                      borderRadius: 16,
                      padding: "14px 16px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all .25s ease",
                      minHeight: 64,
                    }}
                  >
                    <span style={{
                      width: 48, height: 48, borderRadius: 14,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: isActive || isDone ? step.glow : "rgba(255,255,255,.025)",
                      border: `1px solid ${isActive ? step.color : C.border}`,
                      fontSize: 22, flexShrink: 0,
                    }}>{step.icon}</span>
                    <span>
                      <span style={{ display: "block", color: C.text1, fontWeight: 700, fontSize: 14 }}>{step.title}</span>
                      <span style={{ display: "block", color: C.text3, fontSize: 12, marginTop: 3 }}>{step.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" style={{ position: "relative", padding: "100px 24px", display: "flex", justifyContent: "center" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${C.amberGlow}, transparent)` }} />
        <div style={{ width: "100%", maxWidth: 1040 }}>
          <div style={{ textAlign: "center", marginBottom: 64, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ ...S.sectionBadge, color: C.purpleLight }}>Se você está com o livro</span>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "clamp(1.9rem, 5vw, 3.2rem)", letterSpacing: 0, color: C.text1 }}>
              Três passos simples
            </h2>
            <p style={{ fontSize: 15, color: C.text2, marginTop: 16, maxWidth: 460, lineHeight: 1.7 }}>
              Registrar sua passagem leva menos de dois minutos.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 20 }}>
            {journey.slice(1).map((step, i) => (
              <div key={step.title} className="a-border-glow" style={{
                background: C.card,
                borderRadius: 24,
                padding: "36px 32px 32px",
                border: `1px solid ${C.border}`,
                transition: "all .4s",
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${step.color}, transparent)`, opacity: .45 }} />

                <div style={{
                  position: "absolute", top: 20, right: 20,
                  fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: 11,
                  color: step.color, letterSpacing: ".12em",
                  background: `${step.glow}`,
                  border: `1px solid ${step.color}22`,
                  padding: "4px 10px", borderRadius: 8,
                }}>0{i + 1}</div>

                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: step.glow, border: `2px solid ${step.color}33`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 34, margin: "0 auto 24px",
                  boxShadow: `0 0 32px ${step.glow}`,
                }}>{step.icon}</div>

                <h3 style={{ fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: "1.1rem", color: C.text1, marginBottom: 10, letterSpacing: 0, textAlign: "center" }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.8, textAlign: "center" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ position: "relative", padding: "80px 24px 100px", display: "flex", justifyContent: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 50% 70% at 50% 50%, ${C.purpleGlow} 0%, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "relative", width: "100%", maxWidth: 640, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{
            width: "100%", textAlign: "center",
            background: C.cardSoft, border: `1px solid ${C.borderHover}`,
            borderRadius: 28, padding: "52px 40px",
            backdropFilter: "blur(20px)",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.purple}, ${C.amber}, ${C.teal})`, opacity: .4 }} />

            <p style={{ fontSize: 44, marginBottom: 20, lineHeight: 1 }}>📖</p>
            <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "clamp(1.6rem, 4vw, 2.2rem)", letterSpacing: 0, color: C.text1, marginBottom: 14, lineHeight: 1.25 }}>
              O próximo ponto da jornada<br />depende de você
            </h2>
            <p style={{ fontSize: 15, color: C.text2, lineHeight: 1.75, maxWidth: 420, margin: "0 auto" }}>
              Recebeu um exemplar? O QR Code no livro vai direto para a página dele. Registre onde você está e deixe sua marca na história desse livro.
            </p>
          </div>
        </div>
      </section>

      <footer style={{ padding: "48px 24px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.purpleGlow, border: `1px solid rgba(139,92,246,.2)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
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

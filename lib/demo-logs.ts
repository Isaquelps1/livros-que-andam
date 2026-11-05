import type { LogEntry } from "@/components/BookMap";

// Pontos demonstrativos para apresentações do mapa geral. Não são gravados no Firestore.
const locations = [
  ["Ipatinga", "Centro", -19.4792, -42.5177],
  ["Ipatinga", "Horto", -19.4932, -42.5140],
  ["Ipatinga", "Cidade Nobre", -19.4861, -42.5307],
  ["Ipatinga", "Iguaçu", -19.4740, -42.5260],
  ["Ipatinga", "Canaã", -19.4644, -42.5290],
  ["Ipatinga", "Veneza", -19.4660, -42.5152],
  ["Ipatinga", "Bethânia", -19.4910, -42.5430],
  ["Ipatinga", "Cariru", -19.4930, -42.5050],
  ["Ipatinga", "Bom Retiro", -19.4950, -42.5270],
  ["Coronel Fabriciano", "Centro", -19.5182, -42.6284],
  ["Coronel Fabriciano", "Melo Viana", -19.5060, -42.6240],
  ["Coronel Fabriciano", "Santa Helena", -19.5100, -42.6350],
  ["Coronel Fabriciano", "Caladinho", -19.5260, -42.6150],
] as const;

const learningStarts = [
  "Curti bastante essa parte",
  "Foi fácil de entender",
  "Me fez pensar um pouco",
  "Gostei mais do final",
  "Aprendi uma coisa nova hoje",
  "Essa ideia ficou na cabeça",
  "Foi uma leitura bem tranquila",
  "Quero tentar fazer isso também",
  "Não esperava que fosse assim",
  "A história prende bastante",
  "Li rápido porque gostei",
  "Essa parte foi a melhor",
  "O começo já chamou atenção",
  "Fiquei curioso até o fim",
  "Foi diferente do que imaginei",
  "Algumas frases marcaram",
  "Valeu a leitura",
];

const learningEndings = [
  "e gostei da ideia.",
  "e fiquei pensando nisso.",
  "principalmente pelo exemplo.",
  "mais do que eu esperava.",
  "e deu vontade de continuar.",
  "essa foi a parte mais legal.",
  "vou lembrar disso depois.",
  "não tinha pensado desse jeito.",
];

export const DEMO_LOGS: LogEntry[] = Array.from({ length: 17 }, (_, bookIndex) => {
  const bookId = `SENAI-${String(bookIndex + 1).padStart(3, "0")}`;
  const count = 5 + (bookIndex % 4);
  return Array.from({ length: count }, (_, pointIndex) => {
    const location = locations[(bookIndex * 2 + pointIndex) % locations.length];
    const [cidade, bairro, lat, lng] = location;
    const nudge = ((bookIndex + pointIndex) % 3 - 1) * 0.0012;
    return {
      id: `demo-${bookId}-${pointIndex + 1}`,
      bookId,
      cidade,
      bairro,
      aprendizado: `${learningStarts[bookIndex]} ${learningEndings[pointIndex]}`,
      coordenadas: { lat: lat + nudge, lng: lng - nudge },
      timestamp: new Date(Date.UTC(2026, 1, 3 + bookIndex, 10 + pointIndex, 15)),
      isDemo: true,
    };
  });
}).flat();

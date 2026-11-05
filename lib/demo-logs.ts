import type { LogEntry } from "@/components/BookMap";

// Pontos demonstrativos para apresentações do mapa geral. Não são gravados no Firestore.
const locations = [
  ["Ipatinga", "Centro", -19.4785657, -42.5251567],
  ["Ipatinga", "Horto", -19.5055418, -42.5712715],
  ["Ipatinga", "Cidade Nobre", -19.4645300, -42.5587046],
  ["Ipatinga", "Canaã", -19.4512180, -42.5511226],
  ["Ipatinga", "Veneza", -19.4677789, -42.5260227],
  ["Ipatinga", "Cariru", -19.4915630, -42.5268045],
  ["Ipatinga", "Bethânia", -19.4355359, -42.5529457],
  ["Ipatinga", "Bom Retiro", -19.5072095, -42.5598147],
  ["Coronel Fabriciano", "Centro", -19.5289778, -42.6250667],
  ["Coronel Fabriciano", "São Domingos", -19.4998230, -42.6370021],
  ["Coronel Fabriciano", "Nossa Senhora do Carmo", -19.5265842, -42.6272685],
  ["Coronel Fabriciano", "São Cristóvão", -19.4779021, -42.6347826],
] as const;

const learningStarts = [
  "Curti bastante o livro",
  "Foi fácil de entender",
  "Me fez pensar um pouco",
  "Gostei mais do final",
  "Aprendi uma coisa nova hoje",
  "A ideia ficou na cabeça",
  "Foi uma leitura bem tranquila",
  "Quero tentar fazer isso também",
  "Não esperava que fosse assim",
  "A história prende bastante",
  "Li rápido porque gostei",
  "O melhor foi o final",
  "O começo já chamou atenção",
  "Fiquei curioso até o fim",
  "Foi diferente do que imaginei",
  "Algumas frases ficaram",
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
    const nudge = ((bookIndex + pointIndex) % 3 - 1) * 0.00012;
    return {
      id: `demo-${bookId}-${pointIndex + 1}`,
      bookId,
      cidade,
      bairro,
      aprendizado: (bookIndex * 8 + pointIndex) % 5 < 2
        ? ""
        : `${learningStarts[bookIndex]} ${learningEndings[pointIndex]}`,
      coordenadas: { lat: lat + nudge, lng: lng - nudge },
      timestamp: new Date(Date.UTC(2026, 1, 3 + bookIndex, 10 + pointIndex, 15)),
      isDemo: true,
    };
  });
}).flat();

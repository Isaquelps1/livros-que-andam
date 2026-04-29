// Dados dos 15 livros iniciais do programa SENAI
// Os títulos e autores podem ser atualizados posteriormente via Firebase
export interface Book {
  id: string;
  titulo: string;
  autor: string;
  status: "em circulação" | "disponível" | "retirado";
}

export const INITIAL_BOOKS: Book[] = [
  { id: "SENAI-001", titulo: "O Pequeno Príncipe", autor: "Antoine de Saint-Exupéry", status: "em circulação" },
  { id: "SENAI-002", titulo: "Dom Casmurro", autor: "Machado de Assis", status: "em circulação" },
  { id: "SENAI-003", titulo: "A Revolução dos Bichos", autor: "George Orwell", status: "em circulação" },
  { id: "SENAI-004", titulo: "O Alquimista", autor: "Paulo Coelho", status: "em circulação" },
  { id: "SENAI-005", titulo: "1984", autor: "George Orwell", status: "em circulação" },
  { id: "SENAI-006", titulo: "Quem Mexeu no Meu Queijo?", autor: "Spencer Johnson", status: "em circulação" },
  { id: "SENAI-007", titulo: "O Poder do Hábito", autor: "Charles Duhigg", status: "em circulação" },
  { id: "SENAI-008", titulo: "Pai Rico, Pai Pobre", autor: "Robert Kiyosaki", status: "em circulação" },
  { id: "SENAI-009", titulo: "Mindset", autor: "Carol S. Dweck", status: "em circulação" },
  { id: "SENAI-010", titulo: "Sapiens", autor: "Yuval Noah Harari", status: "em circulação" },
  { id: "SENAI-011", titulo: "A Arte da Guerra", autor: "Sun Tzu", status: "em circulação" },
  { id: "SENAI-012", titulo: "O Monge e o Executivo", autor: "James C. Hunter", status: "em circulação" },
  { id: "SENAI-013", titulo: "Mais Esperto que o Diabo", autor: "Napoleon Hill", status: "em circulação" },
  { id: "SENAI-014", titulo: "Ikigai", autor: "Héctor García", status: "em circulação" },
  { id: "SENAI-015", titulo: "Hábitos Atômicos", autor: "James Clear", status: "em circulação" },
];

// Validação do ID do livro
export function isValidBookId(id: string): boolean {
  return /^SENAI-0(0[1-9]|1[0-5])$/.test(id);
}

// Busca o livro pelo ID
export function getBookById(id: string): Book | undefined {
  return INITIAL_BOOKS.find((book) => book.id === id);
}

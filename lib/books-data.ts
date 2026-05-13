// Dados dos 15 livros iniciais do programa SENAI
// Os títulos e autores podem ser atualizados posteriormente via Firebase
export interface Book {
  id: string;
  titulo: string;
  autor: string;
  status: "em circulação" | "disponível" | "retirado";
}

export const INITIAL_BOOKS: Book[] = [
  { id: "SENAI-001", titulo: "Os 7 Hábitos das Pessoas Altamente Eficazes", autor: "Stephen Covey", status: "em circulação" },
  { id: "SENAI-002", titulo: "Mindset: A Nova Psicologia do Sucesso", autor: "Carol Dweck", status: "em circulação" },
  { id: "SENAI-003", titulo: "O Jeito Harvard de Ser Feliz", autor: "Shawn Achor", status: "em circulação" },
  { id: "SENAI-004", titulo: "Ansiedade 2: Autocontrole", autor: "Augusto Cury", status: "em circulação" },
  { id: "SENAI-005", titulo: "O Catador de Sonhos", autor: "Geraldo Rufino", status: "em circulação" },
  { id: "SENAI-006", titulo: "Mulheres: Por que será que elas...?", autor: "Leila Ferreira", status: "em circulação" },
  { id: "SENAI-007", titulo: "A Menina que Roubava Livros", autor: "Markus Zusak", status: "em circulação" },
  { id: "SENAI-008", titulo: "A Culpa é das Estrelas", autor: "John Green", status: "em circulação" },
  { id: "SENAI-009", titulo: "A Cabana", autor: "William P. Young", status: "em circulação" },
  { id: "SENAI-010", titulo: "Guia do Mochileiro das Galáxias", autor: "Douglas Adams", status: "em circulação" },
  { id: "SENAI-011", titulo: "Convergente", autor: "Veronica Roth", status: "em circulação" },
  { id: "SENAI-012", titulo: "Dezessete Luas", autor: "Margaret Stohl e Kami Garcia", status: "em circulação" },
  { id: "SENAI-013", titulo: "Canino Branco", autor: "Jack London", status: "em circulação" },
  { id: "SENAI-014", titulo: "O Código Da Vinci", autor: "Dan Brown", status: "em circulação" },
  { id: "SENAI-015", titulo: "O Símbolo Perdido", autor: "Dan Brown", status: "em circulação" },
  { id: "SENAI-016", titulo: "Desmascarando o Código Da Vinci", autor: "James L. Garlow e Peter Jones", status: "em circulação" },
  { id: "SENAI-017", titulo: "Os Segredos do Código", autor: "Dan Burstein", status: "em circulação" },
];

// Validação do ID do livro
export function isValidBookId(id: string): boolean {
  return /^SENAI-0(0[1-9]|1[0-7])$/.test(id);
}

// Busca o livro pelo ID
export function getBookById(id: string): Book | undefined {
  return INITIAL_BOOKS.find((book) => book.id === id);
}

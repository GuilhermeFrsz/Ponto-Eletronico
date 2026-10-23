// ==========================================
// 1. CONFIGURAÇÕES DE TURNOS
// ==========================================
const TURNO_CAIXA = { entBase: "13:00", intIni: "16:00", intFim: "17:00", saiBase: "21:20", texto: "Seg–Sex 13:00–21:20 (1h int.) | Sáb 13:00–17:00 (sem int.)" };
// Escala específica de Marina: de segunda a sexta, 7h20 líquidos; aos sábados, 4h sem intervalo.
const TURNO_MARINA = {
  entBase: "13:00", intIni: "16:00", intFim: "17:00", saiBase: "21:20",
  sabEntBase: "13:00", sabSaiBase: "17:00",
  texto: "Seg–Sex: 13:00–21:20 (1h int.) | Sáb: 13:00–17:00 (sem int.)"
};
const TURNO_ADM = { entBase: "08:00", intIni: "12:00", intFim: "13:00", saiBase: "17:00", texto: "Seg–Sex 08:00–17:00 (1h int.) | Sáb 08:00–12:00" };
const TURNO_MADRUGA = { entBase: "22:00", intIni: "02:00", intFim: "03:00", saiBase: "05:20", texto: "Seg–Sex 22:00–05:20 (1h int.; dia seguinte) | Sáb 22:00–02:00" };
const TURNO_CEDO = { entBase: "07:00", intIni: "11:00", intFim: "12:00", saiBase: "15:20", texto: "Seg–Sex 07:00–15:20 (1h int.) | Sáb 07:00–11:00" };
const TURNO_FECHAMENTO = { entBase: "13:30", intIni: "17:30", intFim: "18:30", saiBase: "22:00", texto: "Seg–Sex 13:30–22:00 (1h int.) | Sáb 13:30–17:30" }; 

// ==========================================
// 2. QUADRO DE FUNCIONÁRIOS (28 Empregados)
// ==========================================
const FUNCIONARIOS = [
  { id: "0142", nome: "Marina Lopes Barbosa de Oliveira", cargo: "Operadora de Caixa", turno: TURNO_MARINA },
  { id: "0102", nome: "Paulo Ricardo Lima de Melo", cargo: "Gerente do Mercado", turno: TURNO_FECHAMENTO }, 
  { id: "0088", nome: "Mykaelle Santos da Silva", cargo: "Supervisora", turno: TURNO_FECHAMENTO }, 
  { id: "0045", nome: "Gabriela Sales de Almeida", cargo: "Proprietária do Mercado", turno: TURNO_ADM }, 
  { id: "0115", nome: "Daniele Cristina Souza", cargo: "Operadora de Caixa", turno: TURNO_CAIXA },
  { id: "0091", nome: "Thiago Rocha Mendonça", cargo: "Apoio e Reposição", turno: TURNO_CAIXA },
  { id: "0012", nome: "Carlos Eduardo Farias", cargo: "Açougueiro Líder", turno: TURNO_CEDO },
  { id: "0019", nome: "Juliana Mendes Nogueira", cargo: "Fiscal de Loja", turno: TURNO_CAIXA },
  { id: "0023", nome: "Marcos Vinicius Batista", cargo: "Repositor de Mercearia", turno: TURNO_CEDO },
  { id: "0031", nome: "Aline Ferreira Duarte", cargo: "Operadora de Caixa", turno: TURNO_CAIXA },
  { id: "0037", nome: "Lucas Gabriel Antunes", cargo: "Balconista de Padaria", turno: TURNO_CEDO },
  { id: "0042", nome: "Beatriz Nogueira Ramos", cargo: "Auxiliar de Limpeza", turno: TURNO_CEDO },
  { id: "0050", nome: "Rodrigo Alencar Lima", cargo: "Repositor de FLV", turno: TURNO_CEDO },
  { id: "0056", nome: "Fernanda Castilho Prado", cargo: "Conferente", turno: TURNO_ADM },
  { id: "0062", nome: "Rafael Augusto Neves", cargo: "Ajudante de Carga", turno: TURNO_ADM },
  { id: "0068", nome: "Camila Guimarães Costa", cargo: "Operadora de Caixa", turno: TURNO_CAIXA },
  { id: "0071", nome: "Renato Silveira Dias", cargo: "Auxiliar de Açougue", turno: TURNO_CEDO },
  { id: "0077", nome: "Larissa Pires Monteiro", cargo: "Balconista de Frios", turno: TURNO_CAIXA },
  { id: "0083", nome: "Diego Brandão Vilela", cargo: "Fiscal de Loja", turno: TURNO_CEDO },
  { id: "0095", nome: "Tatiane Meireles Prado", cargo: "Operadora de Caixa", turno: TURNO_CAIXA },
  { id: "0108", nome: "Bruno Cesar Vasconcelos", cargo: "Padeiro", turno: TURNO_CEDO },
  { id: "0112", nome: "Vanessa Lins Machado", cargo: "Auxiliar Financeiro", turno: TURNO_ADM },
  { id: "0120", nome: "André Felipe Siqueira", cargo: "Operador de Empilhadeira", turno: TURNO_ADM },
  { id: "0125", nome: "Patrícia Moura Teodoro", cargo: "Auxiliar de Perecíveis", turno: TURNO_CAIXA },
  { id: "0130", nome: "Edson Morais Santana", cargo: "Repositor Noturno", turno: TURNO_MADRUGA },
  { id: "0134", nome: "Sabrina Caldas Paiva", cargo: "Operadora de Caixa", turno: TURNO_CAIXA },
  { id: "0139", nome: "Leandro Cunha Barreto", cargo: "Manutenção", turno: TURNO_ADM },
  { id: "0148", nome: "Jessica Toledo Gusmão", cargo: "Assistente de RH", turno: TURNO_ADM }
];
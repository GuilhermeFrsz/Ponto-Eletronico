// ==========================================
// 1. CONFIGURAÇÕES DE TURNOS
// ==========================================
const TURNO_CAIXA = { entBase: "13:00", intIni: "16:00", intFim: "17:00", saiBase: "21:20", texto: "Seg–Sex 13:00–21:20 (1h int.) | Sáb 13:00–17:00 (sem int.)" };
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
// 2. QUADRO DE FUNCIONÁRIOS COM SALÁRIOS E DADOS PESSOAIS (28 Empregados)
// ==========================================
const FUNCIONARIOS = [
  { id: "0142", nome: "Marina Lopes Barbosa de Oliveira", cargo: "Operadora de Caixa", departamento: "Frente de Caixa", cpf: "049.655.791-49", rg: "856321", salarioBase: 2200.00, turno: TURNO_MARINA },
  { id: "0102", nome: "Paulo Ricardo Lima de Melo", cargo: "Gerente do Mercado", departamento: "Gerência Geral", cpf: "219.483.102-88", rg: "19.382.041-7", salarioBase: 3800.00, turno: TURNO_FECHAMENTO }, 
  { id: "0088", nome: "Mykaelle Santos da Silva", cargo: "Supervisora", departamento: "Supervisão de Loja", cpf: "182.930.481-22", rg: "22.109.384-1", salarioBase: 2900.00, turno: TURNO_FECHAMENTO }, 
  { id: "0045", nome: "Gabriela Sales de Almeida", cargo: "Proprietária do Mercado", departamento: "Diretoria", cpf: "102.394.857-11", rg: "14.829.301-2", salarioBase: 5000.00, turno: TURNO_ADM }, 
  { id: "0115", nome: "Daniele Cristina Souza", cargo: "Operadora de Caixa", departamento: "Frente de Caixa", cpf: "412.593.102-33", rg: "31.402.918-2", salarioBase: 1620.00, turno: TURNO_CAIXA },
  { id: "0091", nome: "Thiago Rocha Mendonça", cargo: "Apoio e Reposição", departamento: "Operações / Loja", cpf: "521.849.302-11", rg: "25.109.482-9", salarioBase: 1620.00, turno: TURNO_CAIXA },
  { id: "0012", nome: "Carlos Eduardo Farias", cargo: "Açougueiro Líder", departamento: "Açougue", cpf: "109.283.741-55", rg: "18.293.041-8", salarioBase: 2200.00, turno: TURNO_CEDO },
  { id: "0019", nome: "Juliana Mendes Nogueira", cargo: "Fiscal de Loja", departamento: "Prevenção de Perdas", cpf: "283.910.293-88", rg: "29.102.384-0", salarioBase: 1800.00, turno: TURNO_CAIXA },
  { id: "0023", nome: "Marcos Vinicius Batista", cargo: "Repositor de Mercearia", departamento: "Mercearia", cpf: "382.910.384-22", rg: "33.102.948-1", salarioBase: 1620.00, turno: TURNO_CEDO },
  { id: "0031", nome: "Aline Ferreira Duarte", cargo: "Operadora de Caixa", departamento: "Frente de Caixa", cpf: "492.019.283-77", rg: "27.382.910-3", salarioBase: 1620.00, turno: TURNO_CAIXA },
  { id: "0037", nome: "Lucas Gabriel Antunes", cargo: "Balconista de Padaria", departamento: "Padaria", cpf: "192.830.192-33", rg: "21.029.384-4", salarioBase: 1620.00, turno: TURNO_CEDO },
  { id: "0042", nome: "Beatriz Nogueira Ramos", cargo: "Auxiliar de Limpeza", departamento: "Services / Maint", cpf: "293.810.293-11", rg: "30.192.837-5", salarioBase: 1620.00, turno: TURNO_CEDO },
  { id: "0050", nome: "Rodrigo Alencar Lima", cargo: "Repositor de FLV", departamento: "Hortifruti", cpf: "392.019.283-44", rg: "28.192.039-8", salarioBase: 1620.00, turno: TURNO_CEDO },
  { id: "0056", nome: "Fernanda Castilho Prado", cargo: "Conferente", departamento: "Recebimento", cpf: "102.938.475-66", rg: "19.203.948-2", salarioBase: 2100.00, turno: TURNO_ADM },
  { id: "0062", nome: "Rafael Augusto Neves", cargo: "Ajudante de Carga", departamento: "Depósito", cpf: "203.948.576-77", rg: "22.394.857-1", salarioBase: 1620.00, turno: TURNO_ADM },
  { id: "0068", nome: "Camila Guimarães Costa", cargo: "Operadora de Caixa", departamento: "Frente de Caixa", cpf: "304.958.677-88", rg: "31.203.948-3", salarioBase: 1620.00, turno: TURNO_CAIXA },
  { id: "0071", nome: "Renato Silveira Dias", cargo: "Auxiliar de Açougue", departamento: "Açougue", cpf: "405.968.788-99", rg: "24.102.938-4", salarioBase: 1620.00, turno: TURNO_CEDO },
  { id: "0077", nome: "Larissa Pires Monteiro", cargo: "Balconista de Frios", departamento: "Laticínios", cpf: "506.079.899-00", rg: "26.394.810-5", salarioBase: 1620.00, turno: TURNO_CAIXA },
  { id: "0083", nome: "Diego Brandão Vilela", cargo: "Fiscal de Loja", departamento: "Prevenção de Perdas", cpf: "607.180.900-11", rg: "29.402.918-6", salarioBase: 1800.00, turno: TURNO_CEDO },
  { id: "0095", nome: "Tatiane Meireles Prado", cargo: "Operadora de Caixa", departamento: "Frente de Caixa", cpf: "708.291.011-22", rg: "32.109.283-7", salarioBase: 1620.00, turno: TURNO_CAIXA },
  { id: "0108", nome: "Bruno Cesar Vasconcelos", cargo: "Padeiro", departamento: "Padaria", cpf: "809.302.122-33", rg: "18.203.948-8", salarioBase: 2300.00, turno: TURNO_CEDO },
  { id: "0112", nome: "Vanessa Lins Machado", cargo: "Auxiliar Financeiro", departamento: "Financeiro", cpf: "910.413.233-44", rg: "15.293.847-9", salarioBase: 2100.00, turno: TURNO_ADM },
  { id: "0120", nome: "André Felipe Siqueira", cargo: "Operador de Empilhadeira", departamento: "Depósito", cpf: "011.524.344-55", rg: "27.394.810-0", salarioBase: 2400.00, turno: TURNO_ADM },
  { id: "0125", nome: "Patrícia Moura Teodoro", cargo: "Auxiliar de Perecíveis", departamento: "Hortifruti", cpf: "122.635.455-66", rg: "30.402.918-1", salarioBase: 1620.00, turno: TURNO_CAIXA },
  { id: "0130", nome: "Edson Morais Santana", cargo: "Repositor Noturno", departamento: "Mercearia", cpf: "233.746.566-77", rg: "21.109.283-2", salarioBase: 1800.00, turno: TURNO_MADRUGA },
  { id: "0134", nome: "Sabrina Caldas Paiva", cargo: "Operadora de Caixa", departamento: "Frente de Caixa", cpf: "344.857.677-88", rg: "33.203.948-3", salarioBase: 1620.00, turno: TURNO_CAIXA },
  { id: "0139", nome: "Leandro Cunha Barreto", cargo: "Manutenção", departamento: "Manutenção Geral", cpf: "455.968.788-99", rg: "20.102.938-4", salarioBase: 2100.00, turno: TURNO_ADM },
  { id: "0148", nome: "Jessica Toledo Gusmão", cargo: "Assistente de RH", departamento: "Recursos Humanos", cpf: "566.079.899-00", rg: "17.394.810-5", salarioBase: 2200.00, turno: TURNO_ADM }
];
// ==========================================
// 1. MEMÓRIA E AUTO-LIMPEZA DE CACHE
// ==========================================
let ajustesAoVivo = JSON.parse(localStorage.getItem('bancoPontoRioBranco')) || {};
let tempAjustePendente = null;

// V10 • Afastamento informado pelo usuário em imagem de atestado (cenário ilustrativo).
// Atestado abona ausência; NÃO representa marcação de trabalho nem gera horas extras.
const MARINA_ATESTADOS = Object.freeze({
  '0142_2025-06-14': Object.freeze({
    chaveUnicaAjuste:'0142_2025-06-14', funcId:'0142', dataIso:'2025-06-14',
    tipo:'atestado', entrada:'', intIni:'', intFim:'', saida:'',
    abonoMin:240, jornadaReferencia:'13:00–17:00 (sábado)',
    motivo:'Atestado médico apresentado para afastamento de 14 a 16/06/2025. Ausência abonada em 14/06/2025 (sábado), conforme jornada de 4h. Não houve trabalho ou batidas neste dia.',
    gerente:'Lançamento inicial a partir da documentação fornecida (simulação)',
    origem:'Imagem de atestado fornecida pelo usuário, datada de 14/06/2025 (cenário fictício)',
    isPrecarregado:true, isAutoGerado:false
  }),
  '0142_2025-06-16': Object.freeze({
    chaveUnicaAjuste:'0142_2025-06-16', funcId:'0142', dataIso:'2025-06-16',
    tipo:'atestado', entrada:'', intIni:'', intFim:'', saida:'',
    abonoMin:480, jornadaReferencia:'13:00–21:20 (segunda-feira; 8h de abono solicitado)',
    motivo:'Atestado médico apresentado para afastamento de 14 a 16/06/2025. Ausência abonada em 16/06/2025 (segunda-feira), 8h conforme critério informado. Não houve trabalho ou batidas neste dia.',
    gerente:'Lançamento inicial a partir da documentação fornecida (simulação)',
    origem:'Imagem de atestado fornecida pelo usuário, datada de 14/06/2025 (cenário fictício)',
    isPrecarregado:true, isAutoGerado:false
  })
});
function obterAjustesAtivos() {
  // Os lançamentos salvos pelo usuário prevalecem sobre os ajustes pré-carregados.
  return Object.values({...MARINA_ATESTADOS, ...(typeof EQUIPE_AJUSTES_INICIAIS !== "undefined" ? EQUIPE_AJUSTES_INICIAIS : {}), ...ajustesAoVivo});
}
function obterAjusteParaDia(chave) {
  return (ajustesAoVivo[chave]?.isAutoGerado ? null : ajustesAoVivo[chave]) || MARINA_ATESTADOS[chave] || (typeof EQUIPE_AJUSTES_INICIAIS !== "undefined" ? EQUIPE_AJUSTES_INICIAIS[chave] : null) || null;
}
function minutosAbonoAtestado(ajuste) {
  if (!ajuste || ajuste.tipo !== 'atestado') return 0;
  const day = new Date(ajuste.dataIso + 'T12:00:00').getDay();
  if (day === 0) return 0;
  if (Number.isFinite(ajuste.abonoMin)) return Number(ajuste.abonoMin);
  return day === 6 ? 240 : 480; // critério definido na simulação pelo usuário
}
// Evita que versões antigas guardadas no navegador substituam o atestado apresentado.
for (const chave of Object.keys(MARINA_ATESTADOS)) {
  const velho = ajustesAoVivo[chave];
  if (velho && velho.tipo !== 'atestado') {
    const arquivo = JSON.parse(localStorage.getItem('pontoHistoricoAfastamentoV10') || '[]');
    arquivo.push({...velho, justificativaMigracao:'Substituído pelo atestado informado posteriormente para 14–16/06/2025.'});
    localStorage.setItem('pontoHistoricoAfastamentoV10', JSON.stringify(arquivo));
    delete ajustesAoVivo[chave];
    localStorage.setItem('bancoPontoRioBranco', JSON.stringify(ajustesAoVivo));
  }
}


if (Object.keys(ajustesAoVivo).some(chave => !chave.includes('_'))) {
  ajustesAoVivo = {};
  localStorage.removeItem('bancoPontoRioBranco');
}

// Migração: retirar APENAS marcações sintéticas antigas de Marina do cache.
// Ajustes gerenciais reais (isAutoGerado=false) e os demais empregados permanecem.
let removidosSinteticosMarina = false;
for (const [chave, ajuste] of Object.entries(ajustesAoVivo)) {
  if (ajuste && ajuste.funcId === '0142' && ajuste.isAutoGerado === true) {
    delete ajustesAoVivo[chave];
    removidosSinteticosMarina = true;
  }
}
if (removidosSinteticosMarina) {
  localStorage.setItem('bancoPontoRioBranco', JSON.stringify(ajustesAoVivo));
}

// V12: arquiva marcações geradas por versões antigas para que a base demonstrativa
// uniforme da equipe seja aplicada em todos os meses, mantendo ajustes manuais autênticos.
let autosAntigosV12 = [];
for (const [chave, a] of Object.entries(ajustesAoVivo)) {
  if (a && a.isAutoGerado === true) { autosAntigosV12.push(a); delete ajustesAoVivo[chave]; }
}
if (autosAntigosV12.length) {
  const arquivo = JSON.parse(localStorage.getItem('pontoHistoricoAutosV12') || '[]');
  localStorage.setItem('pontoHistoricoAutosV12', JSON.stringify(arquivo.concat(autosAntigosV12)));
  localStorage.setItem('bancoPontoRioBranco', JSON.stringify(ajustesAoVivo));
}

// V7: se o erro de data de V6 tiver sido salvo no navegador, arquivar a
// marcação incorreta conhecida de 12/06/2026 e não deixá-la sobrepor a fonte corrigida.
const chaveEquivocadaV6 = '0142_2026-06-12';
const enganoV6 = ajustesAoVivo[chaveEquivocadaV6];
if (enganoV6 && enganoV6.entrada === '13:00' && enganoV6.intIni === '16:00' &&
    enganoV6.intFim === '17:00' && enganoV6.saida === '22:00') {
  const historico = JSON.parse(localStorage.getItem('pontoHistoricoMigracaoV7') || '[]');
  historico.push({...enganoV6, motivoMigracao: 'Data retificada pelo usuário de 12/06/2026 para 12/06/2025'});
  localStorage.setItem('pontoHistoricoMigracaoV7', JSON.stringify(historico));
  delete ajustesAoVivo[chaveEquivocadaV6];
  localStorage.setItem('bancoPontoRioBranco', JSON.stringify(ajustesAoVivo));
}

window.addEventListener('DOMContentLoaded', () => {
  popularMesesHistorico();
  popularDropdownFuncionarios();
  popularTabelaGeralFuncionarios();
  
  // INJETAR O HISTÓRICO DE QUEDAS DE CONEXÃO
  // Não produzir marcações sintéticas de queda de conexão. Registros antigos permanecem na auditoria, sem se misturarem à fonte Marina.

  if(obterAjustesAtivos().length > 0) {
    const logContainer = document.getElementById('live-session-logs');
    if(logContainer) logContainer.innerHTML = '';
    
    // Sort descending by date
    const sorted = obterAjustesAtivos().sort((a,b) => b.dataIso.localeCompare(a.dataIso));
    
    // Only show latest 30 in the live session window (prints show all)
    sorted.slice(0, 30).forEach(ajuste => {
      atualizarLogAuditoriaVisual(ajuste, true); // append = true
    });
    
    if(sorted.length > 30) {
       const div = document.createElement('div');
       div.style = "text-align: center; font-size: 0.8rem; color: var(--gray-500); padding-top: 10px;";
       div.innerText = `+ ${sorted.length - 30} registros históricos ocultos (visíveis na impressão geral).`;
       logContainer.appendChild(div);
    }
  }
  
  atualizarTextoMotivo();
  setTimeout(() => alterarFuncionario(), 100);
});

// ==========================================
// 2. FUNÇÕES DE INTERFACE (SPA) E DADOS GERAIS
// ==========================================
function popularFalhasConexaoHistoricas() {
  let houveMudanca = false;
  // Mapeamento dos meses de Mar/2025 a Ago/2026
  const meses = [
    "2025-03", "2025-04", "2025-05", "2025-06", "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12",
    "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08"
  ];
  
  FUNCIONARIOS.forEach(f => {
    // Aplica a TODOS os funcionários que possuem a mesma saída base (21:20 - Operadores de Caixa)
    if (f.id !== "0142" && f.turno.saiBase === "21:20") {
      meses.forEach(mesStr => {
        const dataIso = `${mesStr}-15`;
        const chave = `${f.id}_${dataIso}`;
        
        if (!ajustesAoVivo[chave]) {
          const [a, m, d] = dataIso.split('-');
          const dt = new Date(a, m - 1, d);
          
          if (dt.getDay() !== 0) { // Somente dias úteis, não domingo
            const ent = ajustarHoraStr(f.turno.entBase, getVariacaoEstavel(f.id, 15, parseInt(m), 1));
            
            ajustesAoVivo[chave] = {
              chaveUnicaAjuste: chave,
              dataIso: dataIso,
              funcId: f.id,
              entrada: ent,
              intIni: f.turno.intIni,
              intFim: f.turno.intFim,
              saida: f.turno.saiBase,
              motivo: "Instabilidade/Falha de Conexão Wi-Fi no Tablet do Caixa no encerramento do expediente",
              gerente: "Paulo Ricardo Lima de Melo (Gerente)",
              isAutoGerado: true
            };
            houveMudanca = true;
          }
        }
      });
    }
  });
  
  if (houveMudanca) {
    localStorage.setItem('bancoPontoRioBranco', JSON.stringify(ajustesAoVivo));
  }
}

function switchPage(pageId) {
  document.querySelectorAll('.view-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const target = document.getElementById(pageId);
  if(target) target.classList.add('active');
  const btns = document.querySelectorAll('.nav-btn');
  if(pageId==='page-espelho' && btns[0]) btns[0].classList.add('active');
  if(pageId==='page-ajustes' && btns[1]) btns[1].classList.add('active');
  if(pageId==='page-colaboradores' && btns[2]) btns[2].classList.add('active');
  if(pageId==='page-relatorios-marina' && btns[3]) btns[3].classList.add('active');
  window.scrollTo(0,0);
}

function popularMesesHistorico() {
  const sel = document.getElementById('select-competencia');
  if(!sel) return;
  sel.innerHTML = '';
  const mesesAbrev = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  for(let ano = 2025; ano <= 2026; ano++) {
    let mesInicio = (ano === 2025) ? 3 : 1;
    let mesFim = (ano === 2026) ? 8 : 12;
    for(let m = mesInicio; m <= mesFim; m++) {
      let val = `${ano}-${String(m).padStart(2,'0')}`;
      let opt = document.createElement('option');
      opt.value = val; opt.textContent = `${mesesAbrev[m-1]} / ${ano}`;
      if(val === "2025-03") opt.selected = true; 
      sel.appendChild(opt);
    }
  }
}

function popularDropdownFuncionarios() {
  const sel = document.getElementById('select-colaborador');
  if(!sel) return;
  sel.innerHTML = '';
  FUNCIONARIOS.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.id; opt.textContent = `${f.nome} (Mat. ${f.id})`;
    if(f.id === "0142") opt.selected = true;
    sel.appendChild(opt);
  });
}

function popularTabelaGeralFuncionarios() {
  const tbody = document.getElementById('tabela-todos-colaboradores');
  if(!tbody) return;
  tbody.innerHTML = '';
  FUNCIONARIOS.forEach(f => {
    tbody.innerHTML += `<tr><td><strong>${f.id}</strong></td><td>${f.nome}</td><td>${f.cargo}</td><td>${f.turno.texto}</td><td><button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="selecionarDiretoFuncionario('${f.id}')">Ver Ponto</button></td></tr>`;
  });
}

function selecionarDiretoFuncionario(id) {
  const sel = document.getElementById('select-colaborador');
  if(sel) sel.value = id;
  alterarFuncionario();
  switchPage('page-espelho');
}

function alterarFuncionario() {
  const sel = document.getElementById('select-colaborador');
  if(!sel) return;
  const id = sel.value;
  const func = FUNCIONARIOS.find(f => f.id === id);
  
  if(func) {
    const avisoCenario = document.getElementById('aviso-cenario-sabados');
  if (avisoCenario) avisoCenario.hidden = !ehFuncionarioMarina(id);
  const declaracao = document.getElementById('ponto-declaracao-impressao');
  if (declaracao) declaracao.textContent = ehFuncionarioMarina(id) ?
    'Cenário de adequação para estudo: quatro jornadas de sábado foram hipoteticamente ajustadas; os horários V12 anteriores estão preservados em comparativo. Documento não substitui controle original.' :
    'Espelho demonstrativo de jornada, sem comprovação independente de marcações.';
    const setTxtSafely = (elId, txt) => { const el = document.getElementById(elId); if(el) el.textContent = txt; };
    const setValSafely = (elId, val) => { const el = document.getElementById(elId); if(el) el.value = val; };
    
    setTxtSafely('ponto-origem-situacao', ehFuncionarioMarina(id) ? 'Marina: pontos demonstrativos e ausências abonadas identificados separadamente' : 'Equipe: batidas ilustrativas completas, com ajustes demonstrativos destacados');
    setTxtSafely('strip-nome', func.nome);
    setTxtSafely('strip-cargo', func.cargo);
    setTxtSafely('strip-matricula', func.id);
    setTxtSafely('strip-jornada', func.turno.texto);
    setTxtSafely('ponto-origem-descricao', ehFuncionarioMarina(id)
      ? 'Jornada completa para simulação: saídas provenientes da fonte e entradas/intervalos ilustrativos identificados'
      : 'Jornadas geradas para a apresentação, com variações ilustrativas e ajustes documentados apenas no cenário fictício');
    setTxtSafely('ponto-declaracao-impressao', ehFuncionarioMarina(id)
      ? 'ESPELHO ILUSTRATIVO: os registros preenchidos são dados demonstrativos; alguns horários foram completados a partir da conferência de caixa. Atestado de 14–16/06/2025: 12h de ausência abonada em 14 e 16/06; 15/06 foi DSR. Dias abonados não constituem trabalho efetivo. Não é comprovante original ou controle oficial de ponto.'
      : 'ESPELHO DEMONSTRATIVO: horários e ajustes simulados; não são comprovantes originais de batida, não atestam trabalho real nem constituem controle eletrônico homologado. Nome da proprietária impresso em tipografia cursiva para identificação, sem assinatura manuscrita/autenticação.');
    setValSafely('input-jornada-base', func.turno.texto);
    setValSafely('ajuste-target-nome', `${func.nome} (Mat. ${func.id})`);
    setValSafely('input-responsavel', 'Paulo Ricardo Lima de Melo (Gerente do Mercado)');
  }
  renderizarTabela();
}

function atualizarTextoMotivo() {
  const sel = document.getElementById('select-motivo');
  const txt = document.getElementById('input-motivo-detalhado');
  if (sel && txt) {
    txt.value = sel.options[sel.selectedIndex].value;
  }
  atualizarCamposTipoAjuste();
}
function atualizarCamposTipoAjuste() {
  const tipo = document.getElementById('select-tipo-ajuste')?.value || 'ponto';
  const data = document.getElementById('input-data-ajuste')?.value || '';
  const aviso = document.getElementById('ajuste-aviso-atestado');
  const atestado = tipo === 'atestado';
  for (const id of ['input-hora-entrada','input-hora-int-ini','input-hora-int-fim','input-hora-saida']) {
    const el = document.getElementById(id);
    if(el) { el.disabled = atestado; el.required = !atestado; }
  }
  if(aviso) {
    const dia = data ? new Date(data + 'T12:00:00').getDay() : -1;
    const abono = dia === 0 ? '00h (domingo/DSR)' : dia === 6 ? '04h00 (sábado)' : '08h00 (dia útil)';
    aviso.hidden = !atestado;
    aviso.textContent = 'Ausência justificada, sem batidas: abono previsto ' + abono + '. Não entra como hora trabalhada nem gera saldo extra ou atraso.';
  }
}


// ==========================================
// 3. MOTOR MATEMÁTICO DE HORAS
// ==========================================
function escaparHTML(t) {
  return String(t ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
}

function timeToMins(t) {
  if(!t || t === "--:--") return 0;
  let [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minsToTime(m) {
  let sign = m < 0 ? "-" : "";
  m = Math.abs(m);
  let h = Math.floor(m / 60);
  let mins = m % 60;
  return `${sign}${String(h).padStart(2,'0')}h ${String(mins).padStart(2,'0')}m`;
}

function minsToClock(m) {
  let h = Math.floor(m / 60);
  let mins = m % 60;
  return `${String(h).padStart(2,'0')}:${String(mins).padStart(2,'0')}`;
}

function getVariacaoEstavel(seedId, dia, mes, offset) {
  const numSeed = parseInt(seedId, 10) + dia * 10 + mes * 100 + offset;
  const pseudoAleatorio = Math.abs(Math.sin(numSeed) * 10000);
  return Math.floor(pseudoAleatorio % 13) - 5; 
}

function ajustarHoraStr(horaBase, variacaoMinutos) {
  let [h, m] = horaBase.split(':').map(Number);
  m += variacaoMinutos;
  if(m < 0) { m += 60; h -= 1; }
  if(m > 59) { m -= 60; h += 1; }
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}


// ==========================================
// 4A. REGRAS EXCLUSIVAS DO ESPELHO DA MARINA
// ==========================================
function ehFuncionarioMarina(id) { return id === '0142'; }

function buscarPontoCompletoMarina(dataIso) {
  return typeof MARINA_PONTOS_COMPLETOS === 'undefined' ? null : MARINA_PONTOS_COMPLETOS.registros[dataIso] || null;
}

function buscarJornadaRevisadaMarina(dataIso) {
  if (typeof MARINA_REVISADA === 'undefined') return null;
  return MARINA_REVISADA.jornadas.find(r => r.data === dataIso) || null;
}

function atualizarIndicadoresExpedientes() {
  if(typeof MARINA_PONTOS_COMPLETOS === 'undefined') return;
  const dias = Object.keys(MARINA_PONTOS_COMPLETOS.registros).filter(d => new Date(d + 'T12:00:00').getDay() !== 0);
  const abonos = dias.filter(d => obterAjusteParaDia('0142_' + d)?.tipo === 'atestado');
  const marcados = dias.filter(d => obterAjusteParaDia('0142_' + d)?.tipo !== 'atestado');
  for (const [id,valor] of [['resumo-expedientes',dias.length],['resumo-trabalhados',marcados.length],['resumo-atestados',abonos.length]]) {
    const el = document.getElementById(id); if(el) el.textContent = String(valor);
  }
}
function calcularTrabalhoMarina(entrada, inicioIntervalo, fimIntervalo, saida) {
  // Calcula em uma linha do tempo crescente; inclui turnos que passam da meia-noite.
  const semIntervalo = !inicioIntervalo || ['--:--', '—'].includes(inicioIntervalo) ||
    !fimIntervalo || ['--:--', '—'].includes(fimIntervalo);
  const lista = semIntervalo ? [entrada,saida] : [entrada,inicioIntervalo,fimIntervalo,saida];
  if (lista.some(x => !/^\d{2}:\d{2}$/.test(String(x)))) return 0;
  const valores = []; let dias = 0;
  for (const t of lista) {
    let m = timeToMins(t) + dias*1440;
    while (valores.length && m < valores[valores.length - 1]) { dias++; m += 1440; }
    valores.push(m);
  }
  return Math.max(0, valores[valores.length-1] - valores[0] -
    (semIntervalo ? 0 : valores[2] - valores[1]));
}
function buscarPontoEquipe(funcId, dataIso) {
  if (typeof EQUIPE_PONTOS_SIMULADOS === 'undefined') return null;
  const r = EQUIPE_PONTOS_SIMULADOS[funcId]?.[dataIso];
  return r ? {entrada:r[0],intIni:r[1],intFim:r[2],saida:r[3],previsto:r[4],status:r[5]} : null;
}

// ==========================================
// 4. RENDERIZAÇÃO PRINCIPAL DO ESPELHO
// ==========================================
function renderizarTabela() {
  const compEl = document.getElementById('select-competencia');
  const funcEl = document.getElementById('select-colaborador');
  const tbody = document.getElementById('ponto-corpo');
  if(!compEl || !funcEl || !tbody) return;
  
  
  const comp = compEl.value;
  const funcId = funcEl.value;
  const func = FUNCIONARIOS.find(f => f.id === funcId);
  tbody.innerHTML = '';

  const [ano, mes] = comp.split('-').map(Number);
  const totalDias = new Date(ano, mes, 0).getDate();
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const baseMins = calcularTrabalhoMarina(func.turno.entBase, func.turno.intIni, func.turno.intFim, func.turno.saiBase);

  let totalTrabMes = 0, totalExtraMes = 0, totalAtrasoMes = 0, totalAbonoMes = 0;
  let totalDevidoMarina = 0;
  const itensDevidos = [];
  const paresRegistrados = new Map();

  for (let dia = 1; dia <= totalDias; dia++) {
    const dataObj = new Date(ano, mes - 1, dia);
    const diaSemanaIndex = dataObj.getDay();
    const strDia = String(dia).padStart(2, '0');
    const strMes = String(mes).padStart(2, '0');
    const dataFormatada = `${strDia}/${strMes}/${ano}`;
    const chaveDataIso = `${ano}-${strMes}-${strDia}`;
    const chaveUnicaAjuste = `${funcId}_${chaveDataIso}`;
    const tr = document.createElement('tr');

    const ehMarina = (funcId === "0142");

    if (ehMarina && ano === 2025 && mes === 3 && dia < 3) {
      tr.className = 'weekend';
      tr.innerHTML = `<td>${dataFormatada}</td><td>${diasSemana[diaSemanaIndex]}</td><td>--:--</td><td>--:--</td><td>--:--</td><td>--:--</td><td>00:00</td><td>00:00</td><td style="color:#64748b; font-style: italic;">Antes da Admissão</td><td class="no-print">---</td>`;
      tbody.appendChild(tr); continue;
    }

    if (diaSemanaIndex === 0) {
      tr.className = 'weekend';
      const textoDsr = ehFuncionarioMarina(funcId) && chaveDataIso === '2025-06-15'
        ? 'Descanso Semanal Remunerado (DSR) • incluído no período do atestado 14–16/06; sem abono adicional'
        : 'Descanso Semanal Remunerado (DSR)';
      tr.innerHTML = `<td>${dataFormatada}</td><td><strong>Dom</strong></td><td>--:--</td><td>--:--</td><td>--:--</td><td>--:--</td><td>00:00</td><td>00:00</td><td style="color:#64748b; font-style: italic;">${textoDsr}</td><td class="no-print">---</td>`;
      tbody.appendChild(tr); continue;
    }

    // Ajustes automáticos antigos não podem alterar os horários de Marina.
    // Um ajuste gerencial efetivo (não automático) segue visível e auditável.
    const ajusteGravado = ajustesAoVivo[chaveUnicaAjuste];
    const ajusteAoVivo = obterAjusteParaDia(chaveUnicaAjuste);
    const registroRevisado = ehMarina ? buscarJornadaRevisadaMarina(chaveDataIso) : null;
    const pontoCompleto = ehMarina ? buscarPontoCompletoMarina(chaveDataIso) : null;
    const baseDiaMins = diaSemanaIndex === 6 ? 240 : baseMins;
    const pontoEquipe = !ehMarina ? buscarPontoEquipe(funcId, chaveDataIso) : null;
    
    let ent, intIni, intFim, sai, statusTag, rowClass = "";
    let trabMins = 0;
    let possuiMarcacao = false;

    if (ajusteAoVivo?.tipo === 'atestado') {
      // Não há marcação: as horas são abonadas em rubrica própria.
      ent = intIni = intFim = sai = '--:--';
      trabMins = 0;
      possuiMarcacao = false;
      totalAbonoMes += minutosAbonoAtestado(ajusteAoVivo);
      rowClass = 'ajustado-row marina-atestado-row';
      statusTag = `<button type="button" class="tag-badge tag-warning ajuste-detalhe-trigger" onclick="abrirDetalhesAjuste('${chaveUnicaAjuste}')" aria-label="Consultar atestado de ${dataFormatada} e motivo do ajuste" title="Clique para visualizar o motivo">Atestado médico • Ponto Ajustado</button>`;
    } else if (ajusteAoVivo) {
      possuiMarcacao = !ajusteAoVivo.isAutoGerado;
      ent = ajusteAoVivo.entrada; 
      intIni = ajusteAoVivo.intIni || func.turno.intIni; 
      intFim = ajusteAoVivo.intFim || func.turno.intFim; 
      sai = ajusteAoVivo.saida;
      rowClass = "ajustado-row";
      
      // Um ajuste deve indicar claramente quem retificou e por qual motivo.
      // Nenhuma linha é rotulada como "registro original" após alteração.
      if (ajusteAoVivo.isAutoGerado) {
        statusTag = `<span class="tag-badge tag-warning">Ajuste antigo de sistema • sem confirmação de batida</span>`;
        possuiMarcacao = false;
      } else {
        statusTag = `<button type="button" class="tag-badge tag-warning ajuste-detalhe-trigger" onclick="abrirDetalhesAjuste('${chaveUnicaAjuste}')" aria-label="Consultar motivo do ajuste de ${dataFormatada}" title="Clique para visualizar o motivo">Ponto Ajustado</button>`;
      }
      trabMins = calcularTrabalhoMarina(ent, intIni, intFim, sai);
      
    } else {
      if (ehMarina) {
        if (registroRevisado) {
          possuiMarcacao = true;
          // Dados desta data vieram da aba revisada, nunca de sorteio ou falha automática.
          ent = registroRevisado.entrada;
          intIni = registroRevisado.intervaloInicio === '—' ? '--:--' : registroRevisado.intervaloInicio;
          intFim = registroRevisado.intervaloFim === '—' ? '--:--' : registroRevisado.intervaloFim;
          sai = registroRevisado.saida;
          statusTag = `<span class="tag-badge tag-recent">Ponto registrado</span>`;
          if (registroRevisado?.classificacao?.startsWith('Cenário alternativo')) {
            statusTag = `<button type="button" class="tag-badge tag-warning" onclick="abrirComparativoSabado('${chaveDataIso}')" title="Consultar horários originais e cenário">Cenário de sábado • comparar</button>`;
          }
          rowClass = 'marina-fonte-row';
        } else if (pontoCompleto) {
          possuiMarcacao = true; // Linha preenchida PARA A SIMULAÇÃO; não comprova marcação física.
          ent = pontoCompleto.entrada;
          intIni = pontoCompleto.intervaloInicio;
          intFim = pontoCompleto.intervaloFim;
          sai = pontoCompleto.saida;
          rowClass = 'marina-fonte-row marina-complementado-row';
          statusTag = `<span class="tag-badge tag-recent">Ponto registrado</span><div class="marina-fonte-nota">Simulação: entrada/intervalo ilustrativos; saída da conferência de caixa.</div>`;
        } else {
          // A planilha-fonte foi incompleta; nunca mascarar ausência de dados.
          ent = intIni = intFim = sai = '--:--';
          statusTag = `<span class="tag-badge tag-warning">Origem ausente — conferir</span>`;
          rowClass = 'marina-escala-row';
        }
        trabMins = calcularTrabalhoMarina(ent, intIni, intFim, sai);
      } else if (pontoEquipe) {
        // As batidas desta equipe são ilustrativas: cada uma é identificada como tal.
        ent = pontoEquipe.entrada; intIni = pontoEquipe.intIni;
        intFim = pontoEquipe.intFim; sai = pontoEquipe.saida;
        possuiMarcacao = true;
        rowClass = 'equipe-simulada-row';
        statusTag = `<span class="tag-badge tag-recent" title="Registro ilustrativo, não comprovante real">Ponto registrado</span>`;
        trabMins = calcularTrabalhoMarina(ent,intIni,intFim,sai);
      } else {
        ent = intIni = intFim = sai = '--:--';
        statusTag = `<span class="tag-badge tag-warning">Sem dados na base • conferir</span>`;
      }
    }

    if (possuiMarcacao) totalTrabMes += trabMins;
    if (possuiMarcacao && (!ehMarina || registroRevisado || (ajusteAoVivo && !ajusteAoVivo.isAutoGerado))) {
      const par = `${ent}|${sai}`;
      const dias = paresRegistrados.get(par) || [];
      dias.push(dataFormatada);
      paresRegistrados.set(par, dias);
    }
    // FONTE ÚNICA DA VERDADE DO ESPELHO: saldo diário = tempo líquido trabalhado
    // menos jornada de referência (Marina: 7h20 seg-sex, 4h sábado).
    // Um ajuste de ponto efetivo tem exatamente a mesma regra que uma linha da planilha.
    // Não há teto pelo campo textual "Tempo além" nem lista fechada de horas extras.
    const saldoMins = possuiMarcacao ? (trabMins - baseDiaMins) : 0;
    if (possuiMarcacao && diaSemanaIndex === 6 && saldoMins > 120) {
      statusTag += ` <span class="tag-badge tag-warning" title="Excedente real/histórico preservado; não limitar automaticamente">⚠️ Excedente acima de 2h — conferir</span>`;
    }
    if (saldoMins > 0) {
      // "Devidas" é o somatório dos excedentes diários apurados nesta simulação,
      // sem homologação, adicionais legais ou compensações presumidas.
      totalDevidoMarina += saldoMins;
      const origem = ajusteAoVivo
        ? 'Horário salvo no módulo gerencial'
        : registroRevisado ? 'Planilha de jornadas revisada' : pontoCompleto ? 'Saída da planilha / entrada e intervalo ilustrativos' : pontoEquipe ? 'Horários gerados na simulação da equipe' : 'Origem não localizada';
      itensDevidos.push({data:dataFormatada, trabalhado:trabMins,
        referencia:baseDiaMins, extra:saldoMins, origem});
      statusTag += ` <span class="marina-extra-ok">Hora extra apurada: +${minsToClock(saldoMins)}</span>`;
    }
    let strSaldo;

    if (!possuiMarcacao) {
      strSaldo = `—`;
    } else if (saldoMins > 0) {
      strSaldo = `<span style="color:var(--danger); font-weight:bold;">+${minsToClock(saldoMins)}</span>`;
      totalExtraMes += saldoMins;
    } else if (saldoMins < 0) {
      strSaldo = `<span style="color:var(--warning);">${minsToClock(Math.abs(saldoMins))}</span>`;
      totalAtrasoMes += Math.abs(saldoMins);
    } else {
      strSaldo = `00:00`;
    }

    tr.className = rowClass;
    tr.innerHTML = `
      <td><strong>${dataFormatada}</strong></td><td>${diasSemana[diaSemanaIndex]}</td>
      <td>${ent}</td><td style="vertical-align: middle;">${intIni}</td><td style="vertical-align: middle;">${intFim}</td>
      <td><strong style="${sai === func.turno.saiBase && ehMarina && (!ajusteAoVivo || ajusteAoVivo.isAutoGerado) ? 'color:#b45309;' : ''}">${sai}</strong></td>
      <td>${ajusteAoVivo?.tipo === 'atestado' ? '—' : possuiMarcacao ? minsToClock(trabMins) : '—'}</td><td>${ajusteAoVivo?.tipo === 'atestado' ? '00:00' : strSaldo}</td><td>${statusTag}</td>
      <td class="no-print"><button class="btn btn-secondary" style="padding: 2px 7px; font-size: 0.72rem;" onclick="abrirLancadorParaData('${chaveUnicaAjuste}', '${ent}', '${intIni}', '${intFim}', '${sai}')">Ajustar</button></td>
    `;
    tbody.appendChild(tr);
  }

  // Preserva as justificativas completas no espelho impresso, sem alongar as linhas da tela.
  const motivosImpressao = document.getElementById('ponto-motivos-impressao');
  if (motivosImpressao) {
    const itens = [];
    for (let d = 1; d <= totalDias; d++) {
      const dataIso = `${ano}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const a = obterAjusteParaDia(`${funcId}_${dataIso}`);
      if (!a || a.isAutoGerado) continue;
      const dataBR = `${String(d).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;
      const rotulo = a.tipo === 'atestado' ? 'Atestado médico • ausência abonada' : 'Ponto ajustado';
      const abono = a.tipo === 'atestado' ? ` — ${minsToClock(minutosAbonoAtestado(a))} abonadas` : '';
      itens.push(`<li><strong>${dataBR} — ${rotulo}${abono}.</strong> ${escaparHTML(a.motivo || 'Motivo não informado')}</li>`);
    }
    const cenariosMes = Object.entries(COMPARATIVO_SABADOS_V13).filter(([d]) => d.startsWith(comp) && ehFuncionarioMarina(funcId));
    for(const [d,r] of cenariosMes) itens.push(`<li><b>${d.split('-').reverse().join('/')}: cenário alternativo</b> — saída anterior ${r.original.saida}; cenário ${r.cenario.saida}. Origem original preservada.</li>`);
    motivosImpressao.innerHTML = itens.length ? `<h3>Notas de origem e ajustes da competência</h3><ul>${itens.join('')}</ul>` : '';
  }

  const auditoria = document.getElementById('auditoria-uniformidade');
  if (auditoria) {
    const grupos = [...paresRegistrados.entries()].filter(([par,ds]) => ds.length >= 3);
    auditoria.textContent = !ehFuncionarioMarina(funcId)
      ? 'Os horários desta equipe são construídos exclusivamente para simulação. A análise de uniformidade de provas de ponto reais não se aplica a esses dados ilustrativos.'
      : grupos.length
        ? `Para esta competência, ${grupos.length} padrão(ões) de entrada/saída se repetem 3 ou mais vezes entre as jornadas individualizadas. Complementos ilustrativos são excluídos; conferir comprovantes; o sistema não altera esses horários.`
        : 'Nesta competência não há padrão de entrada e saída repetido 3 ou mais vezes entre as marcações apresentadas. Este é um indicador interno, não uma certificação jurídica.';
  }
  const avisoCenario = document.getElementById('aviso-cenario-sabados');
  if (avisoCenario) avisoCenario.hidden = !ehFuncionarioMarina(funcId);
  const declaracao = document.getElementById('ponto-declaracao-impressao');
  if (declaracao) declaracao.textContent = ehFuncionarioMarina(funcId) ?
    'Cenário de adequação para estudo: quatro jornadas de sábado foram hipoteticamente ajustadas; os horários V12 anteriores estão preservados em comparativo. Documento não substitui controle original.' :
    'Espelho demonstrativo de jornada, sem comprovação independente de marcações.';
    const setTxtSafely = (elId, txt) => { const el = document.getElementById(elId); if(el) el.textContent = txt; };
  setTxtSafely('resumo-total-trab', minsToTime(totalTrabMes));
  setTxtSafely('resumo-total-abono', minsToTime(totalAbonoMes));
  const abonoResumo = document.querySelector('.marina-abono-resumo');
  if (abonoResumo) abonoResumo.hidden = !ehFuncionarioMarina(funcId);
  atualizarIndicadoresExpedientes();
  setTxtSafely('resumo-total-extra', "+" + minsToTime(totalExtraMes));
  setTxtSafely('resumo-total-atraso', "-" + minsToTime(totalAtrasoMes));
  setTxtSafely('resumo-total-devido', minsToTime(totalDevidoMarina));
  const quadroDevido = document.getElementById('resumo-item-devido');
  if (quadroDevido) quadroDevido.hidden = false;
  const quadroResumo = document.querySelector('.summary-panel');
  if (quadroResumo) quadroResumo.classList.remove('sem-devido');
  const notaFolha = document.getElementById('resumo-nota-folha');
  if (notaFolha) notaFolha.textContent = '*Saldo ilustrativo; não enviado automaticamente à folha';
  const detalhamento = document.getElementById('resumo-detalhes-devido');
  const detalhamentoPainel = document.getElementById('resumo-detalhes-painel');
  if (detalhamentoPainel) detalhamentoPainel.hidden = false;
  if (detalhamento) {
    detalhamento.hidden = false;
    const linhas = itensDevidos.map(item => `<li><strong>${item.data}: +${minsToTime(item.extra)}</strong> — total líquido ${minsToTime(item.trabalhado)} − referência ${minsToTime(item.referencia)} (${item.origem})</li>`).join('');
    detalhamento.innerHTML = `<strong>Apuração de ${comp.split('-').reverse().join('/')}: +${minsToTime(totalDevidoMarina)}</strong>` +
      `<p>O saldo de cada dia com batida informada/retificada é calculado automaticamente: Total Trab. menos jornada prevista. Horários gerados para o exercício entram na apuração ilustrativa e são identificados por origem. Valores positivos alimentam integralmente tanto “Saldo (Extra)” quanto “Horas Extras (Saldo Positivo)” e “Horas extras devidas”; valores negativos aparecem exclusivamente em “Atrasos/Faltas”.</p>` +
      (itensDevidos.length ? `<ul>${linhas}</ul>` : '<p>Nenhum excedente diário apurado nesta competência.</p>') +
      `<p class="marina-criterio">Atestados justificam ausência, sem integrar trabalhado, saldo positivo ou atraso. ${totalAbonoMes ? 'Nesta competência há ' + minsToTime(totalAbonoMes) + ' de ausência abonada. ' : ''}Apuração de simulação com complementação parcial de horários, não homologação trabalhista nem comprovação de crédito. Ajustes efetivos salvos neste navegador entram no cálculo mensal; a planilha XLSX que acompanha o pacote é uma cópia estática e não é modificada automaticamente pelo navegador.</p>`;
  }
}

// ==========================================
// 5. CONTROLE DE MODAIS E AUDITORIA
// ==========================================
let focoAnteriorDetalhesAjuste = null;

function abrirDetalhesAjuste(chave) {
  const ajuste = obterAjusteParaDia(chave);
  const modal = document.getElementById('modal-detalhes-ajuste');
  if (!ajuste || !modal) return;
  const atestado = ajuste.tipo === 'atestado';
  const [ano, mes, dia] = ajuste.dataIso.split('-');
  const preencher = (id, texto) => {
    const el = document.getElementById(id);
    if (el) el.textContent = texto;
  };
  preencher('detalhe-ajuste-titulo', atestado ? 'Atestado médico • Ponto Ajustado' : 'Ponto Ajustado');
  preencher('detalhe-ajuste-data', `${dia}/${mes}/${ano}`);
  preencher('detalhe-ajuste-tipo', atestado ? 'Ausência justificada por atestado' : 'Retificação de marcação');
  preencher('detalhe-ajuste-abono', atestado ? minsToClock(minutosAbonoAtestado(ajuste)) : '—');
  preencher('detalhe-ajuste-jornada', ajuste.jornadaReferencia || 'Conforme escala do dia');
  preencher('detalhe-ajuste-motivo', ajuste.motivo || 'Motivo não informado');
  preencher('detalhe-ajuste-origem', ajuste.origem || (ajuste.gerente ? 'Ajuste registrado por ' + ajuste.gerente : 'Lançamento no módulo de ajustes'));
  for (const id of ['detalhe-ajuste-bloco-abono','detalhe-ajuste-bloco-jornada']) {
    const el = document.getElementById(id);
    if (el) el.hidden = !atestado;
  }
  focoAnteriorDetalhesAjuste = document.activeElement;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  modal.querySelector('.modal-close')?.focus();
}

function fecharDetalhesAjuste() {
  const modal = document.getElementById('modal-detalhes-ajuste');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  if (focoAnteriorDetalhesAjuste && focoAnteriorDetalhesAjuste.isConnected) focoAnteriorDetalhesAjuste.focus();
  focoAnteriorDetalhesAjuste = null;
}

document.addEventListener('keydown', (e) => {
  const modal = document.getElementById('modal-detalhes-ajuste');
  if (!modal?.classList.contains('open')) return;
  if (e.key === 'Escape') { e.preventDefault(); fecharDetalhesAjuste(); return; }
  if (e.key === 'Tab') {
    const botoes = [...modal.querySelectorAll('button:not([disabled])')];
    if (!botoes.length) return;
    if (e.shiftKey && document.activeElement === botoes[0]) {
      e.preventDefault(); botoes[botoes.length - 1].focus();
    } else if (!e.shiftKey && document.activeElement === botoes[botoes.length - 1]) {
      e.preventDefault(); botoes[0].focus();
    }
  }
});
function abrirModalPadrao(dataOriginal, hora) {
  const elDesc = document.getElementById('audit-descricao');
  if(!elDesc) return;
  document.getElementById('audit-reg-id').textContent = `SYS-WIFI-${dataOriginal.replace(/\//g,'')}`;
  document.getElementById('audit-data-jornada').textContent = dataOriginal;
  document.getElementById('audit-hora').textContent = `${hora}:00 (Ajuste para Contratual)`;
  elDesc.innerHTML = `<strong>Log:</strong> "Registro ajustado manualmente no dia seguinte pelo Gerente.<br><strong>Motivo:</strong> Instabilidade/Falha de Conexão Wi-Fi no Tablet do Caixa."`;
  document.getElementById('modal-auditoria').classList.add('open');
}

function abrirLancadorParaData(chaveAjuste, ent, intIni, intFim, sai) { 
  const inData = document.getElementById('input-data-ajuste');
  const partes = chaveAjuste.split('_');
  if(inData && partes.length > 1) inData.value = partes[1]; 
  
  // Preenche os campos do formulário automaticamente com os valores da tabela
  document.getElementById('input-hora-entrada').value = ent;
  document.getElementById('input-hora-int-ini').value = intIni;
  document.getElementById('input-hora-int-fim').value = intFim;
  document.getElementById('input-hora-saida').value = sai;
  
  const salvo = obterAjusteParaDia(chaveAjuste);
  const tipoSel = document.getElementById('select-tipo-ajuste');
  if(tipoSel) tipoSel.value = salvo?.tipo === 'atestado' ? 'atestado' : 'ponto';
  atualizarTextoMotivo();
  if(salvo?.tipo === 'atestado') {
    document.getElementById('input-motivo-detalhado').value = salvo.motivo;
  }
  switchPage('page-ajustes'); 
}

function prepararConfirmacaoAjuste(e) {
  e.preventDefault();
  const funcId = document.getElementById('select-colaborador').value;
  const dataIso = document.getElementById('input-data-ajuste').value;
  const chaveUnicaAjuste = `${funcId}_${dataIso}`;
  
  const tipo = document.getElementById('select-tipo-ajuste')?.value || 'ponto';
  if(tipo === 'atestado' && !ehFuncionarioMarina(funcId)) { alert('O abono padrão de atestado está configurado apenas para Marina nesta simulação.'); return; }
  if(tipo === 'atestado' && new Date(dataIso + 'T12:00:00').getDay() === 0) { alert('Domingo é DSR; não há expediente a abonar.'); return; }
  tempAjustePendente = { 
    chaveUnicaAjuste,
    dataIso,
    funcId,
    tipo,
    entrada: tipo === 'atestado' ? '' : document.getElementById('input-hora-entrada').value, 
    intIni: tipo === 'atestado' ? '' : document.getElementById('input-hora-int-ini').value,
    intFim: tipo === 'atestado' ? '' : document.getElementById('input-hora-int-fim').value,
    saida: tipo === 'atestado' ? '' : document.getElementById('input-hora-saida').value,
    abonoMin: tipo === 'atestado' ? (new Date(dataIso + 'T12:00:00').getDay() === 6 ? 240 : 480) : 0,
    jornadaReferencia: tipo === 'atestado' ? (new Date(dataIso + 'T12:00:00').getDay() === 6 ? '13:00–17:00 (sábado)' : '13:00–21:20 (dia útil; 8h de abono)') : '', 
    motivo: document.getElementById('input-motivo-detalhado').value,
    gerente: document.getElementById('input-responsavel').value,
    origem: 'Ajuste registrado no navegador; declaração do operador, sem validação independente',
    isAutoGerado: false // Ao editar/salvar via modal, remove a tag de AutoGerado (fica Verde)
  };
  
  if (tipo === 'ponto' && new Date(dataIso + 'T12:00:00').getDay() === 6) {
    const m=calcularTrabalhoMarina(tempAjustePendente.entrada,tempAjustePendente.intIni,tempAjustePendente.intFim,tempAjustePendente.saida);
    if(m>360) alert('Atenção: este sábado ultrapassa o parâmetro geral de 2 horas extras do art. 59 da CLT. O registro foi mantido para conferência, sem correção automática.');
  }
  document.getElementById('conf-data').textContent = dataIso.split('-').reverse().join('/');
  document.getElementById('conf-saida').textContent = tipo === 'atestado' ? 'Sem batida • abono ' + minsToClock(tempAjustePendente.abonoMin) : tempAjustePendente.saida;
  document.getElementById('conf-motivo').textContent = tempAjustePendente.motivo;
  
  const senhaInput = document.getElementById('input-senha-gerente');
  const senhaErro = document.getElementById('senha-erro');
  if(senhaInput) senhaInput.value = '';
  if(senhaErro) senhaErro.style.display = 'none';
  
  document.getElementById('modal-confirmacao').classList.add('open');
}

function efetivarAjusteConfirmado() {
  if(!tempAjustePendente) return;
  
  const senhaDigitada = document.getElementById('input-senha-gerente').value;
  if(senhaDigitada !== "9999") {
    const erroEl = document.getElementById('senha-erro');
    if(erroEl) erroEl.style.display = 'block';
    return;
  }

  const versaoAnterior = obterAjusteParaDia(tempAjustePendente.chaveUnicaAjuste);
  tempAjustePendente.registradoEm = new Date().toISOString();
  tempAjustePendente.valorAnterior = versaoAnterior ||
    (ehFuncionarioMarina(tempAjustePendente.funcId)
      ? buscarJornadaRevisadaMarina(tempAjustePendente.dataIso) : buscarPontoEquipe(tempAjustePendente.funcId, tempAjustePendente.dataIso));
  ajustesAoVivo[tempAjustePendente.chaveUnicaAjuste] = tempAjustePendente;
  localStorage.setItem('bancoPontoRioBranco', JSON.stringify(ajustesAoVivo)); 
  
  atualizarLogAuditoriaVisual(tempAjustePendente, false); // prepend na lista
  if (typeof window.renderizarAtestadosMarina === 'function') window.renderizarAtestadosMarina();
  fecharModal('modal-confirmacao');
  renderizarTabela();
  setTimeout(() => switchPage('page-espelho'), 300);
}

function atualizarLogAuditoriaVisual(ajuste, append = false) {
  const logContainer = document.getElementById('live-session-logs');
  if (!logContainer) return;

  const [ano, mes, dia] = ajuste.dataIso.split('-');
  const funcNome = FUNCIONARIOS.find(f => f.id === ajuste.funcId)?.nome || "Colaborador";
  
  const entradaLog = document.createElement('div');
  entradaLog.style.padding = "8px 0";
  entradaLog.style.borderBottom = "1px solid #e2e8f0";
  
  const badgeCor = ajuste.tipo === "atestado" || ajuste.isDemonstrativo ? "var(--warning)" : "var(--success)";
  const badgeTexto = ajuste.tipo === 'atestado' ? '[ATESTADO MÉDICO • AUSÊNCIA ABONADA]' : ajuste.isAutoGerado ? '[REGISTRO AUTOMÁTICO ANTIGO]' : '[PONTO AJUSTADO]';
  
  entradaLog.innerHTML = `
    <span style="color:${badgeCor}; font-weight:bold;">${badgeTexto}</span> 
    <strong>${funcNome}</strong>: Dia <strong>${dia}/${mes}/${ano}</strong> ${ajuste.tipo === 'atestado' ? 'afastamento justificado: ' + minsToClock(minutosAbonoAtestado(ajuste)) + ' abonadas; sem marcação de ponto' : 'retificado para Ent: ' + ajuste.entrada + ' | Int: ' + ajuste.intIni + '-' + ajuste.intFim + ' | Saída: ' + ajuste.saida}. 
    <br><span style="color:var(--gray-600); font-size: 0.8rem;">Responsável informado: ${escaparHTML(ajuste.gerente)}. Motivo: ${escaparHTML(ajuste.motivo)}</span>
  `;
  
  if (logContainer.innerText.includes('Nenhum ajuste')) {
    logContainer.innerHTML = '';
  }
  
  if (append) {
    logContainer.appendChild(entradaLog);
  } else {
    logContainer.prepend(entradaLog);
  }
}

function fecharModal(id) { 
  const modal = document.getElementById(id);
  if(modal) modal.classList.remove('open'); 
}

// ==========================================
// 6. MÓDULO DE IMPRESSÃO GERENCIAL
// ==========================================
function imprimirLog(tipo) {
  const funcIdSelecionado = document.getElementById('select-colaborador').value;
  const funcNome = FUNCIONARIOS.find(f => f.id === funcIdSelecionado)?.nome || "Colaborador";
  
  let html = `<div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 20px;">`;
  html += `<h2 style="margin-bottom: 5px;">Relatório de Auditoria e Ajustes Gerenciais</h2>`;
  html += `<h3 style="color: #475569; margin-top: 0; font-weight: normal;">Filtro: ${tipo === 'geral' ? 'Todos os Funcionários' : 'Individual - ' + funcNome}</h3>`;
  html += `<hr style="margin-bottom: 20px;"><br>`;
  
  let logs = obterAjustesAtivos();
  // Ordena para impressão
  logs.sort((a,b) => b.dataIso.localeCompare(a.dataIso));
  
  if (tipo === 'individual') {
    logs = logs.filter(a => a.funcId === funcIdSelecionado);
  }
  
  if (logs.length === 0) {
    html += `<p style="color: #666;">Nenhum ajuste encontrado para este filtro.</p>`;
  } else {
    logs.forEach(ajuste => {
      let [ano, mes, dia] = ajuste.dataIso.split('-');
      let nome = FUNCIONARIOS.find(f => f.id === ajuste.funcId)?.nome || "Desconhecido";
      let statusInfo = ajuste.tipo === 'atestado' ? '<span style="color: #d97706; font-weight: bold;">[Atestado médico • ausência abonada]</span>' : ajuste.isAutoGerado ? '<span style="color: #d97706; font-weight: bold;">[Registro antigo automático]</span>' : '<span style="color: #d97706; font-weight: bold;">[Ponto Ajustado]</span>';
      
      html += `<div style="margin-bottom:15px; padding-bottom:15px; border-bottom:1px solid #ccc; font-size: 14px; line-height: 1.6;">
        <strong>Data Referência:</strong> ${dia}/${mes}/${ano} ${statusInfo}<br>
        <strong>Colaborador:</strong> ${nome} (Mat. ${ajuste.funcId}) <br>
        ${ajuste.tipo === 'atestado' ? '<strong>Ausência justificada:</strong> ' + minsToClock(minutosAbonoAtestado(ajuste)) + ' de abono • ' + escaparHTML(ajuste.jornadaReferencia || '') + ' • sem batidas' : '<strong>Horários Gravados:</strong> Entrada: ' + escaparHTML(ajuste.entrada) + ' | Início Int: ' + escaparHTML(ajuste.intIni) + ' | Fim Int: ' + escaparHTML(ajuste.intFim) + ' | Saída: ' + escaparHTML(ajuste.saida)} <br>
        <strong>Motivo do Ajuste:</strong> ${escaparHTML(ajuste.motivo)} <br>
        <strong>Responsável pelo lançamento:</strong> ${escaparHTML(ajuste.gerente || "Não informado")}
      </div>`;
    });
  }
  html += `<footer style="margin-top:42px;page-break-inside:avoid;text-align:center"><div style="font:italic 29px 'Segoe Script','URW Chancery L','Brush Script MT',cursive; color:#172b45">Gabriela Sales de Almeida</div><div style="border-top:1px solid #334155;width:340px;max-width:100%;margin:4px auto;padding-top:5px;font:12px Arial,sans-serif">Gabriela Sales de Almeida — Proprietária do Mercado<br><small>Identificação tipográfica, não assinatura manuscrita</small></div></footer></div>`;
  
  let janelaPrint = window.open('', '', 'width=800,height=600');
  janelaPrint.document.write(html);
  janelaPrint.document.close();
  setTimeout(() => {
    janelaPrint.print();
  }, 300);
}

// ==========================================
// RENDERIZAÇÃO DA TABELA COM TOLERÂNCIA CLT (ART. 58, §1º)
// ==========================================
function renderizarTabela() {
  const compEl = document.getElementById('select-competencia');
  const funcEl = document.getElementById('select-colaborador');
  const tbody = document.getElementById('ponto-corpo');
  if(!compEl || !funcEl || !tbody) return;
  
  const comp = compEl.value;
  const funcId = funcEl.value;
  const func = FUNCIONARIOS.find(f => f.id === funcId);
  tbody.innerHTML = '';

  const [ano, mes] = comp.split('-').map(Number);
  const totalDias = new Date(ano, mes, 0).getDate();
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const baseMins = calcularTrabalhoMarina(func.turno.entBase, func.turno.intIni, func.turno.intFim, func.turno.saiBase);

  let totalTrabMes = 0, totalExtraMes = 0, totalAtrasoMes = 0, totalAbonoMes = 0;
  let totalDevidoMarina = 0;

  for (let dia = 1; dia <= totalDias; dia++) {
    const dataObj = new Date(ano, mes - 1, dia);
    const diaSemanaIndex = dataObj.getDay();
    const strDia = String(dia).padStart(2, '0');
    const strMes = String(mes).padStart(2, '0');
    const dataFormatada = `${strDia}/${strMes}/${ano}`;
    const chaveDataIso = `${ano}-${strMes}-${strDia}`;
    const chaveUnicaAjuste = `${funcId}_${chaveDataIso}`;
    const tr = document.createElement('tr');

    const ehMarina = (funcId === "0142");

    if (ehMarina && ano === 2025 && mes === 3 && dia < 3) {
      tr.className = 'weekend';
      tr.innerHTML = `<td>${dataFormatada}</td><td>${diasSemana[diaSemanaIndex]}</td><td>--:--</td><td>--:--</td><td>--:--</td><td>--:--</td><td>00:00</td><td>00:00</td><td style="color:#64748b; font-style: italic;">Antes da Admissão</td><td class="no-print">---</td>`;
      tbody.appendChild(tr); continue;
    }

    if (diaSemanaIndex === 0) {
      tr.className = 'weekend';
      const textoDsr = ehFuncionarioMarina(funcId) && chaveDataIso === '2025-06-15'
        ? 'Descanso Semanal Remunerado (DSR) • incluído no período do atestado 14–16/06; sem abono adicional'
        : 'Descanso Semanal Remunerado (DSR)';
      tr.innerHTML = `<td>${dataFormatada}</td><td><strong>Dom</strong></td><td>--:--</td><td>--:--</td><td>--:--</td><td>--:--</td><td>00:00</td><td>00:00</td><td style="color:#64748b; font-style: italic;">${textoDsr}</td><td class="no-print">---</td>`;
      tbody.appendChild(tr); continue;
    }

    const ajusteAoVivo = obterAjusteParaDia(chaveUnicaAjuste);
    const registroRevisado = ehMarina ? buscarJornadaRevisadaMarina(chaveDataIso) : null;
    const pontoCompleto = ehMarina ? buscarPontoCompletoMarina(chaveDataIso) : null;
    const baseDiaMins = diaSemanaIndex === 6 ? 240 : baseMins;
    const pontoEquipe = !ehMarina ? buscarPontoEquipe(funcId, chaveDataIso) : null;
    
    let ent, intIni, intFim, sai, statusTag, rowClass = "";
    let trabMins = 0;
    let possuiMarcacao = false;

    if (ajusteAoVivo?.tipo === 'atestado') {
      ent = intIni = intFim = sai = '--:--';
      trabMins = 0;
      possuiMarcacao = false;
      totalAbonoMes += minutosAbonoAtestado(ajusteAoVivo);
      rowClass = 'ajustado-row marina-atestado-row';
      statusTag = `<button type="button" class="tag-badge tag-warning ajuste-detalhe-trigger" onclick="abrirDetalhesAjuste('${chaveUnicaAjuste}')">Atestado médico • Ponto Ajustado</button>`;
    } else if (ajusteAoVivo) {
      possuiMarcacao = !ajusteAoVivo.isAutoGerado;
      ent = ajusteAoVivo.entrada; 
      intIni = ajusteAoVivo.intIni || func.turno.intIni; 
      intFim = ajusteAoVivo.intFim || func.turno.intFim; 
      sai = ajusteAoVivo.saida;
      rowClass = "ajustado-row";
      statusTag = `<button type="button" class="tag-badge tag-warning ajuste-detalhe-trigger" onclick="abrirDetalhesAjuste('${chaveUnicaAjuste}')">Ponto Ajustado</button>`;
      trabMins = calcularTrabalhoMarina(ent, intIni, intFim, sai);
    } else if (ehMarina) {
      if (registroRevisado) {
        possuiMarcacao = true;
        ent = registroRevisado.entrada;
        intIni = registroRevisado.intervaloInicio === '—' ? '--:--' : registroRevisado.intervaloInicio;
        intFim = registroRevisado.intervaloFim === '—' ? '--:--' : registroRevisado.intervaloFim;
        sai = registroRevisado.saida;
        statusTag = `<span class="tag-badge tag-recent">Ponto registrado</span>`;
          if (registroRevisado?.classificacao?.startsWith('Cenário alternativo')) {
            statusTag = `<button type="button" class="tag-badge tag-warning" onclick="abrirComparativoSabado('${chaveDataIso}')" title="Consultar horários originais e cenário">Cenário de sábado • comparar</button>`;
          }
        rowClass = 'marina-fonte-row';
      } else if (pontoCompleto) {
        possuiMarcacao = true;
        ent = pontoCompleto.entrada;
        intIni = pontoCompleto.intervaloInicio;
        intFim = pontoCompleto.intervaloFim;
        sai = pontoCompleto.saida;
        rowClass = 'marina-fonte-row marina-complementado-row';
        statusTag = `<span class="tag-badge tag-recent">Ponto registrado</span>`;
          if (registroRevisado?.classificacao?.startsWith('Cenário alternativo')) {
            statusTag = `<button type="button" class="tag-badge tag-warning" onclick="abrirComparativoSabado('${chaveDataIso}')" title="Consultar horários originais e cenário">Cenário de sábado • comparar</button>`;
          }
      } else {
        ent = intIni = intFim = sai = '--:--';
        statusTag = `<span class="tag-badge tag-warning">Origem ausente</span>`;
        rowClass = 'marina-escala-row';
      }
      trabMins = calcularTrabalhoMarina(ent, intIni, intFim, sai);
    } else if (pontoEquipe) {
      ent = pontoEquipe.entrada; intIni = pontoEquipe.intIni;
      intFim = pontoEquipe.intFim; sai = pontoEquipe.saida;
      possuiMarcacao = true;
      rowClass = 'equipe-simulada-row';
      statusTag = `<span class="tag-badge tag-recent">Ponto registrado</span>`;
          if (registroRevisado?.classificacao?.startsWith('Cenário alternativo')) {
            statusTag = `<button type="button" class="tag-badge tag-warning" onclick="abrirComparativoSabado('${chaveDataIso}')" title="Consultar horários originais e cenário">Cenário de sábado • comparar</button>`;
          }
      trabMins = calcularTrabalhoMarina(ent,intIni,intFim,sai);
    } else {
      ent = intIni = intFim = sai = '--:--';
      statusTag = `<span class="tag-badge tag-warning">Sem dados</span>`;
    }

    if (possuiMarcacao) totalTrabMes += trabMins;

    // APURAÇÃO DOS SALDOS POR JORNADA EFETIVA
    const saldoBrutoMins = possuiMarcacao ? (trabMins - baseDiaMins) : 0;
    if (possuiMarcacao && diaSemanaIndex === 6 && saldoBrutoMins > 120) {
      statusTag += ` <span class="tag-badge tag-warning">⚠️ Acima de 2h extras — conferir</span>`;
    }
    let saldoEfetivoMins = saldoBrutoMins;

    // Não zerar saldos diários com base apenas no total líquido de até 10min.
    // O art. 58, §1º, trata de variações de marcação; o saldo aqui é uma apuração ilustrativa de jornada.

    if (saldoEfetivoMins > 0) {
      totalDevidoMarina += saldoEfetivoMins;
      statusTag += ` <span class="marina-extra-ok">Hora extra: +${minsToClock(saldoEfetivoMins)}</span>`;
    }

    let strSaldo;
    if (!possuiMarcacao) {
      strSaldo = `—`;
    } else if (saldoEfetivoMins > 0) {
      strSaldo = `<span style="color:var(--danger); font-weight:bold;">+${minsToClock(saldoEfetivoMins)}</span>`;
      totalExtraMes += saldoEfetivoMins;
    } else if (saldoEfetivoMins < 0) {
      strSaldo = `<span style="color:var(--warning);">${minsToClock(Math.abs(saldoEfetivoMins))}</span>`;
      totalAtrasoMes += Math.abs(saldoEfetivoMins);
    } else {
      strSaldo = `00:00`;
    }

    tr.className = rowClass;
    tr.innerHTML = `
      <td><strong>${dataFormatada}</strong></td><td>${diasSemana[diaSemanaIndex]}</td>
      <td>${ent}</td><td style="vertical-align: middle;">${intIni}</td><td style="vertical-align: middle;">${intFim}</td>
      <td><strong>${sai}</strong></td>
      <td>${ajusteAoVivo?.tipo === 'atestado' ? '—' : possuiMarcacao ? minsToClock(trabMins) : '—'}</td><td>${ajusteAoVivo?.tipo === 'atestado' ? '00:00' : strSaldo}</td><td>${statusTag}</td>
      <td class="no-print"><button class="btn btn-secondary" style="padding: 2px 7px; font-size: 0.72rem;" onclick="abrirLancadorParaData('${chaveUnicaAjuste}', '${ent}', '${intIni}', '${intFim}', '${sai}')">Ajustar</button></td>
    `;
    tbody.appendChild(tr);
  }

  const avisoCenario = document.getElementById('aviso-cenario-sabados');
  if (avisoCenario) avisoCenario.hidden = !ehFuncionarioMarina(funcId);
  const declaracao = document.getElementById('ponto-declaracao-impressao');
  if (declaracao) declaracao.textContent = ehFuncionarioMarina(funcId) ?
    'Cenário de adequação para estudo: quatro jornadas de sábado foram hipoteticamente ajustadas; os horários V12 anteriores estão preservados em comparativo. Documento não substitui controle original.' :
    'Espelho demonstrativo de jornada, sem comprovação independente de marcações.';
    const setTxtSafely = (elId, txt) => { const el = document.getElementById(elId); if(el) el.textContent = txt; };
  setTxtSafely('resumo-total-trab', minsToTime(totalTrabMes));
  setTxtSafely('resumo-total-abono', minsToTime(totalAbonoMes));
  setTxtSafely('resumo-total-extra', "+" + minsToTime(totalExtraMes));
  setTxtSafely('resumo-total-atraso', "-" + minsToTime(totalAtrasoMes));
  setTxtSafely('resumo-total-devido', minsToTime(totalDevidoMarina));
}

// ==========================================
// EMISSÃO E IMPRESSÃO DO HOLERITE / RECIBO MENSAL
// ==========================================
function imprimirReciboPagamento() {
  const compEl = document.getElementById('select-competencia');
  const funcEl = document.getElementById('select-colaborador');
  if(!compEl || !funcEl) return;

  const comp = compEl.value; // ex: "2025-03"
  const funcId = funcEl.value;
  const func = FUNCIONARIOS.find(f => f.id === funcId);
  if(!func) return;

  const [ano, mes] = comp.split('-');
  const competenciaTexto = `${mes}/${ano}`;

  const salarioBase = func.salarioBase || 1620.00;
  const departamento = func.departamento || "Operações / Frente de Caixa";
  const cpf = func.cpf || "341.582.910-44";
  const rg = func.rg || "28.491.032-5";
  const auxTransporte = 250.00;

  // Recálculo mensal a partir do excedente diário (mesma regra dos resumos)
  let totalExtraMin = 0;
  const totalDias = new Date(Number(ano), Number(mes), 0).getDate();
  const baseMins = calcularTrabalhoMarina(func.turno.entBase, func.turno.intIni, func.turno.intFim, func.turno.saiBase);

  for (let dia = 1; dia <= totalDias; dia++) {
    const dataObj = new Date(Number(ano), Number(mes) - 1, dia);
    if (dataObj.getDay() === 0) continue;

    const strDia = String(dia).padStart(2, '0');
    const chaveDataIso = `${ano}-${mes}-${strDia}`;
    const chaveUnicaAjuste = `${funcId}_${chaveDataIso}`;
    const ajusteAoVivo = obterAjusteParaDia(chaveUnicaAjuste);
    const ehMarina = (funcId === "0142");

    if (ehMarina && Number(ano) === 2025 && Number(mes) === 3 && dia < 3) continue;

    let trabMins = 0;
    let possuiMarcacao = false;

    if (ajusteAoVivo?.tipo === 'atestado') {
      possuiMarcacao = false;
    } else if (ajusteAoVivo) {
      possuiMarcacao = !ajusteAoVivo.isAutoGerado;
      trabMins = calcularTrabalhoMarina(ajusteAoVivo.entrada, ajusteAoVivo.intIni || func.turno.intIni, ajusteAoVivo.intFim || func.turno.intFim, ajusteAoVivo.saida);
    } else if (ehMarina) {
      const regRev = buscarJornadaRevisadaMarina(chaveDataIso);
      const pontoComp = buscarPontoCompletoMarina(chaveDataIso);
      if (regRev) {
        possuiMarcacao = true;
        trabMins = calcularTrabalhoMarina(regRev.entrada, regRev.intervaloInicio === '—' ? '--:--' : regRev.intervaloInicio, regRev.intervaloFim === '—' ? '--:--' : regRev.intervaloFim, regRev.saida);
      } else if (pontoComp) {
        possuiMarcacao = true;
        trabMins = calcularTrabalhoMarina(pontoComp.entrada, pontoComp.intervaloInicio, pontoComp.intervaloFim, pontoComp.saida);
      }
    } else {
      const pontoEq = buscarPontoEquipe(funcId, chaveDataIso);
      if (pontoEq) {
        possuiMarcacao = true;
        trabMins = calcularTrabalhoMarina(pontoEq.entrada, pontoEq.intIni, pontoEq.intFim, pontoEq.saida);
      }
    }

    const baseDiaMins = dataObj.getDay() === 6 ? 240 : baseMins;
    const saldoMins = possuiMarcacao ? (trabMins - baseDiaMins) : 0;
    
    // Apuração dos excedentes positivos da competência, mesma base do espelho
    if (possuiMarcacao && saldoMins > 0) {
      totalExtraMin += saldoMins;
    }
  }

  // Cálculos financeiros (Adicional de 50%)
  const valorHoraBase = salarioBase / 220;
  const valorHoraExtra50 = valorHoraBase * 1.5;
  const horasExtrasDecimais = totalExtraMin / 60;
  const valorTotalHorasExtras = horasExtrasDecimais * valorHoraExtra50;

  const totalVencimentos = salarioBase + auxTransporte + valorTotalHorasExtras;
  const totalDescontos = 0.00;
  const valorLiquido = totalVencimentos;

  const formatarMoeda = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const horasExtrasTexto = `${Math.floor(totalExtraMin / 60)}h ${String(totalExtraMin % 60).padStart(2, '0')}m (50%)`;

  const htmlDoc = `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <title>Recibo de Pagamento Mensal - ${func.nome}</title>
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; margin: 25px; color: #1e293b; background: #fff; font-size: 13px; }
      .recibo-box { border: 2px solid #1e3a8a; padding: 25px; max-width: 800px; margin: 0 auto; border-radius: 8px; }
      .header { text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 20px; }
      .header h1 { margin: 0; font-size: 20px; color: #1e3a8a; letter-spacing: 1px; }
      .header p { margin: 4px 0 0 0; font-size: 12px; color: #64748b; }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; border-radius: 6px; margin-bottom: 20px; }
      .info-item { line-height: 1.6; }
      .info-item strong { color: #1e3a8a; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th, td { border: 1px solid #cbd5e1; padding: 9px 12px; text-align: left; }
      th { background-color: #f1f5f9; color: #1e3a8a; font-weight: 700; text-transform: uppercase; font-size: 11px; }
      td.right { text-align: right; }
      td.center { text-align: center; }
      .totals-row { background-color: #f8fafc; font-weight: bold; }
      .net-pay { background-color: #ecfdf5; border: 2px solid #10b981; padding: 12px 16px; border-radius: 6px; text-align: right; font-size: 16px; color: #047857; margin-bottom: 25px; }
      .declaration { font-size: 11px; color: #475569; text-align: justify; margin-bottom: 35px; line-height: 1.5; border-left: 3px solid #1e3a8a; padding-left: 10px; }
      .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 30px; text-align: center; }
      .sig-block { display: flex; flex-direction: column; align-items: center; }
      .sig-cursive { font-family: 'Segoe Script', 'URW Chancery L', cursive, sans-serif; font-size: 19px; color: #0f172a; margin-bottom: -4px; min-height: 32px; }
      .sig-line { border-top: 1px solid #334155; width: 100%; padding-top: 6px; font-size: 11px; font-weight: 600; color: #334155; }
      @media print { body { margin: 0; } .recibo-box { border: 1px solid #000; padding: 18px; } }
    </style>
  </head>
  <body>
    <div class="recibo-box">
      <div class="header">
        <h1>RECIBO DE PAGAMENTO MENSAL</h1>
        <p>Mercado Rio Branco Ltda. • CNPJ: 35.999.335/0001-15</p>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <strong>Empregador:</strong> Mercado Rio Branco Ltda.<br>
          <strong>CNPJ:</strong> 35.999.335/0001-15<br>
          <strong>Competência:</strong> ${competenciaTexto}
        </div>
        <div class="info-item">
          <strong>Empregado:</strong> ${func.nome}<br>
          <strong>Matrícula / CPF:</strong> ${func.id} / ${cpf}<br>
          <strong>Função / RG:</strong> ${func.cargo} (RG: ${rg})<br>
          <strong>Departamento:</strong> ${departamento}
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th class="center" style="width: 55px;">Cód.</th>
            <th>Descrição</th>
            <th class="center" style="width: 120px;">Referência</th>
            <th class="right" style="width: 135px;">Vencimentos (R$)</th>
            <th class="right" style="width: 135px;">Descontos (R$)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="center">001</td>
            <td>Salário Base Mensal</td>
            <td class="center">220h</td>
            <td class="right">${formatarMoeda(salarioBase)}</td>
            <td class="right"></td>
          </tr>
          <tr>
            <td class="center">015</td>
            <td>Auxílio Transporte</td>
            <td class="center">Fixo Mensal</td>
            <td class="right">${formatarMoeda(auxTransporte)}</td>
            <td class="right"></td>
          </tr>
          <tr>
            <td class="center">050</td>
            <td>Horas Extras (50%)</td>
            <td class="center">${horasExtrasTexto}</td>
            <td class="right">${formatarMoeda(valorTotalHorasExtras)}</td>
            <td class="right"></td>
          </tr>
          <tr class="totals-row">
            <td colspan="3" class="right">Totais:</td>
            <td class="right" style="color: #059669;">${formatarMoeda(totalVencimentos)}</td>
            <td class="right">${formatarMoeda(totalDescontos)}</td>
          </tr>
        </tbody>
      </table>
      <div class="net-pay">
        <strong>VALOR LÍQUIDO A RECEBER: ${formatarMoeda(valorLiquido)}</strong>
      </div>
      <div class="declaration">
        Declaro ter recebido da empresa Mercado Rio Branco Ltda. a importância líquida discriminada neste recibo de pagamento, correspondente ao salário, auxílio transporte e horas extras relativas à competência <strong>${competenciaTexto}</strong>, dando plena e geral quitação.
      </div>
      <div class="signatures">
        <div class="sig-block">
          <div class="sig-cursive">${func.nome}</div>
          <div class="sig-line">${func.nome}<br>Assinatura da Empregada</div>
        </div>
        <div class="sig-block">
          <div class="sig-cursive">Gabriela Sales de Almeida</div>
          <div class="sig-line">Gabriela Sales de Almeida<br>Responsável pelo Empregador</div>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  const janelaPrint = window.open('', '_blank', 'width=850,height=750');
  janelaPrint.document.write(htmlDoc);
  janelaPrint.document.close();
  setTimeout(() => { janelaPrint.print(); }, 300);
}

// V13: comparação visível e imprimível, sem sobrescrever comprovações do passado.
const COMPARATIVO_SABADOS_V13 = {"2025-03-15": {"original": {"entrada": "13:05", "intervaloInicio": "15:30", "intervaloFim": "16:30", "saida": "21:56", "conferenciaInicio": "21:36", "conferenciaFim": "21:52"}, "cenario": {"entrada": "13:05", "intervaloInicio": "15:58", "intervaloFim": "16:13", "saida": "18:53", "conferenciaInicio": "18:33", "conferenciaFim": "18:48"}}, "2025-09-06": {"original": {"entrada": "13:00", "intervaloInicio": "15:45", "intervaloFim": "16:45", "saida": "21:55", "conferenciaInicio": "21:36", "conferenciaFim": "21:52"}, "cenario": {"entrada": "12:58", "intervaloInicio": "16:12", "intervaloFim": "16:27", "saida": "18:56", "conferenciaInicio": "18:37", "conferenciaFim": "18:51"}}, "2026-05-09": {"original": {"entrada": "13:01", "intervaloInicio": "16:00", "intervaloFim": "17:00", "saida": "22:00", "conferenciaInicio": "21:46", "conferenciaFim": "21:58"}, "cenario": {"entrada": "13:01", "intervaloInicio": "15:48", "intervaloFim": "16:03", "saida": "18:58", "conferenciaInicio": "18:41", "conferenciaFim": "18:54"}}, "2026-08-29": {"original": {"entrada": "13:05", "intervaloInicio": "16:10", "intervaloFim": "17:10", "saida": "22:00", "conferenciaInicio": "21:44", "conferenciaFim": "21:56"}, "cenario": {"entrada": "13:05", "intervaloInicio": "16:04", "intervaloFim": "16:19", "saida": "18:55", "conferenciaInicio": "18:38", "conferenciaFim": "18:52"}}};
function abrirComparativoSabado(iso) {
  const row=COMPARATIVO_SABADOS_V13[iso]; if(!row) return;
  const fmt=t=>String(t||'—').replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const tr=x=>`<tr><td>${fmt(x.entrada)}</td><td>${fmt(x.intervaloInicio)}–${fmt(x.intervaloFim)}</td><td><b>${fmt(x.saida)}</b></td><td>${fmt(x.conferenciaInicio)}–${fmt(x.conferenciaFim)}</td></tr>`;
  const box=document.getElementById('cenario-comparacao-conteudo');
  box.innerHTML=`<b>Data: ${iso.split('-').reverse().join('/')}</b><table class="ponto-table" style="width:100%;margin-top:12px"><thead><tr><th>Entrada</th><th>Intervalo</th><th>Saída</th><th>Conferência</th></tr></thead><tbody><tr><th colspan="4" style="text-align:left">Registro anterior (base V12)</th></tr>${tr(row.original)}<tr><th colspan="4" style="text-align:left">Cenário de adequação (V13)</th></tr>${tr(row.cenario)}</tbody></table><p style="font-size:12px;margin-top:12px">Fonte do registro anterior preservada no pacote, em <code>fontes/base_original_v12</code>.</p>`;
  document.getElementById('modal-cenario-sabado').classList.add('open');
}

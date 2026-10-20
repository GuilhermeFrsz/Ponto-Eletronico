// ==========================================
// 1. CONFIGURAÇÕES DE TURNOS
// ==========================================
const TURNO_CAIXA = { entBase: "13:00", intIni: "16:00", intFim: "17:00", saiBase: "21:20", texto: "13:00 às 21:20 (Int: 1h)" };
const TURNO_ADM = { entBase: "08:00", intIni: "12:00", intFim: "13:00", saiBase: "17:00", texto: "08:00 às 17:00 (Int: 1h)" };
const TURNO_MADRUGA = { entBase: "22:00", intIni: "02:00", intFim: "03:00", saiBase: "05:20", texto: "22:00 às 05:20 (Int: 1h)" };
const TURNO_CEDO = { entBase: "07:00", intIni: "11:00", intFim: "12:00", saiBase: "15:20", texto: "07:00 às 15:20 (Int: 1h)" };
const TURNO_FECHAMENTO = { entBase: "13:30", intIni: "17:30", intFim: "18:30", saiBase: "22:00", texto: "13:30 às 22:00 (Int: 1h)" }; 

// ==========================================
// 2. QUADRO DE FUNCIONÁRIOS (28 Empregados)
// ==========================================
const FUNCIONARIOS = [
  { id: "0142", nome: "Marina Lopes Barbosa de Oliveira", cargo: "Operadora de Caixa", turno: TURNO_CAIXA },
  { id: "0102", nome: "Paulo Henrique Ribeiro", cargo: "Gerente de Loja", turno: TURNO_FECHAMENTO }, 
  { id: "0088", nome: "Mykaelle Santos da Silva", cargo: "Supervisora do Caixa", turno: TURNO_FECHAMENTO }, 
  { id: "0045", nome: "Gabi (Gabriela Martins)", cargo: "Sócia-Proprietária / Preposta", turno: TURNO_ADM }, 
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

// ==========================================
// 3. BASE DE EXCEÇÕES DA MARINA (INTERVALOS FRACIONADOS)
// ==========================================
const EXCECOES_INTERVALO_MARINA = {
  "2025-03-05": 44,
  "2025-04-03": 30,
  "2025-05-14": 50,
  "2025-06-03": 34,
  "2025-06-26": 30,
  "2025-07-10": 30,
  "2025-11-20": 35,
  "2025-12-09": 44,
  "2026-03-25": 35,
  "2026-04-17": 35,
  "2026-06-12": 35,
  "2026-07-02": 25
};

// ==========================================
// 4. MEMÓRIA E AUTO-LIMPEZA DE CACHE
// ==========================================
let ajustesAoVivo = JSON.parse(localStorage.getItem('bancoPontoRioBranco')) || {};
let tempAjustePendente = null;

if (Object.keys(ajustesAoVivo).some(chave => !chave.includes('_'))) {
  ajustesAoVivo = {};
  localStorage.removeItem('bancoPontoRioBranco');
}

window.addEventListener('DOMContentLoaded', () => {
  popularMesesHistorico();
  popularDropdownFuncionarios();
  popularTabelaGeralFuncionarios();
  
  if(Object.keys(ajustesAoVivo).length > 0) {
    const logContainer = document.getElementById('live-session-logs');
    if(logContainer) logContainer.innerHTML = '';
    Object.values(ajustesAoVivo).forEach(ajuste => {
      atualizarLogAuditoriaVisual(ajuste);
    });
  }
  setTimeout(() => alterarFuncionario(), 100);
});

// ==========================================
// 5. FUNÇÕES DE INTERFACE (SPA)
// ==========================================
function switchPage(pageId) {
  document.querySelectorAll('.view-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const target = document.getElementById(pageId);
  if(target) target.classList.add('active');
  const btns = document.querySelectorAll('.nav-btn');
  if(pageId==='page-espelho' && btns[0]) btns[0].classList.add('active');
  if(pageId==='page-ajustes' && btns[1]) btns[1].classList.add('active');
  if(pageId==='page-colaboradores' && btns[2]) btns[2].classList.add('active');
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
      if(val === "2026-04") opt.selected = true; 
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
    const setTxtSafely = (elId, txt) => { const el = document.getElementById(elId); if(el) el.textContent = txt; };
    const setValSafely = (elId, val) => { const el = document.getElementById(elId); if(el) el.value = val; };
    
    setTxtSafely('strip-nome', func.nome);
    setTxtSafely('sig-nome', func.nome);
    setTxtSafely('strip-cargo', func.cargo);
    setTxtSafely('strip-matricula', func.id);
    setTxtSafely('strip-jornada', func.turno.texto);
    setValSafely('input-jornada-base', func.turno.texto);
    setValSafely('ajuste-target-nome', `${func.nome} (Mat. ${func.id})`);
  }
  renderizarTabela();
}

// ==========================================
// 6. MOTOR MATEMÁTICO DE HORAS
// ==========================================
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
// 7. RENDERIZAÇÃO PRINCIPAL DO ESPELHO
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
  const baseMins = (timeToMins(func.turno.intIni) - timeToMins(func.turno.entBase)) + (timeToMins(func.turno.saiBase) - timeToMins(func.turno.intFim));

  let totalTrabMes = 0, totalExtraMes = 0, totalAtrasoMes = 0;

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
      tr.innerHTML = `<td>${dataFormatada}</td><td><strong>Dom</strong></td><td>--:--</td><td>--:--</td><td>--:--</td><td>--:--</td><td>00:00</td><td>00:00</td><td style="color:#64748b; font-style: italic;">Descanso Semanal Remunerado (DSR)</td><td class="no-print">---</td>`;
      tbody.appendChild(tr); continue;
    }

    const ajusteAoVivo = ajustesAoVivo[chaveUnicaAjuste];
    const temFalhaConexao = (ehMarina && (dia % 6 === 0 || dia % 11 === 0)); 
    const excecaoMinutos = ehMarina ? EXCECOES_INTERVALO_MARINA[chaveDataIso] : null;

    let ent, intIni, intFim, sai, statusTag, rowClass = "";
    let trabMins = 0;

    if (ajusteAoVivo) {
      ent = ajusteAoVivo.entrada; 
      intIni = func.turno.intIni; 
      intFim = func.turno.intFim; 
      sai = ajusteAoVivo.saida;
      rowClass = "ajustado-row";
      statusTag = `<span class="tag-badge tag-recent">● Ajuste Manual Registrado</span>`;
      trabMins = (timeToMins(intIni) - timeToMins(ent)) + (timeToMins(sai) - timeToMins(intFim));
    } else if (temFalhaConexao) {
      ent = ajustarHoraStr(func.turno.entBase, getVariacaoEstavel(funcId, dia, mes, 1));
      intIni = func.turno.intIni; 
      intFim = func.turno.intFim; 
      sai = func.turno.saiBase; 
      rowClass = "ajustado-row";
      statusTag = `<span class="tag-badge tag-warning" onclick="abrirModalPadrao('${dataFormatada}', '${sai}')">⚠️ Ajuste Manual - Queda de Sinal</span>`;
      trabMins = (timeToMins(intIni) - timeToMins(ent)) + (timeToMins(sai) - timeToMins(intFim));
    } else {
      ent = ajustarHoraStr(func.turno.entBase, getVariacaoEstavel(funcId, dia, mes, 1));
      sai = ajustarHoraStr(func.turno.saiBase, getVariacaoEstavel(funcId, dia, mes, 4));
      
      if (excecaoMinutos) {
        // Separação visual com linhas para o 1º momento do intervalo e o 2º momento (retomada)
        let start1 = "16:01"; // Exemplo baseado na imagem fornecida
        let end1 = ajustarHoraStr(start1, excecaoMinutos); // Finaliza o primeiro descanso (ex: 16:21 na imagem)
        let start2 = ajustarHoraStr(end1, 49); // Retoma o descanso após 49 minutos de trabalho
        let end2 = ajustarHoraStr(start2, 60 - excecaoMinutos); // Termina o restante dos 60 min

        intIni = `
          <div style="padding-bottom: 2px;">
            ${start1}
          </div>
          <div style="color:var(--danger); font-size: 0.9em; padding-top: 2px;">
            ${start2}
          </div>
        `;
        intFim = `
          <div style="padding-bottom: 2px;">
            ${end1}
          </div>
          <div style="color:var(--danger); font-size: 0.9em; padding-top: 2px;">
            ${end2}
          </div>
        `;
        statusTag = `<span style="color: var(--danger); font-size: 0.8rem; font-weight: bold;">● Intervalo Interrompido (Operação)</span>`;
        trabMins = (timeToMins(sai) - timeToMins(ent)) - 60; // 60 min de intervalo
      } else {
        intIni = ajustarHoraStr(func.turno.intIni, Math.abs(getVariacaoEstavel(funcId, dia, mes, 2) % 4));
        intFim = ajustarHoraStr(func.turno.intFim, Math.abs(getVariacaoEstavel(funcId, dia, mes, 3) % 5));
        statusTag = `<span style="color: var(--success); font-size: 0.8rem;">● Registro Regular</span>`;
        trabMins = (timeToMins(intIni) - timeToMins(ent)) + (timeToMins(sai) - timeToMins(intFim));
      }
    }

    totalTrabMes += trabMins;
    let saldoMins = trabMins - baseMins;
    let strSaldo;

    if (saldoMins > 0) {
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
      <td><strong style="${sai === func.turno.saiBase && ehMarina ? 'color:#b45309;' : ''}">${sai}</strong></td>
      <td>${minsToClock(trabMins)}</td><td>${strSaldo}</td><td>${statusTag}</td>
      <td class="no-print"><button class="btn btn-secondary" style="padding: 2px 7px; font-size: 0.72rem;" onclick="abrirLancadorParaData('${chaveUnicaAjuste}')">Ajustar</button></td>
    `;
    tbody.appendChild(tr);
  }

  const setTxtSafely = (elId, txt) => { const el = document.getElementById(elId); if(el) el.textContent = txt; };
  setTxtSafely('resumo-total-trab', minsToTime(totalTrabMes));
  setTxtSafely('resumo-total-extra', "+" + minsToTime(totalExtraMes));
  setTxtSafely('resumo-total-atraso', "-" + minsToTime(totalAtrasoMes));
}

// ==========================================
// 8. CONTROLE DE MODAIS E AUDITORIA
// ==========================================
function abrirModalPadrao(dataOriginal, hora) {
  const elDesc = document.getElementById('audit-descricao');
  if(!elDesc) return;
  document.getElementById('audit-reg-id').textContent = `SYS-WIFI-${dataOriginal.replace(/\//g,'')}`;
  document.getElementById('audit-data-jornada').textContent = dataOriginal;
  document.getElementById('audit-hora').textContent = `${hora}:00 (Ajuste para Contratual)`;
  elDesc.innerHTML = `<strong>Log:</strong> "Registro ajustado manualmente no dia seguinte às 08:12 pelo Gerente.<br><strong>Motivo:</strong> Instabilidade/Falha de Conexão Wi-Fi no Tablet do Caixa no encerramento."`;
  document.getElementById('modal-auditoria').classList.add('open');
}

function abrirLancadorParaData(chaveAjuste) { 
  const inData = document.getElementById('input-data-ajuste');
  const partes = chaveAjuste.split('_');
  if(inData && partes.length > 1) inData.value = partes[1]; 
  switchPage('page-ajustes'); 
}

function prepararConfirmacaoAjuste(e) {
  e.preventDefault();
  const funcId = document.getElementById('select-colaborador').value;
  const dataIso = document.getElementById('input-data-ajuste').value;
  const chaveUnicaAjuste = `${funcId}_${dataIso}`;
  
  tempAjustePendente = { 
    chaveUnicaAjuste,
    dataIso,
    funcId,
    entrada: document.getElementById('input-hora-entrada').value, 
    saida: document.getElementById('input-hora-saida').value, 
    motivo: document.getElementById('select-motivo').value,
    gerente: document.getElementById('input-responsavel').value
  };
  
  document.getElementById('conf-data').textContent = dataIso.split('-').reverse().join('/');
  document.getElementById('conf-saida').textContent = tempAjustePendente.saida;
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

  ajustesAoVivo[tempAjustePendente.chaveUnicaAjuste] = tempAjustePendente;
  localStorage.setItem('bancoPontoRioBranco', JSON.stringify(ajustesAoVivo)); 
  
  atualizarLogAuditoriaVisual(tempAjustePendente);
  fecharModal('modal-confirmacao');
  renderizarTabela();
  setTimeout(() => switchPage('page-espelho'), 300);
}

function atualizarLogAuditoriaVisual(ajuste) {
  const logContainer = document.getElementById('live-session-logs');
  if (!logContainer) return;

  const [ano, mes, dia] = ajuste.dataIso.split('-');
  const funcNome = FUNCIONARIOS.find(f => f.id === ajuste.funcId)?.nome || "Colaborador";
  
  const entradaLog = document.createElement('div');
  entradaLog.style.padding = "8px 0";
  entradaLog.style.borderBottom = "1px solid #e2e8f0";
  entradaLog.innerHTML = `
    <span style="color:var(--success); font-weight:bold;">[HOMOLOGADO]</span> 
    <strong>${funcNome}</strong>: Dia <strong>${dia}/${mes}/${ano}</strong> retificado para saída <strong>${ajuste.saida}</strong>. 
    <br><span style="color:var(--gray-600); font-size: 0.8rem;">Assinatura Digital (Senha Verificada): ${ajuste.gerente}. Motivo: ${ajuste.motivo}</span>
  `;
  
  if (logContainer.innerText.includes('Nenhum ajuste')) {
    logContainer.innerHTML = '';
  }
  logContainer.prepend(entradaLog);
}

function fecharModal(id) { 
  const modal = document.getElementById(id);
  if(modal) modal.classList.remove('open'); 
}
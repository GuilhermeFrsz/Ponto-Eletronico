// ==========================================
// 1. MEMÓRIA E AUTO-LIMPEZA DE CACHE
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
  
  // INJETAR O HISTÓRICO DE QUEDAS DE CONEXÃO
  popularFalhasConexaoHistoricas();

  if(Object.keys(ajustesAoVivo).length > 0) {
    const logContainer = document.getElementById('live-session-logs');
    if(logContainer) logContainer.innerHTML = '';
    
    // Sort descending by date
    const sorted = Object.values(ajustesAoVivo).sort((a,b) => b.dataIso.localeCompare(a.dataIso));
    
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
    if (f.turno.saiBase === "21:20") {
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
              gerente: "Paulo Henrique Ribeiro (Gerente)",
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

function atualizarTextoMotivo() {
  const sel = document.getElementById('select-motivo');
  const txt = document.getElementById('input-motivo-detalhado');
  if (sel && txt) {
    txt.value = sel.options[sel.selectedIndex].value;
  }
}

// ==========================================
// 3. MOTOR MATEMÁTICO DE HORAS
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
    
    let ent, intIni, intFim, sai, statusTag, rowClass = "";
    let trabMins = 0;

    if (ajusteAoVivo) {
      ent = ajusteAoVivo.entrada; 
      intIni = ajusteAoVivo.intIni || func.turno.intIni; 
      intFim = ajusteAoVivo.intFim || func.turno.intFim; 
      sai = ajusteAoVivo.saida;
      rowClass = "ajustado-row";
      
      if (ajusteAoVivo.isAutoGerado) {
        statusTag = `<span class="tag-badge tag-warning" onclick="abrirModalPadrao('${dataFormatada}', '${sai}')">⚠️ Ajuste Manual - Queda de Sinal</span>`;
      } else {
        statusTag = `<span class="tag-badge tag-recent">● Ajuste Manual Registrado</span>`;
      }
      trabMins = (timeToMins(intIni) - timeToMins(ent)) + (timeToMins(sai) - timeToMins(intFim));
      
    } else {
      ent = ajustarHoraStr(func.turno.entBase, getVariacaoEstavel(funcId, dia, mes, 1));
      sai = ajustarHoraStr(func.turno.saiBase, getVariacaoEstavel(funcId, dia, mes, 4));
      intIni = ajustarHoraStr(func.turno.intIni, Math.abs(getVariacaoEstavel(funcId, dia, mes, 2) % 4));
      intFim = ajustarHoraStr(func.turno.intFim, Math.abs(getVariacaoEstavel(funcId, dia, mes, 3) % 5));
      statusTag = `<span style="color: var(--success); font-size: 0.8rem;">● Registro Regular</span>`;
      trabMins = (timeToMins(intIni) - timeToMins(ent)) + (timeToMins(sai) - timeToMins(intFim));
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
      <td><strong style="${sai === func.turno.saiBase && ehMarina && (!ajusteAoVivo || ajusteAoVivo.isAutoGerado) ? 'color:#b45309;' : ''}">${sai}</strong></td>
      <td>${minsToClock(trabMins)}</td><td>${strSaldo}</td><td>${statusTag}</td>
      <td class="no-print"><button class="btn btn-secondary" style="padding: 2px 7px; font-size: 0.72rem;" onclick="abrirLancadorParaData('${chaveUnicaAjuste}', '${ent}', '${intIni}', '${intFim}', '${sai}')">Ajustar</button></td>
    `;
    tbody.appendChild(tr);
  }

  const setTxtSafely = (elId, txt) => { const el = document.getElementById(elId); if(el) el.textContent = txt; };
  setTxtSafely('resumo-total-trab', minsToTime(totalTrabMes));
  setTxtSafely('resumo-total-extra', "+" + minsToTime(totalExtraMes));
  setTxtSafely('resumo-total-atraso', "-" + minsToTime(totalAtrasoMes));
}

// ==========================================
// 5. CONTROLE DE MODAIS E AUDITORIA
// ==========================================
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
  
  atualizarTextoMotivo();
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
    intIni: document.getElementById('input-hora-int-ini').value,
    intFim: document.getElementById('input-hora-int-fim').value,
    saida: document.getElementById('input-hora-saida').value, 
    motivo: document.getElementById('input-motivo-detalhado').value,
    gerente: document.getElementById('input-responsavel').value,
    isAutoGerado: false // Ao editar/salvar via modal, remove a tag de AutoGerado (fica Verde)
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
  
  atualizarLogAuditoriaVisual(tempAjustePendente, false); // prepend na lista
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
  
  const badgeCor = ajuste.isAutoGerado ? "var(--warning)" : "var(--success)";
  const badgeTexto = ajuste.isAutoGerado ? "[SISTEMA - QUEDA]" : "[HOMOLOGADO]";
  
  entradaLog.innerHTML = `
    <span style="color:${badgeCor}; font-weight:bold;">${badgeTexto}</span> 
    <strong>${funcNome}</strong>: Dia <strong>${dia}/${mes}/${ano}</strong> retificado para Ent: ${ajuste.entrada} | Int: ${ajuste.intIni}-${ajuste.intFim} | Saída: ${ajuste.saida}. 
    <br><span style="color:var(--gray-600); font-size: 0.8rem;">Assinatura Digital: ${ajuste.gerente}. Motivo: ${ajuste.motivo}</span>
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
  
  let logs = Object.values(ajustesAoVivo);
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
      let statusInfo = ajuste.isAutoGerado ? '<span style="color: #d97706; font-weight: bold;">[Queda de Sistema Detectada]</span>' : '<span style="color: #16a34a; font-weight: bold;">[Ajuste Manual]</span>';
      
      html += `<div style="margin-bottom:15px; padding-bottom:15px; border-bottom:1px solid #ccc; font-size: 14px; line-height: 1.6;">
        <strong>Data Referência:</strong> ${dia}/${mes}/${ano} ${statusInfo}<br>
        <strong>Colaborador:</strong> ${nome} (Mat. ${ajuste.funcId}) <br>
        <strong>Horários Gravados:</strong> Entrada: ${ajuste.entrada} | Início Int: ${ajuste.intIni} | Fim Int: ${ajuste.intFim} | Saída: ${ajuste.saida} <br>
        <strong>Motivo do Ajuste:</strong> ${ajuste.motivo} <br>
        <strong>Responsável (Assinatura):</strong> ${ajuste.gerente}
      </div>`;
    });
  }
  html += `</div>`;
  
  let janelaPrint = window.open('', '', 'width=800,height=600');
  janelaPrint.document.write(html);
  janelaPrint.document.close();
  setTimeout(() => {
    janelaPrint.print();
  }, 300);
}

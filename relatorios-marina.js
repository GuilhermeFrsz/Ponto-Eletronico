/* Relatórios acadêmicos revisados: sem leitura/escrita de localStorage e sem referência a ajustesAoVivo. */
(() => {
  'use strict';
  const dias = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  const config = {
    jornada: { linhas: 'marina-tbody-jornada', filtro: 'filtro-jornadas', contador: 'contador-jornadas', vazio: 'vazio-jornada' },
    falhas: { linhas: 'marina-tbody-falhas', filtro: 'filtro-falhas', contador: 'contador-falhas', vazio: 'vazio-falhas' }
  };
  let detalhesAbertos = [];

  // Os relatórios não possuem uma etapa de validação com senha.
  // A senha gerencial do espelho de ponto pertence exclusivamente ao módulo legado.
  // Mensagens de inconsistência de fonte ficam associadas às linhas afetadas e à impressão.

  function limparHTML(texto) {
    return String(texto ?? '—').replace(/[&<>"']/g, ch => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[ch]));
  }
  function formatoData(iso) {
    const partes = String(iso).split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : String(iso);
  }
  function simplificar(texto) {
    return String(texto).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  }
  function textoEscapado(valor) {
    return limparHTML(valor);
  }
  function conflitoData(data) {
    return MARINA_REVISADA.divergencias.some(item => item.data === data);
  }
  function validarLinha(r, grupo) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.data)) return `Data inválida (${grupo}: ${r.data}).`;
    const [ano, mes, dia] = r.data.split('-').map(Number);
    const utc = new Date(Date.UTC(ano, mes - 1, dia));
    if (utc.getUTCFullYear() !== ano || utc.getUTCMonth() !== mes - 1 || utc.getUTCDate() !== dia) {
      return `Data inexistente (${grupo}: ${r.data}).`;
    }
    if (simplificar(r.dia) !== simplificar(dias[utc.getUTCDay()])) {
      return `Dia da semana divergente em ${formatoData(r.data)} (${grupo}): ${r.dia} ≠ ${dias[utc.getUTCDay()]}.`;
    }
    return null;
  }
  function validarBase() {
    const inconsistencias = [];
    const chaves = new Set();
    for (const [tipo, registros] of [['jornada', MARINA_REVISADA.jornadas], ['falhas', MARINA_REVISADA.falhas]]) {
      for (const registro of registros) {
        const problema = validarLinha(registro, tipo);
        if (problema) inconsistencias.push(problema);
        const chave = tipo + '_' + registro.data;
        if (chaves.has(chave)) inconsistencias.push(`Data duplicada: ${formatoData(registro.data)} (${tipo}).`);
        chaves.add(chave);
      }
    }
    const fonte15J = MARINA_REVISADA.jornadas.find(x => x.data === '2026-08-15');
    const fonte15F = MARINA_REVISADA.falhas.find(x => x.data === '2026-08-15');
    if (!fonte15J || !fonte15F || fonte15J.saida !== '16:56' || fonte15F.horarioPrevisto !== '21:20') {
      inconsistencias.push('A divergência conhecida de 15/08/2026 precisa ser revisada contra a planilha de origem.');
    }
    return inconsistencias;
  }
  function detalhe(rotulo, valor) {
    return `<p><strong>${limparHTML(rotulo)}:</strong> ${textoEscapado(valor)}</p>`;
  }
  function detalhesHTML(html) {
    return `<details class="relatorio-detalhes"><summary>Ver informações completas</summary><div class="relatorio-detalhes-corpo">${html}</div></details>`;
  }
  function etiquetaConflito(data) {
    return conflitoData(data) ? `<span class="relatorio-etiqueta-alerta">⚠️ Divergência a validar</span>` : '';
  }
  function marcarBusca(registro) {
    // Filtros são apenas visuais, sem alterar os dados ou o conteúdo impresso.
    return simplificar(formatoData(registro.data) + ' ' + Object.values(registro).join(' '));
  }
  function linhaJornada(r) {
    const htmlDetalhes = detalhe('Jornada normal de referência', r.jornadaReferencia) +
      detalhe('Classificação do registro', r.classificacao) + detalhe('Observações da planilha', r.observacoes);
    const intervalo = r.intervaloInicio === '—' ? 'Sem intervalo' : `${textoEscapado(r.intervaloInicio)} – ${textoEscapado(r.intervaloFim)}`;
    const html = `<td><strong>${formatoData(r.data)}</strong>${etiquetaConflito(r.data)}</td>`+
      `<td>${textoEscapado(r.dia)}</td><td>${textoEscapado(r.entrada)}</td>`+
      `<td>${intervalo}</td><td><strong>${textoEscapado(r.saida)}</strong></td>`+
      `<td>${textoEscapado(r.conferenciaInicio)} – ${textoEscapado(r.conferenciaFim)}</td>`+
      `<td>${textoEscapado(r.tempoAlem)}</td>`+
      `<td><span class="relatorio-classificacao">${textoEscapado(r.classificacao)}</span>${detalhesHTML(htmlDetalhes)}</td>`;
    return html;
  }
  function linhaFalha(r) {
    const htmlDetalhes = detalhe('Providência sugerida', r.providencia) +
      detalhe('Responsável indicado', r.responsavel) + detalhe('Origem do registro', r.origem) +
      detalhe('Nota de consistência da planilha', r.nota);
    return `<td><strong>${formatoData(r.data)}</strong>${etiquetaConflito(r.data)}</td>`+
      `<td>${textoEscapado(r.dia)}</td><td>${textoEscapado(r.batidaAfetada)}</td>`+
      `<td><strong>${textoEscapado(r.horarioPrevisto)}</strong></td>`+
      `<td>${textoEscapado(r.motivo)}</td><td>${textoEscapado(r.origem)}</td>`+
      `<td><span class="relatorio-nota-resumo">${conflitoData(r.data) ? 'Divergência entre abas — preservar os dois valores' : r.nota === 'Ocorrência fictícia para exercício; horários variados e aproximados, sem pretensão de reproduzir registro real.' ? 'Registro simulado' : textoEscapado(r.nota)}</span>${detalhesHTML(htmlDetalhes)}</td>`;
  }
  function renderizarGrupo(grupo) {
    const registros = grupo === 'jornada' ? MARINA_REVISADA.jornadas : MARINA_REVISADA.falhas;
    const conf = config[grupo];
    const tbody = document.getElementById(conf.linhas);
    if (!tbody) return;
    const fragmento = document.createDocumentFragment();
    for (const r of registros) {
      const tr = document.createElement('tr');
      tr.className = 'relatorio-linha' + (conflitoData(r.data) ? ' relatorio-linha-alerta' : '');
      tr.dataset.busca = marcarBusca(r);
      tr.innerHTML = grupo === 'jornada' ? linhaJornada(r) : linhaFalha(r);
      fragmento.appendChild(tr);
    }
    tbody.replaceChildren(fragmento);
    document.getElementById(conf.contador).textContent = `${registros.length} registros`;
  }
  function filtrarGrupo(grupo) {
    const conf = config[grupo];
    const query = simplificar(document.getElementById(conf.filtro).value.trim());
    let mostradas = 0;
    document.querySelectorAll(`#${conf.linhas} .relatorio-linha`).forEach(row => {
      const corresponde = !query || row.dataset.busca.includes(query);
      row.classList.toggle('relatorio-filtrada', !corresponde);
      if (corresponde) mostradas++;
    });
    document.getElementById(conf.vazio).hidden = mostradas !== 0;
    const total = grupo === 'jornada' ? MARINA_REVISADA.jornadas.length : MARINA_REVISADA.falhas.length;
    document.getElementById(conf.contador).textContent = query ? `${mostradas} de ${total} registros` : `${total} registros`;
  }
  window.filtrarRelatorioMarina = filtrarGrupo;

  function aposImpressao() {
    document.body.classList.remove('print-revisado');
    document.body.removeAttribute('data-print-marina');
    for (const [detalheEl, estavaAberto] of detalhesAbertos) detalheEl.open = estavaAberto;
    detalhesAbertos = [];
  }
  window.imprimirRelatorioMarina = function (grupo) {
    if (!['jornada','falhas','ambos'].includes(grupo)) return;
    if (!window.MARINA_REVISADA && typeof MARINA_REVISADA === 'undefined') return;
    aposImpressao();
    // Abre os detalhes antes da impressão para garantir que todas as informações originais apareçam no PDF.
    detalhesAbertos = [...document.querySelectorAll('#page-relatorios-marina details')].map(el => [el, el.open]);
    for (const [el] of detalhesAbertos) el.open = true;
    document.body.dataset.printMarina = grupo;
    document.body.classList.add('print-revisado');
    window.print(); // Navegador oferece Impressora / Salvar como PDF.
  };
  window.addEventListener('afterprint', aposImpressao);
  window.addEventListener('DOMContentLoaded', () => {
    const status = document.getElementById('marina-integridade');
    if (typeof MARINA_REVISADA === 'undefined') {
      status.textContent = 'Erro: arquivo dados-marina-revisados.js não foi carregado.';
      status.classList.add('relatorio-integridade-erro');
      return;
    }
    const inconsistencias = validarBase();
    document.getElementById('resumo-jornadas').textContent = MARINA_REVISADA.jornadas.length;
    document.getElementById('resumo-falhas').textContent = MARINA_REVISADA.falhas.length;
    document.getElementById('relatorio-fonte').textContent = MARINA_REVISADA.fonte;
    renderizarGrupo('jornada');
    renderizarGrupo('falhas');
    if (inconsistencias.length) {
      status.classList.add('relatorio-integridade-erro');
      status.textContent = '⚠️ Problema na validação: ' + inconsistencias.join(' ');
    } else {
      status.textContent = `✓ Datas e dias da semana conferidos: ${MARINA_REVISADA.jornadas.length + MARINA_REVISADA.falhas.length} registros consistentes.`;
    }
  });
})();


/* Ponto Certo V14 — navegação independente do motor de registros. */
(function () {
  'use strict';
  const pages = ['page-espelho', 'page-ajustes', 'page-colaboradores', 'page-relatorios-marina'];
  function switchPageSeguro(pageId) {
    if (!pages.includes(pageId)) return false;
    const target = document.getElementById(pageId);
    if (!target) return false;
    document.querySelectorAll('.view-page').forEach(page => {
      const selected = page.id === pageId;
      page.classList.toggle('active', selected);
      page.setAttribute('aria-hidden', selected ? 'false' : 'true');
    });
    document.querySelectorAll('nav.nav-bar .nav-btn').forEach(button => {
      const selected = button.dataset.page === pageId;
      button.classList.toggle('active', selected);
      if (selected) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    if (typeof window.scrollTo === 'function') window.scrollTo(0, 0);
    return true;
  }
  // Overrides the legacy function; even if script.js fails to load, the menu works.
  window.switchPage = switchPageSeguro;
  function iniciarMenu() {
    const nav = document.querySelector('nav.nav-bar');
    if (!nav) return;
    nav.querySelectorAll('button[data-page]').forEach(button => {
      button.type = 'button';
      button.setAttribute('aria-controls', button.dataset.page);
    });
    nav.addEventListener('click', function (event) {
      const button = event.target.closest('button[data-page]');
      if (button && nav.contains(button)) {
        event.preventDefault();
        switchPageSeguro(button.dataset.page);
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciarMenu);
  else iniciarMenu();
})();

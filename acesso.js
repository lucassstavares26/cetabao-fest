/* Conta o acesso no painel (Vendas do site → Acessos do site). Anônimo: só um
   código aleatório guardado neste aparelho, pra separar PESSOAS de VISITAS.
   Página: <script src="/acesso.js" data-pagina="compra|checkout" defer>. */
(function () {
  var script = document.currentScript;
  var pagina = script && script.getAttribute('data-pagina');
  if (!pagina || !navigator.sendBeacon) return;
  var visitante = '';
  try {
    visitante = localStorage.getItem('cetabao_visitante') || '';
    if (!/^[a-z0-9]{12,40}$/.test(visitante)) {
      visitante = Array.from(crypto.getRandomValues(new Uint8Array(16)), function (b) { return (b % 36).toString(36); }).join('');
      localStorage.setItem('cetabao_visitante', visitante);
    }
  } catch (e) {
    return; // sem armazenamento (aba anônima bloqueada): não conta, sem problema
  }
  var origem = '';
  try { origem = sessionStorage.getItem('cetabao_origem') || location.search.slice(1) || document.referrer || ''; } catch (e) { /* tudo bem */ }
  var corpo = JSON.stringify({ pagina: pagina, visitante: visitante, origem: origem.slice(0, 120) });
  try {
    navigator.sendBeacon('https://cetabao-painel.vercel.app/api/site/acesso', new Blob([corpo], { type: 'text/plain;charset=UTF-8' }));
  } catch (e) { /* não atrapalha a compra */ }
})();

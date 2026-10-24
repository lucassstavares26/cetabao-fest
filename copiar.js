/*
 * Copiar o código Pix — funciona também no navegador do Instagram/Facebook
 * (Lucas, 24/10: "deixe em perfeito estado a pessoa abrindo o link pelo Instagram").
 * Lá o navigator.clipboard costuma falhar e o window.prompt (plano B antigo) é bloqueado.
 *
 *   CetabaoCopiar(texto, elementoQueMostraOTexto) → Promise<boolean>
 *
 * Tenta, nesta ordem:
 *   1. execCommand('copy') com um campo escondido — ainda dentro do toque, que é o que o iPhone exige;
 *   2. navigator.clipboard;
 *   3. não deu: seleciona o código na tela pra pessoa tocar e segurar → Copiar (devolve false).
 */
(function () {
  function viaCampo(texto) {
    var campo = document.createElement('textarea');
    campo.value = texto;
    campo.setAttribute('readonly', '');
    // 16px: abaixo disso o iPhone dá zoom na página ao focar o campo.
    campo.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px;border:0;padding:0';
    document.body.appendChild(campo);
    var ok = false;
    try {
      campo.focus();
      campo.select();
      campo.setSelectionRange(0, texto.length);
      ok = document.execCommand('copy');
    } catch (e) { ok = false; }
    campo.remove();
    return ok;
  }

  function selecionar(el) {
    if (!el) return;
    try {
      var faixa = document.createRange();
      faixa.selectNodeContents(el);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(faixa);
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    } catch (e) { /* sem seleção: a dica na tela ainda explica */ }
  }

  window.CetabaoCopiar = function (texto, el) {
    if (viaCampo(texto)) return Promise.resolve(true);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(texto).then(function () { return true; }, function () { selecionar(el); return false; });
    }
    selecionar(el);
    return Promise.resolve(false);
  };
})();

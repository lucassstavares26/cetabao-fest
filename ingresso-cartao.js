/* Desenho de um ingresso — o mesmo na página do pedido, no ingresso enviado
   pelo WhatsApp e na impressão. Estilo em estilo.css (.ingresso). */
(function () {
  var SITE = 'https://www.cetabaofest.com.br';
  var EVENTO = { data: 'Sábado, 28/11 · 16h', local: 'Parque de Exposições · Passos-MG' };
  var esc = function (t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  /** i = { setor, rotulo, meia, nome, codigo, qr, cancelado, usado }; num = "Ingresso 1 de 2" (opcional) */
  function html(i, num) {
    var invalido = i.cancelado || i.usado;
    return '<article class="ingresso ' + esc(i.setor) + (invalido ? ' invalido' : '') + '">' +
      '<div class="ing-topo">' +
        '<img src="/img/logo.webp" alt="Cê Tá Bão Fest" width="400" height="420">' +
        '<div class="ing-evento"><b>Cê Tá Bão Fest</b><span>' + EVENTO.data + '</span><span>' + EVENTO.local + '</span></div>' +
      '</div>' +
      '<div class="ing-setor"><span class="faixa-setor">' + esc(i.rotulo.split(' — ')[0]) + '</span>' +
        (i.meia ? '<span class="meia-tag">MEIA</span>' : '') +
        (num ? '<span class="num">' + esc(num) + '</span>' : '') + '</div>' +
      '<div class="picote"></div>' +
      '<img class="ing-qr" src="' + esc(i.qr) + '" width="240" height="240" alt="QR Code do ingresso">' +
      '<p class="codigo">' + esc(i.codigo) + '</p>' +
      '<p class="rot-titular">Nome no ingresso</p>' +
      '<p class="titular">' + esc(i.nome) + '</p>' +
      (i.cancelado ? '<p class="selo" style="color:var(--brasa)">Cancelado</p>' : i.usado ? '<p class="selo" style="color:var(--verde)">Já utilizado na entrada</p>' : '') +
      '<p class="ing-rodape">Cada QR Code vale uma entrada' + (i.meia ? ' · Meia-entrada: leve o documento' : '') + '</p>' +
      '</article>';
  }

  /** Abre o WhatsApp com a mensagem pronta; a pessoa só escolhe o contato. */
  function linkWhats(i) {
    var texto = '🎟️ Seu ingresso do *Cê Tá Bão Fest* — ' + (i.rotulo.indexOf(' — ') > 0 ? i.rotulo.replace(' — ', ' (') + ')' : i.rotulo) + '\n' +
      'Nome: ' + i.nome + '\n\n' +
      'Abra o link e mostre o QR Code na entrada:\n' + SITE + '/ingresso/' + i.codigo + '\n\n' +
      '📅 ' + EVENTO.data + '\n📍 ' + EVENTO.local;
    return 'https://wa.me/?text=' + encodeURIComponent(texto);
  }

  var ICONE_ZAP = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.41z"/></svg>';
  function botaoWhats(i) {
    return '<a class="btn btn-zap nao-imprime" target="_blank" rel="noopener" href="' + esc(linkWhats(i)) + '">' + ICONE_ZAP + 'Enviar pelo WhatsApp</a>';
  }

  window.CetabaoIngresso = { html: html, linkWhats: linkWhats, botaoWhats: botaoWhats, esc: esc };
})();

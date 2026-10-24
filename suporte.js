/* Botão de suporte no WhatsApp, em todas as páginas do site. Número do
   suporte do Cê Tá Bão (Lucas, 11/10). Cada página pode trocar a mensagem
   pronta: <body data-suporte-msg="..."> ou CetabaoSuporte.mensagem("..."). */
(function () {
  var NUMERO = '553531690079'; // (35) 3169-0079
  var PADRAO = 'Oi! Tenho uma dúvida sobre o Cê Tá Bão Fest.';
  var link = function (m) { return 'https://wa.me/' + NUMERO + '?text=' + encodeURIComponent(m || PADRAO); };
  // Navegador de dentro do Instagram/Facebook/TikTok: link que abre nova aba costuma não abrir nada.
  var dentroDeApp = /Instagram|FBAN|FBAV|FB_IAB|FBIOS|Line\/|TikTok|musical_ly/i.test(navigator.userAgent || '');
  var botao = null;

  function criar() {
    // Página com lugar reservado (#suporte-inline, ex.: checkout): botão no meio da página,
    // pra nunca ficar por cima do botão de pagar.
    var lugar = document.getElementById('suporte-inline');
    botao = document.createElement('a');
    botao.className = lugar ? 'suporte-inline nao-imprime' : 'suporte-flutuante nao-imprime';
    if (!dentroDeApp) { botao.target = '_blank'; botao.rel = 'noopener'; }
    botao.href = link(document.body.getAttribute('data-suporte-msg'));
    botao.setAttribute('aria-label', 'Dúvidas? Fale com o suporte no WhatsApp');
    botao.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.41z"/></svg><span>Dúvidas? Suporte</span>';
    // Página que pede (data-suporte-depois): o botão só aparece depois de rolar, pra não cobrir o topo.
    var depois = Number(document.body.getAttribute('data-suporte-depois')) || 0;
    if (!lugar && depois) {
      var olhar = function () { botao.classList.toggle('suporte-escondido', window.scrollY < depois); };
      olhar();
      window.addEventListener('scroll', olhar, { passive: true });
    }
    if (lugar) {
      botao.querySelector('span').textContent = 'Dúvidas? Fale com o suporte';
      lugar.appendChild(botao);
    } else document.body.appendChild(botao);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', criar); else criar();

  // Qualquer link de WhatsApp do site (suporte, reservar Lounge/Mesa…): dentro do Instagram abre na
  // mesma tela, que é o que funciona lá (Lucas, 24/10). O "Enviar pelo WhatsApp" do ingresso tem o seu.
  if (dentroDeApp) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href*="wa.me/"], a[href*="api.whatsapp.com/"]');
      if (!a || a.hasAttribute('data-whats') || e.defaultPrevented) return;
      e.preventDefault();
      location.href = a.href;
    });
  }

  window.CetabaoSuporte = {
    link: link,
    mensagem: function (m) { if (botao) botao.href = link(m); }
  };
})();

/*
 * Sair do navegador do Instagram/Facebook pra pagar no cartão (Lucas, 14/11).
 * Dentro do app o formulário do cartão às vezes não aceita os dados ("Dado
 * obrigatório" com o campo preenchido) e o antifraude recusa mais. No Safari
 * também dá erro às vezes, então o caminho principal é o CHROME, com o Safari
 * de reserva no iPhone (pra quem não tem o Chrome).
 *
 * Cupom e agência vão no link, porque o outro navegador não tem o que ficou
 * guardado aqui (localStorage).
 *
 *   CetabaoFora.dentro               → está no navegador do Instagram/Facebook?
 *   CetabaoFora.links('/checkout/?oi=1') → { chrome, safari|null, url }
 */
(function () {
  var ua = navigator.userAgent || '';
  var dentro = /Instagram|FBAN|FBAV|FB_IAB|FBIOS/.test(ua);
  var ios = /iPhone|iPad|iPod/.test(ua);
  var android = /Android/.test(ua);

  function extras(caminho) {
    var e = [];
    try {
      var cg = JSON.parse(localStorage.getItem('cetabao_cupom') || 'null');
      if (cg && /^[A-Z0-9]{3,20}$/.test(cg.c) && cg.ate > Date.now() && !/[?&]cupom=/.test(caminho)) e.push('cupom=' + cg.c);
      var ag = JSON.parse(localStorage.getItem('cetabao_agencia') || 'null');
      if (ag && /^[a-z0-9]{2,40}$/.test(ag.s) && ag.ate > Date.now() && !/[?&]ag=/.test(caminho)) e.push('ag=' + ag.s);
    } catch (err) { /* sem localStorage: vai sem */ }
    return e.join('&');
  }

  function links(caminho) {
    var ex = extras(caminho);
    var url = location.origin + caminho + (ex ? (caminho.indexOf('?') < 0 ? '?' : '&') + ex : '');
    var chrome = url;
    if (ios) chrome = url.replace(/^https:\/\//, 'googlechromes://').replace(/^http:\/\//, 'googlechrome://');
    else if (android) chrome = 'intent://' + url.replace(/^https?:\/\//, '') + '#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=' + encodeURIComponent(url) + ';end';
    return { url: url, chrome: chrome, safari: ios ? 'x-safari-' + url : null };
  }

  window.CetabaoFora = { dentro: dentro, ios: ios, android: android, links: links };
})();

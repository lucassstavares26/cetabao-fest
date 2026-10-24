/*
 * 3DS — confirmação da compra pelo banco (Lucas, 24/10: "tem que aprovar").
 * Quando o Mercado Pago acha a compra com cartão arriscada, em vez de recusar ou
 * segurar "em análise" ele pede pro banco do cliente confirmar (app ou código por SMS).
 * O servidor devolve { url, creq } e esta tela abre a página do banco por cima do site.
 *
 * Usado no checkout, no /pagar/ (Lounge e Mesa) e no /cartao/ (ponto físico):
 *   CetabaoDesafio.abrir(desafio, aoTerminar)
 * aoTerminar roda quando o banco avisa que acabou ou quando a pessoa toca em
 * "Já confirmei". Quem decide se pagou é sempre o servidor (a página do pedido consulta).
 *
 * O banco precisa receber o pedido em até 30 s depois do pagamento criado: abrir na hora.
 */
(function () {
  var CSS =
    '.desafio-fundo{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(0,26,71,.82)}' +
    '.desafio-caixa{width:100%;max-width:500px;max-height:100%;overflow:auto;padding:18px 16px 16px;border-radius:18px;background:#fff;color:#0b1d45;text-align:left;box-shadow:0 20px 50px rgba(0,0,0,.4)}' +
    '.desafio-caixa h2{margin:0;font:800 21px/1.15 "Barlow Condensed","Arial Narrow",sans-serif;letter-spacing:.03em;text-transform:uppercase;color:#003c86}' +
    '.desafio-caixa p{margin:6px 0 12px;font:500 14.5px/1.45 Barlow,system-ui,sans-serif;color:#4a5b85}' +
    '.desafio-caixa iframe{display:block;width:100%;height:440px;border:1px solid #e2e7f1;border-radius:12px;background:#fff}' +
    '@media (min-width:980px){.desafio-caixa iframe{height:600px}}' +
    '.desafio-pronto{display:block;width:100%;margin-top:12px;min-height:46px;border:0;border-radius:12px;background:#ffc61a;color:#b41212;font:800 16px/1 "Barlow Condensed","Arial Narrow",sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}';

  var terminou = false;

  function abrir(desafio, aoTerminar) {
    if (!desafio || !desafio.url || !desafio.creq) { aoTerminar(); return; }
    terminou = false;
    if (!document.getElementById('desafio-css')) {
      var estilo = document.createElement('style');
      estilo.id = 'desafio-css';
      estilo.textContent = CSS;
      document.head.appendChild(estilo);
    }
    var fundo = document.createElement('div');
    fundo.className = 'desafio-fundo';
    fundo.setAttribute('role', 'dialog');
    fundo.setAttribute('aria-modal', 'true');
    fundo.setAttribute('aria-labelledby', 'desafio-titulo');
    fundo.innerHTML =
      '<div class="desafio-caixa">' +
        '<h2 id="desafio-titulo">Confirme a compra com seu banco</h2>' +
        '<p>Seu banco pediu uma confirmação de segurança. Siga as instruções abaixo (pode ser no app do banco ou um código por SMS). Não feche esta página.</p>' +
        '<iframe name="desafio-3ds" title="Confirmação do banco"></iframe>' +
        '<button type="button" class="desafio-pronto">Já confirmei</button>' +
      '</div>';
    document.body.appendChild(fundo);

    var fim = function () {
      if (terminou) return;
      terminou = true;
      window.removeEventListener('message', aoMensagem);
      aoTerminar();
    };
    // O banco avisa que acabou (não diz se aprovou: isso o servidor confere).
    var aoMensagem = function (e) { if (e && e.data && e.data.status === 'COMPLETE') fim(); };
    window.addEventListener('message', aoMensagem);
    fundo.querySelector('.desafio-pronto').addEventListener('click', fim);

    // Formulário que manda o creq pro banco, abrindo a resposta dentro do iframe.
    var form = document.createElement('form');
    form.method = 'post';
    form.action = desafio.url;
    form.target = 'desafio-3ds';
    form.style.display = 'none';
    var campo = document.createElement('input');
    campo.type = 'hidden';
    campo.name = 'creq';
    campo.value = desafio.creq;
    form.appendChild(campo);
    document.body.appendChild(form);
    form.submit();
    form.remove();
  }

  window.CetabaoDesafio = { abrir: abrir };
})();

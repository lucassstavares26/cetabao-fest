/*
 * Baixar os ingressos em PDF — usado na página do pedido e na do ingresso.
 * Antes era window.print(), que não funciona no navegador do Instagram/Facebook
 * e no iPhone é escondido (Lucas, 24/10: "não está dando de baixar o PDF").
 *
 * O PDF é montado no próprio celular: cada .ingresso vira uma imagem (html2canvas)
 * e uma página do PDF (jsPDF). No iPhone abre o menu de compartilhar
 * (Salvar em Arquivos, WhatsApp…); onde não tem, baixa o arquivo.
 *
 * O iPhone só deixa abrir o compartilhar logo depois do toque. Por isso o PDF é
 * preparado assim que os ingressos aparecem, e o toque só entrega.
 *
 *   CetabaoPdf.botao(container, elementos, nomeDoArquivo)
 */
(function () {
  var LIBS = [
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
  ];
  var libs = null;

  function carregarScript(src) {
    return new Promise(function (ok, erro) {
      var s = document.createElement('script');
      s.src = src; s.async = true; s.onload = ok; s.onerror = erro;
      document.head.appendChild(s);
    });
  }
  function carregarLibs() { return libs || (libs = Promise.all(LIBS.map(carregarScript))); }

  function imagensProntas(el) {
    return Promise.all(Array.prototype.map.call(el.querySelectorAll('img'), function (img) {
      if (img.complete && img.naturalWidth) return null;
      return new Promise(function (ok) { img.addEventListener('load', ok, { once: true }); img.addEventListener('error', ok, { once: true }); });
    }));
  }

  function montarPdf(elementos) {
    var fontes = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    return carregarLibs().then(function () { return fontes; }).then(function () {
      var telas = [];
      // Um de cada vez: celular fraco não aguenta desenhar todos juntos.
      return elementos.reduce(function (anterior, el) {
        return anterior.then(function () { return imagensProntas(el); }).then(function () {
          return window.html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false });
        }).then(function (tela) { telas.push(tela); });
      }, Promise.resolve()).then(function () {
        var JsPDF = window.jspdf.jsPDF, doc = null;
        telas.forEach(function (tela) {
          var w = tela.width / 2, h = tela.height / 2;
          var orient = w > h ? 'l' : 'p';
          if (!doc) doc = new JsPDF({ unit: 'px', format: [w, h], orientation: orient, hotfixes: ['px_scaling'] });
          else doc.addPage([w, h], orient);
          doc.addImage(tela.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, w, h);
        });
        return doc.output('blob');
      });
    });
  }

  function baixar(blob, nome) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = nome;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
  }

  // Compartilhar só no celular: no computador (Chrome do Windows também tem) o certo é baixar direto.
  var celular = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');

  function entregar(blob, nome) {
    var arquivo = null;
    try { arquivo = new File([blob], nome, { type: 'application/pdf' }); } catch (e) { /* navegador antigo */ }
    if (celular && arquivo && navigator.canShare && navigator.canShare({ files: [arquivo] })) {
      return navigator.share({ files: [arquivo], title: nome }).catch(function (e) {
        if (e && e.name === 'AbortError') return; // a pessoa fechou o menu
        baixar(blob, nome);
      });
    }
    baixar(blob, nome);
    return Promise.resolve();
  }

  // Navegador de dentro do Instagram/Facebook/TikTok: costuma bloquear download.
  var dentroDeApp = /Instagram|FBAN|FBAV|FB_IAB|FBIOS|Line\/|TikTok|musical_ly/i.test(navigator.userAgent || '');

  /** Botão "Baixar ingressos em PDF" dentro de `onde`, já preparando o arquivo. */
  function botao(onde, elementos, nome) {
    if (!onde || !elementos.length) return;
    var plural = elementos.length > 1;
    var rotulo = plural ? 'Baixar ingressos em PDF' : 'Baixar ingresso em PDF';
    onde.innerHTML =
      '<button class="btn btn-linha nao-imprime" type="button" data-pdf>' + rotulo + '</button>' +
      '<p class="pdf-aviso nao-imprime" data-pdf-aviso hidden></p>' +
      (dentroDeApp ? '<p class="pdf-aviso nao-imprime">Abriu pelo Instagram ou Facebook? Se o PDF não baixar, toque em <strong>•••</strong> no canto da tela e escolha <strong>Abrir no navegador</strong>.</p>' : '');
    var b = onde.querySelector('[data-pdf]'), aviso = onde.querySelector('[data-pdf-aviso]');
    var arquivo = null, preparando = false;
    var preparar = function () {
      preparando = true;
      return montarPdf(elementos).then(function (blob) {
        arquivo = blob;
      }, function (e) {
        console.warn('PDF do ingresso:', e);
        aviso.textContent = 'Não consegui gerar o PDF agora. Tente de novo ou tire um print da tela: o QR Code vale do mesmo jeito.';
        aviso.hidden = false;
      }).then(function () { preparando = false; });
    };
    preparar();
    b.addEventListener('click', function () {
      // Pronto: entrega no mesmo toque (o iPhone exige isso pro menu de compartilhar).
      if (arquivo) { aviso.hidden = true; entregar(arquivo, nome); b.textContent = rotulo; return; }
      // Ainda montando (ou falhou): espera e pede outro toque.
      b.disabled = true; b.textContent = 'Preparando o PDF…';
      (preparando ? new Promise(function (ok) { var t = setInterval(function () { if (!preparando) { clearInterval(t); ok(); } }, 200); }) : preparar())
        .then(function () { b.disabled = false; b.textContent = arquivo ? 'Toque de novo pra baixar' : rotulo; });
    });
  }

  window.CetabaoPdf = { botao: botao };
})();

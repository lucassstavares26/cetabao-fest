/* Site sem zoom (pedido do Lucas, 18/10). A meta viewport (user-scalable=no)
   e o touch-action do estilo.css já travam no Android; o Safari do iPhone
   ignora os dois pro gesto de pinça, então aqui o gesto é barrado. */
(function () {
  var parar = function (e) { e.preventDefault(); };
  document.addEventListener('gesturestart', parar, { passive: false });
  document.addEventListener('gesturechange', parar, { passive: false });
  document.addEventListener('touchmove', function (e) { if (e.touches && e.touches.length > 1) e.preventDefault(); }, { passive: false });
})();

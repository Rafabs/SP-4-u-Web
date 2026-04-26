(function () {
  const texts = [
    'SP-4-U · TRANSPORTE METROPOLITANO',
    'CITYLINES.CO CONTRIBUTOR',
    'DADOS ABERTOS · MOBILIDADE URBANA',
  ];

  let li = 0, ci = 0, del = false;

  function init() {
    const el = document.getElementById('tw-footer');
    if (!el) return;

    function type() {
      const t = texts[li];
      if (!del) {
        ci++;
        el.innerHTML = t.slice(0, ci) + '<span class="cur"></span>';
        if (ci === t.length) { del = true; setTimeout(type, 1800); return; }
        setTimeout(type, 52);
      } else {
        ci--;
        el.innerHTML = t.slice(0, ci) + '<span class="cur"></span>';
        if (ci === 0) { del = false; li = (li + 1) % texts.length; setTimeout(type, 350); return; }
        setTimeout(type, 26);
      }
    }

    setTimeout(type, 700);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
(function () {
  const TARGET_ID = 'tw-footer';
  const CURSOR_CLASS = 'cur';
  const TYPE_LINES = [
    'SP-4-U · TRANSPORTE METROPOLITANO',
    'CITYLINES.CO CONTRIBUTOR',
    'DADOS ABERTOS · MOBILIDADE URBANA',
  ];

  const TIMING = {
    start: 700,
    type: 52,
    erase: 26,
    hold: 1800,
    next: 350,
  };

  function createTypewriter(el) {
    const textNode = document.createTextNode('');
    const cursor = document.createElement('span');
    cursor.className = CURSOR_CLASS;

    el.replaceChildren(textNode, cursor);

    return {
      setText(value) {
        textNode.textContent = value;
      },
    };
  }

  function init() {
    const el = document.getElementById(TARGET_ID);
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const writer = createTypewriter(el);

    if (prefersReducedMotion) {
      writer.setText(TYPE_LINES[0]);
      return;
    }

    let lineIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function tick() {
      const currentLine = TYPE_LINES[lineIndex];
      const nextText = currentLine.slice(0, charIndex);

      writer.setText(nextText);

      if (!isDeleting && charIndex === currentLine.length) {
        isDeleting = true;
        setTimeout(tick, TIMING.hold);
        return;
      }

      if (isDeleting && charIndex === 0) {
        isDeleting = false;
        lineIndex = (lineIndex + 1) % TYPE_LINES.length;
        setTimeout(tick, TIMING.next);
        return;
      }

      charIndex += isDeleting ? -1 : 1;
      setTimeout(tick, isDeleting ? TIMING.erase : TIMING.type);
    }

    setTimeout(tick, TIMING.start);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
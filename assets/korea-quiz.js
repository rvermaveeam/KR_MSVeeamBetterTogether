/* Veeam Korea — mini resilience quiz: 12 positive questions, 4 cute buddies */
(function () {
  // Buddy thresholds keyed off % of 12 questions answered "yes".
  const BUDDIES = [
    { key: 'kongi',  min: 0,  max: 24,  name: 'Kongi',  hangul: '콩이',
      title: 'The Sprout',
      msg: "You're at the very start of a great journey — and that's the perfect place to be. A few smart moves now will protect everything you build next." },
    { key: 'bangul', min: 25, max: 54, name: 'Bangul', hangul: '방울',
      title: 'The Dewdrop',
      msg: "Real momentum! The fundamentals are taking shape. A little focus on immutability and recovery will carry you to the next level." },
    { key: 'gureum', min: 55, max: 84, name: 'Gureum', hangul: '구름',
      title: 'The Cloud',
      msg: "Impressive — you're already resilience-ready. The last stretch is usually identity rollback and signed-off recovery targets." },
    { key: 'horang', min: 85, max: 100, name: 'Horang', hangul: '호랑',
      title: 'The Tiger',
      msg: "Gold standard. You have audit-ready resilience — exactly what a confident, AI-ready organisation looks like. 멋져요!" },
  ];

  function pick(pct) {
    return BUDDIES.find(b => pct >= b.min && pct <= b.max) || BUDDIES[0];
  }

  function update() {
    const items = document.querySelectorAll('.q-item');
    const total = items.length;
    if (!total) return;
    const checked = document.querySelectorAll('.q-item.is-on').length;
    const pct = Math.round((checked / total) * 100);

    const countEl = document.querySelector('[data-q-count]');
    if (countEl) countEl.textContent = checked + ' / ' + total;

    // Ring
    const ring = document.querySelector('.q-ring .arc');
    const num = document.querySelector('.q-ring .pct');
    if (num) num.textContent = pct + '%';
    if (ring) {
      const C = 2 * Math.PI * 86;
      ring.style.strokeDasharray = C;
      ring.style.strokeDashoffset = C * (1 - pct / 100);
      let color = '#FE8A25';
      if (pct >= 25) color = '#FFC355';
      if (pct >= 55) color = '#57E0FF';
      if (pct >= 85) color = '#00D15F';
      ring.style.stroke = color;
    }

    const buddy = pick(pct);

    // Highlight matched buddy card
    document.querySelectorAll('.buddy').forEach(card => {
      card.classList.toggle('is-match', card.dataset.buddy === buddy.key);
    });

    // Result panel
    const rName = document.querySelector('[data-r-name]');
    const rHangul = document.querySelector('[data-r-hangul]');
    const rTitle = document.querySelector('[data-r-title]');
    const rMsg = document.querySelector('[data-r-msg]');
    if (rName) rName.textContent = buddy.name;
    if (rHangul) rHangul.textContent = buddy.hangul;
    if (rTitle) rTitle.textContent = buddy.title;
    if (rMsg) rMsg.textContent = buddy.msg;

    const result = document.querySelector('.q-result');
    if (result) result.classList.toggle('is-live', checked > 0);
  }

  function init() {
    document.addEventListener('click', e => {
      const item = e.target.closest && e.target.closest('.q-item');
      if (!item) return;
      const on = item.classList.toggle('is-on');
      item.setAttribute('aria-checked', on);
      update();
    });
    document.addEventListener('keydown', e => {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      const item = e.target.closest && e.target.closest('.q-item');
      if (!item) return;
      e.preventDefault();
      item.click();
    });
    document.addEventListener('click', e => {
      if (!e.target.closest || !e.target.closest('[data-q-reset]')) return;
      document.querySelectorAll('.q-item.is-on').forEach(i => {
        i.classList.remove('is-on');
        i.setAttribute('aria-checked', 'false');
      });
      update();
    });
    document.querySelectorAll('.q-item').forEach(i => {
      i.setAttribute('role', 'checkbox');
      i.setAttribute('tabindex', '0');
      i.setAttribute('aria-checked', 'false');
    });
    update();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

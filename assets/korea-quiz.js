/* Veeam Korea — mini resilience quiz: 8 questions, 4 cute buddies */
(function () {
  // Thresholds based on 8 questions: 0-2 ticks=Kongi, 3-4=Bangul, 5-6=Gureum, 7-8=Horang
  // Percentages: 2/8=25%, 4/8=50%, 6/8=75%, 8/8=100%
  const BUDDIES = [
    { key: 'kongi',  min: 0,  max: 25,  name: 'Kongi',  hangul: '콩이',
      title: '새싹',
      msg: "이제 막 훌륭한 여정을 시작했습니다 — 지금이 바로 완벽한 출발점입니다. 지금 몇 가지 현명한 조치를 취하면 앞으로 쌓아갈 모든 것을 지킬 수 있습니다." },
    { key: 'bangul', min: 26, max: 50, name: 'Bangul', hangul: '방울',
      title: '물방울',
      msg: "좋은 흐름입니다! 기본기가 갖춰지고 있습니다. immutability와 복구에 조금만 더 집중하면 다음 단계로 올라갈 수 있습니다." },
    { key: 'gureum', min: 51, max: 75, name: 'Gureum', hangul: '구름',
      title: '구름',
      msg: "인상적입니다 — 이미 복원력 준비가 되어 있습니다. 마지막 단계는 보통 identity rollback과 공식 복구 목표 확정입니다." },
    { key: 'horang', min: 76, max: 100, name: 'Horang', hangul: '호랑',
      title: '호랑이',
      msg: "최고 수준입니다. 감사 대비 복원력을 갖추셨습니다 — 자신감 있는 AI 준비 기업의 모습 그 자체입니다. 멋져요!" },
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
      if (pct >= 26) color = '#FFC355';
      if (pct >= 51) color = '#57E0FF';
      if (pct >= 76) color = '#00D15F';
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

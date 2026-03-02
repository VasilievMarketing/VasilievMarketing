/* =========================
   Premium interactions
   ========================= */

(function(){
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Year
  const y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();

  // Scroll progress bar + pill
  const bar = document.querySelector('.progress__bar');
  const pctEl = document.querySelector('[data-progress-pct]');
  const secEl = document.querySelector('[data-progress-section]');

  function setProgress(){
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const scrollHeight = (doc.scrollHeight || document.body.scrollHeight) - doc.clientHeight;
    const p = scrollHeight > 0 ? Math.min(1, Math.max(0, scrollTop / scrollHeight)) : 0;
    if (bar) bar.style.width = (p * 100).toFixed(2) + '%';
    if (pctEl) pctEl.textContent = Math.round(p*100) + '%';
  }
  window.addEventListener('scroll', setProgress, {passive:true});
  window.addEventListener('resize', setProgress);
  setProgress();

  // Cursor glow (perf: rAF + translate3d)
  const glow = document.querySelector('.cursor-glow');
  if (glow && !prefersReduced && window.matchMedia('(pointer:fine)').matches){
    let mx = 0, my = 0, raf = 0;
    const move = (e) => {
      mx = e.clientX; my = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        glow.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
        glow.style.opacity = '1';
        raf = 0;
      });
    };
    window.addEventListener('mousemove', move, {passive:true});
    window.addEventListener('mouseleave', () => glow.style.opacity = '0');
  }

  // Reveal on scroll (unobserve after visible)
  const reveals = document.querySelectorAll('.reveal');
  if (!prefersReduced && reveals.length){
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries){
        if (entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      }
    }, {threshold: 0.16, rootMargin: '0px 0px -6% 0px'});
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  // Nav section highlight (smart)
  const navLinks = [...document.querySelectorAll('[data-nav]')];
  const sectionIds = navLinks.map(a => a.getAttribute('href')).filter(Boolean).map(s => s.replace('#',''));
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

  function setActive(id){
    navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + id));
    if (secEl){
      const node = document.getElementById(id);
      const label = node?.dataset?.sectionLabel || (id === 'top' ? 'Вверх' : id);
      secEl.textContent = label;
    }
  }

  if (sections.length){
    const navIO = new IntersectionObserver((entries) => {
      let best = null;
      for (const e of entries){
        if (!e.isIntersecting) continue;
        if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
      }
      if (best) setActive(best.target.id);
    }, {threshold: [0.22, 0.36, 0.5], rootMargin: '-10% 0px -60% 0px'});
    sections.forEach(s => navIO.observe(s));
  }

  // Magnetic buttons (desktop pointer only)
  const isFinePointer = window.matchMedia && window.matchMedia('(pointer:fine)').matches;
  if (!prefersReduced && isFinePointer){
    document.querySelectorAll('.magnetic').forEach(el => {
      let rect = null;
      let raf = 0, tx = 0, ty = 0;

      const onMove = (e) => {
        rect = rect || el.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width/2);
        const y = e.clientY - (rect.top + rect.height/2);
        tx = Math.max(-10, Math.min(10, x * 0.12));
        ty = Math.max(-10, Math.min(10, y * 0.12));
        if (!raf){
          raf = requestAnimationFrame(() => {
            el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
            raf = 0;
          });
        }
      };

      const onEnter = () => { rect = el.getBoundingClientRect(); };
      const onLeave = () => { rect = null; el.style.transform = ''; };

      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
    });
  }

  // Specular highlight for glass components
  if (!prefersReduced && isFinePointer){
    const glasses = document.querySelectorAll('.glass');
    glasses.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = ((e.clientX - r.left) / r.width) * 100;
        const py = ((e.clientY - r.top) / r.height) * 100;
        el.style.setProperty('--mx', px + '%');
        el.style.setProperty('--my', py + '%');
      }, {passive:true});
    });
  }

  // Subtle tilt for hero KPI card (desktop only)
  if (!prefersReduced && isFinePointer){
    const tilt = document.querySelector('[data-tilt]');
    if (tilt){
      let raf = 0, rx = 0, ry = 0;
      tilt.addEventListener('mousemove', (e) => {
        const r = tilt.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        ry = x * 6;
        rx = -y * 6;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          tilt.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
          raf = 0;
        });
      }, {passive:true});
      tilt.addEventListener('mouseleave', () => tilt.style.transform = '');
    }
  }

  // Light parallax for hero orbs (desktop only)
  if (!prefersReduced && isFinePointer){
    const orbs = document.querySelectorAll('[data-parallax]');
    if (orbs.length){
      let mx = 0, my = 0, raf = 0;
      const onMove = (e) => {
        mx = (e.clientX / window.innerWidth - 0.5);
        my = (e.clientY / window.innerHeight - 0.5);
        if (raf) return;
        raf = requestAnimationFrame(() => {
          orbs.forEach(o => {
            const k = parseFloat(o.getAttribute('data-parallax')) || 0.1;
            const tx = mx * 80 * k;
            const ty = my * 80 * k;
            o.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
          });
          raf = 0;
        });
      };
      window.addEventListener('mousemove', onMove, {passive:true});
    }
  }

  // Accordion: keep only one open (premium behavior)
  const accs = document.querySelectorAll('.accordion details');
  accs.forEach(d => {
    d.addEventListener('toggle', () => {
      if (d.open){
        accs.forEach(o => { if (o !== d) o.removeAttribute('open'); });
      }
    });
  });

  // Chips interactive panel
  const chipPanel = document.querySelector('[data-chip-panel]');
  const chipBtns = document.querySelectorAll('.chipbtn');
  const chipCopy = {
    vk: "Холодный трафик + ретаргет, масштабирование через тесты связок.",
    yandex: "Сбор спроса и консультации. Контроль качества и воронки по этапам.",
    tg: "Прогрев/догрев: автоворонки и повышение конверсии в созвон.",
    avito: "Заявки из площадки + догоняющий ретаргет для усиления качества.",
    rt: "Дожим тёплых сегментов по поведению — без слива на холодных.",
    events: "Видим путь лида и точки потерь — решения принимаем по данным.",
    ab: "Проверяем гипотезы на цифрах, а не на ощущениях. Быстро отбираем сильное.",
    matrix: "Сетка гипотез: оффер × аудитория × формат — тестируем системно."
  };
  chipBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      chipBtns.forEach(b => b.classList.toggle('is-active', b === btn));
      const key = btn.getAttribute('data-chip');
      if (chipPanel) chipPanel.textContent = chipCopy[key] || "";
    });
  });

})();

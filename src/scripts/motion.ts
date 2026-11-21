const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

root.classList.add('motion');

function reveal() {
  const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  items.forEach((el) => io.observe(el));
}

function countdown() {
  const items = document.querySelectorAll<HTMLElement>('[data-countdown]');
  if (!items.length) return;
  const pad = (n: number) => String(n).padStart(2, '0');
  const render = () => {
    const now = Date.now();
    items.forEach((el) => {
      const start = Date.parse(el.dataset.countdown ?? '');
      const end = Date.parse(el.dataset.end ?? '') || start;
      const out = el.querySelector<HTMLElement>('[data-countdown-out]');
      if (!out || Number.isNaN(start)) return;
      if (now >= end) {
        el.hidden = true;
        return;
      }
      el.hidden = false;
      if (now >= start) {
        out.textContent = 'Happening now';
        el.dataset.state = 'live';
        return;
      }
      const s = Math.floor((start - now) / 1000);
      const d = Math.floor(s / 86400);
      const h = Math.floor((s % 86400) / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      out.innerHTML = `${d}<small>d</small> ${pad(h)}<small>h</small> ${pad(m)}<small>m</small> ${pad(sec)}<small>s</small>`;
    });
  };
  render();
  window.setInterval(render, 1000);
}

function chipEyes() {
  if (reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;
  const chips = Array.from(document.querySelectorAll<SVGSVGElement>('[data-chip]'));
  let frame = 0;
  let px = 0;
  let py = 0;
  const look = () => {
    frame = 0;
    chips.forEach((chip) => {
      const r = chip.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height * 0.35;
      const dx = px - cx;
      const dy = py - cy;
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 300);
      const pupils = chip.querySelector<SVGGElement>('[data-pupils]');
      if (pupils) pupils.style.transform = `translate(${((dx / d) * 2.6 * k).toFixed(2)}px, ${((dy / d) * 2.6 * k).toFixed(2)}px)`;
    });
  };
  window.addEventListener(
    'pointermove',
    (event) => {
      px = event.clientX;
      py = event.clientY;
      if (!frame) frame = requestAnimationFrame(look);
    },
    { passive: true },
  );
}

function stickyHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  const update = () => header.classList.toggle('scrolled', window.scrollY > 8);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

function anchors() {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href')?.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
}

function stamps() {
  const pages = document.querySelectorAll<HTMLElement>('[data-stamps]');
  if (!('IntersectionObserver' in window)) {
    pages.forEach((p) => p.querySelectorAll('[data-stamp]').forEach((s) => s.classList.add('down')));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll('[data-stamp]').forEach((s) => s.classList.add('down'));
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.35 },
  );
  pages.forEach((p) => io.observe(p));
}

anchors();
reveal();
stamps();
countdown();
chipEyes();
stickyHeader();

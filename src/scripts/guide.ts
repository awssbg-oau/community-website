const guide = document.querySelector<HTMLElement>('[data-guide-el]');
const bubble = document.querySelector<HTMLElement>('[data-guide-bubble]');
const photo = document.querySelector<HTMLElement>('[data-passport-photo]');
const hero = document.querySelector<HTMLElement>('[data-hero]');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (guide && bubble && photo && hero) {
  const stops = Array.from(document.querySelectorAll<HTMLElement>('[data-guide]'));
  type Mode = 'home' | 'leaving' | 'out' | 'returning';
  let mode: Mode = 'home';
  let pos = { x: 0, y: 0 };
  let vel = { x: 0, y: 0 };
  let running = false;
  let current = '';
  let hideTimer = 0;
  let showTimer = 0;
  let lastScroll = 0;

  const width = () => guide.offsetWidth || 76;
  const slot = () => {
    const r = photo.getBoundingClientRect();
    const w = width();
    return { x: r.left + r.width / 2 - w / 2, y: r.bottom - w * 1.05 };
  };
  const side = () => {
    const w = width();
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    const mobile = window.innerWidth <= 720;
    const top = mobile ? vh - w * 1.15 - 14 : 120 + p * (vh - 120 - w * 1.15 - 24);
    return { x: window.innerWidth - w - (mobile ? 10 : 28), y: top };
  };
  const draw = (lift = 0) => {
    guide.style.transform = `translate(${pos.x.toFixed(1)}px, ${(pos.y - lift).toFixed(1)}px)`;
  };

  const lineFor = () => {
    let pick = '';
    for (const stop of stops) {
      if (stop.getBoundingClientRect().top < window.innerHeight * 0.6) pick = stop.dataset.guide ?? '';
    }
    return pick;
  };
  const hideBubble = () => {
    window.clearTimeout(hideTimer);
    window.clearTimeout(showTimer);
    bubble.classList.remove('show');
  };
  const say = (force = false) => {
    if (mode !== 'out') return;
    const line = lineFor();
    if (!force && line === current) return;
    current = line;
    hideBubble();
    if (!line) return;
    showTimer = window.setTimeout(() => {
      bubble.textContent = line;
      bubble.classList.add('show');
      hideTimer = window.setTimeout(() => bubble.classList.remove('show'), 3800);
    }, 180);
  };

  const frame = () => {
    const target = mode === 'home' || mode === 'returning' ? slot() : side();
    if (reduce) {
      pos = target;
    } else {
      const k = mode === 'out' ? 0.18 : 0.11;
      vel.x = (vel.x + (target.x - pos.x) * k) * 0.74;
      vel.y = (vel.y + (target.y - pos.y) * k) * 0.74;
      pos.x += vel.x;
      pos.y += vel.y;
    }
    const dist = Math.hypot(target.x - pos.x, target.y - pos.y);
    const travelling = mode === 'leaving' || mode === 'returning';
    const lift = travelling && !reduce ? Math.min(60, dist * 0.25) : 0;
    draw(lift);
    const moving = Math.abs(vel.x) + Math.abs(vel.y) > 0.6 || performance.now() - lastScroll < 160;
    guide.classList.toggle('walking', moving && !reduce);

    if (mode === 'leaving' && dist < 3) {
      mode = 'out';
      say(true);
    }
    if (mode === 'returning' && dist < 2.5) {
      mode = 'home';
      guide.classList.remove('on', 'walking');
      document.documentElement.classList.remove('guide-out');
      running = false;
      return;
    }
    if (mode === 'out' && dist < 0.5 && !moving) {
      running = false;
      return;
    }
    requestAnimationFrame(frame);
  };
  const run = () => {
    if (!running) {
      running = true;
      requestAnimationFrame(frame);
    }
  };

  const update = () => {
    lastScroll = performance.now();
    const away = hero.getBoundingClientRect().bottom < window.innerHeight * 0.5;
    if (away && (mode === 'home' || mode === 'returning')) {
      if (mode === 'home') {
        pos = slot();
        vel = { x: 0, y: 0 };
      }
      mode = 'leaving';
      document.documentElement.classList.add('guide-out');
      guide.classList.add('on');
    } else if (!away && (mode === 'out' || mode === 'leaving')) {
      mode = 'returning';
      current = '';
      hideBubble();
    } else if (mode === 'out') {
      say();
    }
    if (mode !== 'home') run();
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

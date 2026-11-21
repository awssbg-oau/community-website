type Point = { x: number; y: number; px: number; py: number };

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function mount(root: HTMLElement) {
  const strap = root.querySelector<SVGPathElement>('[data-strap]');
  const badge = root.querySelector<HTMLElement>('[data-badge]');
  if (!strap || !badge) return;

  const SEGMENTS = 12;
  const GRAVITY = 0.55;
  const DAMPING = 0.986;
  const ITERATIONS = 14;
  let width = 0;
  let ropeLength = 0;
  let segment = 0;
  let anchor = { x: 0, y: 0 };
  let points: Point[] = [];
  let dragging = false;
  let target = { x: 0, y: 0 };
  let grab = { x: 0, y: 0 };
  let still = 0;
  let running = false;
  let visible = true;
  let reach = Infinity;
  let maxSwing = 0.55;
  let travel = Infinity;

  const layout = (swing: number) => {
    const rect = root.getBoundingClientRect();
    width = rect.width;
    ropeLength = (Number(root.dataset.rope ?? 190) + 48) * (width < 420 ? 0.82 : 1);
    segment = ropeLength / SEGMENTS;
    anchor = { x: width * 0.5, y: -48 };
    const page = document.documentElement.clientWidth;
    const pivot = rect.left + anchor.x;
    const half = badge.offsetWidth / 2;
    reach = Math.max(0, Math.min(pivot, page - pivot) - half - 12);
    maxSwing = Math.asin(Math.min(1, reach / (ropeLength + badge.offsetHeight)));
    travel = reach * (ropeLength / (ropeLength + badge.offsetHeight));
    swing = Math.sign(swing) * Math.min(Math.abs(swing), maxSwing);
    points = Array.from({ length: SEGMENTS + 1 }, (_, i) => {
      const x = anchor.x + Math.sin(swing) * segment * i;
      const y = anchor.y + Math.cos(swing) * segment * i;
      return { x, y, px: x, py: y };
    });
  };

  const render = () => {
    strap.setAttribute('d', points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' '));
    const end = points[SEGMENTS];
    const prev = points[SEGMENTS - 2];
    const raw = Math.atan2(end.x - prev.x, end.y - prev.y);
    const angle = Math.max(-maxSwing, Math.min(maxSwing, raw));
    badge.style.transform = `translate(${end.x.toFixed(1)}px, ${end.y.toFixed(1)}px) translate(-50%, 0) rotate(${(-angle * 180) / Math.PI}deg)`;
  };

  const step = () => {
    let motion = 0;
    for (let i = 1; i <= SEGMENTS; i++) {
      const p = points[i];
      const vx = (p.x - p.px) * DAMPING;
      const vy = (p.y - p.py) * DAMPING;
      p.px = p.x;
      p.py = p.y;
      p.x += vx;
      p.y += vy + GRAVITY * (i === SEGMENTS ? 2.2 : 1);
      motion = Math.max(motion, Math.abs(vx) + Math.abs(vy));
    }
    if (dragging) {
      const end = points[SEGMENTS];
      const dx = target.x - anchor.x;
      const dy = target.y - anchor.y;
      const dist = Math.hypot(dx, dy) || 1;
      const max = ropeLength * 1.04;
      const k = dist > max ? max / dist : 1;
      end.x = anchor.x + dx * k;
      end.y = anchor.y + dy * k;
    }
    const wall = (p: Point) => {
      const lo = anchor.x - travel;
      const hi = anchor.x + travel;
      if (p.x < lo) {
        p.x = lo;
        p.px = lo;
      } else if (p.x > hi) {
        p.x = hi;
        p.px = hi;
      }
    };
    for (let n = 0; n < ITERATIONS; n++) {
      points[0].x = anchor.x;
      points[0].y = anchor.y;
      for (let i = 0; i < SEGMENTS; i++) {
        const a = points[i];
        const b = points[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.0001;
        const diff = (d - segment) / d;
        const pinnedA = i === 0;
        const pinnedB = dragging && i + 1 === SEGMENTS;
        if (pinnedA && pinnedB) continue;
        const wa = pinnedA ? 0 : pinnedB ? 1 : i + 1 === SEGMENTS ? 0.75 : 0.5;
        const wb = pinnedB ? 0 : 1 - wa;
        a.x += dx * diff * wa;
        a.y += dy * diff * wa;
        b.x -= dx * diff * wb;
        b.y -= dy * diff * wb;
      }
      wall(points[SEGMENTS]);
    }
    render();
    return motion;
  };

  const loop = () => {
    if (!visible || document.hidden) {
      running = false;
      return;
    }
    const motion = step();
    still = !dragging && motion < 0.02 ? still + 1 : 0;
    if (still > 90) {
      running = false;
      return;
    }
    requestAnimationFrame(loop);
  };

  const wake = () => {
    still = 0;
    if (!running && !reduceMotion) {
      running = true;
      requestAnimationFrame(loop);
    }
  };

  const local = (event: PointerEvent) => {
    const rect = root.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  layout(reduceMotion ? 0 : 0.55);
  render();
  root.classList.add('ready');

  if (reduceMotion) return;

  badge.addEventListener('pointerdown', (event) => {
    const p = local(event);
    const end = points[SEGMENTS];
    grab = { x: p.x - end.x, y: p.y - end.y };
    target = { x: end.x, y: end.y };
    dragging = true;
    try {
      badge.setPointerCapture(event.pointerId);
    } catch {}
    root.classList.add('dragging');
    wake();
  });
  badge.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const p = local(event);
    target = { x: p.x - grab.x, y: p.y - grab.y };
  });
  const release = () => {
    dragging = false;
    root.classList.remove('dragging');
    wake();
  };
  badge.addEventListener('pointerup', release);
  badge.addEventListener('pointercancel', release);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
    }).observe(root);
  }
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) wake();
  });
  let resizeTimer = 0;
  let lastWidth = width;
  const relayout = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      const next = root.getBoundingClientRect().width;
      if (Math.abs(next - lastWidth) < 1) return;
      lastWidth = next;
      layout(0.2);
      wake();
    }, 120);
  };
  if ('ResizeObserver' in window) new ResizeObserver(relayout).observe(root);
  else window.addEventListener('resize', relayout);
  wake();
}

document.querySelectorAll<HTMLElement>('[data-lanyard]').forEach(mount);

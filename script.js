/* ═════════════════════════════════════
   SCRIPT.JS — Premium Portfolio
   Custom Cursor · Typed Text · Canvas
   Scroll Reveal · Nav · Parallax
═════════════════════════════════════ */

/* ── 1. Custom Cursor ─────────────── */
const cur    = document.getElementById('cursor');
const curDot = document.getElementById('cursorDot');

let mx = 0, my = 0;   // actual mouse
let cx = 0, cy = 0;   // cursor (lagging)

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  curDot.style.left = mx + 'px';
  curDot.style.top  = my + 'px';

  // parallax on hero bg image
  const bgFloat = document.querySelector('.photo-bg-float');
  if (bgFloat) {
    const xp = ((e.clientX / window.innerWidth)  - 0.5) * 24;
    const yp = ((e.clientY / window.innerHeight) - 0.5) * 14;
    bgFloat.style.transform = `translate(${xp}px, ${yp}px)`;
  }
});

// Smooth lagging outer cursor
function moveCursor() {
  cx += (mx - cx) * 0.12;
  cy += (my - cy) * 0.12;
  cur.style.left = cx + 'px';
  cur.style.top  = cy + 'px';
  requestAnimationFrame(moveCursor);
}
moveCursor();

/* ── 2. Typed Text ────────────────── */
const ROLES = [
  'AIML Engineer',
  'ML Developer',
  'B.Tech AIML Student',
  'Data Science Enthusiast',
  'Python Developer',
];
let ri = 0, ci2 = 0, erasing = false;
const typeEl = document.getElementById('typedEl');

function type() {
  const role = ROLES[ri];
  typeEl.textContent = erasing ? role.slice(0, --ci2) : role.slice(0, ++ci2);

  let t = erasing ? 40 : 85;
  if (!erasing && ci2 === role.length) { t = 2000; erasing = true; }
  else if (erasing && ci2 === 0) { erasing = false; ri = (ri + 1) % ROLES.length; t = 300; }
  setTimeout(type, t);
}
type();

/* ── 3. Navbar ────────────────────── */
const nav    = document.getElementById('nav');
const burger = document.getElementById('burger');
const drawer = document.getElementById('navDrawer');

window.addEventListener('scroll', () => {
  nav.classList.toggle('stuck', window.scrollY > 50);

  // Active nav item
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 200) current = s.id;
  });
  document.querySelectorAll('.nav-item').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
  });
});

burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  drawer.classList.toggle('open');
});
document.querySelectorAll('.drawer-link').forEach(l => {
  l.addEventListener('click', () => {
    burger.classList.remove('open');
    drawer.classList.remove('open');
  });
});

/* ── 4. Smooth Scroll ─────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ── 5. Scroll Reveal ─────────────── */
const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.classList.add('in');
      obs.unobserve(en.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── 6. Neural Canvas ─────────────── */
const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');
let W, H;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const MOUSE = { x: -999, y: -999 };
document.addEventListener('mousemove', e => { MOUSE.x = e.clientX; MOUSE.y = e.clientY; });

const N = 70, LINK = 150;

class Node {
  constructor() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.35;
    this.vy = (Math.random() - 0.5) * 0.35;
    this.r  = Math.random() * 1.6 + 0.8;
    this.a  = Math.random() * 0.45 + 0.15;
    this.p  = Math.random() * Math.PI * 2;
    this.ps = 0.01 + Math.random() * 0.012;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.p += this.ps;
    if (this.x < 0 || this.x > W) this.vx *= -1;
    if (this.y < 0 || this.y > H) this.vy *= -1;
    const dx = this.x - MOUSE.x, dy = this.y - MOUSE.y;
    const d  = Math.hypot(dx, dy);
    if (d < 160 && d > 0) {
      const f = (160 - d) / 160 * 0.5;
      this.x += dx / d * f;
      this.y += dy / d * f;
    }
  }
  draw() {
    const a = this.a * (0.6 + 0.4 * Math.sin(this.p));
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(220,165,76,${a})`;
    ctx.fill();
  }
}

const nodes = Array.from({ length: N }, () => new Node());

function drawLinks() {
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const d  = Math.hypot(dx, dy);
      if (d < LINK) {
        const a = (1 - d / LINK) * 0.28;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.strokeStyle = `rgba(220,165,76,${a})`;
        ctx.lineWidth = 0.65;
        ctx.stroke();
      }
    }
  }
}

function frame() {
  ctx.clearRect(0, 0, W, H);
  nodes.forEach(n => { n.update(); n.draw(); });
  drawLinks();
  requestAnimationFrame(frame);
}
frame();

/* ── 7. Photo Card parallax tilt ──── */
const photoCard = document.querySelector('.photo-card');
const photoFrame = document.querySelector('.photo-frame');
if (photoFrame) {
  photoFrame.addEventListener('mousemove', e => {
    const r  = photoFrame.getBoundingClientRect();
    const dx = (e.clientX - r.left  - r.width  / 2) / (r.width  / 2);
    const dy = (e.clientY - r.top   - r.height / 2) / (r.height / 2);
    if (photoCard) photoCard.style.transform =
      `perspective(800px) rotateX(${-dy * 5}deg) rotateY(${dx * 5}deg)`;
  });
  photoFrame.addEventListener('mouseleave', () => {
    if (photoCard) {
      photoCard.style.transition = 'transform 0.6s ease';
      photoCard.style.transform  = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
      setTimeout(() => { photoCard.style.transition = ''; }, 600);
    }
  });
}

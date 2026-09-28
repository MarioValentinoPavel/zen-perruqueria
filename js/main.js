/* Zen — hojas tropicales que se apartan con el scroll y se mecen con el viento del cursor */
gsap.registerPlugin(ScrollTrigger);
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ---------- fábrica de hojas ---------- */
function monstera(id, fill, vein) {
  const cuts = [];
  for (let i = 0; i < 5; i++) {
    const a = -1.2 + i * .6, r1 = 55, r2 = 98;
    const x1 = 100 + Math.cos(a) * r1, y1 = 105 + Math.sin(a) * r1 * .9, x2 = 100 + Math.cos(a) * r2, y2 = 105 + Math.sin(a) * r2 * .95;
    const x3 = 100 - Math.cos(a) * r1, x4 = 100 - Math.cos(a) * r2;
    cuts.push(`M${x1},${y1} L${x2},${y2 - 6} L${x2},${y2 + 6}Z`, `M${x3},${y1} L${x4},${y2 - 6} L${x4},${y2 + 6}Z`);
  }
  return `<svg viewBox="0 0 200 230"><defs><mask id="${id}"><rect width="200" height="230" fill="#fff"/><path d="${cuts.join(' ')}" fill="#000"/><ellipse cx="72" cy="120" rx="6" ry="10" fill="#000"/><ellipse cx="128" cy="120" rx="6" ry="10" fill="#000"/></mask></defs>
    <path mask="url(#${id})" d="M100 214 C38 196 4 146 10 94 C16 42 60 6 100 12 C140 6 186 42 190 94 C196 146 162 196 100 214Z" fill="${fill}"/>
    <path d="M100 230 L100 40" stroke="${vein}" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;
}
function palm(fill, vein) {
  let lf = '';
  for (let i = 0; i < 14; i++) {
    const t = i / 13, x = 20 + t * 250, y = 150 - Math.sin(t * Math.PI * .9) * 90;
    const len = 60 * Math.sin(t * Math.PI) + 18;
    lf += `<ellipse cx="${x}" cy="${y - len / 2}" rx="7" ry="${len / 2}" transform="rotate(${-30 + t * 20} ${x} ${y})" fill="${fill}"/>`;
    lf += `<ellipse cx="${x}" cy="${y + len / 2}" rx="7" ry="${len / 2}" transform="rotate(${30 - t * 10} ${x} ${y})" fill="${fill}"/>`;
  }
  return `<svg viewBox="0 0 300 230">${lf}<path d="M10 150 Q150 30 285 110" stroke="${vein}" stroke-width="4" fill="none"/></svg>`;
}

/* ---------- la jungla ---------- */
(function jungle() {
  const box = $('#leaves');
  const L = [ // tipo, color, left%, top%, ancho vw, rotación, dirección de salida
    ['m', '#1f5b3f', -14, -16, 36, 30, [-1, -1]], ['p', '#e0527f', 64, -18, 44, 200, [1, -1]], ['m', '#f07fa4', 80, 34, 32, -60, [1, 0]],
    ['p', '#2f7a52', -24, 44, 46, -20, [-1, 0]], ['m', '#e0527f', 0, 70, 34, 150, [-1, 1]], ['m', '#7fb99a', 62, 74, 38, -150, [1, 1]],
    ['p', '#f07fa4', 22, -30, 40, 170, [0, -1]], ['m', '#2f7a52', 34, 84, 30, 190, [0, 1]], ['p', '#1f5b3f', 82, 78, 42, -140, [1, 1]],
    ['p', '#e0527f', -16, 8, 38, 20, [-1, 0]], ['m', '#1f5b3f', 78, 2, 28, -30, [1, -1]]
  ];
  const leaves = L.map(([t, c, x, y, w, r, dir], i) => {
    const d = document.createElement('div');
    d.className = 'leaf';
    d.style.left = x + '%'; d.style.top = y + '%'; d.style.width = w + 'vw';
    d.style.minWidth = (w * 3.2) + 'px';
    d.innerHTML = t === 'm' ? monstera('mk' + i, c, 'rgba(0,0,0,.18)') : palm(c, 'rgba(0,0,0,.2)');
    box.appendChild(d);
    return { el: d, r, dir, sway: 0, v: 0 };
  });
  leaves.forEach(l => gsap.set(l.el, { rotation: l.r, transformOrigin: '50% 50%' }));
  // entrada: se abren un poco
  gsap.from(leaves.map(l => l.el), { scale: 1.4, opacity: 0, duration: 1.6, ease: 'expo.out', stagger: .05 });
  // scroll: se apartan hacia fuera
  leaves.forEach(l => {
    gsap.to(l.el, { x: () => l.dir[0] * innerWidth * .55, y: () => l.dir[1] * innerHeight * .6, rotation: l.r + l.dir[0] * 25 + 10, ease: 'none',
      scrollTrigger: { trigger: '.jungle', start: 'top top', end: 'bottom bottom', scrub: 1, invalidateOnRefresh: true } });
  });
  gsap.fromTo('.jungle__center', { scale: .92 }, { scale: 1.05, ease: 'none', scrollTrigger: { trigger: '.jungle', start: 'top top', end: 'bottom bottom', scrub: 1 } });
  // viento del cursor
  let lx = null;
  addEventListener('pointermove', e => { if (lx !== null) { const v = (e.clientX - lx) * .06; leaves.forEach((l, i) => { l.v += v * (.6 + (i % 3) * .2); }); } lx = e.clientX; });
  gsap.ticker.add(t => {
    leaves.forEach((l, i) => {
      l.v += (-l.sway) * .04; l.v *= .9; l.sway += l.v;
      const idle = Math.sin(t * .8 + i) * 1.5;
      l.el.style.rotate = (l.sway + idle).toFixed(2) + 'deg';
    });
  });
})();
gsap.from('.jungle__center > *', { y: 30, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .1, delay: .6 });

/* ---------- apariciones ---------- */
$$('.sun__txt, .sun__grid img, .palette h2, .swatches figure, .cuts__txt, .cuts__imgs img, .team__img, .team__txt, .rate > *, .visit__card').forEach(n => {
  gsap.from(n, { y: 50, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: n, start: 'top 90%' } });
});

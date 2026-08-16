(() => {
  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, p) => a + (b - a) * p;
  const progress = (el) => {
    const r = el.getBoundingClientRect();
    return clamp((-r.top) / Math.max(1, r.height - innerHeight));
  };
  const transform = (el, value, opacity) => {
    if (!el) return;
    el.style.transform = value;
    if (opacity !== undefined) el.style.opacity = String(clamp(opacity));
  };

  function mount() {
    const story = document.querySelector('.mb-v7-story');
    if (!story) { requestAnimationFrame(mount); return; }
    if (story.dataset.motionMounted === '1') return;
    story.dataset.motionMounted = '1';
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const hook = story.querySelector('[data-v7-chapter="hook"]');
    const services = story.querySelector('[data-v7-chapter="services"]');
    const route = story.querySelector('[data-v7-chapter="route"]');
    const cards = [...story.querySelectorAll('.v7-service-card')];
    const routePath = story.querySelector('.v7-route-live');
    const routeVan = story.querySelector('.v7-route-van');
    const routeMap = story.querySelector('.v7-route-map');
    const priceCard = story.querySelector('.v7-price-card');
    const serviceEnds = [
      [-250, -190, -10, .92], [210, -205, 9, .98], [-275, 10, 7, 1.05], [235, 40, -7, .96], [-30, 210, 3, 1.02]
    ];

    let raf = 0;
    const draw = () => {
      raf = 0;
      if (hook) {
        const p = progress(hook);
        const copy = hook.querySelector('.v7-copy');
        const van = hook.querySelector('.v7-van');
        const routeLines = hook.querySelector('.v7-route-lines');
        const boxes = [...hook.querySelectorAll('.v7-box')];
        const object = hook.querySelector('.v7-object');
        transform(copy, `translate3d(0,${lerp(0,-85,p)}px,0)`, 1 - p * .78);
        transform(object, `translate3d(${lerp(90,-75,p)}px,${lerp(35,-18,p)}px,0) scale(${lerp(.88,1.08,p)}) rotate(${lerp(1.7,-.8,p)}deg)`, lerp(.78,1,p < .55 ? p/.55 : 1));
        transform(van, `translate3d(${lerp(40,-16,p)}px,0,0) scale(${lerp(.94,1.02,p)})`);
        if (routeLines) routeLines.style.opacity = String(lerp(.12,.85,clamp(p*1.5)));
        const boxEnd = [[-180,-90,-13],[140,-130,14],[185,100,11]];
        boxes.forEach((box,i) => {
          const [x,y,r] = boxEnd[i] || [0,0,0];
          transform(box, `translate3d(${lerp(0,x,p)}px,${lerp(0,y,p)}px,0) rotate(${lerp(0,r,p)}deg) scale(${lerp(1,1.08,p)})`, lerp(1,.35,p));
        });
      }

      if (services) {
        const p = progress(services);
        const copy = services.querySelector('.v7-copy');
        transform(copy, `translate3d(0,${lerp(55,-35,p)}px,0)`, clamp(1 - Math.abs(p-.45)*1.45));
        cards.forEach((card,i) => {
          const [x,y,r,s] = serviceEnds[i];
          const eased = p < .12 ? 0 : clamp((p-.12)/.72);
          const startY = i * 12;
          const startR = (i - 2) * 1.5;
          transform(card, `translate3d(${lerp(0,x,eased)}px,${lerp(startY,y,eased)}px,${lerp(-i*14,i*16,eased)}px) rotateZ(${lerp(startR,r,eased)}deg) rotateX(${lerp(0,(i-2)*1.5,eased)}deg) scale(${lerp(.94,s,eased)})`, clamp(.35 + eased*1.2));
        });
      }

      if (route) {
        const p = progress(route);
        const copy = route.querySelector('.v7-copy');
        transform(copy, `translate3d(${lerp(70,0,clamp(p*1.4))}px,${lerp(35,-15,p)}px,0)`, clamp(p*1.7));
        if (routePath) routePath.style.strokeDashoffset = String(1120 * (1 - clamp(p*1.12)));
        if (routeMap) transform(routeMap, `translate3d(${lerp(-25,20,p)}px,${lerp(18,-12,p)}px,0) scale(${lerp(.96,1.035,p)})`);
        if (routeVan) {
          const x = lerp(0, 520, clamp(p));
          const y = Math.sin(p * Math.PI * 1.35) * -95 + p * -70;
          transform(routeVan, `translate3d(${x}px,${y}px,0) rotate(${lerp(-8,5,p)}deg) scale(${lerp(.8,1.08,p)})`, clamp(p*2));
        }
        const reveal = clamp((p - .38) / .28);
        transform(priceCard, `translate3d(0,${lerp(70,0,reveal)}px,0) scale(${lerp(.9,1,reveal)}) rotate(${lerp(-3,0,reveal)}deg)`, reveal);
      }
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(draw); };
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    draw();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true }); else mount();
})();

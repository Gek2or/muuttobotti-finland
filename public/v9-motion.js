(() => {
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const progress = (element) => {
    const rect = element.getBoundingClientRect();
    return clamp((innerHeight - rect.top) / Math.max(1, innerHeight + rect.height));
  };

  function mount() {
    const story = document.querySelector('.mb-v9-story');
    if (!story) { requestAnimationFrame(mount); return; }
    if (story.dataset.motionMounted === '1') return;
    story.dataset.motionMounted = '1';
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      story.querySelectorAll('.v9-route-live').forEach(path => { path.style.strokeDashoffset = '0'; });
      return;
    }

    const hero = story.querySelector('[data-v9="hero"]');
    const services = story.querySelector('[data-v9="services"]');
    const prepared = story.querySelector('[data-v9="prepared"]');
    const route = story.querySelector('[data-v9="route"]');
    let raf = 0;

    const drift = (section, selector, amount, scale = 0.04) => {
      if (!section) return;
      const p = progress(section);
      const media = section.querySelector(selector);
      if (!media) return;
      const y = (p - .5) * amount;
      media.style.transform = `translate3d(0,${y.toFixed(1)}px,0) scale(${(1.12 + Math.abs(p-.5)*scale).toFixed(3)})`;
    };

    const draw = () => {
      raf = 0;
      if (hero) {
        const p = progress(hero);
        const media = hero.querySelector('.v9-inline-hero i');
        const title = hero.querySelector('.v9-display-hero');
        if (media) media.style.transform = `translate3d(${((p-.5)*16).toFixed(1)}px,${((p-.5)*-24).toFixed(1)}px,0) scale(${(1.12 + p*.08).toFixed(3)})`;
        if (title) title.style.transform = `translate3d(0,${((p-.5)*-14).toFixed(1)}px,0)`;
      }
      drift(services, '.v9-inline-services i', -28, .05);
      drift(services, '.v9-inline-kit-small i', 25, .04);
      drift(prepared, '.v9-inline-kit i', -32, .05);
      if (route) {
        const p = progress(route);
        const path = route.querySelector('.v9-route-live');
        const board = route.querySelector('.v9-route-board');
        if (path) path.style.strokeDashoffset = String(900 * (1 - clamp((p - .12) / .68)));
        if (board) board.style.transform = `translate3d(0,${((.5-p)*14).toFixed(1)}px,0)`;
      }
      document.querySelectorAll('.v9-outro .v9-inline-final i').forEach(media => {
        const section = media.closest('.v9-outro');
        if (!section) return;
        const p = progress(section);
        media.style.transform = `translate3d(0,${((p-.5)*-24).toFixed(1)}px,0) scale(${(1.18 + p*.04).toFixed(3)})`;
      });
    };

    const queue = () => { if (!raf) raf = requestAnimationFrame(draw); };
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    draw();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();

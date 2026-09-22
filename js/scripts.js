window.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealItems = document.querySelectorAll('.reveal');
  const signal = document.querySelector('#signal-field');

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.16 });
    revealItems.forEach((item) => observer.observe(item));
  }

  document.querySelectorAll('[data-project-card] .project-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const detail = trigger.nextElementSibling;
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!isOpen));
      detail.hidden = isOpen;
    });
  });

  document.querySelector('.theme-toggle')?.addEventListener('click', () => {
    document.body.classList.toggle('high-contrast');
  });

  if (!signal || reducedMotion) return;
  const context = signal.getContext('2d');
  let frame = 0;
  const resize = () => {
    const ratio = window.devicePixelRatio || 1;
    signal.width = signal.clientWidth * ratio;
    signal.height = signal.clientHeight * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  const draw = () => {
    const width = signal.clientWidth;
    const height = signal.clientHeight;
    context.clearRect(0, 0, width, height);
    context.strokeStyle = 'rgba(101,216,230,.14)';
    context.lineWidth = 1;
    for (let ring = 0; ring < 8; ring += 1) {
      context.beginPath();
      for (let x = width * 0.42; x < width; x += 10) {
        const y = height * 0.46 + Math.sin(x * 0.012 + frame * 0.012 + ring) * (18 + ring * 7) + ring * 10;
        if (x === width * 0.42) context.moveTo(x, y); else context.lineTo(x, y);
      }
      context.stroke();
    }
    context.strokeStyle = 'rgba(255,138,91,.8)';
    context.beginPath();
    for (let x = width * 0.4; x < width * 0.92; x += 4) {
      const y = height * 0.46 + Math.sin(x * 0.05 + frame * 0.03) * 2 + Math.sin(x * 0.19) * 1.5;
      if (x === width * 0.4) context.moveTo(x, y); else context.lineTo(x, y);
    }
    context.stroke();
    frame += 1;
    window.requestAnimationFrame(draw);
  };
  resize();
  window.addEventListener('resize', resize);
  draw();
});

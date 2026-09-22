(() => {
  'use strict';
  const sections = [...document.querySelectorAll('main [data-label]')];
  const links = [...document.querySelectorAll('.section-nav a')];
  const command = document.getElementById('terminal-command');
  const message = document.getElementById('terminal-message');
  const caption = document.getElementById('instrument-caption');
  const path = document.getElementById('instrument-path');
  const instrument = document.querySelector('.instrument');
  const progress = document.getElementById('reading-progress');
  const progressText = document.getElementById('progress-text');
  const terminal = document.getElementById('terminal');
  const openButton = document.getElementById('open-terminal');
  const closeButton = document.getElementById('close-terminal');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 980px)');
  const graphics = {
    signal: 'M0 65H40L54 45L68 80L85 20L103 70L118 55H155L172 35L187 75L204 50H245L263 30L278 60H300',
    education: 'M10 90H70V67H135V43H210V20H290 M70 90V100 M135 67V100 M210 43V100',
    work: 'M12 80H288 M30 65V95 M85 50V95 M140 35V95 M195 20V95 M270 10V95',
    skills: 'M20 55H70L110 20H180L220 55H280 M70 55L110 90H180L220 55 M110 20V90 M180 20V90 M110 55H180',
    projects: 'M15 85V45H45V85H80V25H110V85H145V50H175V85H210V15H240V85H285',
    outside: 'M0 80C35 80 30 30 65 30S100 75 130 70S150 15 190 25S225 85 250 65S280 35 300 45',
    contact: 'M65 25H235V90H65V25L150 65L235 25 M65 90L120 48 M235 90L180 48',
  };
  let active = null;
  let frame = null;

  function setActive(section) {
    if (active === section) return;
    active = section;
    command.textContent = `> reading / ${section.dataset.label}`;
    message.textContent = section.dataset.message;
    caption.textContent = section.dataset.caption;
    path.setAttribute('d', graphics[section.dataset.graphic] || graphics.signal);
    instrument.classList.remove('changed');
    if (!reducedMotion.matches) {
      void instrument.offsetWidth;
      instrument.classList.add('changed');
    }
    for (const link of links) {
      if (link.hash === `#${section.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }

  function updateReading() {
    frame = null;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
    const readingLine = Math.min(window.innerHeight * .32, 240);
    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= readingLine) current = section;
    }
    if (maxScroll > 0 && window.scrollY >= maxScroll - 3) current = sections.at(-1);
    setActive(current);
    const percent = Math.round(ratio * 100);
    progress.value = percent;
    progress.textContent = `${percent}%`;
    progressText.textContent = `${percent}%`;
    document.documentElement.style.setProperty('--parallax', reducedMotion.matches ? '0px' : `${-(window.scrollY * .035 % 64)}px`);
  }
  function scheduleUpdate() {
    if (frame === null) frame = window.requestAnimationFrame(updateReading);
  }
  function showCompanion(show, focus = false) {
    terminal.hidden = !show;
    openButton.hidden = show;
    document.body.classList.toggle('companion-closed', !show);
    if (focus) (show ? closeButton : openButton).focus({ preventScroll: true });
    scheduleUpdate();
  }
  closeButton.addEventListener('click', () => showCompanion(false, true));
  openButton.addEventListener('click', () => showCompanion(true, mobile.matches));
  mobile.addEventListener('change', () => {
    if (!mobile.matches) showCompanion(true);
    scheduleUpdate();
  });
  reducedMotion.addEventListener('change', scheduleUpdate);
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('hashchange', scheduleUpdate);
  window.addEventListener('pageshow', scheduleUpdate);
  // Native disclosures work with the keyboard and without JavaScript.
  document.querySelectorAll('details.project').forEach(project => {
    project.addEventListener('toggle', () => {
      if (!project.open) project.querySelectorAll('video').forEach(video => video.pause());
      scheduleUpdate();
    });
  });
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .08 });
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  }
  if ('ResizeObserver' in window) new ResizeObserver(scheduleUpdate).observe(document.querySelector('main'));
  updateReading();
})();

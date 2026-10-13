// Progressive enhancement only: the page is fully readable without this file.
(() => {
  'use strict';

  const doc = document;
  const header = doc.getElementById('site-header');
  const toggle = doc.querySelector('.nav-toggle');
  const nav = doc.getElementById('site-nav');
  const desktop = window.matchMedia('(min-width: 1040px)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Header border once the page has scrolled.
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu.
  const setMenu = (open) => {
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.addEventListener('click', () => setMenu(!header.classList.contains('is-open')));
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false);
  });
  doc.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && header.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });
  doc.addEventListener('click', (e) => {
    if (header.classList.contains('is-open') && !header.contains(e.target)) setMenu(false);
  });
  desktop.addEventListener('change', () => setMenu(false));

  // Reveal on scroll.
  const revealItems = doc.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-in');
          reveal.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    revealItems.forEach((el) => reveal.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add('is-in'));
  }

  // Scroll-spy: mark the nav link whose section crosses the upper-middle of the viewport.
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const targets = links
    .map((a) => ({ a, section: doc.getElementById(a.getAttribute('href').slice(1)) }))
    .filter((t) => t.section);
  if ('IntersectionObserver' in window && targets.length) {
    const inBand = new Set();
    const spy = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          if (isIntersecting) inBand.add(target);
          else inBand.delete(target);
        }
        const active = targets.filter((t) => inBand.has(t.section)).pop();
        for (const t of targets) {
          if (t === active) t.a.setAttribute('aria-current', 'true');
          else t.a.removeAttribute('aria-current');
        }
      },
      { rootMargin: '-35% 0px -60% 0px' },
    );
    targets.forEach((t) => spy.observe(t.section));
  }

  // Copy email.
  const copyBtn = doc.getElementById('copy-email');
  if (copyBtn) {
    const label = copyBtn.querySelector('span');
    const status = doc.getElementById('copy-status');
    const original = label.textContent;

    const legacyCopy = (text) => {
      const field = doc.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      doc.body.appendChild(field);
      field.select();
      let ok = false;
      try {
        ok = doc.execCommand('copy');
      } catch {
        ok = false;
      }
      field.remove();
      return ok;
    };

    const selectVisibleEmail = () => {
      const node = doc.getElementById('contact-email');
      if (!node) return;
      const range = doc.createRange();
      range.selectNodeContents(node);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    };

    copyBtn.addEventListener('click', async () => {
      const email = copyBtn.dataset.email;
      let ok = false;
      try {
        await navigator.clipboard.writeText(email);
        ok = true;
      } catch {
        ok = legacyCopy(email);
      }
      if (!ok) selectVisibleEmail();
      label.textContent = ok ? copyBtn.dataset.copied : copyBtn.dataset.failed;
      status.textContent = label.textContent;
      window.setTimeout(() => {
        label.textContent = original;
        status.textContent = '';
      }, 2200);
    });
  }
})();

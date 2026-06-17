/* ═══════════════════════════════════════════════════════════
   EduManager ERP — Landing Page JavaScript
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar: scroll behaviour + hero mode ── */
  const navbar = document.getElementById('navbar');

  const updateNavbar = () => {
    const scrolled = window.scrollY > 40;
    navbar.classList.toggle('scrolled', scrolled);
    navbar.classList.toggle('hero-mode', !scrolled);
  };
  updateNavbar();
  window.addEventListener('scroll', updateNavbar, { passive: true });

  /* ── Mobile burger menu ── */
  const burgerBtn = document.getElementById('burgerBtn');
  const navMenu   = document.getElementById('navMenu');

  burgerBtn?.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    const open = navMenu.classList.contains('open');
    burgerBtn.setAttribute('aria-expanded', open);
    // Animate burger lines
    burgerBtn.querySelectorAll('span').forEach((s, i) => {
      s.style.transform = open
        ? i === 0 ? 'translateY(7px) rotate(45deg)'
        : i === 1 ? ''
        : 'translateY(-7px) rotate(-45deg)'
        : '';
      if (i === 1) s.style.opacity = open ? '0' : '1';
    });
  });

  // Close menu on nav link click
  navMenu?.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      burgerBtn.querySelectorAll('span').forEach((s, i) => {
        s.style.transform = '';
        s.style.opacity   = '1';
      });
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) {
      navMenu?.classList.remove('open');
    }
  });

  /* ── Scroll-reveal animations ── */
  const animElements = document.querySelectorAll('[data-animate]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el    = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);
        setTimeout(() => el.classList.add('is-visible'), delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  animElements.forEach(el => observer.observe(el));

  /* ── Counter animation for stats ── */
  const counters = document.querySelectorAll('[data-count]');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || (target >= 100 ? '%' : '+');
      const duration = 1500;
      const start    = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const ease     = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        el.textContent = Math.floor(ease * target) + (progress < 1 ? '' : suffix);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));

  /* ── Modules tabs ── */
  const tabBtns   = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('tab-btn--active'));
      tabPanels.forEach(p => {
        p.classList.remove('tab-panel--active');
        p.style.display = 'none';
      });

      btn.classList.add('tab-btn--active');
      const panel = document.getElementById(`tab-${target}`);
      if (panel) {
        panel.style.display = 'grid';
        panel.classList.add('tab-panel--active');
        // Re-trigger animations in panel
        panel.querySelectorAll('[data-animate]').forEach(el => {
          el.classList.remove('is-visible');
          const delay = parseInt(el.dataset.delay || '0', 10);
          setTimeout(() => el.classList.add('is-visible'), delay + 50);
        });
      }
    });
  });

  /* ── Preview feature tabs ── */
  const previewTabs = document.querySelectorAll('.preview-tab');
  const previewDesc = document.querySelectorAll('.preview__desc');

  previewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const screen = tab.dataset.screen;

      previewTabs.forEach(t => t.classList.remove('active'));
      previewDesc.forEach(d => d.classList.remove('active'));

      tab.classList.add('active');
      const desc = document.getElementById(`desc-${screen}`);
      desc?.classList.add('active');
    });
  });

  /* ── Back to top ── */
  const backTop = document.getElementById('backTop');

  window.addEventListener('scroll', () => {
    backTop?.classList.toggle('show', window.scrollY > 500);
  }, { passive: true });

  backTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── Contact form ── */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const name    = document.getElementById('contactName')?.value.trim();
    const email   = document.getElementById('contactEmail')?.value.trim();
    const school  = document.getElementById('schoolName')?.value.trim();

    if (!name || !email || !school) {
      // Shake invalid fields
      contactForm.querySelectorAll('input[required]').forEach(input => {
        if (!input.value.trim()) {
          input.style.borderColor = '#ef4444';
          input.addEventListener('input', () => {
            input.style.borderColor = '';
          }, { once: true });
        }
      });
      return;
    }

    // Simulate form submission
    const submitBtn = contactForm.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';

    setTimeout(() => {
      contactForm.querySelectorAll('input, textarea').forEach(f => f.value = '');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Envoyer ma demande de démo';
      formSuccess?.classList.add('show');
      setTimeout(() => formSuccess?.classList.remove('show'), 6000);
    }, 1400);
  });

  /* ── Smooth anchor scrolling with navbar offset ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const y = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  /* ── Active nav highlighting on scroll ── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.remove('active-link');
          if (link.getAttribute('href') === `#${entry.target.id}`) {
            link.classList.add('active-link');
          }
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => sectionObserver.observe(s));

  /* ── Hero floating cards parallax on mouse move ── */
  const floatingCards = document.querySelectorAll('.hero__floating');
  document.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (clientX - cx) / cx;
    const dy = (clientY - cy) / cy;

    floatingCards.forEach((card, i) => {
      const factor = i === 0 ? 12 : 8;
      card.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
    });
  });

});

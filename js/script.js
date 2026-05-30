/**
 * ORELEO — Premium Lottery Experience
 * Vanilla JS. Progressive enhancement.
 */

(function () {
  'use strict';

  // ====== DOM refs ======
  const nav = document.getElementById('main-nav');
  const hamburger = document.querySelector('.nav__hamburger');
  const navLinks = document.getElementById('nav-links');
  const jackpotEl = document.getElementById('jackpot-amount');
  const numberGrid = document.getElementById('number-grid');
  const selectedCount = document.getElementById('selected-count');
  const quickPickBtn = document.getElementById('quick-pick');
  const clearBtn = document.getElementById('clear-numbers');
  const drawOptions = document.getElementById('draw-options');
  const summaryNumbers = document.getElementById('summary-numbers');
  const summaryDraws = document.getElementById('summary-draws');
  const summaryTotal = document.getElementById('summary-total');
  const confirmBtn = document.getElementById('confirm-purchase');
  const ticketBuilder = document.getElementById('ticket-builder');
  const confirmation = document.getElementById('confirmation');
  const confirmNumbers = document.getElementById('confirm-numbers');
  const confirmDraws = document.getElementById('confirm-draws');
  const playAgainBtn = document.getElementById('play-again');
  const testimonialsTrack = document.getElementById('testimonials-track');
  const dots = document.querySelectorAll('.testimonials__dot');

  const COST_PER_DRAW = 2.50;
  let selectedNumbers = [];
  let selectedDraws = 1;
  let testimonialIndex = 0;

  // ====== Mobile nav ======
  const overlay = document.createElement('div');
  overlay.className = 'nav__overlay';

  function toggleMenu(open) {
    navLinks.classList.toggle('nav__links--open', open);
    overlay.classList.toggle('nav__overlay--visible', open);
    if (hamburger) hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  if (hamburger) {
    hamburger.addEventListener('click', function () {
      toggleMenu(!navLinks.classList.contains('nav__links--open'));
    });
  }
  overlay.addEventListener('click', function () { toggleMenu(false); });
  nav.parentNode.insertBefore(overlay, nav.nextSibling);

  navLinks.querySelectorAll('.nav__link').forEach(function (link) {
    link.addEventListener('click', function () {
      if (window.innerWidth < 768) toggleMenu(false);
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navLinks.classList.contains('nav__links--open')) toggleMenu(false);
  });

  // ====== Sticky nav ======
  function handleNavScroll() {
    nav.classList.toggle('nav--scrolled', window.scrollY > 80);
  }

  // ====== Active nav link ======
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav__link:not(.nav__link--gold)');
    let current = '';
    sections.forEach(function (s) {
      const top = s.offsetTop - 120;
      const bottom = top + s.offsetHeight;
      if (window.scrollY >= top && window.scrollY < bottom) current = s.id;
    });
    links.forEach(function (l) {
      l.classList.toggle('nav__link--active', l.getAttribute('href') === '#' + current);
    });
  }

  // ====== Jackpot counter animation ======
  function animateJackpot(target) {
    if (!jackpotEl) return;
    // Convert €47,382,910 to a number
    const cleanTarget = typeof target === 'number' ? target : 47382910;
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.floor(eased * cleanTarget);
      jackpotEl.textContent = '€' + current.toLocaleString('en-US');
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // ====== Number grid ======
  function buildNumberGrid() {
    if (!numberGrid) return;
    for (let i = 1; i <= 49; i++) {
      const btn = document.createElement('button');
      btn.className = 'num-btn';
      btn.textContent = String(i).padStart(2, '0');
      btn.dataset.num = i;
      btn.setAttribute('aria-label', 'Number ' + i);
      btn.addEventListener('click', function () { toggleNumber(i); });
      numberGrid.appendChild(btn);
    }
  }

  function toggleNumber(num) {
    const idx = selectedNumbers.indexOf(num);
    if (idx > -1) {
      selectedNumbers.splice(idx, 1);
    } else if (selectedNumbers.length < 6) {
      selectedNumbers.push(num);
    } else {
      // Already 6 selected — can't add more
      return;
    }
    updateGridUI();
    updateSummary();
  }

  function updateGridUI() {
    const btns = numberGrid.querySelectorAll('.num-btn');
    btns.forEach(function (btn) {
      const num = parseInt(btn.dataset.num);
      btn.classList.toggle('num-btn--selected', selectedNumbers.includes(num));
    });
    if (selectedCount) selectedCount.textContent = selectedNumbers.length + ' selected';
    updateConfirmButton();
  }

  function quickPick() {
    selectedNumbers = [];
    const nums = new Set();
    while (nums.size < 6) {
      nums.add(Math.floor(Math.random() * 49) + 1);
    }
    selectedNumbers = Array.from(nums).sort(function (a, b) { return a - b; });
    updateGridUI();
    updateSummary();
  }

  function clearSelection() {
    selectedNumbers = [];
    updateGridUI();
    updateSummary();
  }

  // ====== Draw selector ======
  drawOptions.querySelectorAll('.draw-option').forEach(function (opt) {
    opt.addEventListener('click', function () {
      drawOptions.querySelectorAll('.draw-option').forEach(function (o) {
        o.classList.remove('draw-option--selected');
        o.setAttribute('aria-checked', 'false');
      });
      this.classList.add('draw-option--selected');
      this.setAttribute('aria-checked', 'true');
      selectedDraws = parseInt(this.dataset.draws);
      updateSummary();
    });
  });

  // ====== Summary ======
  function updateSummary() {
    if (summaryNumbers) {
      summaryNumbers.textContent = selectedNumbers.length === 6
        ? selectedNumbers.join(', ')
        : selectedNumbers.length + '/6 selected';
    }
    if (summaryDraws) summaryDraws.textContent = selectedDraws + ' Draw' + (selectedDraws > 1 ? 's' : '');
    if (summaryTotal) summaryTotal.textContent = '€' + (selectedDraws * COST_PER_DRAW).toFixed(2);
    updateConfirmButton();
  }

  function updateConfirmButton() {
    if (!confirmBtn) return;
    confirmBtn.disabled = selectedNumbers.length !== 6;
  }

  // ====== Purchase flow ======
  function confirmPurchase() {
    if (selectedNumbers.length !== 6) return;
    if (confirmNumbers) confirmNumbers.textContent = selectedNumbers.join(', ');
    if (confirmDraws) confirmDraws.textContent = selectedDraws + ' Draw' + (selectedDraws > 1 ? 's' : '');
    ticketBuilder.style.display = 'none';
    confirmation.removeAttribute('hidden');
    // Confetti!
    createConfetti();
    // Scroll to confirmation
    confirmation.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function createConfetti() {
    const container = document.getElementById('confetti');
    if (!container) return;
    const colors = ['#d4a843', '#f0d68a', '#a67c2e', '#6b2d3e', '#f5f0e8'];
    for (let i = 0; i < 60; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti__piece';
      piece.style.left = (Math.random() * 100) + '%';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.width = (4 + Math.random() * 6) + 'px';
      piece.style.height = (4 + Math.random() * 6) + 'px';
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      piece.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
      piece.style.animationDelay = (Math.random() * 0.5) + 's';
      container.appendChild(piece);
      // Remove after animation
      setTimeout(function () { piece.remove(); }, 3000);
    }
  }

  function resetPlay() {
    selectedNumbers = [];
    selectedDraws = 1;
    updateGridUI();
    updateSummary();
    ticketBuilder.style.display = 'block';
    confirmation.setAttribute('hidden', '');
    // Reset draw selector
    drawOptions.querySelectorAll('.draw-option').forEach(function (o) {
      o.classList.remove('draw-option--selected');
      o.setAttribute('aria-checked', 'false');
    });
    drawOptions.querySelector('.draw-option').classList.add('draw-option--selected');
    drawOptions.querySelector('.draw-option').setAttribute('aria-checked', 'true');
  }

  // ====== Testimonials carousel ======
  function goToTestimonial(index) {
    if (!testimonialsTrack) return;
    testimonialIndex = index;
    testimonialsTrack.style.transform = 'translateX(-' + (index * 100) + '%)';
    dots.forEach(function (dot, i) {
      dot.classList.toggle('testimonials__dot--active', i === index);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      goToTestimonial(parseInt(this.dataset.index));
    });
  });

  // Auto-advance testimonials every 6 seconds
  let testimonialInterval = setInterval(function () {
    testimonialIndex = (testimonialIndex + 1) % dots.length;
    goToTestimonial(testimonialIndex);
  }, 6000);

  // Pause on hover
  const testimonialsRegion = document.getElementById('testimonials');
  if (testimonialsRegion) {
    testimonialsRegion.addEventListener('mouseenter', function () { clearInterval(testimonialInterval); });
    testimonialsRegion.addEventListener('mouseleave', function () {
      testimonialInterval = setInterval(function () {
        testimonialIndex = (testimonialIndex + 1) % dots.length;
        goToTestimonial(testimonialIndex);
      }, 6000);
    });
  }

  // ====== Scroll animations (fade-in sections) ======
  function initScrollAnimations() {
    const sections = document.querySelectorAll('.section');
    if (!('IntersectionObserver' in window)) {
      sections.forEach(function (s) { s.style.opacity = '1'; });
      return;
    }
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in--visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    sections.forEach(function (s, i) {
      s.classList.add('fade-in');
      s.style.transitionDelay = (i * 0.1) + 's';
      observer.observe(s);
    });
  }

  // ====== Smooth scroll for anchors ======
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ====== Event listeners ======
  if (quickPickBtn) quickPickBtn.addEventListener('click', quickPick);
  if (clearBtn) clearBtn.addEventListener('click', clearSelection);
  if (confirmBtn) confirmBtn.addEventListener('click', confirmPurchase);
  if (playAgainBtn) playAgainBtn.addEventListener('click', resetPlay);

  // Keyboard nav for draw options
  drawOptions.querySelectorAll('.draw-option').forEach(function (opt) {
    opt.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.click(); }
    });
  });

  // ====== Scroll handler ======
  let ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        handleNavScroll();
        updateActiveNavLink();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // ====== Init ======
  buildNumberGrid();
  animateJackpot(47382910);
  updateSummary();
  handleNavScroll();
  updateActiveNavLink();
  initScrollAnimations();

  // Handle resize for mobile menu
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768 && navLinks.classList.contains('nav__links--open')) {
      toggleMenu(false);
    }
  });

  console.log('✨ ORELEO — Where luck meets luxury');
})();

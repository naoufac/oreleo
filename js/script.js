/**
 * ORELEO — For the hope of it.
 * Progressive enhancement. No dependencies.
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
  const ticket = document.getElementById('ticket');
  const confirm = document.getElementById('confirm');
  const confirmDetails = document.getElementById('confirm-details');
  const playAgainBtn = document.getElementById('play-again');

  const COST = 2.50;
  let selected = [];
  let draws = 1;

  // ====== Nav ======
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
    nav.parentNode.insertBefore(overlay, nav.nextSibling);
    overlay.addEventListener('click', function () { toggleMenu(false); });
    navLinks.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () { if (window.innerWidth < 768) toggleMenu(false); });
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navLinks.classList.contains('nav__links--open')) toggleMenu(false);
  });

  // ====== Nav scroll ======
  function onScroll() {
    nav.classList.toggle('nav--scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ====== Jackpot — no animation, just static confidence ======
  // The number is already in the HTML. No count-up. No gimmick.
  // It sits there quietly. Like it belongs.

  // ====== Number grid ======
  function buildGrid() {
    if (!numberGrid) return;
    for (let i = 1; i <= 49; i++) {
      const btn = document.createElement('button');
      btn.className = 'num-btn';
      btn.textContent = String(i).padStart(2, '0');
      btn.dataset.num = i;
      btn.setAttribute('aria-label', 'Number ' + i);
      btn.addEventListener('click', function () { toggle(i); });
      numberGrid.appendChild(btn);
    }
  }

  function toggle(num) {
    const idx = selected.indexOf(num);
    if (idx > -1) {
      selected.splice(idx, 1);
    } else if (selected.length < 6) {
      selected.push(num);
    } else {
      return;
    }
    updateUI();
  }

  function updateUI() {
    numberGrid.querySelectorAll('.num-btn').forEach(function (btn) {
      btn.classList.toggle('num-btn--selected', selected.includes(parseInt(btn.dataset.num)));
    });
    if (selectedCount) selectedCount.textContent = selected.length + ' / 6 selected';
    updateSummary();
  }

  function quickPick() {
    selected = [];
    while (selected.length < 6) {
      const n = Math.floor(Math.random() * 49) + 1;
      if (!selected.includes(n)) selected.push(n);
    }
    selected.sort(function (a, b) { return a - b; });
    updateUI();
  }

  function clearSelection() { selected = []; updateUI(); }

  // ====== Draw selector ======
  drawOptions.querySelectorAll('.draw-opt').forEach(function (opt) {
    opt.addEventListener('click', function () {
      drawOptions.querySelectorAll('.draw-opt').forEach(function (o) {
        o.classList.remove('draw-opt--active');
        o.setAttribute('aria-checked', 'false');
      });
      this.classList.add('draw-opt--active');
      this.setAttribute('aria-checked', 'true');
      draws = parseInt(this.dataset.draws);
      updateSummary();
    });
  });

  // ====== Summary ======
  function updateSummary() {
    if (summaryNumbers) {
      summaryNumbers.textContent = selected.length === 6 ? selected.join(', ') : selected.length + ' / 6';
    }
    if (summaryDraws) summaryDraws.textContent = draws;
    if (summaryTotal) {
      const total = (draws * COST).toFixed(2);
      summaryTotal.textContent = '€' + total;
    }
    if (confirmBtn) confirmBtn.disabled = selected.length !== 6;
  }

  // ====== Purchase ======
  function purchase() {
    if (selected.length !== 6) return;
    const nums = selected.join(', ');
    const d = draws;
    const total = (d * COST).toFixed(2);
    if (confirmDetails) {
      confirmDetails.innerHTML =
        '<span>Numbers: <strong>' + nums + '</strong></span>' +
        '<span>Draws: <strong>' + d + '</strong></span>' +
        '<span>Total: <strong>€' + total + '</strong></span>';
    }
    ticket.style.display = 'none';
    confirm.removeAttribute('hidden');
    confirm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function resetPlay() {
    selected = [];
    draws = 1;
    updateUI();
    ticket.style.display = 'block';
    confirm.setAttribute('hidden', '');
    // Reset draw selector
    drawOptions.querySelectorAll('.draw-opt').forEach(function (o) {
      o.classList.remove('draw-opt--active');
      o.setAttribute('aria-checked', 'false');
    });
    drawOptions.querySelector('.draw-opt').classList.add('draw-opt--active');
    drawOptions.querySelector('.draw-opt').setAttribute('aria-checked', 'true');
  }

  // ====== Smooth scroll ======
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ====== Events ======
  if (quickPickBtn) quickPickBtn.addEventListener('click', quickPick);
  if (clearBtn) clearBtn.addEventListener('click', clearSelection);
  if (confirmBtn) confirmBtn.addEventListener('click', purchase);
  if (playAgainBtn) playAgainBtn.addEventListener('click', resetPlay);

  drawOptions.querySelectorAll('.draw-opt').forEach(function (opt) {
    opt.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.click(); }
    });
  });

  // ====== Resize ======
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768 && navLinks.classList.contains('nav__links--open')) {
      toggleMenu(false);
    }
  });

  // ====== Init ======
  buildGrid();
  updateSummary();
  onScroll();

  console.log('ORELEO — For the hope of it.');
})();

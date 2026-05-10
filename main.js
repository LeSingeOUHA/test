/* ============================================================
   LUMIÈRE — main.js
   Fonctionnalités : recherche, panier, scroll, stats, newsletter
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     0. BOUTON MODE NUIT — basculer style.css ↔ style-noir-or.css
     ============================================================ */
  const themeBtn        = document.getElementById('themeBtn');
  const mainStylesheet  = document.getElementById('mainStylesheet');

  const STYLE_LIGHT = 'style.css';
  const STYLE_DARK  = 'style-noir-or.css';

  function isDarkActive() {
    if (!mainStylesheet) return false;
    return mainStylesheet.getAttribute('href').includes('noir-or');
  }

  function applyTheme(dark, animate) {
    if (!mainStylesheet) return;

    mainStylesheet.setAttribute('href', dark ? STYLE_DARK : STYLE_LIGHT);
    localStorage.setItem('lumiere_theme', dark ? 'dark' : 'light');

    if (!themeBtn) return;

    const moon = themeBtn.querySelector('.icon-moon');
    const sun  = themeBtn.querySelector('.icon-sun');

    if (dark) {
      themeBtn.classList.add('mode-nuit');
      themeBtn.setAttribute('aria-label', 'Mode jour');
      themeBtn.setAttribute('title', 'Basculer mode jour');
      if (moon) moon.style.display = 'none';
      if (sun)  sun.style.display  = 'block';
    } else {
      themeBtn.classList.remove('mode-nuit');
      themeBtn.setAttribute('aria-label', 'Mode nuit');
      themeBtn.setAttribute('title', 'Basculer mode nuit');
      if (moon) moon.style.display = 'block';
      if (sun)  sun.style.display  = 'none';
    }

    // Petit effet de flash au clic
    if (animate) {
      document.body.style.transition = 'opacity 0.15s';
      document.body.style.opacity = '0.92';
      setTimeout(() => {
        document.body.style.opacity = '';
        setTimeout(() => { document.body.style.transition = ''; }, 160);
      }, 120);
    }
  }

  // Appliquer le thème sauvegardé au chargement
  const savedTheme = localStorage.getItem('lumiere_theme');
  applyTheme(savedTheme === 'dark', false);

  // Clic sur le bouton
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      applyTheme(!isDarkActive(), true);
    });
  }

  /* ============================================================
     1. HEADER — scroll
     ============================================================ */
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  /* ============================================================
     2. MENU BURGER (mobile)
     ============================================================ */
  const burger   = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');

  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
      const spans = burger.querySelectorAll('span');
      if (open) {
        spans[0].style.transform = 'translateY(6px) rotate(45deg)';
        spans[1].style.transform = 'translateY(-1px) rotate(-45deg)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.transform = '';
      }
    });
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        const spans = burger.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.transform = '';
      });
    });
  }

  /* ============================================================
     3. BARRE DE RECHERCHE
     ============================================================ */
  const CATALOGUE = [
    { id: 1, name: 'Sérum Éclat Absolu',      sub: 'Concentré anti-âge · 30 ml',          price: 245, tags: ['sérum', 'anti-âge', 'visage', 'éclat'] },
    { id: 2, name: 'Crème Royale Nuit',        sub: 'Soin régénérant · 50 ml',              price: 185, tags: ['crème', 'nuit', 'soin nuit', 'régénérant'] },
    { id: 3, name: "Huile d'Or Précieuse",     sub: 'Visage · Corps · Cheveux · 50 ml',    price: 155, tags: ['huile', 'or', 'visage', 'corps', 'cheveux'] },
    { id: 4, name: 'Baume Lèvres & Contour',  sub: 'Soin réparateur · 15 ml',              price: 58,  tags: ['baume', 'lèvres', 'contour', 'réparateur'] },
    { id: 5, name: 'Lotion Florale Tonique',   sub: 'Eau de soin · 150 ml',                price: 48,  tags: ['lotion', 'tonique', 'florale', 'eau'] },
    { id: 6, name: 'Masque Argile & Rose',     sub: 'Soin purifiant · 75 ml',              price: 72,  tags: ['masque', 'argile', 'rose', 'purifiant'] },
    { id: 7, name: 'Exfoliant Sucre de Canne', sub: 'Gommage visage doux · 60 ml',         price: 65,  tags: ['exfoliant', 'gommage', 'sucre', 'doux'] },
    { id: 8, name: 'Contour des Yeux Botanique', sub: 'Soin regard · 15 ml',               price: 120, tags: ['contour', 'yeux', 'regard', 'botanique'] },
    { id: 9, name: 'Sérum Corps Nourrissant',  sub: 'Soin corps · 200 ml',                 price: 95,  tags: ['sérum', 'corps', 'nourrissant'] },
    { id: 10, name: 'Baume Corps Cacao',       sub: 'Hydratation profonde · 200 ml',       price: 68,  tags: ['baume', 'corps', 'cacao', 'hydratation'] },
  ];

  const searchBtn     = document.getElementById('searchBtn');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchClose   = document.getElementById('searchClose');
  const searchInput   = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const searchForm    = document.getElementById('searchForm');

  function openSearch() {
    searchOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => searchInput && searchInput.focus(), 200);
  }

  function closeSearch() {
    searchOverlay.classList.remove('open');
    document.body.style.overflow = '';
    if (searchInput) searchInput.value = '';
    if (searchResults) searchResults.innerHTML = '';
  }

  function doSearch(query) {
    if (!searchResults) return;
    const q = query.trim().toLowerCase();
    if (!q) { searchResults.innerHTML = ''; return; }

    const matches = CATALOGUE.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sub.toLowerCase().includes(q) ||
      p.tags.some(t => t.includes(q))
    );

    if (matches.length === 0) {
      searchResults.innerHTML = `<p class="search-no-result">Aucun résultat pour « ${query} »</p>`;
      return;
    }

    searchResults.innerHTML = matches.slice(0, 5).map(p => `
      <div class="search-result-item" data-id="${p.id}">
        <div>
          <p class="search-result-name">${p.name}</p>
          <p class="search-result-sub">${p.sub}</p>
        </div>
        <span class="search-result-price">${p.price} €</span>
      </div>
    `).join('');

    searchResults.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', () => {
        closeSearch();
        window.location.href = 'produits.html';
      });
    });
  }

  if (searchBtn)    searchBtn.addEventListener('click', openSearch);
  if (searchClose)  searchClose.addEventListener('click', closeSearch);
  if (searchInput)  searchInput.addEventListener('input', e => doSearch(e.target.value));
  if (searchForm)   searchForm.addEventListener('submit', e => { e.preventDefault(); doSearch(searchInput.value); });

  document.querySelectorAll('.search-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = tag.dataset.query;
        doSearch(tag.dataset.query);
        searchInput.focus();
      }
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSearch();
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
  });

  /* ============================================================
     4. PANIER (partagé via localStorage)
     ============================================================ */
  const CART_KEY = 'lumiere_cart';

  function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  let cart = loadCart();

  const cartBtn     = document.getElementById('cartBtn');
  const cartDrawer  = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartClose   = document.getElementById('cartClose');
  const cartItems   = document.getElementById('cartItems');
  const cartFooter  = document.getElementById('cartFooter');
  const cartCount   = document.getElementById('cartCount');
  const cartTotal   = document.getElementById('cartTotal');

  function openCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.add('open');
    cartOverlay && cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.remove('open');
    cartOverlay && cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (cartBtn)     cartBtn.addEventListener('click', openCart);
  if (cartClose)   cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

  function addToCart(product) {
    const existing = cart.find(i => i.id === product.id);
    if (existing) existing.qty += 1;
    else cart.push({ ...product, qty: 1 });
    saveCart(cart);
    renderCart();
    showToast(`${product.name} ajouté au panier`);
  }

  function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart(cart);
    renderCart();
  }

  function updateQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) { removeFromCart(id); return; }
    saveCart(cart);
    renderCart();
  }

  window.updateQtyPublic      = (id, delta) => updateQty(id, delta);
  window.removeFromCartPublic = (id) => removeFromCart(id);

  function renderCart() {
    const totalItems = cart.reduce((s, i) => s + i.qty, 0);
    const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

    if (cartCount) {
      cartCount.textContent = totalItems;
      cartCount.classList.toggle('visible', totalItems > 0);
    }
    if (cartTotal) cartTotal.textContent = totalPrice.toLocaleString('fr-FR') + ' €';

    if (cartItems) {
      if (cart.length === 0) {
        cartItems.innerHTML = '<p class="cart-empty">Votre panier est vide.</p>';
        if (cartFooter) cartFooter.style.display = 'none';
      } else {
        if (cartFooter) cartFooter.style.display = 'block';
        cartItems.innerHTML = cart.map(item => `
          <div class="cart-item">
            <div class="cart-item-info">
              <p class="cart-item-name">${item.name}</p>
              <p class="cart-item-sub">${item.sub}</p>
              <div class="cart-item-controls">
                <button class="cart-qty-btn" onclick="updateQtyPublic(${item.id}, -1)">−</button>
                <span class="cart-item-qty">${item.qty}</span>
                <button class="cart-qty-btn" onclick="updateQtyPublic(${item.id}, 1)">+</button>
                <button class="cart-item-remove" onclick="removeFromCartPublic(${item.id})">Retirer</button>
              </div>
            </div>
            <span class="cart-item-price">${(item.price * item.qty).toLocaleString('fr-FR')} €</span>
          </div>
        `).join('');
      }
    }
  }

  // Boutons "Ajouter au panier" sur la page
  document.querySelectorAll('.produit-add-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const card = btn.closest('[data-product]');
      if (!card) return;
      try {
        const product = JSON.parse(card.dataset.product);
        addToCart(product);
      } catch(err) {}
    });
  });

  renderCart();

  /* ============================================================
     5. REVEAL AU SCROLL
     ============================================================ */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = parseInt(el.dataset.delay) || 0;
      setTimeout(() => el.classList.add('visible'), delay);
      revealObs.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => revealObs.observe(el));

  /* ============================================================
     6. COMPTEUR STATS
     ============================================================ */
  document.querySelectorAll('.stat-num[data-target]').forEach(el => {
    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      const target = parseInt(el.dataset.target);
      let cur = 0;
      const step = target / (1800 / 16);
      const timer = setInterval(() => {
        cur += step;
        if (cur >= target) { cur = target; clearInterval(timer); }
        el.textContent = Math.round(cur).toLocaleString('fr-FR');
      }, 16);
      obs.unobserve(el);
    }, { threshold: 0.5 });
    obs.observe(el);
  });

  /* ============================================================
     7. NEWSLETTER
     ============================================================ */
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', e => {
      e.preventDefault();
      const emailEl = document.getElementById('newsletterEmail');
      const val = emailEl ? emailEl.value.trim() : '';
      if (!val || !val.includes('@')) { showToast('Veuillez entrer un e-mail valide.'); return; }
      const btn = newsletterForm.querySelector('.btn-primary');
      btn.textContent = '...';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = '✓ Inscrit(e)';
        showToast(`Bienvenue chez LUMIÈRE !`);
        if (emailEl) emailEl.value = '';
        setTimeout(() => { btn.textContent = "S'inscrire"; btn.disabled = false; }, 3000);
      }, 800);
    });
  }

  /* ============================================================
     8. SMOOTH SCROLL
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ============================================================
     9. TICKER
     ============================================================ */
  const ticker = document.getElementById('ticker');
  if (ticker) {
    ticker.addEventListener('mouseenter', () => ticker.style.animationPlayState = 'paused');
    ticker.addEventListener('mouseleave', () => ticker.style.animationPlayState = 'running');
  }

  /* ============================================================
     10. PARALLAXE — bouteille hero
     ============================================================ */
  const heroBottle = document.querySelector('.hero-bottle');
  if (heroBottle) {
    window.addEventListener('scroll', () => {
      heroBottle.style.transform = `translateY(${window.scrollY * 0.12}px)`;
    }, { passive: true });
  }

  /* ============================================================
     11. FILTRES — page produits
     ============================================================ */
  const filterCheckboxes = document.querySelectorAll('.filtre-option input[type="checkbox"]');
  const allProduitCards  = document.querySelectorAll('.produit-page-card');
  const produitsCount    = document.getElementById('produitsCount');

  function filterProducts() {
    const checked = Array.from(filterCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
    let visible = 0;
    allProduitCards.forEach(card => {
      const cats = (card.dataset.categories || '').split(',');
      const show = checked.length === 0 || checked.some(c => cats.includes(c));
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    if (produitsCount) produitsCount.textContent = `${visible} produit${visible !== 1 ? 's' : ''}`;
  }

  filterCheckboxes.forEach(cb => cb.addEventListener('change', filterProducts));

  // Tri
  const sortSelect = document.getElementById('sortSelect');
  const pageGrid   = document.getElementById('pageGrid');
  if (sortSelect && pageGrid) {
    sortSelect.addEventListener('change', () => {
      const cards = Array.from(pageGrid.querySelectorAll('.produit-page-card'));
      cards.sort((a, b) => {
        const pa = parseInt(a.dataset.price || 0);
        const pb = parseInt(b.dataset.price || 0);
        if (sortSelect.value === 'price-asc') return pa - pb;
        if (sortSelect.value === 'price-desc') return pb - pa;
        return 0;
      });
      cards.forEach(c => pageGrid.appendChild(c));
    });
  }

  /* ============================================================
     12. PAIEMENT — toggle champs carte
     ============================================================ */
  document.querySelectorAll('.paiement-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.paiement-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const radio = opt.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      const cardFields = document.getElementById('cardFields');
      if (cardFields) {
        cardFields.classList.toggle('visible', opt.dataset.method === 'card');
      }
    });
  });

  /* ============================================================
     13. FORMULAIRE COMMANDE
     ============================================================ */
  const commandeForm = document.getElementById('commandeForm');
  if (commandeForm) {
    // Afficher le récap du panier
    const recapItems    = document.getElementById('recapItems');
    const recapTotal    = document.getElementById('recapTotal');
    const recapLivraison = document.getElementById('recapLivraison');
    const recapSousTotal = document.getElementById('recapSousTotal');

    function renderRecap() {
      if (!recapItems) return;
      const sousTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
      const livraison = sousTotal >= 80 ? 0 : 5.9;
      const total     = sousTotal + livraison;

      if (cart.length === 0) {
        recapItems.innerHTML = '<p class="recap-empty">Aucun article</p>';
      } else {
        recapItems.innerHTML = cart.map(item => `
          <div class="recap-item">
            <div>
              <p class="recap-item-name">${item.name}</p>
              <p class="recap-item-qty">Qté : ${item.qty}</p>
            </div>
            <span class="recap-item-price">${(item.price * item.qty).toLocaleString('fr-FR')} €</span>
          </div>
        `).join('');
      }
      if (recapSousTotal)  recapSousTotal.textContent = sousTotal.toLocaleString('fr-FR') + ' €';
      if (recapLivraison)  recapLivraison.textContent = livraison === 0 ? 'Offerte' : livraison.toFixed(2) + ' €';
      if (recapTotal)      recapTotal.textContent = total.toLocaleString('fr-FR') + ' €';
    }

    renderRecap();

    commandeForm.addEventListener('submit', e => {
      e.preventDefault();

      // Validation simple
      const required = commandeForm.querySelectorAll('[required]');
      let valid = true;
      required.forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = '#C85A5A';
          valid = false;
          field.addEventListener('input', () => field.style.borderColor = '', { once: true });
        }
      });
      if (!valid) { showToast('Veuillez remplir tous les champs obligatoires.'); return; }

      // Simuler envoi
      const submitBtn = commandeForm.querySelector('.btn-submit');
      submitBtn.textContent = 'Traitement en cours…';
      submitBtn.disabled = true;

      setTimeout(() => {
        // Vider le panier
        cart = [];
        saveCart(cart);
        // Rediriger vers confirmation
        window.location.href = 'commande.html?confirmation=1';
      }, 1500);
    });
  }

  // Afficher la page de confirmation si ?confirmation=1
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('confirmation') === '1') {
    const formSection  = document.getElementById('formSection');
    const confirmSection = document.getElementById('confirmSection');
    if (formSection)   formSection.style.display = 'none';
    if (confirmSection) confirmSection.style.display = 'block';
  }

  /* ============================================================
     14. TOAST
     ============================================================ */
  const toastEl = document.getElementById('toast');
  let toastTimer;

  function showToast(message) {
    if (!toastEl) return;
    clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.classList.add('show');
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
  }

  window.showToast = showToast;

});

/* =========================================
   MAISON NOIR — Premium JavaScript
   ========================================= */

'use strict';

// ---- SCROLL PROGRESS ----
const scrollProgress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const prog = (scrollTop / docHeight) * 100;
  scrollProgress.style.width = prog + '%';
}, { passive: true });

// ---- NAVBAR ----
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

// Close mobile nav on link click
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ---- HERO SLIDER ----
const slides = document.querySelectorAll('.hero-slide');
const dots = document.querySelectorAll('.hero-dot');
const prevBtn = document.getElementById('heroPrev');
const nextBtn = document.getElementById('heroNext');
let currentSlide = 0;
let heroInterval = null;

function goToSlide(index) {
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

function nextSlide() { goToSlide(currentSlide + 1); }
function prevSlide() { goToSlide(currentSlide - 1); }

function startHeroAuto() {
  heroInterval = setInterval(nextSlide, 6000);
}

function resetHeroAuto() {
  clearInterval(heroInterval);
  startHeroAuto();
}

prevBtn.addEventListener('click', () => { prevSlide(); resetHeroAuto(); });
nextBtn.addEventListener('click', () => { nextSlide(); resetHeroAuto(); });
dots.forEach((dot, i) => {
  dot.addEventListener('click', () => { goToSlide(i); resetHeroAuto(); });
});

// Swipe support for hero
let heroTouchStart = 0;
const heroEl = document.getElementById('heroSlides');
heroEl.addEventListener('touchstart', e => { heroTouchStart = e.touches[0].clientX; }, { passive: true });
heroEl.addEventListener('touchend', e => {
  const diff = heroTouchStart - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) { nextSlide(); } else { prevSlide(); }
    resetHeroAuto();
  }
}, { passive: true });

startHeroAuto();

// ---- CART STATE ----
let cartItems = [];

function formatPrice(n) {
  return '\u20A6' + n.toLocaleString('en-NG');
}

function saveCart() {
  try { localStorage.setItem('mn_cart', JSON.stringify(cartItems)); } catch(e) {}
}

function loadCart() {
  try {
    const saved = localStorage.getItem('mn_cart');
    if (saved) cartItems = JSON.parse(saved);
  } catch(e) {}
}

function getCartTotal() {
  return cartItems.reduce((s, i) => s + i.price * i.qty, 0);
}

function renderCart() {
  const container = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  const emptyEl = document.getElementById('cartEmpty');
  const countEl = document.getElementById('cartCount');
  const subtotalEl = document.getElementById('cartSubtotal');

  const totalQty = cartItems.reduce((s, i) => s + i.qty, 0);
  countEl.textContent = totalQty;
  countEl.classList.toggle('visible', totalQty > 0);

  if (cartItems.length === 0) {
    emptyEl.style.display = 'flex';
    footer.style.display = 'none';
    // Remove any extra item nodes
    container.querySelectorAll('.cart-item').forEach(n => n.remove());
    return;
  }

  emptyEl.style.display = 'none';
  footer.style.display = 'block';
  subtotalEl.textContent = formatPrice(getCartTotal());

  // Rebuild items
  container.querySelectorAll('.cart-item').forEach(n => n.remove());
  cartItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.dataset.id = item.id;
    div.innerHTML = `
      <div class="cart-item-img">
        <img src="${item.img}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;" loading="lazy" />
      </div>
      <div class="cart-item-details">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">${formatPrice(item.price)}</p>
        <div class="cart-item-qty">
          <button class="qty-btn" data-action="dec" data-id="${item.id}">&#8722;</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
        </div>
        <button class="cart-item-remove" data-id="${item.id}">Remove</button>
      </div>
    `;
    container.appendChild(div);
  });

  // Bind qty & remove buttons
  container.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const action = btn.dataset.action;
      const idx = cartItems.findIndex(i => i.id === id);
      if (idx === -1) return;
      if (action === 'inc') {
        cartItems[idx].qty++;
      } else {
        cartItems[idx].qty--;
        if (cartItems[idx].qty <= 0) cartItems.splice(idx, 1);
      }
      saveCart();
      renderCart();
    });
  });

  container.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      cartItems = cartItems.filter(i => i.id !== id);
      saveCart();
      renderCart();
    });
  });
}

function addToCart(id, name, price) {
  // Try to get image from corresponding product card
  let img = '';
  const cards = document.querySelectorAll('.product-card');
  cards.forEach(card => {
    const btn = card.querySelector('.quick-add');
    if (btn && parseInt(btn.dataset.id) === id) {
      const primaryImg = card.querySelector('.product-img.primary');
      if (primaryImg) img = primaryImg.src;
    }
  });

  const existing = cartItems.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cartItems.push({ id, name, price, qty: 1, img });
  }
  saveCart();
  renderCart();
  openCart();

  // Brief button feedback
  const btn = document.querySelector(`.quick-add[data-id="${id}"]`);
  if (btn) {
    const orig = btn.textContent;
    btn.textContent = 'Added';
    btn.style.background = 'rgba(201,169,110,0.9)';
    btn.style.color = '#080c18';
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
      btn.style.color = '';
    }, 1200);
  }
}

// ---- CART DRAWER ----
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartToggle = document.getElementById('cartToggle');
const cartClose = document.getElementById('cartClose');
const continueShopping = document.getElementById('continueShopping');

function openCart() {
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

cartToggle.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);
if (continueShopping) {
  continueShopping.addEventListener('click', closeCart);
}

// ---- ADD TO CART BUTTONS ----
document.querySelectorAll('.quick-add').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = parseInt(btn.dataset.id);
    const name = btn.dataset.name;
    const price = parseInt(btn.dataset.price);
    addToCart(id, name, price);
  });
});

// ---- CHECKOUT ----
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const modalOverlay = document.getElementById('modalOverlay');
const loaderBar = document.getElementById('loaderBar');

function buildWhatsAppMessage() {
  const phone = '2349031538922';
  let msg = 'Hello Maison Noir,%0A%0AI would like to place the following order:%0A%0A';
  cartItems.forEach(item => {
    msg += `- ${item.name} x${item.qty} — ${formatPrice(item.price * item.qty)}%0A`;
  });
  msg += `%0ATotal: ${formatPrice(getCartTotal())}%0A%0APlease confirm availability and delivery details. Thank you.`;
  return `https://wa.me/${phone}?text=${msg}`;
}

checkoutBtn.addEventListener('click', () => {
  if (cartItems.length === 0) return;

  // Close cart, show modal
  closeCart();
  checkoutModal.classList.add('active');
  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Animate loader
  requestAnimationFrame(() => {
    loaderBar.classList.add('go');
  });

  // Redirect to WhatsApp after 2.8s
  setTimeout(() => {
    const url = buildWhatsAppMessage();
    window.open(url, '_blank');
    // Reset
    checkoutModal.classList.remove('active');
    modalOverlay.classList.remove('active');
    loaderBar.classList.remove('go');
    loaderBar.style.transition = 'none';
    loaderBar.style.width = '0%';
    setTimeout(() => { loaderBar.style.transition = ''; }, 50);
    document.body.style.overflow = '';
    // Clear cart
    cartItems = [];
    saveCart();
    renderCart();
  }, 2800);
});

// ---- TESTIMONIALS SLIDER ----
const tSlider = document.getElementById('testimonialsSlider');
const tCards = tSlider ? tSlider.querySelectorAll('.testimonial-card') : [];
const tDotsContainer = document.getElementById('tDots');
const tPrev = document.getElementById('tPrev');
const tNext = document.getElementById('tNext');

let tCurrent = 0;
let tVisible = getVisibleTestimonials();
let tTotal = tCards.length;

function getVisibleTestimonials() {
  if (window.innerWidth <= 680) return 1;
  if (window.innerWidth <= 1100) return 2;
  return 3;
}

function buildTDots() {
  if (!tDotsContainer) return;
  tDotsContainer.innerHTML = '';
  const pages = Math.ceil(tTotal / tVisible);
  for (let i = 0; i < pages; i++) {
    const d = document.createElement('button');
    d.className = 't-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => goToTestimonial(i));
    tDotsContainer.appendChild(d);
  }
}

function goToTestimonial(page) {
  tVisible = getVisibleTestimonials();
  const pages = Math.ceil(tTotal / tVisible);
  tCurrent = Math.max(0, Math.min(page, pages - 1));
  const offset = tCurrent * (100 / tVisible) * tVisible;
  if (tSlider) tSlider.style.transform = `translateX(-${offset}%)`;
  if (tSlider) tSlider.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  tDotsContainer.querySelectorAll('.t-dot').forEach((d, i) => {
    d.classList.toggle('active', i === tCurrent);
  });
}

if (tPrev) tPrev.addEventListener('click', () => goToTestimonial(tCurrent - 1));
if (tNext) tNext.addEventListener('click', () => goToTestimonial(tCurrent + 1));

// Swipe for testimonials
let tTouchStart = 0;
if (tSlider) {
  tSlider.addEventListener('touchstart', e => { tTouchStart = e.touches[0].clientX; }, { passive: true });
  tSlider.addEventListener('touchend', e => {
    const diff = tTouchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) { goToTestimonial(tCurrent + 1); } else { goToTestimonial(tCurrent - 1); }
    }
  }, { passive: true });
}

window.addEventListener('resize', () => {
  tVisible = getVisibleTestimonials();
  buildTDots();
  goToTestimonial(0);
});

buildTDots();

// ---- NEWSLETTER ----
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', e => {
    e.preventDefault();
    const input = newsletterForm.querySelector('.newsletter-input');
    const btn = newsletterForm.querySelector('.btn');
    const orig = btn.textContent;
    btn.textContent = 'Subscribed';
    btn.style.background = 'rgba(201,169,110,0.8)';
    input.value = '';
    input.placeholder = 'Welcome to the circle.';
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
      input.placeholder = 'Your email address';
    }, 3000);
  });
}

// ---- SCROLL REVEAL ----
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

// ---- BACK TO TOP ----
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  if (window.scrollY > 600) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
}, { passive: true });

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ---- PARALLAX EFFECT ----
const parallaxBg = document.querySelector('.parallax-bg');
if (parallaxBg && window.innerWidth > 768) {
  window.addEventListener('scroll', () => {
    const section = document.querySelector('.parallax-divider');
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const offset = rect.top / window.innerHeight;
    parallaxBg.style.transform = `translateY(${offset * 60}px)`;
  }, { passive: true });
}

// ---- CURSOR GLOW (desktop only) ----
if (window.innerWidth > 1024 && !window.matchMedia('(pointer: coarse)').matches) {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 9000;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201,169,110,0.045) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: left 0.15s ease, top 0.15s ease;
    mix-blend-mode: screen;
  `;
  document.body.appendChild(glow);

  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  }, { passive: true });
}

// ---- 3D CARD HOVER (product cards, desktop) ----
if (window.innerWidth > 768 && !window.matchMedia('(pointer: coarse)').matches) {
  document.querySelectorAll('.product-card, .collection-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `
        perspective(800px)
        rotateY(${x * 6}deg)
        rotateX(${-y * 4}deg)
        translateY(-8px)
      `;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
  });
}

// ---- INIT ----
loadCart();
renderCart();

console.log('%cMAISON NOIR', 'font-size:20px;font-weight:900;color:#c9a96e;letter-spacing:0.2em;');
console.log('%cLuxury Fashion House — Built with precision.', 'color:#8795b0;');
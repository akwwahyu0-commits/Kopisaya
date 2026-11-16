/* ===== KopiKita — script.js =====
   Semua data produk ada di PRODUCTS: edit di sini untuk mengubah menu. */
(function () {
  'use strict';

  // Foto dari Unsplash. Jika ingin foto lokal, ganti isi img dengan 'assets/images/nama.jpg'
  const u = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=700&q=80`;

  const PRODUCTS = [
    { id: 'c1', cat: 'Coffee', name: 'Kopi Susu Gula Aren', price: 28000, img: u('1461023058943-07fcbe16d735'), desc: 'Espresso, susu segar, dan gula aren yang dimasak pelan.' },
    { id: 'c2', cat: 'Coffee', name: 'Americano', price: 22000, img: u('1495474472287-4d71bcdd2085'), desc: 'Double shot espresso bersih dengan catatan cokelat gelap.' },
    { id: 'c3', cat: 'Coffee', name: 'Flat White', price: 30000, img: u('1509042239860-f550ce710b93'), desc: 'Microfoam tipis dan ristretto yang pekat.' },
    { id: 'n1', cat: 'Non-Coffee', name: 'Matcha Latte', price: 30000, img: u('1536256263959-770b48d82b0a'), desc: 'Matcha kualitas harian, susu oat, manis secukupnya.' },
    { id: 'n2', cat: 'Non-Coffee', name: 'Teh Tarik Rempah', price: 24000, img: u('1544787219-7f47ccb76574'), desc: 'Teh hitam, kayu manis, dan sedikit jahe.' },
    { id: 'n3', cat: 'Non-Coffee', name: 'Cokelat Panas', price: 27000, img: u('1542990253-0d0f5be5f0ed'), desc: 'Cokelat 70% yang dilebur, bukan bubuk instan.' },
    { id: 's1', cat: 'Signature', name: 'Cold Brew Jeruk', price: 34000, img: u('1517701604599-bb29b565090c'), desc: 'Cold brew 18 jam dengan perasan jeruk dan tonik.' },
    { id: 's2', cat: 'Signature', name: 'Affogato Vanilla', price: 36000, img: u('1572442388796-11668a67e53d'), desc: 'Es krim vanilla yang disiram espresso panas di meja.' },
    { id: 's3', cat: 'Signature', name: 'Es Kopi Pandan Kelapa', price: 35000, img: u('1578314675249-a6910f80cc4e'), desc: 'Kopi, santan pandan, dan serutan kelapa muda.' }
  ];

  const KEY = 'kopikita_cart_v1';
  const TAX = 0.1;
  const $ = (s) => document.querySelector(s);
  const rupiah = (n) => 'Rp' + Math.round(n).toLocaleString('id-ID');
  const byId = (id) => PRODUCTS.find((p) => p.id === id);

  /* ---------- State keranjang (localStorage) ---------- */
  let cart = loadCart();

  function loadCart() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY)) || {};
      const clean = {};
      Object.keys(raw).forEach((id) => {
        const q = parseInt(raw[id], 10);
        if (byId(id) && q > 0) clean[id] = Math.min(q, 99);
      });
      return clean;
    } catch (e) { return {}; }
  }
  function saveCart() {
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) { /* mode privat: abaikan */ }
  }
  const count = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const subtotal = () => Object.keys(cart).reduce((s, id) => s + byId(id).price * cart[id], 0);

  /* ---------- Render menu + filter ---------- */
  const grid = $('#products');
  let activeCat = 'all';

  function renderProducts() {
    const list = PRODUCTS.filter((p) => activeCat === 'all' || p.cat === activeCat);
    grid.innerHTML = list.map((p) => `
      <article class="product">
        <div class="product__img"><img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.remove()"></div>
        <span class="product__cat">${p.cat}</span>
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="product__foot">
          <span class="price">${rupiah(p.price)}</span>
          <button class="add" data-add="${p.id}"><svg class="i" style="width:16px;height:16px"><use href="#i-plus"/></svg>Add to Cart</button>
        </div>
      </article>`).join('');
  }

  $('#filters').addEventListener('click', (e) => {
    const b = e.target.closest('.filter');
    if (!b) return;
    activeCat = b.dataset.cat;
    document.querySelectorAll('.filter').forEach((f) => {
      const on = f === b;
      f.classList.toggle('is-active', on);
      f.setAttribute('aria-pressed', on);
    });
    renderProducts();
  });

  grid.addEventListener('click', (e) => {
    const b = e.target.closest('[data-add]');
    if (!b) return;
    const id = b.dataset.add;
    cart[id] = Math.min((cart[id] || 0) + 1, 99);
    update();
    // Umpan balik: tombol berubah sebentar + toast
    b.classList.add('done');
    b.lastChild.textContent = 'Ditambahkan';
    setTimeout(() => { b.classList.remove('done'); b.lastChild.textContent = 'Add to Cart'; }, 1100);
    toast(byId(id).name + ' masuk keranjang');
  });

  /* ---------- Render keranjang ---------- */
  const itemsEl = $('#cartItems');

  function update() {
    saveCart();
    const n = count();
    const badge = $('#cartCount');
    badge.hidden = n === 0;
    badge.textContent = n;
    badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump');

    const ids = Object.keys(cart);
    if (!ids.length) {
      itemsEl.innerHTML = '<div class="empty"><p>Keranjangmu masih kosong.</p><button class="btn" data-go-menu>Lihat menu</button></div>';
    } else {
      itemsEl.innerHTML = ids.map((id) => {
        const p = byId(id);
        return `
        <div class="item">
          <div class="item__img"><img src="${p.img}" alt="" onerror="this.remove()"></div>
          <div>
            <h3>${p.name}</h3>
            <small>${rupiah(p.price)}</small><br>
            <div class="qty">
              <button data-dec="${id}" aria-label="Kurangi ${p.name}"><svg class="i"><use href="#i-minus"/></svg></button>
              <span aria-live="polite">${cart[id]}</span>
              <button data-inc="${id}" aria-label="Tambah ${p.name}"><svg class="i"><use href="#i-plus"/></svg></button>
            </div>
          </div>
          <div class="item__side">
            <button class="item__rm" data-rm="${id}" aria-label="Hapus ${p.name}"><svg class="i"><use href="#i-trash"/></svg></button>
            <strong>${rupiah(p.price * cart[id])}</strong>
          </div>
        </div>`;
      }).join('');
    }
    const sub = subtotal(), tax = sub * TAX;
    $('#subtotal').textContent = rupiah(sub);
    $('#tax').textContent = rupiah(tax);
    $('#total').textContent = rupiah(sub + tax);
    $('#modalTotal').textContent = rupiah(sub + tax);
    $('#checkoutBtn').disabled = !ids.length;
    $('#clearBtn').hidden = !ids.length;
  }

  itemsEl.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.hasAttribute('data-go-menu')) { closeDrawer(); location.hash = '#menu'; return; }
    const { inc, dec, rm } = t.dataset;
    if (inc) cart[inc] = Math.min(cart[inc] + 1, 99);
    if (dec) { cart[dec]--; if (cart[dec] <= 0) delete cart[dec]; }
    if (rm) delete cart[rm];
    update();
  });

  $('#clearBtn').addEventListener('click', () => { cart = {}; update(); });

  /* ---------- Drawer ---------- */
  const drawer = $('#drawer'), overlay = $('#overlay');
  overlay.hidden = false; // transisi diatur lewat class
  let lastFocus = null;

  function openDrawer() {
    lastFocus = document.activeElement;
    drawer.classList.add('is-open'); overlay.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    $('#cartClose').focus();
  }
  function closeDrawer() {
    drawer.classList.remove('is-open'); overlay.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    if (lastFocus) lastFocus.focus();
  }
  $('#cartBtn').addEventListener('click', openDrawer);
  $('#cartClose').addEventListener('click', closeDrawer);
  overlay.addEventListener('click', () => { closeDrawer(); });

  /* ---------- Checkout modal + validasi ---------- */
  const modal = $('#modal'), form = $('#checkoutForm'), confirmEl = $('#confirm');

  function openModal() {
    if (!count()) return;
    closeDrawer();
    form.hidden = false; confirmEl.hidden = true;
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('is-open'));
    $('#cName').focus();
  }
  function closeModal() {
    modal.classList.remove('is-open');
    setTimeout(() => { modal.hidden = true; }, 300);
  }
  $('#checkoutBtn').addEventListener('click', openModal);
  $('#modalClose').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  function setErr(input, errEl, msg) {
    errEl.textContent = msg;
    input.classList.toggle('invalid', !!msg);
    return !msg;
  }
  function validate() {
    const name = $('#cName'), phone = $('#cPhone');
    const nv = name.value.trim(), pv = phone.value.replace(/[\s-]/g, '');
    const okN = setErr(name, $('#eName'),
      nv.length < 3 ? 'Nama minimal 3 karakter.' : !/^[\p{L}\s.'-]+$/u.test(nv) ? 'Nama hanya boleh berisi huruf.' : '');
    const okP = setErr(phone, $('#ePhone'),
      !/^(\+62|62|0)8\d{8,11}$/.test(pv) ? 'Gunakan nomor Indonesia, contoh 081234567890.' : '');
    return okN && okP;
  }
  ['#cName', '#cPhone'].forEach((s) => $(s).addEventListener('input', () => { if ($(s).classList.contains('invalid')) validate(); }));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) { (document.querySelector('.invalid') || {}).focus?.(); return; }

    const sub = subtotal(), total = sub + sub * TAX;
    const code = 'KK-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    const method = form.method.value;
    const lines = Object.keys(cart).map((id) => `<div class="row"><span>${cart[id]}× ${byId(id).name}</span><span>${rupiah(byId(id).price * cart[id])}</span></div>`).join('');

    $('#confirmText').textContent = `Terima kasih, ${$('#cName').value.trim()}. Pesanan ${code} (${method}) sedang disiapkan. Ini hanya simulasi.`;
    $('#receipt').innerHTML = lines + `<div class="row row--total" style="margin:.8rem 0 0"><span>Total</span><span>${rupiah(total)}</span></div>`;
    form.hidden = true; confirmEl.hidden = false;

    cart = {}; update(); form.reset();
  });
  $('#confirmDone').addEventListener('click', () => { closeModal(); location.hash = '#menu'; });

  /* ---------- Navigasi ---------- */
  const navLinks = $('#navLinks'), navToggle = $('#navToggle');
  function setNav(open) {
    navLinks.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open);
    navToggle.querySelector('use').setAttribute('href', open ? '#i-x' : '#i-menu');
  }
  navToggle.addEventListener('click', () => setNav(!navLinks.classList.contains('open')));
  navLinks.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });

  // Penanda link aktif sesuai section
  const links = [...navLinks.querySelectorAll('a')];
  const spy = new IntersectionObserver((es) => es.forEach((en) => {
    if (en.isIntersecting) links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach((s) => spy.observe(s));

  // Tombol Explore Offers: tambah dua Signature ke keranjang
  $('#offerBtn').addEventListener('click', () => {
    location.hash = '#menu';
    document.querySelector('[data-cat="Signature"]').click();
    toast('Pilih dua minuman Signature untuk bonus cookies');
  });

  // Ikon sosial adalah demo
  document.querySelectorAll('[data-demo]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); toast('Akun sosial ini hanya demo'); location.hash = '#location'; }));

  /* ---------- Escape menutup panel ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!modal.hidden) closeModal(); else if (drawer.classList.contains('is-open')) closeDrawer(); else setNav(false);
  });

  /* ---------- Toast ---------- */
  const toastEl = $('#toast'); let tt;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  /* ---------- Animasi masuk ringan ---------- */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { threshold: 0.12 }) : null;
  document.querySelectorAll('.reveal').forEach((el) => io ? io.observe(el) : el.classList.add('in'));

  /* ---------- Init ---------- */
  renderProducts();
  update();
})();
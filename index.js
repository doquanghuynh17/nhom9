(function () {
  

  const pages = ['home', 'products', 'about'];
  const links = document.querySelectorAll('.nav-link');

  // Điều hướng nội bộ: hiển thị 1 trong 3 trang (home/products/about)
  function showPage(pageId, focus = true) {
    pages.forEach(p => {
      const el = document.getElementById(p);
      if (!el) return;
      el.hidden = p !== pageId;
      if (p === pageId) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (focus) el.focus({ preventScroll: true });
      }
    });

    links.forEach(a =>
      a.classList.toggle('active', a.dataset.route === pageId)
    );

    document.body.classList.toggle('show-products-chat', pageId === 'products');

    if (location.hash !== '#' + pageId) {
      history.replaceState(null, '', '#' + pageId);
    }
  }

  const initial =
    location.hash && pages.includes(location.hash.replace('#', ''))
      ? location.hash.replace('#', '')
      : 'home';

  pages.forEach(p => {
    const el = document.getElementById(p);
    if (el) el.hidden = true;
  });
  showPage(initial, false);

  document.querySelectorAll('[data-route]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      showPage(a.dataset.route);
    });
  });

  window.addEventListener('hashchange', () => {
    const h = location.hash.replace('#', '');
    if (pages.includes(h)) showPage(h);
  });


  // Liên hệ nhanh: gửi form đơn giản ở trang chủ
  const quickSend = document.getElementById('quickSend');
  if (quickSend) {
    quickSend.addEventListener('click', () => {
      const name = cname.value.trim();
      const email = cemail.value.trim();
      const msg = cmsg.value.trim();

      if (!name || !email || !msg) {
        alert('Vui lòng điền đầy đủ thông tin.');
        return;
      }

      alert('Cảm ơn ' + name + '! Chúng tôi đã nhận yêu cầu.');
      cname.value = cemail.value = cmsg.value = '';
    });
  }

  const chatMessages = document.getElementById('chatMessages');
  const chatForm = document.getElementById('chatForm');
  const chatText = document.getElementById('chatText');
  const chatBox = document.querySelector('.chat-box');
  const chatToggle = document.querySelector('.chat-toggle');
  const chatEmojiBtn = document.getElementById('chatEmojiBtn');
  const chatEmojiPanel = document.getElementById('chatEmojiPanel');
  const chatImageInput = document.getElementById('chatImageInput');
  const chatImageViewer = document.getElementById('chatImageViewer');
  const chatImageFull = document.getElementById('chatImageFull');
  const CHAT_KEY = 'vip_chat_messages';
  const MAX_CHAT_STORE = 2000000; // ~2MB an toàn
  const MAX_IMAGE_LENGTH = 300000; // giới hạn dataURL ảnh
  const productSearch = document.getElementById('productSearch');
  const productSearchBtn = document.getElementById('productSearchBtn');
  const searchHistoryEl = document.getElementById('searchHistory');
  const SEARCH_KEY = 'vip_search_history';
  const openAuth = document.getElementById('openAuth');
  const authModal = document.getElementById('authModal');
  const authTabs = document.querySelectorAll('.auth-tab');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginEmail = document.getElementById('loginEmail');
  const loginPass = document.getElementById('loginPass');
  const regEmail = document.getElementById('regEmail');
  const regPass = document.getElementById('regPass');
  const loginMsg = document.getElementById('loginMsg');
  const loginNote = document.getElementById('loginNote');
  const regMsg = document.getElementById('regMsg');
  const loginGoogle = document.getElementById('loginGoogle');
  const loginFacebook = document.getElementById('loginFacebook');
  const loginSubmit = document.getElementById('loginSubmit');
  const registerSubmit = document.getElementById('registerSubmit');
  const loginRemember = document.getElementById('loginRemember');
  const userStatus = document.getElementById('userStatus');
  let logoutBtn = null;

  function loadMessages() {
    try {
      const raw = localStorage.getItem(scopedKey('chat', CHAT_KEY));
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  function saveMessages(list) {
    try {
      localStorage.setItem(scopedKey('chat', CHAT_KEY), JSON.stringify(list));
      return true;
    } catch (_) {
      return false;
    }
  }
  // Khởi tạo hội thoại chat theo tài khoản hiện tại
  function initChatForCurrentUser() {
    const msgs = loadMessages();
    if (!msgs.length) {
      const email = getCurrentUser();
      const greet = email ? ('Xin chào ' + email + '. Tôi có thể hỗ trợ gì cho bạn?') : 'Tôi có thể giúp gì cho bạn.';
      msgs.push({ from: 'bot', text: greet });
      saveMessages(msgs);
    }
    renderMessages(msgs);
  }

  // Render danh sách tin nhắn chat (user/bot)
  function renderMessages(list) {
    if (!chatMessages) return;
    chatMessages.innerHTML = '';
    list.forEach(m => {
      const div = document.createElement('div');
      div.className = 'chat-message ' + (m.from === 'user' ? 'user' : 'bot');
      if (m.text) {
        const span = document.createElement('div');
        span.textContent = m.text;
        div.appendChild(span);
      }
      if (m.image) {
        const img = document.createElement('img');
        img.src = m.image;
        img.alt = '';
        if (chatImageViewer && chatImageFull) {
          img.addEventListener('click', () => {
            chatImageFull.src = m.image;
            chatImageViewer.removeAttribute('hidden');
          });
        }
        div.appendChild(img);
      }
      chatMessages.appendChild(div);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Luật trả lời đơn giản cho chat bot: bắt từ khóa và phản hồi phù hợp
  function reply(text) {
    const t = text.toLowerCase();
    if (
      t.includes('giá') ||
      t.includes('bao nhiêu')
    ) {
      return 'Giá đã hiển thị dưới từng sản phẩm. Bạn muốn hỏi sản phẩm nào?';
    }
    if (
      t.includes('ship') ||
      t.includes('giao hàng')
    ) {
      return 'Chúng tôi hỗ trợ giao hàng toàn quốc với nhiều hình thức linh hoạt như VNExpress, Giao hàng tiết kiệm, Giao hàng nhanh...';
    }
    if (
      t.includes('giảm giá') ||
      t.includes('khuyến mãi') ||
      t.includes('sale')
    ) {
      return 'Một số sản phẩm có ưu đãi theo thời điểm. Hãy cho tôi biết sản phẩm bạn quan tâm.';
    }
    if (
      t.includes('xin chào') ||
      t.includes('chào') ||
      t.includes('hello')
    ) {
      return 'Xin chào, tôi là trợ lý Luxury. Tôi có thể hỗ trợ gì cho bạn?';
    }
    if (
      t.includes('xin chào') ||
      t.includes('chào shop') ||
      t.includes('chào anh') ||
      t.includes('chào chị') ||
      t.includes('chào bạn') ||
      t.includes('tư vấn')
    ) {
      return 'Xin chào! Đây là Luxury Shop. Tôi có thể giúp gì cho bạn hôm nay? 😊';
    }


    if (
      t.includes('hi') ||
      t.includes('hello') ||
      t.includes('hey') ||
      t.includes('support') ||
      t.includes('consult')
    ) {
      return 'Hello! Welcome to Luxury Shop. How can I assist you today? 😊';
    }

    if (
      t.includes('giá') ||
      t.includes('bao nhiêu') ||
      t.includes('giá bao nhiêu') ||
      t.includes('mấy tiền') ||
      t.includes('giá tiền') ||
      t.includes('bao tiền')
    ) {
      return 'Giá hiển thị dưới từng sản phẩm. Bạn muốn hỏi sản phẩm nào?';
    }

    if (
      t.includes('price') ||
      t.includes('cost') ||
      t.includes('how much') ||
      t.includes('how many')
    ) {
      return 'The prices are already shown clearly under each product. Which item are you asking about?';
    }

    if (
      t.includes('liên hệ') ||
      t.includes('trao đổi') ||
      t.includes('thông tin') ||
      t.includes('liên lạc') ||
      t.includes('kết nối') ||
      t.includes('hotline') ||
      t.includes('số điện thoại') ||
      t.includes('zalo')
    ) {
      return `Kết nối với chúng tôi tại:\n` +
        `- SĐT/Zalo: 1900 1004\n` +
        `- Gmail: luxuryshop9999@gmail.com\n` +
        `- Facebook: https://www.facebook.com/Luxuryshop/`;
    }

    if (
      t.includes('contact') ||
      t.includes('information') ||
      t.includes('connect') ||
      t.includes('phone') ||
      t.includes('email') ||
      t.includes('facebook')
    ) {
      return `Connect with us at:\n` +
        `- Phone/Zalo: 1900 1004\n` +
        `- Gmail: luxuryshop9999@gmail.com\n` +
        `- Facebook: https://www.facebook.com/Luxuryshop/`;
    }

    if (
      t.includes('giảm giá') ||
      t.includes('khuyến mãi') ||
      t.includes('ưu đãi') ||
      t.includes('giảm')
    ) {
      return `Chương trình khuyến mãi Tết đang diễn ra từ:\n` +
        `👉 Từ ngày **16/01/2026** đến **29/02/2026**\n\n` +
        `Giá siêu hời, nhiều ưu đãi hấp dẫn đang chờ bạn! 🔥`;
    }

    if (
      t.includes('sale') ||
      t.includes('sales') ||
      t.includes('promotion') ||
      t.includes('discount')
    ) {
      return `Our Tet Promotion is now live!\n` +
        `📅 From **January 16, 2026** to **February 29, 2026**\n\n` +
        `Super hot deals and discounts are waiting for you! 🔥`;
    }


    if (
      t.includes('chất lượng') ||
      t.includes('quality') ||
      t.includes('chất') ||
      t.includes('độ bền')
    ) {
      return `Tất cả sản phẩm tại Luxury Shop đều được chế tác từ nguyên liệu cao cấp bậc nhất thế giới, gia công thủ công tinh xảo bởi các nghệ nhân hàng đầu. Chúng tôi không làm hàng đại trà.\n` +
        `Chỉ có sự xa xỉ đích thực và đẳng cấp riêng biệt.`;
    }

    if (
      t.includes('chất lượng') ||
      t.includes('quality') ||
      t.includes('chất') ||
      t.includes('độ bền')
    ) {
      return `At Luxury Shop, every creation is forged exclusively from the finest materials the world has to offer, handcrafted with uncompromising artistry by the most skilled masters.\n` +
        `We never compromise with mass production — only authentic, timeless luxury and singular sophistication. ✨`;
    }
    return 'Xin vui lòng đợi bên tư vấn để có thể nhận được mức giá ưu đãi nhất, chúng tôi sẽ cố gắn liên lạc lại với bạn sớm nhất có thể....';
  }

  // Khởi động khối chat: toggle mở/đóng, xử lý gửi tin nhắn và phản hồi bot
  if (chatToggle && chatBox && chatForm && chatText && chatMessages) {
    initChatForCurrentUser();

    chatToggle.addEventListener('click', () => {
      const isHidden = chatBox.hasAttribute('hidden');
      if (isHidden) {
        chatBox.removeAttribute('hidden');
        chatToggle.setAttribute('aria-expanded', 'true');
      } else {
        chatBox.setAttribute('hidden', '');
        chatToggle.setAttribute('aria-expanded', 'false');
      }
    });

    chatForm.addEventListener('submit', e => {
      e.preventDefault();
      const text = chatText.value.trim();
      if (!text) return;
      const messages = loadMessages();
      messages.push({ from: 'user', text });
      const botText = reply(text);
      messages.push({ from: 'bot', text: botText });
      saveMessages(messages);
      renderMessages(messages);
      chatText.value = '';
      chatText.focus();
    });
  }

  // Bảng emoji: mở/đóng khi nhấn nút emoji
  if (chatEmojiBtn && chatText && chatEmojiPanel) {
    chatEmojiBtn.addEventListener('click', () => {
      const isHidden = chatEmojiPanel.hasAttribute('hidden');
      if (isHidden) {
        chatEmojiPanel.removeAttribute('hidden');
      } else {
        chatEmojiPanel.setAttribute('hidden', '');
      }
    });
  }

  // Chèn emoji vào ô nhập chat khi chọn
  if (chatEmojiPanel && chatText) {
    chatEmojiPanel.addEventListener('click', e => {
      const target = e.target;
      if (!target.classList || !target.classList.contains('chat-emoji-item')) return;
      const emoji = target.textContent || '';
      const value = chatText.value;
      const insert = value ? value + ' ' + emoji : emoji;
      chatText.value = insert;
      chatText.focus();
      const len = chatText.value.length;
      chatText.setSelectionRange(len, len);
      chatEmojiPanel.setAttribute('hidden', '');
    });
  }

  // Gửi ảnh trong chat: nén ảnh theo ngưỡng và thêm vào hội thoại
  if (chatImageInput && chatMessages) {
    chatImageInput.addEventListener('change', e => {
      const files = e.target.files;
      if (!files || !files[0]) return;
      const file = files[0];
      if (!file.type || !file.type.startsWith('image/')) return;
      compressImage(file, 900, 900, 0.72).then(dataUrl => {
        if ((dataUrl || '').length > MAX_IMAGE_LENGTH) {
          return compressImage(file, 600, 600, 0.55);
        }
        return dataUrl;
      }).then(dataOrUrl => {
        const dataUrl = typeof dataOrUrl === 'string' ? dataOrUrl : (dataOrUrl || '');
        if ((dataUrl || '').length > MAX_IMAGE_LENGTH) {
          return compressImage(file, 400, 400, 0.4).then(u => u).catch(() => dataUrl);
        }
        return dataUrl;
      }).then(dataUrl => {
        const existing = loadMessages();
        let list = Array.isArray(existing) ? existing : [];
        list.push({ from: 'user', image: dataUrl });
        ensureStorageFit(list);
        if (!saveMessages(list)) {
          const msg = loadMessages();
          const m2 = Array.isArray(msg) ? msg : [];
          m2.push({ from: 'bot', text: 'Ảnh quá lớn, vui lòng chọn ảnh nhẹ hơn.' });
          ensureStorageFit(m2);
          saveMessages(m2);
          renderMessages(m2);
        } else {
          renderMessages(list);
        }
        chatImageInput.value = '';
      }).catch(() => {
        const msg = loadMessages();
        const m2 = Array.isArray(msg) ? msg : [];
        m2.push({ from: 'bot', text: 'Không thể đọc ảnh.' });
        saveMessages(m2);
        renderMessages(m2);
        chatImageInput.value = '';
      });
    });
  }

  // Tiện ích: ước lượng kích thước JSON hóa của đối tượng
  function jsonSize(obj) {
    try { return JSON.stringify(obj).length; } catch (_) { return 0; }
  }
  // Đảm bảo dung lượng chat không vượt giới hạn (~2MB) bằng cách loại ảnh cũ
  function ensureStorageFit(list) {
    while (jsonSize(list) > MAX_CHAT_STORE && list.length > 1) {
      const idx = list.findIndex(m => m && m.image);
      if (idx >= 0) list.splice(idx, 1);
      else list.shift();
    }
  }

  function compressImage(file, maxW, maxH, quality) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          let w = img.naturalWidth || img.width;
          let h = img.naturalHeight || img.height;
          const ratio = Math.min(maxW / w, maxH / h, 1);
          w = Math.max(1, Math.round(w * ratio));
          h = Math.max(1, Math.round(h * ratio));
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject(new Error('noctx')); return; }
          ctx.drawImage(img, 0, 0, w, h);
          const url = canvas.toDataURL('image/jpeg', quality);
          resolve(url);
        };
        img.onerror = () => reject(new Error('imgerr'));
        img.src = reader.result;
      };
      reader.onerror = () => reject(new Error('readerr'));
      reader.readAsDataURL(file);
    });
  }

  if (chatImageViewer && chatImageFull) {
    chatImageViewer.addEventListener('click', () => {
      chatImageViewer.setAttribute('hidden', '');
      chatImageFull.src = '';
    });
  }

  function getProducts() {
    return Array.from(document.querySelectorAll('#products .product'));
  }

  function normalize(s) {
    const v = (s || '').toString().trim().toLowerCase();
    try {
      return v.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    } catch (_) {
      return v;
    }
  }

  function filterProducts(term) {
    const t = normalize(term);
    const tokens = t.split(/\s+/).filter(Boolean);
    const items = getProducts();
    items.forEach(item => {
      const title = item.querySelector('h3')?.textContent || '';
      const desc = item.querySelector('p')?.textContent || '';
      const colors = (item.getAttribute('data-colors') || '').split('|').map(x => normalize(x));
      const weights = (item.getAttribute('data-weights') || '').split('|').map(x => normalize(x));
      const hay = [normalize(title), normalize(desc)]
        .concat(colors)
        .concat(weights)
        .join(' ');
      const show = tokens.every(tok => hay.includes(tok));
      item.style.display = show ? '' : 'none';
    });
  }

  function loadSearchHistory() {
    try {
      const raw = localStorage.getItem(scopedKey('search', SEARCH_KEY));
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (_) { return []; }
  }

  function saveSearchHistory(list) {
    try { localStorage.setItem(scopedKey('search', SEARCH_KEY), JSON.stringify(list.slice(0, 4))); } catch (_) { }
  }

  function renderSearchHistory(term) {
    if (!searchHistoryEl) return;
    const raw = loadSearchHistory();
    const t = (term || '').trim().toLowerCase();
    const items = t ? raw.filter(x => (x || '').toLowerCase().includes(t)).slice(0, 4) : raw.slice(0, 4);
    if (!items.length) {
      searchHistoryEl.setAttribute('hidden', '');
      searchHistoryEl.innerHTML = '';
      return;
    }
    const listHtml = items.map(t => '<div class="item" role="option">' + t + '</div>').join('');
    const actionsHtml = '<div style="display:flex;justify-content:flex-end;padding:6px 10px;"><button type="button" class="btn" id="clearSearchHistory" style="padding:6px 10px;font-size:12px;border-radius:8px">Xóa lịch sử</button></div>';
    searchHistoryEl.innerHTML = listHtml + actionsHtml;
    searchHistoryEl.removeAttribute('hidden');
    searchHistoryEl.querySelectorAll('.item').forEach(el => {
      el.addEventListener('click', () => {
        const v = el.textContent || '';
        if (productSearch) {
          productSearch.value = v;
          filterProducts(v);
        }
        searchHistoryEl.setAttribute('hidden', '');
      });
    });
    const clearBtn = document.getElementById('clearSearchHistory');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        saveSearchHistory([]);
        searchHistoryEl.setAttribute('hidden', '');
        searchHistoryEl.innerHTML = '';
      });
    }
  }

  function pushSearchHistory(term) {
    const t = term.trim();
    if (!t) return;
    const items = loadSearchHistory();
    const filtered = [t].concat(items.filter(x => x !== t));
    saveSearchHistory(filtered);
  }

  function debounce(fn, wait) {
    let t = null;
    return (...args) => {
      if (t) clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }
  let shActiveIndex = -1;
  function moveHistoryActive(dir) {
    if (!searchHistoryEl) return;
    const items = Array.from(searchHistoryEl.querySelectorAll('.item'));
    if (!items.length) return;
    if (dir === 'reset') {
      items.forEach(el => el.classList.remove('active'));
      shActiveIndex = -1;
      return;
    }
    shActiveIndex = (shActiveIndex + dir + items.length) % items.length;
    items.forEach(el => el.classList.remove('active'));
    const cur = items[shActiveIndex];
    if (cur) cur.classList.add('active');
  }
  const debouncedSearch = debounce(() => {
    const v = productSearch?.value || '';
    filterProducts(v);
    if (v.trim()) {
      renderSearchHistory(v);
      moveHistoryActive('reset');
    } else {
      searchHistoryEl && searchHistoryEl.setAttribute('hidden', '');
    }
  }, 160);
  if (productSearch && searchHistoryEl) {
    productSearch.setAttribute('role', 'combobox');
    productSearch.setAttribute('aria-autocomplete', 'list');
    productSearch.addEventListener('input', debouncedSearch);
    productSearch.addEventListener('focus', () => {
      renderSearchHistory(productSearch.value);
      moveHistoryActive('reset');
    });
    productSearch.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const term = productSearch.value || '';
        const cur = searchHistoryEl.querySelector('.item.active');
        const pick = (cur?.textContent || '').trim();
        const final = pick || term;
        pushSearchHistory(final);
        filterProducts(final);
        searchHistoryEl.setAttribute('hidden', '');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        moveHistoryActive(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        moveHistoryActive(-1);
      } else if (e.key === 'Escape') {
        searchHistoryEl.setAttribute('hidden', '');
        moveHistoryActive('reset');
      }
    });
  }
  if (productSearchBtn && productSearch) {
    productSearchBtn.addEventListener('click', () => {
      const term = productSearch.value || '';
      pushSearchHistory(term);
      filterProducts(term);
      searchHistoryEl.setAttribute('hidden', '');
    });
  }

  function isEmail(s) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  }
  function isGmail(s) {
    const m = (s || '').trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m) && m.endsWith('@gmail.com');
  }
  function normalizeEmail(s) {
    return (s || '').trim().toLowerCase();
  }

  async function hashPassword(pwd) {
    const enc = new TextEncoder().encode(pwd);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    const arr = Array.from(new Uint8Array(buf));
    return arr.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function loadUsers() {
    try {
      const raw = localStorage.getItem('vip_users');
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (_) { return []; }
  }
  function saveUsers(list) {
    try { localStorage.setItem('vip_users', JSON.stringify(list)); } catch (_) { }
  }
  // Tìm người dùng theo email (đã normalize)
  function findUserByEmail(email) {
    const e = normalizeEmail(email);
    const users = loadUsers();
    return users.find(u => normalizeEmail(u.email) === e) || null;
  }
  // Ghi người dùng hiện tại vào localStorage
  function setCurrentUser(email) {
    try { localStorage.setItem('vip_current_user', email); } catch (_) { }
  }
  // Lấy email người dùng hiện tại từ localStorage
  function getCurrentUser() {
    try { return localStorage.getItem('vip_current_user') || ''; } catch (_) { return ''; }
  }
  // Xóa trạng thái người dùng hiện tại
  function clearCurrentUser() {
    try { localStorage.removeItem('vip_current_user'); } catch (_) { }
  }

  // Tạo khóa lưu trữ theo người dùng: vip_user:{email}:{base}
  function userKey(email, base) {
    return 'vip_user:' + normalizeEmail(email) + ':' + base;
  }
  // Chọn khóa phù hợp: ưu tiên theo người dùng, fallback khóa chung
  function scopedKey(base, defaultKey) {
    const email = getCurrentUser();
    return email ? userKey(email, base) : defaultKey;
  }
  // Lưu ảnh chụp dữ liệu hiện tại sang không gian riêng của email
  function snapshotForUser(email) {
    try {
      const cart = loadCart();
      localStorage.setItem(userKey(email, 'cart'), JSON.stringify(cart));
    } catch (_) { }
    try {
      const orders = loadOrders();
      localStorage.setItem(userKey(email, 'orders'), JSON.stringify(orders));
    } catch (_) { }
    try {
      const last = getLastOrder();
      localStorage.setItem(userKey(email, 'last_order'), last);
    } catch (_) { }
    try {
      const hist = loadSearchHistory();
      localStorage.setItem(userKey(email, 'search'), JSON.stringify(hist));
    } catch (_) { }
    try {
      const msgs = loadMessages();
      localStorage.setItem(userKey(email, 'chat'), JSON.stringify(msgs));
    } catch (_) { }
  }
  // Reset UI về trạng thái mặc định (dành cho khách/đăng xuất)
  function resetToDefaultUI() {
    try { localStorage.setItem('vip_cart', JSON.stringify([])); } catch (_) { }
    try { localStorage.setItem('vip_orders', JSON.stringify([])); } catch (_) { }
    try { localStorage.removeItem('vip_last_order'); } catch (_) { }
    try { localStorage.setItem('vip_search_history', JSON.stringify([])); } catch (_) { }
    try { localStorage.removeItem('vip_chat_messages'); } catch (_) { }
    updateCartStats();
    renderCartList && renderCartList();
    renderTrackingOptions && renderTrackingOptions();
    renderHistory && renderHistory();
    renderSearchHistory && renderSearchHistory('');
    if (typeof renderMessages === 'function') {
      chatMessages && (chatMessages.innerHTML = '');
    }
  }
  // Khôi phục dữ liệu UI từ không gian riêng theo email sang khóa chung
  function restoreForUser(email) {
    try {
      const raw = localStorage.getItem(userKey(email, 'cart'));
      if (raw !== null) {
        try { localStorage.setItem('vip_cart', raw); } catch (_) { }
      }
    } catch (_) { }
    try {
      const raw = localStorage.getItem(userKey(email, 'orders'));
      if (raw !== null) {
        try { localStorage.setItem('vip_orders', raw); } catch (_) { }
      }
    } catch (_) { }
    try {
      const last = localStorage.getItem(userKey(email, 'last_order'));
      if (last !== null) {
        try { localStorage.setItem('vip_last_order', last); } catch (_) { }
      }
    } catch (_) { }
    try {
      const raw = localStorage.getItem(userKey(email, 'search'));
      if (raw !== null) {
        try { localStorage.setItem('vip_search_history', raw); } catch (_) { }
      }
    } catch (_) { }
    try {
      const raw = localStorage.getItem(userKey(email, 'chat'));
      if (raw !== null) {
        try { localStorage.setItem('vip_chat_messages', raw); } catch (_) { }
      }
    } catch (_) { }
    updateCartStats();
    renderCartList && renderCartList();
    renderTrackingOptions && renderTrackingOptions();
    renderHistory && renderHistory();
    renderSearchHistory && renderSearchHistory('');
  }
  function handleLogout() {
    const email = getCurrentUser();
    if (email) snapshotForUser(email);
    clearCurrentUser();
    resetToDefaultUI();
    updateUserStatus();
    if (openAuth) openAuth.style.display = '';
  }

  function updateUserStatus() {
    if (!userStatus) return;
    const email = getCurrentUser();
    if (email) {
      userStatus.innerHTML = 'Đang đăng nhập: ' + email + ' <button type="button" id="logoutBtn" class="btn" style="padding:6px 10px;font-size:12px;border-radius:8px;margin-left:8px">Đăng xuất</button>';
      logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          handleLogout();
        });
      }
      if (openAuth) openAuth.style.display = 'none';
    } else {
      userStatus.textContent = '';
      if (openAuth) openAuth.style.display = '';
    }
  }
  updateUserStatus();
  (function () {
    const cur = getCurrentUser();
    if (cur) {
      updateUserStatus();
    }
  })();

  function toggleAuth(show) {
    if (!authModal) return;
    if (show) authModal.removeAttribute('hidden');
    else authModal.setAttribute('hidden', '');
  }

  if (openAuth && authModal) {
    openAuth.addEventListener('click', e => {
      e.preventDefault();
      toggleAuth(true);
      const active = document.querySelector('.auth-tab.active');
      const key = active ? active.dataset.tab : 'login';
      if (key === 'login' && loginEmail) loginEmail.focus();
      if (key === 'register' && regEmail) regEmail.focus();
    });
    document.querySelectorAll('.auth-close').forEach(btn => {
      btn.addEventListener('click', () => {
        toggleAuth(false);
        if (loginMsg) loginMsg.textContent = '';
        if (regMsg) regMsg.textContent = '';
        if (loginNote) loginNote.textContent = '';
        if (loginEmail) loginEmail.value = '';
        if (loginPass) loginPass.value = '';
        if (regEmail) regEmail.value = '';
        if (regPass) regPass.value = '';
      });
    });
  }

  if (authTabs && loginForm && registerForm) {
    authTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        authTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const key = tab.dataset.tab;
        if (key === 'login') {
          loginForm.hidden = false;
          registerForm.hidden = true;
        } else {
          loginForm.hidden = true;
          registerForm.hidden = false;
        }
      });
    });
  }
  document.querySelectorAll('.pass-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.target;
      const ip = id ? document.getElementById(id) : null;
      if (!ip) return;
      ip.type = ip.type === 'password' ? 'text' : 'password';
    });
  });

  if (loginForm && loginEmail && loginPass && loginMsg) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      if (loginSubmit) { loginSubmit.disabled = true; loginSubmit.textContent = 'Đang xử lý...'; }
      const email = (loginEmail.value || '').trim();
      const pass = (loginPass.value || '').trim();
      if (!isGmail(email)) {
        loginMsg.textContent = 'Chỉ hỗ trợ Gmail';
        if (loginSubmit) { loginSubmit.disabled = false; loginSubmit.textContent = 'Đăng nhập'; }
        return;
      }
      if (pass.length < 6) {
        loginMsg.textContent = 'Mật khẩu tối thiểu 6 ký tự';
        if (loginSubmit) { loginSubmit.disabled = false; loginSubmit.textContent = 'Đăng nhập'; }
        return;
      }
      const users = loadUsers();
      const found = findUserByEmail(email);
      if (!found) {
        loginMsg.textContent = 'Tài khoản không tồn tại';
        if (loginSubmit) { loginSubmit.disabled = false; loginSubmit.textContent = 'Đăng nhập'; }
        return;
      }
      const hp = await hashPassword(pass);
      if (found.pass !== hp) {
        loginMsg.textContent = 'Sai mật khẩu';
        if (loginSubmit) { loginSubmit.disabled = false; loginSubmit.textContent = 'Đăng nhập'; }
        return;
      }
      found.lastLogin = Date.now();
      saveUsers(users);
      setCurrentUser(email);
      loginMsg.textContent = 'Đăng nhập thành công';
      toggleAuth(false);
      updateUserStatus();
      updateCartStats();
      renderCartList && renderCartList();
      renderTrackingOptions && renderTrackingOptions();
      renderHistory && renderHistory();
      renderSearchHistory && renderSearchHistory('');
      if (typeof initChatForCurrentUser === 'function') {
        initChatForCurrentUser();
      }
      if (loginRemember && loginRemember.checked) {
        try { localStorage.setItem('vip_remember', '1'); } catch (_) { }
      } else {
        try { localStorage.removeItem('vip_remember'); } catch (_) { }
      }
      if (loginEmail) loginEmail.value = '';
      if (loginPass) loginPass.value = '';
      if (loginSubmit) { loginSubmit.disabled = false; loginSubmit.textContent = 'Đăng nhập'; }
    });
    loginPass && loginPass.addEventListener('keydown', e => {
      if (!loginNote) return;
      const caps = e.getModifierState && e.getModifierState('CapsLock');
      loginNote.textContent = caps ? 'Caps Lock đang bật' : '';
    });
  }

  if (registerForm && regEmail && regPass && regMsg) {
    registerForm.addEventListener('submit', async e => {
      e.preventDefault();
      if (registerSubmit) { registerSubmit.disabled = true; registerSubmit.textContent = 'Đang xử lý...'; }
      const email = (regEmail.value || '').trim();
      const pass = (regPass.value || '').trim();
      if (!isGmail(email)) {
        regMsg.textContent = 'Chỉ hỗ trợ Gmail';
        if (registerSubmit) { registerSubmit.disabled = false; registerSubmit.textContent = 'Đăng ký'; }
        return;
      }
      if (!pass) {
        regMsg.textContent = 'Vui lòng nhập mật khẩu';
        if (registerSubmit) { registerSubmit.disabled = false; registerSubmit.textContent = 'Đăng ký'; }
        return;
      }
      if (pass.length < 6) {
        regMsg.textContent = 'Mật khẩu tối thiểu 6 ký tự';
        if (registerSubmit) { registerSubmit.disabled = false; registerSubmit.textContent = 'Đăng ký'; }
        return;
      }
      const users = loadUsers();
      const exist = findUserByEmail(email);
      if (exist) {
        regMsg.textContent = 'Tài khoản đã tồn tại';
        if (registerSubmit) { registerSubmit.disabled = false; registerSubmit.textContent = 'Đăng ký'; }
        return;
      }
      const hp = await hashPassword(pass);
      users.unshift({ email: normalizeEmail(email), pass: hp, createdAt: Date.now() });
      saveUsers(users);
      regMsg.textContent = 'Đăng ký thành công';
      if (regEmail) regEmail.value = '';
      if (regPass) regPass.value = '';
      if (registerSubmit) { registerSubmit.disabled = false; registerSubmit.textContent = 'Đăng ký'; }
    });
  }

  if (loginGoogle) {
    loginGoogle.addEventListener('click', () => {
      alert('Đăng nhập Google cần cấu hình OAuth ở backend hoặc Firebase Auth.');
    });
  }
  if (loginFacebook) {
    loginFacebook.addEventListener('click', () => {
      alert('Đăng nhập Facebook cần cấu hình OAuth ở backend.');
    });
  }

  const CART_KEY = 'vip_cart';
  const ORDERS_KEY = 'vip_orders';
  const LAST_ORDER_KEY = 'vip_last_order';
  // Bảng phí vận chuyển cố định theo hãng
  const SHIPPING_FEES = {
    ghn: 400000,
    ghtk: 350000,
    viettel: 300000,
    vnpost: 250000,
    jt: 320000,
    ninjavan: 280000,
    shopee: 260000,
    goship: 240000,
    grab: 380000,
    be: 360000,
    ems: 450000,
    dhl: 900000,
    fedex: 850000
  };
  // Khoảng thời gian giao dự kiến (ngày) theo hãng
  const SHIPPING_ETAS = {
    ghn: [2, 4],
    ghtk: [2, 5],
    viettel: [3, 6],
    vnpost: [3, 7],
    jt: [2, 5],
    ninjavan: [2, 4],
    shopee: [2, 4],
    goship: [1, 3],
    grab: [1, 2],
    be: [1, 3],
    ems: [1, 2],
    dhl: [3, 6],
    fedex: [3, 6]
  };
  function enhanceShippingSelect(sel) {
    if (!sel) return;
    Array.from(sel.options).forEach(opt => {
      const v = opt.value;
      const base = opt.dataset.label || opt.textContent || v;
      opt.dataset.label = base;
      opt.textContent = base;
    });
  }
  function ensureShipFeeLabel(sel, id) {
    const par = sel?.closest('.pm-row') || null;
    if (!par) return null;
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      el.style.color = 'var(--muted)';
      el.style.marginTop = '6px';
      par.appendChild(el);
    }
    return el;
  }
  function renderShipFee(sel, id) {
    const el = ensureShipFeeLabel(sel, id);
    if (!el || !sel) return;
    const fee = SHIPPING_FEES[sel.value || ''] || 0;
    el.textContent = 'Phí: ' + formatVND(fee);
  }
  function ensureShipEtaLabel(sel, id) {
    const par = sel?.closest('.pm-row') || null;
    if (!par) return null;
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      el.style.color = 'var(--muted)';
      el.style.marginTop = '2px';
      par.appendChild(el);
    }
    return el;
  }
  function renderShipEta(sel, id) {
    const el = ensureShipEtaLabel(sel, id);
    if (!el || !sel) return;
    const range = SHIPPING_ETAS[sel.value || ''] || [3, 5];
    const now = Date.now();
    const ms = 24 * 60 * 60 * 1000;
    const d1 = new Date(now + range[0] * ms).toLocaleDateString('vi-VN');
    const d2 = new Date(now + range[1] * ms).toLocaleDateString('vi-VN');
    el.textContent = 'Dự kiến nhận: ' + range[0] + '–' + range[1] + ' ngày (' + d1 + ' – ' + d2 + ')';
  }
  function ensureShipInfoLabel(sel, id) {
    const par = sel?.closest('.pm-row') || null;
    if (!par) return null;
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      el.style.color = 'var(--muted)';
      el.style.marginTop = '6px';
      par.appendChild(el);
    }
    return el;
  }
  function renderShipInfo(sel, id) {
    const el = ensureShipInfoLabel(sel, id);
    if (!el || !sel) return;
    const fee = SHIPPING_FEES[sel.value || ''] || 0;
    const range = SHIPPING_ETAS[sel.value || ''] || [3, 5];
    const now = Date.now();
    const ms = 24 * 60 * 60 * 1000;
    const d1 = new Date(now + range[0] * ms).toLocaleDateString('vi-VN');
    const d2 = new Date(now + range[1] * ms).toLocaleDateString('vi-VN');
    el.textContent = 'Phí: ' + formatVND(fee) + ' • Dự kiến nhận: ' + range[0] + '–' + range[1] + ' ngày (' + d1 + ' – ' + d2 + ')';
  }

  // Chuyển chuỗi giá tiền (có ký tự) thành số nguyên
  function parsePrice(s) {
    const n = parseInt(String(s || '').replace(/[^\d]/g, ''), 10);
    return isNaN(n) ? 0 : n;
  }
  // Định dạng số sang chuỗi tiền Việt (₫x.xxx.xxx)
  function formatVND(n) {
    try { return '₫' + (n || 0).toLocaleString('vi-VN'); } catch (_) { return '₫' + (n || 0); }
  }
  // Trích xuất thông tin sản phẩm từ thẻ .product trong HTML
  function extractProduct(el) {
    const name = (el.querySelector('h3')?.textContent || '').trim();
    const priceText = (el.querySelector('.price')?.textContent || '').trim();
    const img = el.querySelector('img')?.src || '';
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
    const desc = (el.querySelector('p')?.textContent || '').trim();
    const colors = (el.getAttribute('data-colors') || '').split('|').map(s => s.trim()).filter(Boolean);
    const weights = (el.getAttribute('data-weights') || '').split('|').map(s => s.trim()).filter(Boolean);
    return { id, name, price: parsePrice(priceText), image: img, desc, colors, weights };
  }
  // Tải giỏ hàng theo không gian người dùng
  function loadCart() {
    try {
      const raw = localStorage.getItem(scopedKey('cart', CART_KEY));
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (_) { return []; }
  }
  // Lưu giỏ hàng
  function saveCart(list) {
    try { localStorage.setItem(scopedKey('cart', CART_KEY), JSON.stringify(list)); } catch (_) { }
  }
  // Thêm sản phẩm vào giỏ (gộp số lượng nếu trùng ID)
  function addCart(item, qty) {
    const q = Math.max(1, parseInt(qty || 1, 10));
    const cart = loadCart();
    const exist = cart.find(x => x.id === item.id);
    if (exist) exist.qty = Math.min(999, (exist.qty || 0) + q);
    else cart.unshift({ id: item.id, name: item.name, price: item.price, image: item.image, qty: q });
    saveCart(cart);
  }
  // Xóa sản phẩm khỏi giỏ theo ID
  function removeCart(id) {
    const cart = loadCart().filter(x => x.id !== id);
    saveCart(cart);
  }
  // Tổng số lượng mặt hàng trong giỏ
  function cartCount() {
    return loadCart().reduce((a, b) => a + (b.qty || 0), 0);
  }
  // Tổng tiền hàng (chưa gồm phí ship)
  function cartTotal() {
    return loadCart().reduce((a, b) => a + (b.price || 0) * (b.qty || 0), 0);
  }

  const cartCountEl = document.getElementById('cartCount');
  const cartTotalEl = document.getElementById('cartTotal');
  // Cập nhật huy hiệu giỏ: số lượng và tổng tiền
  function updateCartStats() {
    if (cartCountEl) cartCountEl.textContent = String(cartCount());
    if (cartTotalEl) cartTotalEl.textContent = formatVND(cartTotal());
  }
  updateCartStats();


  const productModal = document.getElementById('productModal');
  const pmImage = document.getElementById('pmImage');
  const pmTitle = document.getElementById('pmTitle');
  const pmPrice = document.getElementById('pmPrice');
  const pmDesc = document.getElementById('pmDesc');
  const pmImageInfo = document.getElementById('pmImageInfo');
  const pmQty = document.getElementById('pmQty');
  const pmShip = document.getElementById('pmShip');
  const pmColor = document.getElementById('pmColor');
  const pmWeight = document.getElementById('pmWeight');
  const pmName = document.getElementById('pmName');
  const pmPhone = document.getElementById('pmPhone');
  const pmAddress = document.getElementById('pmAddress');
  const pmTotalLabel = document.getElementById('pmTotalLabel');
  const pmAddCart = document.getElementById('pmAddCart');
  const pmBuyNow = document.getElementById('pmBuyNow');
  let currentProduct = null;

  // Hiển thị/ẩn modal chi tiết sản phẩm
  function toggleProductModal(show) {
    if (!productModal) return;
    if (show) productModal.removeAttribute('hidden'); else productModal.setAttribute('hidden', '');
  }
  // Tính tổng cho Thanh toán nhanh (giá * số lượng + phí ship)
  function computePmTotal() {
    if (!currentProduct) return 0;
    const qty = Math.max(1, parseInt(pmQty?.value || '1', 10));
    const ship = pmShip?.value || 'ghn';
    const fee = SHIPPING_FEES[ship] || 0;
    return currentProduct.price * qty + fee;
  }
  // Render tổng tiền ở Thanh toán nhanh
  function renderPmTotal() {
    const t = computePmTotal();
    if (pmTotalLabel) pmTotalLabel.textContent = 'Tổng: ' + formatVND(t);
  }
  // Mở modal chi tiết sản phẩm và thiết lập dữ liệu hiển thị
  function openProductModal(prod) {
    currentProduct = prod;
    if (pmImage) pmImage.src = prod.image || '';
    if (pmImageInfo) pmImageInfo.textContent = '';
    if (pmTitle) pmTitle.textContent = prod.name || '';
    if (pmPrice) pmPrice.textContent = 'Giá: ' + formatVND(prod.price || 0);
    if (pmDesc) pmDesc.textContent = prod.desc || '';
    if (pmColor) {
      const list = (prod.colors && prod.colors.length) ? prod.colors : ['Đen', 'Trắng', 'Vàng'];
      pmColor.innerHTML = list.map(c => '<option value="' + c + '">' + c + '</option>').join('');
    }
    if (pmWeight) {
      const list = (prod.weights && prod.weights.length) ? prod.weights : ['100g', '250g', '500g'];
      pmWeight.innerHTML = list.map(w => '<option value="' + w + '">' + w + '</option>').join('');
    }
    if (pmQty) pmQty.value = '1';
    if (pmShip) pmShip.value = 'ghn';
    enhanceShippingSelect(pmShip);
    if (pmName) pmName.value = '';
    if (pmPhone) pmPhone.value = '';
    if (pmAddress) pmAddress.value = '';
    renderPmTotal();
    const pmFee = document.getElementById('pmShipFee'); if (pmFee) pmFee.remove();
    const pmEta = document.getElementById('pmShipEta'); if (pmEta) pmEta.remove();
    renderShipFee(pmShip, 'pmShipFee');
    toggleProductModal(true);
  }
  // Đóng các modal theo data-target
  document.querySelectorAll('.shop-close').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.getAttribute('data-target') || '';
      if (t === 'productModal') toggleProductModal(false);
      if (t === 'checkoutModal') toggleCheckoutModal(false);
      if (t === 'trackingModal') toggleTrackingModal(false);
      if (t === 'historyModal') toggleHistoryModal(false);
    });
  });
  if (pmQty) pmQty.addEventListener('input', renderPmTotal);
  if (pmShip) pmShip.addEventListener('change', () => { renderPmTotal(); renderShipFee(pmShip, 'pmShipFee'); });
  // Thêm vào giỏ từ modal sản phẩm
  if (pmAddCart) {
    pmAddCart.addEventListener('click', () => {
      if (!currentProduct) return;
      addCart(currentProduct, pmQty?.value || 1);
      updateCartStats();
      toggleProductModal(false);
      alert('Đã thêm vào giỏ hàng');
    });
  }
  // Đặt hàng nhanh cho sản phẩm hiện tại
  if (pmBuyNow) {
    pmBuyNow.addEventListener('click', () => {
      if (!currentProduct) return;
      const name = (pmName?.value || '').trim();
      const phone = (pmPhone?.value || '').trim();
      const address = (pmAddress?.value || '').trim();
      if (!name || !phone || !address) { alert('Vui lòng điền đủ thông tin'); return; }
      const total = computePmTotal();
      const qty = Math.max(1, parseInt(pmQty?.value || '1', 10));
      const ship = pmShip?.value || 'ghn';
      const order = createOrder([{ id: currentProduct.id, name: currentProduct.name, price: currentProduct.price, image: currentProduct.image, qty }], ship, { name, phone, address });
      addOrder(order);
      setLastOrder(order.id);
      toggleProductModal(false);
      const d1 = new Date(order.expectedMin).toLocaleDateString('vi-VN');
      const d2 = new Date(order.expectedMax).toLocaleDateString('vi-VN');
      alert('Đặt hàng thành công. Tổng thanh toán: ' + formatVND(total) + '. Dự kiến nhận: ' + d1 + ' – ' + d2);
    });
  }

  const checkoutModal = document.getElementById('checkoutModal');
  const ckList = document.getElementById('ckList');
  const ckShip = document.getElementById('ckShip');
  const ckName = document.getElementById('ckName');
  const ckPhone = document.getElementById('ckPhone');
  const ckAddress = document.getElementById('ckAddress');
  const ckTotalLabel = document.getElementById('ckTotalLabel');
  const ckPlaceOrder = document.getElementById('ckPlaceOrder');
  const openCartBtn = document.getElementById('openCart');

  // Hiển thị/ẩn modal giỏ hàng & thanh toán
  function toggleCheckoutModal(show) {
    if (!checkoutModal) return;
    if (show) checkoutModal.removeAttribute('hidden'); else checkoutModal.setAttribute('hidden', '');
  }
  // Tính tổng thanh toán từ giỏ hàng (tổng hàng + phí ship)
  function computeCkTotal() {
    const items = loadCart();
    if (!items.length) return 0;
    const ship = ckShip?.value || 'ghn';
    const fee = SHIPPING_FEES[ship] || 0;
    return cartTotal() + fee;
  }
  // Render tổng tiền ở khung thanh toán giỏ
  function renderCkTotal() {
    if (ckTotalLabel) ckTotalLabel.textContent = 'Tổng: ' + formatVND(computeCkTotal());
  }
  // Render danh sách giỏ hàng, hỗ trợ xóa item
  function renderCartList() {
    if (!ckList) return;
    const items = loadCart();
    if (!items.length) {
      ckList.innerHTML = '<div style="color:var(--muted)">Giỏ hàng trống</div>';
      renderCkTotal();
      return;
    }
    ckList.innerHTML = items.map(it => (
      '<div class="ck-item" data-id="' + it.id + '">' +
      '<img src="' + (it.image || '') + '" alt="">' +
      '<div>' +
      '<div class="ck-name">' + it.name + '</div>' +
      '<div style="color:var(--muted)">Số lượng: ' + it.qty + '</div>' +
      '</div>' +
      '<div>' +
      '<div class="ck-price">' + formatVND(it.price * it.qty) + '</div>' +
      '<button type="button" class="ck-remove">Xóa</button>' +
      '</div>' +
      '</div>'
    )).join('');
    ckList.querySelectorAll('.ck-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const par = btn.closest('.ck-item');
        const id = par?.getAttribute('data-id') || '';
        if (id) removeCart(id);
        renderCartList();
        updateCartStats();
      });
    });
    renderCkTotal();
  }
  if (openCartBtn) {
    openCartBtn.addEventListener('click', () => {
      ckShip && (ckShip.value = 'ghn');
      enhanceShippingSelect(ckShip);
      ckName && (ckName.value = '');
      ckPhone && (ckPhone.value = '');
      ckAddress && (ckAddress.value = '');
      renderCartList();
      const oldFee = document.getElementById('ckShipFee'); if (oldFee) oldFee.remove();
      const oldEta = document.getElementById('ckShipEta'); if (oldEta) oldEta.remove();
      renderShipInfo(ckShip, 'ckShipInfo');
      toggleCheckoutModal(true);
    });
  }
  if (ckShip) ckShip.addEventListener('change', () => { renderCkTotal(); renderShipInfo(ckShip, 'ckShipInfo'); });
  if (ckPlaceOrder) {
    ckPlaceOrder.addEventListener('click', () => {
      const name = (ckName?.value || '').trim();
      const phone = (ckPhone?.value || '').trim();
      const address = (ckAddress?.value || '').trim();
      if (!name || !phone || !address) { alert('Vui lòng điền đủ thông tin'); return; }
      const total = computeCkTotal();
      const ship = ckShip?.value || 'ghn';
      const items = loadCart();
      if (!items.length) { alert('Giỏ hàng trống'); return; }
      const order = createOrder(items, ship, { name, phone, address });
      addOrder(order);
      setLastOrder(order.id);
      saveCart([]);
      updateCartStats();
      renderCartList();
      toggleCheckoutModal(false);
      const d1 = new Date(order.expectedMin).toLocaleDateString('vi-VN');
      const d2 = new Date(order.expectedMax).toLocaleDateString('vi-VN');
      alert('Đặt hàng thành công. Tổng thanh toán: ' + formatVND(total) + '. Dự kiến nhận: ' + d1 + ' – ' + d2);
    });
  }

  // Tải danh sách đơn hàng theo không gian người dùng
  function loadOrders() {
    try {
      const raw = localStorage.getItem(scopedKey('orders', ORDERS_KEY));
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (_) { return []; }
  }
  // Lưu danh sách đơn hàng
  function saveOrders(list) {
    try { localStorage.setItem(scopedKey('orders', ORDERS_KEY), JSON.stringify(list)); } catch (_) { }
  }
  // Sinh mã đơn ngẫu nhiên (ORD + timestamp + random)
  function genOrderId() {
    return 'ORD' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
  }
  // Các bước trạng thái đơn hàng hiển thị ở theo dõi
  function steps() {
    return ['Đã nhận đơn', 'Đã lấy hàng', 'Đang vận chuyển', 'Đã đến kho', 'Đang giao', 'Giao thành công'];
  }
  // Tạo đơn hàng: tính toán phí/ETA, lưu thời điểm và tiến trình
  function createOrder(items, carrier, customer) {
    const subtotal = items.reduce((a, b) => a + (b.price || 0) * (b.qty || 0), 0);
    const shipFee = SHIPPING_FEES[carrier] || 0;
    const total = subtotal + shipFee;
    const eta = SHIPPING_ETAS[carrier] || [3, 5];
    const now = Date.now();
    const ms = 24 * 60 * 60 * 1000;
    const expectedMin = now + eta[0] * ms;
    const expectedMax = now + eta[1] * ms;
    return { id: genOrderId(), items, carrier, customer, subtotal, shipFee, total, createdAt: Date.now(), progress: 0, expectedMin, expectedMax };
  }
  // Thêm đơn hàng mới vào danh sách
  function addOrder(order) {
    const list = loadOrders();
    list.unshift(order);
    saveOrders(list);
  }
  // Ghi ID đơn gần nhất để tiện theo dõi lại
  function setLastOrder(id) {
    try { localStorage.setItem(scopedKey('last_order', LAST_ORDER_KEY), id); } catch (_) { }
  }
  // Đọc ID đơn gần nhất
  function getLastOrder() {
    try { return localStorage.getItem(scopedKey('last_order', LAST_ORDER_KEY)) || ''; } catch (_) { return ''; }
  }

  const trackingModal = document.getElementById('trackingModal');
  const trkSelect = document.getElementById('trkSelect');
  const trkInfo = document.getElementById('trkInfo');
  const trkList = document.getElementById('trkList');
  const trkStatus = document.getElementById('trkStatus');
  const openTrackingBtn = document.getElementById('openTracking');
  const trkMap = document.getElementById('trkMap');

  // Hiển thị/ẩn modal theo dõi đơn
  function toggleTrackingModal(show) {
    if (!trackingModal) return;
    if (show) trackingModal.removeAttribute('hidden'); else trackingModal.setAttribute('hidden', '');
  }
  // Render danh sách đơn hàng vào dropdown theo dõi
  function renderTrackingOptions() {
    if (!trkSelect) return;
    const list = loadOrders();
    trkSelect.innerHTML = list.map(o => '<option value="' + o.id + '">' + o.id + ' • ' + new Date(o.createdAt).toLocaleString('vi-VN') + '</option>').join('');
    const last = getLastOrder();
    if (last) trkSelect.value = last;
  }
  // Lấy đơn theo ID
  function getOrderById(id) {
    return loadOrders().find(o => o.id === id) || null;
  }
  // Render thông tin theo dõi: meta, các bước và bản đồ
  function renderTracking() {
    if (!trkSelect || !trkInfo || !trkList) return;
    const id = trkSelect.value || '';
    const o = getOrderById(id);
    if (!o) { trkInfo.textContent = 'Chưa có đơn hàng'; trkList.innerHTML = ''; return; }
    const d1 = new Date(o.expectedMin || o.createdAt).toLocaleDateString('vi-VN');
    const d2 = new Date(o.expectedMax || o.createdAt).toLocaleDateString('vi-VN');
    trkInfo.textContent = 'Đơn ' + o.id + ' • ' + o.carrier + ' • ' + new Date(o.createdAt).toLocaleString('vi-VN') + ' • Dự kiến nhận: ' + d1 + ' – ' + d2;
    const s = steps();
    trkList.innerHTML = s.map((label, i) => '<div class="trk-step ' + (i <= o.progress ? 'done' : '') + '"><div class="trk-dot"></div><div class="trk-label">' + label + '</div></div>').join('');
    if (trkStatus) {
      trkStatus.innerHTML = s.map((label, i) => '<option value="' + i + '">' + label + '</option>').join('');
      trkStatus.value = String(o.progress || 0);
    }
    renderTrackingMap(o);
  }
  // Nút mở modal theo dõi: render dữ liệu rồi mở modal
  if (openTrackingBtn) {
    openTrackingBtn.addEventListener('click', () => {
      renderTrackingOptions();
      renderTracking();
      toggleTrackingModal(true);
    });
  }
  // Đổi đơn đang xem: lưu ID và render lại
  if (trkSelect) {
    trkSelect.addEventListener('change', () => {
      setLastOrder(trkSelect.value || '');
      renderTracking();
    });
  }
  // Đổi trạng thái tiến trình của đơn hàng
  if (trkStatus) {
    trkStatus.addEventListener('change', () => {
      const id = trkSelect?.value || '';
      if (!id) return;
      const list = loadOrders();
      const o = list.find(x => x.id === id);
      if (!o) return;
      const max = steps().length - 1;
      const v = Math.max(0, Math.min(max, parseInt(trkStatus.value || '0', 10)));
      o.progress = v;
      saveOrders(list);
      renderTracking();
    });
  }

  // Phân loại sản phẩm để chọn tuyến bản đồ minh họa
  function getCategory(name) {
    const n = (name || '').toLowerCase();
    if (n.includes('túi') || n.includes('vali')) return 'bag';
    if (n.includes('đồng hồ')) return 'watch';
    if (n.includes('giày')) return 'shoes';
    if (n.includes('nước hoa')) return 'perfume';
    if (n.includes('nhẫn')) return 'ring';
    if (n.includes('ví')) return 'wallet';
    return 'general';
  }
  // Điểm tuyến đường minh họa theo loại sản phẩm
  function routePoints(cat) {
    if (cat === 'bag') return [[10, 160], [60, 120], [120, 80], [180, 50], [260, 30]];
    if (cat === 'watch') return [[10, 150], [80, 150], [140, 120], [200, 90], [260, 70]];
    if (cat === 'shoes') return [[10, 140], [70, 130], [130, 120], [190, 110], [250, 100]];
    if (cat === 'perfume') return [[10, 160], [60, 140], [120, 130], [180, 120], [240, 110]];
    if (cat === 'ring') return [[20, 150], [60, 120], [100, 90], [140, 70], [180, 90], [220, 120], [260, 150]];
    return [[10, 160], [80, 120], [150, 90], [220, 60], [280, 40]];
  }
  // Bản đồ SVG minh họa đường vận chuyển theo tiến trình đơn hàng
  function renderTrackingMap(order) {
    if (!trkMap) return;
    const w = trkMap.clientWidth || 300;
    const h = trkMap.clientHeight || 180;
    const first = order.items[0];
    const cat = getCategory(first?.name || '');
    const pts = routePoints(cat);
    const max = steps().length - 1;
    const r = Math.min(1, Math.max(0, (order.progress || 0) / max));
    const idx = Math.round(r * (pts.length - 1));
    const cur = pts[idx];
    const bg = '<rect x="0" y="0" width="' + w + '" height="' + h + '" fill="rgba(20,20,20,0.9)"/>';
    const water = '<rect x="' + (w * 0.55) + '" y="' + (h * 0.05) + '" width="' + (w * 0.4) + '" height="' + (h * 0.4) + '" fill="rgba(0,90,140,0.35)" stroke="rgba(255,255,255,0.08)"/>';
    const park = '<rect x="' + (w * 0.1) + '" y="' + (h * 0.6) + '" width="' + (w * 0.3) + '" height="' + (h * 0.25) + '" fill="rgba(0,120,0,0.15)" stroke="rgba(255,255,255,0.08)"/>';
    const roads = [
      '<polyline points="0,' + (h * 0.8) + ' ' + w + ',' + (h * 0.6) + '" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>',
      '<polyline points="' + (w * 0.2) + ',0 ' + (w * 0.4) + ',' + (h * 1) + '" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="2"/>',
      '<polyline points="' + (w * 0.6) + ',' + (h * 0.2) + ' ' + (w * 0.9) + ',' + (h * 0.9) + '" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="2"/>'
    ].join('');
    const path = '<polyline points="' + pts.map(p => p[0] + ',' + p[1]).join(' ') + '" fill="none" stroke="url(#grad)" stroke-width="3" />';
    const start = '<circle cx="' + pts[0][0] + '" cy="' + pts[0][1] + '" r="5" fill="#5bc0de" stroke="rgba(255,255,255,0.4)" />';
    const end = '<circle cx="' + pts[pts.length - 1][0] + '" cy="' + pts[pts.length - 1][1] + '" r="5" fill="#5cb85c" stroke="rgba(255,255,255,0.4)" />';
    const current = '<circle cx="' + cur[0] + '" cy="' + cur[1] + '" r="6" fill="url(#grad)" stroke="rgba(255,255,255,0.6)" />';
    trkMap.innerHTML =
      '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#ffd700"/><stop offset="100%" stop-color="#c4a100"/></linearGradient></defs>' +
      bg + water + park + roads +
      path +
      start +
      end +
      current +
      '</svg>';
  }

  const historyModal = document.getElementById('historyModal');
  const openHistoryBtn = document.getElementById('openHistory');
  const hisList = document.getElementById('hisList');
  // Hiển thị/ẩn modal lịch sử mua hàng
  function toggleHistoryModal(show) {
    if (!historyModal) return;
    if (show) historyModal.removeAttribute('hidden'); else historyModal.setAttribute('hidden', '');
  }
  // Render danh sách lịch sử đơn đã đặt và nút xem theo dõi
  function renderHistory() {
    if (!hisList) return;
    const list = loadOrders();
    if (!list.length) { hisList.innerHTML = '<div style="color:var(--muted)">Chưa có đơn hàng</div>'; return; }
    hisList.innerHTML = list.map(o => {
      const items = o.items.map(it => it.name + ' x' + it.qty).join(', ');
      return '<div class="his-item" data-id="' + o.id + '">' +
        '<div class="his-meta">Đơn ' + o.id + ' • ' + new Date(o.createdAt).toLocaleString('vi-VN') + ' • ' + o.carrier + '</div>' +
        '<div style="color:var(--muted)">' + items + '</div>' +
        '<div class="his-total">Tổng: ' + formatVND(o.total) + ' (Hàng: ' + formatVND(o.subtotal) + ' • Phí: ' + formatVND(o.shipFee) + ')</div>' +
        '<div class="pm-actions"><button type="button" class="btn his-track">Theo dõi</button></div>' +
        '</div>';
    }).join('');
    hisList.querySelectorAll('.his-track').forEach(btn => {
      btn.addEventListener('click', () => {
        const par = btn.closest('.his-item');
        const id = par?.getAttribute('data-id') || '';
        if (id) {
          setLastOrder(id);
          renderTrackingOptions();
          renderTracking();
          toggleHistoryModal(false);
          toggleTrackingModal(true);
        }
      });
    });
  }
  if (openHistoryBtn) {
    openHistoryBtn.addEventListener('click', () => {
      renderHistory();
      toggleHistoryModal(true);
    });
  }

  document.querySelectorAll('#products .actions [data-action="quickview"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const card = a.closest('.product');
      if (!card) return;
      const prod = extractProduct(card);
      openProductModal(prod);
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (productModal && !productModal.hasAttribute('hidden')) toggleProductModal(false);
      if (checkoutModal && !checkoutModal.hasAttribute('hidden')) toggleCheckoutModal(false);
    }
  });
})();

/**
 * Career Pilot Documentation Portal Logic
 * Theme sync, instant search, copy code, active TOC scroll spy, sidebar collapsing
 */

if (typeof window !== 'undefined') {
(() => {
  const root = document.documentElement;
  const config = window.CAREER_PILOT_CONFIG || {};
  const themeButton = document.getElementById('themeButton');
  const themePopover = document.getElementById('themePopover');
  const mobileToggle = document.getElementById('mobileSidebarToggle');
  const sidebar = document.getElementById('docSidebar');
  const toast = document.getElementById('docToast');
  const searchBar = document.getElementById('docSearchBar');
  const searchModal = document.getElementById('searchModal');
  const modalInput = document.getElementById('modalSearchInput');
  const modalClose = document.getElementById('searchCloseBtn');
  const modalResults = document.getElementById('searchResultsList');
  const sidebarSearchInput = document.getElementById('sidebarSearchInput');
  const tocLinks = [...document.querySelectorAll('.toc-list a')];
  const navLinks = [...document.querySelectorAll('.nav-category-list a')];

  // Toast utility
  const showToast = (message, ms = 2500) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), ms);
  };

  // Theme synchronization
  const setTheme = (theme) => {
    root.dataset.theme = theme;
    localStorage.setItem('careerPilotTheme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'midnight' ? '#0E1428' : theme === 'pulse' ? '#F1F3F9' : '#F7F8FC');
  };

  const currentTheme = localStorage.getItem('careerPilotTheme') || config.defaultTheme || 'cloud';
  setTheme(currentTheme);

  themeButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    themePopover?.classList.toggle('open');
  });

  themePopover?.querySelectorAll('[data-theme-choice]').forEach(btn => {
    btn.addEventListener('click', () => {
      setTheme(btn.dataset.themeChoice);
      themePopover.classList.remove('open');
      showToast(`Theme changed to ${btn.dataset.themeChoice}`);
    });
  });

  document.addEventListener('click', (e) => {
    if (!themePopover?.contains(e.target) && e.target !== themeButton) {
      themePopover?.classList.remove('open');
    }
  });

  // Mobile sidebar drawer
  mobileToggle?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
  });

  // Category collapsing
  document.querySelectorAll('.nav-category-title').forEach(title => {
    title.addEventListener('click', () => {
      const parent = title.closest('.nav-category');
      parent?.classList.toggle('collapsed');
    });
  });

  // Code block copy buttons
  document.querySelectorAll('.code-block-wrapper').forEach(wrapper => {
    const pre = wrapper.querySelector('pre');
    const copyBtn = wrapper.querySelector('.btn-copy');
    if (copyBtn && pre) {
      copyBtn.addEventListener('click', async () => {
        const text = pre.innerText;
        try {
          await navigator.clipboard.writeText(text);
          const original = copyBtn.innerHTML;
          copyBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="m5 12 4 4 10-10"/></svg> Copied!`;
          copyBtn.style.color = 'var(--teal-light)';
          showToast('Code copied to clipboard');
          setTimeout(() => {
            copyBtn.innerHTML = original;
            copyBtn.style.color = '';
          }, 2000);
        } catch (err) {
          showToast('Unable to copy code to clipboard');
        }
      });
    }
  });

  // Dynamic Scroll Spy for Right TOC & Sidebar
  const headings = [...document.querySelectorAll('.doc-section h2[id], .doc-section h3[id]')];
  if (headings.length > 0) {
    const headingObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          tocLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
          navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else if (link.getAttribute('href')?.startsWith('#')) {
              link.classList.remove('active');
            }
          });
        }
      });
    }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 });

    headings.forEach(h => headingObserver.observe(h));
  }

  // Index documentation sections for instant search
  const searchableSections = [];
  document.querySelectorAll('.doc-section').forEach(sec => {
    const id = sec.id || sec.querySelector('h2, h3, h1')?.id;
    const title = sec.querySelector('h1, h2, h3')?.innerText || 'Documentation';
    const text = sec.innerText.replace(/\s+/g, ' ');
    if (id) {
      searchableSections.push({ id, title, text });
    }
  });

  // Modal Search
  const openSearch = () => {
    searchModal?.classList.add('open');
    modalInput?.focus();
    if (modalInput) modalInput.value = '';
    renderSearchResults('');
  };

  const closeSearch = () => {
    searchModal?.classList.remove('open');
  };

  searchBar?.addEventListener('click', openSearch);
  modalClose?.addEventListener('click', closeSearch);
  searchModal?.addEventListener('click', (e) => {
    if (e.target === searchModal) closeSearch();
  });

  // Keyboard shortcut Ctrl+K or Cmd+K or /
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      searchModal?.classList.contains('open') ? closeSearch() : openSearch();
    }
    if (e.key === 'Escape' && searchModal?.classList.contains('open')) {
      closeSearch();
    }
  });

  const renderSearchResults = (query) => {
    if (!modalResults) return;
    const q = query.trim().toLowerCase();
    if (!q) {
      modalResults.innerHTML = `
        <div class="search-empty">
          <p>Type keywords to search documentation topics, API endpoints, architecture, or requirements...</p>
        </div>
      `;
      return;
    }

    const filtered = searchableSections.filter(item => 
      item.title.toLowerCase().includes(q) || item.text.toLowerCase().includes(q)
    ).slice(0, 10);

    if (filtered.length === 0) {
      modalResults.innerHTML = `
        <div class="search-empty">
          <p>No documentation matches found for "<strong>${query}</strong>".</p>
        </div>
      `;
      return;
    }

    modalResults.innerHTML = filtered.map(item => {
      const idx = item.text.toLowerCase().indexOf(q);
      const start = Math.max(0, idx - 40);
      const end = Math.min(item.text.length, idx + 100);
      const snippet = idx !== -1 ? item.text.substring(start, end) : item.text.substring(0, 120);

      return `
        <a class="search-result-item" href="#${item.id}">
          <span class="res-title">${item.title}</span>
          <span class="res-snippet">...${snippet}...</span>
        </a>
      `;
    }).join('');

    modalResults.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        closeSearch();
        sidebar?.classList.remove('open');
      });
    });
  };

  modalInput?.addEventListener('input', (e) => {
    renderSearchResults(e.target.value);
  });

  // Sidebar live filter input
  sidebarSearchInput?.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase().trim();
    document.querySelectorAll('.nav-category-list li').forEach(li => {
      const text = li.innerText.toLowerCase();
      const match = !val || text.includes(val);
      li.style.display = match ? 'block' : 'none';
    });

    document.querySelectorAll('.nav-category').forEach(cat => {
      const visibleItems = cat.querySelectorAll('.nav-category-list li:not([style*="display: none"])');
      cat.style.display = visibleItems.length > 0 ? 'block' : 'none';
      if (val && visibleItems.length > 0) {
        cat.classList.remove('collapsed');
      }
    });
  });

  // Close mobile sidebar on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      sidebar?.classList.remove('open');
    });
  });

  // QR Code Modal Handlers
  const qrModal = document.getElementById('qrModal');
  const qrImage = document.getElementById('qrImage');
  const qrTitle = document.getElementById('qrModalTitle');
  const qrDesc = document.getElementById('qrModalDesc');
  const qrActionBtn = document.getElementById('qrActionBtn');
  const qrActionText = document.getElementById('qrActionText');
  const qrCopyBtn = document.getElementById('qrCopyBtn');

  let currentQrType = 'apk';

  const openQrModal = (type = 'apk') => {
    if (!qrModal) return;
    setQrType(type);
    qrModal.classList.add('open');
    qrModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeQrModal = () => {
    if (!qrModal) return;
    qrModal.classList.remove('open');
    qrModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const setQrType = (type) => {
    currentQrType = type;
    document.querySelectorAll('#qrTypeSelector [data-qr-type]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.qrType === type);
    });

    if (type === 'apk') {
      const driveUrl = config.apkUrl || 'https://drive.google.com/file/d/1s3bEHNOvOh9IGUMnAgCO8QuruOPtWEDV/view?usp=sharing';
      if (qrImage) qrImage.src = 'assets/qr-apk-download.svg';
      if (qrTitle) qrTitle.textContent = 'Download APK via Google Drive';
      if (qrDesc) qrDesc.textContent = 'Scan with your phone camera or click below to download the signed Android release from Google Drive.';
      if (qrActionBtn) {
        qrActionBtn.href = driveUrl;
        qrActionBtn.setAttribute('target', '_blank');
        qrActionBtn.setAttribute('rel', 'noopener noreferrer');
        qrActionBtn.removeAttribute('download');
      }
      if (qrActionText) qrActionText.textContent = 'Open Google Drive Download';
    } else {
      if (qrImage) qrImage.src = 'assets/qr-live-demo.svg';
      if (qrTitle) qrTitle.textContent = 'Open Mobile Emulator';
      if (qrDesc) qrDesc.textContent = 'Scan with your phone camera to test the real-time mobile interface in your mobile browser.';
      if (qrActionBtn) {
        qrActionBtn.href = 'emulator.html';
        qrActionBtn.removeAttribute('download');
      }
      if (qrActionText) qrActionText.textContent = 'Open Emulator Page';
    }
  };

  document.querySelectorAll('[data-open-qr]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openQrModal(btn.dataset.openQr || 'apk');
    });
  });

  document.querySelectorAll('[data-close-qr]').forEach(btn => {
    btn.addEventListener('click', closeQrModal);
  });

  document.querySelectorAll('#qrTypeSelector [data-qr-type]').forEach(btn => {
    btn.addEventListener('click', () => setQrType(btn.dataset.qrType));
  });

  qrCopyBtn?.addEventListener('click', () => {
    const origin = (window.location.origin && !window.location.origin.includes('localhost'))
      ? window.location.origin
      : (config.productionUrl || 'https://career-pilot-indol.vercel.app');
    const url = currentQrType === 'apk' 
      ? (config.apkUrl || 'https://drive.google.com/file/d/1s3bEHNOvOh9IGUMnAgCO8QuruOPtWEDV/view?usp=sharing')
      : (origin + '/emulator.html');
    navigator.clipboard?.writeText(url).then(() => {
      showToast('Link copied to clipboard: ' + url);
    }).catch(() => {
      showToast('Link: ' + url);
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && qrModal?.classList.contains('open')) closeQrModal();
  });
})();
}

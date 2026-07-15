// ESL Makina — shared site behaviour
document.addEventListener('DOMContentLoaded', function () {

  /* Mobile nav toggle */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  /* Before / after compare sliders — callable again for dynamically-injected widgets */
  function initCompareSliders(root) {
    (root || document).querySelectorAll('.compare').forEach(function (el) {
      if (el.dataset.compareInit) return;
      el.dataset.compareInit = '1';

      var handle = el.querySelector('.compare-handle');
      var afterWrap = el.querySelector('.after-wrap');
      var range = el.querySelector('.compare-range');

      function setPosition(pct) {
        pct = Math.min(100, Math.max(0, pct));
        afterWrap.style.width = pct + '%';
        handle.style.left = pct + '%';
        var img = afterWrap.querySelector('img');
        if (img) img.style.width = el.clientWidth + 'px';
      }

      function updateFromClientX(clientX) {
        var rect = el.getBoundingClientRect();
        var pct = ((clientX - rect.left) / rect.width) * 100;
        setPosition(pct);
        if (range) range.value = pct;
      }

      if (range) {
        range.addEventListener('input', function () { setPosition(parseFloat(range.value)); });
      }

      var dragging = false;
      el.addEventListener('pointerdown', function (e) { dragging = true; updateFromClientX(e.clientX); });
      window.addEventListener('pointermove', function (e) { if (dragging) updateFromClientX(e.clientX); });
      window.addEventListener('pointerup', function () { dragging = false; });

      window.addEventListener('resize', function () {
        var img = afterWrap.querySelector('img');
        if (img) img.style.width = el.clientWidth + 'px';
      });

      setPosition(50);
    });
  }
  initCompareSliders(document);
  window.ESL_initCompareSliders = initCompareSliders;

  /* FAQ accordion */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (other) {
        if (other !== item) { other.classList.remove('open'); other.querySelector('.faq-a').style.maxHeight = null; }
      });
      if (isOpen) {
        item.classList.remove('open');
        a.style.maxHeight = null;
      } else {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* Quote form: validate, save to database via our API, and also email a copy via FormSubmit */
  var form = document.getElementById('quote-form');
  if (form) {
    var success = document.getElementById('form-success');
    var errorBox = document.getElementById('form-error');
    var submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var required = form.querySelectorAll('[required]');
      var valid = true;
      required.forEach(function (field) {
        if (!field.value.trim()) valid = false;
      });

      if (!valid) {
        errorBox.textContent = 'Lütfen zorunlu (*) alanları eksiksiz doldurun.';
        errorBox.classList.add('show');
        success.classList.remove('show');
        return;
      }

      errorBox.classList.remove('show');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Gönderiliyor…'; }

      var payload = {
        adSoyad: (document.getElementById('ad-soyad') || {}).value || '',
        firma: (document.getElementById('firma') || {}).value || '',
        telefon: (document.getElementById('telefon') || {}).value || '',
        eposta: (document.getElementById('eposta') || {}).value || '',
        sehir: (document.getElementById('sehir') || {}).value || '',
        hizmet: (document.getElementById('hizmet') || {}).value || '',
        tezgah: (document.getElementById('tezgah') || {}).value || '',
        mesaj: (document.getElementById('mesaj') || {}).value || '',
      };

      fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
        .then(function (result) {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Teklif Talebi Gönder'; }
          if (!result.ok) {
            errorBox.textContent = (result.data && result.data.error) || 'Talebiniz gönderilemedi. Lütfen tekrar deneyin.';
            errorBox.classList.add('show');
            return;
          }
          success.classList.add('show');
          form.reset();
          form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        })
        .catch(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Teklif Talebi Gönder'; }
          errorBox.textContent = 'Sunucuya ulaşılamadı. Lütfen tekrar deneyin veya WhatsApp üzerinden yazın.';
          errorBox.classList.add('show');
        });

      // Ayrıca e-posta bildirimi için FormSubmit'e arka planda (best-effort) bir kopya gönder.
      try {
        var emailPayload = new FormData();
        emailPayload.append('Ad Soyad', payload.adSoyad);
        emailPayload.append('Firma', payload.firma);
        emailPayload.append('Telefon', payload.telefon);
        emailPayload.append('E-posta', payload.eposta);
        emailPayload.append('Şehir', payload.sehir);
        emailPayload.append('Hizmet', payload.hizmet);
        emailPayload.append('Tezgah Marka Model', payload.tezgah);
        emailPayload.append('Mesaj', payload.mesaj);
        emailPayload.append('_subject', 'Yeni Teklif Talebi - ESL Makina Web Sitesi');
        fetch('https://formsubmit.co/ajax/esahin@mail.ru', { method: 'POST', body: emailPayload }).catch(function () {});
      } catch (e) { /* sessiz geç, e-posta bildirimi ikincil */ }
    });
  }

  /* ---------------- Dinamik içerik (CMS) ---------------- */

  function digitsOnly(str) { return (str || '').replace(/\D/g, ''); }

  function applyContact(contact) {
    if (!contact) return;
    var phone1 = contact.phone1 || '';
    var phone2 = contact.phone2 || '';

    document.querySelectorAll('.js-phone-combo').forEach(function (el) {
      el.textContent = phone1 + (phone2 ? ' • ' + phone2 : '');
    });
    document.querySelectorAll('.js-phone1-text').forEach(function (el) { el.textContent = phone1; });
    document.querySelectorAll('.js-phone2-text').forEach(function (el) { el.textContent = phone2; });
    document.querySelectorAll('.js-email-text').forEach(function (el) { el.textContent = contact.email || ''; });
    document.querySelectorAll('.js-address-text').forEach(function (el) { el.textContent = contact.address || ''; });
    document.querySelectorAll('.js-hours-text').forEach(function (el) { el.textContent = contact.hours || ''; });

    document.querySelectorAll('.js-phone1-link').forEach(function (el) {
      el.textContent = phone1;
      el.href = 'tel:+90' + digitsOnly(phone1).replace(/^0/, '');
    });
    document.querySelectorAll('.js-phone2-link').forEach(function (el) {
      el.textContent = phone2;
      el.href = 'tel:+90' + digitsOnly(phone2).replace(/^0/, '');
    });
    document.querySelectorAll('.js-email-link').forEach(function (el) {
      el.textContent = contact.email || '';
      el.href = 'mailto:' + (contact.email || '');
    });
    document.querySelectorAll('[data-wa-link="true"]').forEach(function (el) {
      el.href = 'https://wa.me/90' + digitsOnly(phone1).replace(/^0/, '');
    });
  }

  function parseInlineBold(text) {
    // "**vurgulu**" -> <em>vurgulu</em> (CSS'te turuncu renkli gösterilir)
    var span = document.createElement('span');
    var parts = String(text || '').split('**');
    parts.forEach(function (part, i) {
      if (i % 2 === 1) {
        var em = document.createElement('em');
        em.textContent = part;
        span.appendChild(em);
      } else {
        span.appendChild(document.createTextNode(part));
      }
    });
    return span;
  }

  function applyHero(hero) {
    if (!hero) return;
    var eyebrowEl = document.getElementById('hero-eyebrow');
    var titleEl = document.getElementById('hero-title');
    var subtitleEl = document.getElementById('hero-subtitle');
    if (eyebrowEl && hero.eyebrow) eyebrowEl.textContent = hero.eyebrow;
    if (titleEl && hero.title) {
      titleEl.innerHTML = '';
      titleEl.appendChild(parseInlineBold(hero.title));
    }
    if (subtitleEl && hero.subtitle) subtitleEl.textContent = hero.subtitle;
  }

  var SERVICE_ICON = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/></svg>';

  function renderServices(services) {
    var grid = document.getElementById('services-grid');
    if (!grid || !services || services.length === 0) return;
    grid.innerHTML = services.map(function (s, i) {
      var tag = String(i + 1).padStart(2, '0');
      return '' +
        '<div class="spec-card">' +
          '<span class="tag">' + tag + '</span>' +
          '<div class="icon" aria-hidden="true">' + SERVICE_ICON + '</div>' +
          '<h3>' + escapeHtml(s.title) + '</h3>' +
          '<p>' + escapeHtml(s.description) + '</p>' +
        '</div>';
    }).join('');
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function infoBlockHtml(p) {
    var hasTitle = p.title && p.title.trim();
    var hasDesc = p.description && p.description.trim();
    if (!hasTitle && !hasDesc) return '';
    return '<div class="info">' +
      (hasTitle ? '<h3>' + escapeHtml(p.title) + '</h3>' : '') +
      (hasDesc ? '<p>' + escapeHtml(p.description) + '</p>' : '') +
      '</div>';
  }

  function projectCardHtml(p) {
    var hasBoth = p.before_image_url && p.after_image_url;
    var singleUrl = p.after_image_url || p.before_image_url;
    var altText = (p.title && p.title.trim()) ? p.title : 'ESL Makina proje fotoğrafı';

    if (hasBoth) {
      return '' +
        '<div class="project-card">' +
          '<div class="compare" style="--compare-w:480px;">' +
            '<span class="compare-label before">Önce</span>' +
            '<span class="compare-label after">Sonra</span>' +
            '<img src="' + p.before_image_url + '" alt="' + escapeHtml(altText) + ' — önce">' +
            '<div class="after-wrap"><img src="' + p.after_image_url + '" alt="' + escapeHtml(altText) + ' — sonra"></div>' +
            '<div class="compare-handle"></div>' +
            '<input type="range" class="compare-range" min="0" max="100" value="50" aria-label="Önce sonra karşılaştırma kaydırıcısı">' +
          '</div>' +
          infoBlockHtml(p) +
        '</div>';
    }

    if (singleUrl) {
      return '' +
        '<div class="project-card">' +
          '<div class="single-photo"><img src="' + singleUrl + '" alt="' + escapeHtml(altText) + '" loading="lazy"></div>' +
          infoBlockHtml(p) +
        '</div>';
    }

    return '';
  }

  function renderProjectsGrid(projects) {
    var grid = document.getElementById('projects-grid');
    if (!grid || !projects || projects.length === 0) return;
    var html = projects.map(projectCardHtml).join('');
    if (!html.trim()) return;
    grid.innerHTML = html;
    initCompareSliders(grid);
  }

  function renderFeaturedProject(projects) {
    var wrap = document.getElementById('featured-project-wrap');
    if (!wrap || !projects || projects.length === 0) return;
    // Anasayfadaki kaydırıcı için hem önce hem sonra fotoğrafı olan ilk projeyi seç.
    var p = projects.find(function (x) { return x.before_image_url && x.after_image_url; });
    if (!p) return;
    wrap.innerHTML = '' +
      '<div class="compare" style="--compare-w:480px;">' +
        '<span class="compare-label before">Önce</span>' +
        '<span class="compare-label after">Sonra</span>' +
        '<img src="' + p.before_image_url + '" alt="' + escapeHtml(p.title) + ' — önce">' +
        '<div class="after-wrap"><img src="' + p.after_image_url + '" alt="' + escapeHtml(p.title) + ' — sonra"></div>' +
        '<div class="compare-handle"></div>' +
        '<input type="range" class="compare-range" min="0" max="100" value="50" aria-label="Önce sonra karşılaştırma kaydırıcısı">' +
      '</div>';
    initCompareSliders(wrap);
  }

  // İletişim bilgileri + anasayfa metinleri her sayfada yükleniyor.
  fetch('/api/content-get')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      applyContact(data.contact);
      applyHero(data.hero);
    })
    .catch(function () { /* varsayılan statik metinler kalır */ });

  // Hizmetler grid'i sadece o elemanın olduğu sayfalarda (anasayfa, hizmetlerimiz) çekilir.
  if (document.getElementById('services-grid')) {
    fetch('/api/services-list')
      .then(function (r) { return r.json(); })
      .then(function (data) { renderServices(data.services); })
      .catch(function () { /* statik varsayılan kartlar kalır */ });
  }

  // Projeler sadece ilgili elemanların olduğu sayfalarda (anasayfa, projelerimiz) çekilir.
  if (document.getElementById('projects-grid') || document.getElementById('featured-project-wrap')) {
    fetch('/api/projects-list')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        renderProjectsGrid(data.projects);
        renderFeaturedProject(data.projects);
      })
      .catch(function () { /* statik varsayılan önce/sonra görseli kalır */ });
  }

});

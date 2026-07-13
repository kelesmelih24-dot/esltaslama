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

  /* Before / after compare sliders */
  document.querySelectorAll('.compare').forEach(function (el) {
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
});

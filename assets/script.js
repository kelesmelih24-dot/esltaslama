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

  /* Quote form: basic validation + friendly success state (static-site demo) */
  var form = document.getElementById('quote-form');
  if (form) {
    var success = document.getElementById('form-success');
    var errorBox = document.getElementById('form-error');
    form.addEventListener('submit', function (e) {
      var required = form.querySelectorAll('[required]');
      var valid = true;
      required.forEach(function (field) {
        if (!field.value.trim()) valid = false;
      });
      if (!valid) {
        e.preventDefault();
        if (errorBox) { errorBox.classList.add('show'); }
        if (success) success.classList.remove('show');
        return;
      }
      if (errorBox) errorBox.classList.remove('show');
      // Form submits to FormSubmit endpoint; show a local confirmation too.
    });
  }
});

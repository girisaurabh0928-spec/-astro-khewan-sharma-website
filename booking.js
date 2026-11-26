/* =========================================================
   ASTRO KHEWAN SHARMA JYOTISH KENDRA — js/booking.js
   Frontend booking form → validated, prefilled WhatsApp message.
   No backend. This is a REQUEST, not a confirmed appointment.
   ========================================================= */
(function () {
  'use strict';

  const WHATSAPP_NUMBER = '918375890764'; // country code 91 + 8375890764

  const SERVICES = ['kundli', 'career', 'marriage', 'muhurat', 'gemstone', 'vastu', 'remedies'];
  const FIELDS = ['name', 'phone', 'service', 'date', 'time', 'message'];

  const $ = function (id) { return document.getElementById(id); };
  const t = function (k) { return window.I18N ? window.I18N.t(k) : k; };

  let form, statusEl, submitBtn;
  const inputs = {};
  const errorKeys = {};
  let lockTimer = 0;

  /* ---------- date helpers (local time) ---------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function todayISO() {
    const d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function formatDate(iso) {
    const p = iso.split('-');
    return p[2] + '-' + p[1] + '-' + p[0];
  }
  function formatTime(hhmm) {
    const p = hhmm.split(':');
    let h = parseInt(p[0], 10);
    const ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + p[1] + ' ' + ap;
  }

  /* ---------- errors ---------- */
  function showError(name, key) {
    errorKeys[name] = key || '';
    const el = $('err-' + name);
    if (el) el.textContent = key ? t(key) : '';
    const input = inputs[name];
    if (input) {
      const wrap = input.closest('.field');
      if (wrap) wrap.classList.toggle('has-error', !!key);
      if (key) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    }
  }

  function rerenderErrors() {
    FIELDS.forEach(function (n) {
      const el = $('err-' + n);
      if (el) el.textContent = errorKeys[n] ? t(errorKeys[n]) : '';
    });
    if (statusEl && statusEl.dataset.key) statusEl.textContent = t(statusEl.dataset.key);
  }

  function setStatus(key, kind) {
    if (!statusEl) return;
    statusEl.textContent = key ? t(key) : '';
    statusEl.dataset.key = key || '';
    statusEl.className = 'form-status' + (kind ? ' is-' + kind : '');
  }

  /* ---------- validation ---------- */
  function normalizePhone(raw) {
    let d = String(raw || '').replace(/[\s\-().]/g, '');
    if (d.indexOf('+') === 0) d = d.slice(1);
    d = d.replace(/\D/g, '');
    if (d.length === 12 && d.indexOf('91') === 0) d = d.slice(2);
    if (d.length === 11 && d.charAt(0) === '0') d = d.slice(1);
    return d;
  }

  function validate() {
    const v = {};
    let firstBad = null;
    const fail = function (name, key) {
      showError(name, key);
      if (!firstBad) firstBad = name;
    };

    v.name = inputs.name.value.replace(/\s+/g, ' ').trim();
    if (!/^[\p{L}\p{M}][\p{L}\p{M}\s.'-]{1,59}$/u.test(v.name)) fail('name', 'booking.err.name'); else showError('name', '');

    v.phone = normalizePhone(inputs.phone.value);
    if (!/^[6-9]\d{9}$/.test(v.phone)) fail('phone', 'booking.err.phone'); else showError('phone', '');

    v.service = inputs.service.value;
    if (SERVICES.indexOf(v.service) === -1) fail('service', 'booking.err.service'); else showError('service', '');

    v.date = inputs.date.value;
    if (!v.date) fail('date', 'booking.err.date');
    else if (v.date < todayISO()) fail('date', 'booking.err.datePast');
    else showError('date', '');

    v.time = inputs.time.value;
    if (!v.time) fail('time', 'booking.err.time');
    else if (v.date === todayISO()) {
      const now = new Date();
      if (v.time <= pad(now.getHours()) + ':' + pad(now.getMinutes())) fail('time', 'booking.err.timePast');
      else showError('time', '');
    } else showError('time', '');

    v.message = inputs.message.value.replace(/[^\S\n]+/g, ' ').replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '').trim();
    if (v.message.length > 500) fail('message', 'booking.err.message'); else showError('message', '');

    return { ok: !firstBad, values: v, firstBad: firstBad };
  }

  /* ---------- message ---------- */
  function buildMessage(v) {
    const lines = [
      '*' + t('wa.title') + '*',
      '',
      t('wa.hello'),
      '',
      '*' + t('wa.name') + ':* ' + v.name,
      '*' + t('wa.phone') + ':* +91 ' + v.phone,
      '*' + t('wa.service') + ':* ' + t('services.' + v.service + '.title'),
      '*' + t('wa.date') + ':* ' + formatDate(v.date),
      '*' + t('wa.time') + ':* ' + formatTime(v.time)
    ];
    if (v.message) lines.push('*' + t('wa.message') + ':* ' + v.message);
    lines.push('', '_' + t('wa.note') + '_', '', t('wa.thanks'));
    return lines.join('\n');
  }

  function whatsappURL(text) {
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
  }

  /* ---------- submit ---------- */
  function onSubmit(e) {
    e.preventDefault();
    if (submitBtn && submitBtn.disabled) return;

    const res = validate();
    if (!res.ok) {
      setStatus('booking.status.fix', 'error');
      const bad = inputs[res.firstBad];
      if (bad) bad.focus();
      return;
    }

    const url = whatsappURL(buildMessage(res.values));
    const win = window.open(url, '_blank', 'noopener');

    if (win) {
      setStatus('booking.status.opening', 'success');
    } else {
      // pop-up blocked (common on iPhone): offer a tappable link
      statusEl.className = 'form-status is-error';
      statusEl.dataset.key = '';
      statusEl.textContent = '';
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = t('booking.status.blocked');
      a.style.textDecoration = 'underline';
      statusEl.appendChild(a);
    }

    // short lock against accidental double-submits
    if (submitBtn) {
      submitBtn.disabled = true;
      clearTimeout(lockTimer);
      lockTimer = setTimeout(function () { submitBtn.disabled = false; }, 2500);
    }
  }

  /* ---------- service shortcut buttons ---------- */
  function bindServiceLinks() {
    document.querySelectorAll('[data-service-select]').forEach(function (a) {
      a.addEventListener('click', function () {
        const val = a.getAttribute('data-service-select');
        if (SERVICES.indexOf(val) !== -1) {
          inputs.service.value = val;
          showError('service', '');
        }
      });
    });
  }

  function init() {
    form = $('booking-form');
    if (!form) return;
    statusEl = $('form-status');
    submitBtn = $('booking-submit');
    FIELDS.forEach(function (n) { inputs[n] = $('b-' + n); });

    const today = todayISO();
    inputs.date.min = today;
    inputs.date.addEventListener('focus', function () { inputs.date.min = todayISO(); });

    form.addEventListener('submit', onSubmit);

    FIELDS.forEach(function (n) {
      const ev = inputs[n].tagName === 'SELECT' ? 'change' : 'input';
      inputs[n].addEventListener(ev, function () {
        if (errorKeys[n]) showError(n, '');
        if (statusEl && statusEl.classList.contains('is-error')) setStatus('', '');
      });
    });

    bindServiceLinks();

    if (window.I18N && typeof window.I18N.onChange === 'function') {
      window.I18N.onChange(rerenderErrors);
    }
  }

  window.Booking = { init: init };
})();
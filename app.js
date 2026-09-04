/* ============================================================
   Azure Cove Hotel — interface behaviour only.
   No booking/Firebase logic lives here; that stays untouched
   in index.html's module script.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  /* ---------- Dates: sensible defaults + min bounds ---------- */
  const arrival = document.getElementById('arrival');
  const departure = document.getElementById('departure');

  const toISO = (d) => d.toISOString().split('T')[0];
  const today = new Date();
  arrival.min = toISO(today);

  const syncDepartureMin = () => {
    if (!arrival.value) {
      departure.min = toISO(today);
      return;
    }
    const next = new Date(arrival.value);
    next.setDate(next.getDate() + 1);
    departure.min = toISO(next);
    if (departure.value && departure.value <= arrival.value) {
      departure.value = toISO(next);
    }
  };
  syncDepartureMin();
  arrival.addEventListener('change', syncDepartureMin);

  /* ---------- Guest stepper ---------- */
  const guests = document.getElementById('guests');
  const minus = document.getElementById('guestMinus');
  const plus = document.getElementById('guestPlus');

  const clamp = (n) => Math.min(5, Math.max(1, n));

  minus.addEventListener('click', () => {
    guests.value = clamp(parseInt(guests.value || '1', 10) - 1);
  });
  plus.addEventListener('click', () => {
    guests.value = clamp(parseInt(guests.value || '1', 10) + 1);
  });

  /* ---------- Payment / pickup selectable cards ---------- */
  const syncOptionCards = (name) => {
    document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
      const card = input.closest('.option-card');
      if (!card) return;
      card.classList.toggle('is-checked', input.checked);
    });
  };

  ['payment', 'pickup'].forEach((name) => {
    document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
      input.addEventListener('change', () => syncOptionCards(name));
    });
  });

  /* ---------- Special requests character counter ---------- */
  const requests = document.getElementById('requests');
  const charCount = document.getElementById('charCount');
  if (requests && charCount) {
    const updateCount = () => {
      charCount.textContent = `${requests.value.length} / ${requests.maxLength}`;
    };
    requests.addEventListener('input', updateCount);
    updateCount();
  }

  /* ---------- Gentle inline validation feedback ---------- */
  form.querySelectorAll('input[required], select[required]').forEach((field) => {
    field.addEventListener('blur', () => {
      field.classList.toggle('is-invalid', !field.checkValidity());
    });
    field.addEventListener('input', () => {
      if (field.classList.contains('is-invalid') && field.checkValidity()) {
        field.classList.remove('is-invalid');
      }
    });
  });

  /* ---------- Submit button loading state ----------
     Runs alongside (not instead of) the Firebase submit
     handler. It just gives visual feedback while the async
     save is in flight, then clears itself shortly after —
     it never calls preventDefault or touches booking data. */
  const submitBtn = form.querySelector('.btn--primary');
  form.addEventListener('submit', () => {
    if (!form.checkValidity()) return;
    submitBtn.classList.add('is-loading');
    window.setTimeout(() => submitBtn.classList.remove('is-loading'), 2500);
  });

  form.addEventListener('reset', () => {
    window.setTimeout(() => {
      guests.value = 1;
      syncDepartureMin();
      updateCountSafe();
      ['payment', 'pickup'].forEach(syncOptionCards);
      form.querySelectorAll('.is-invalid').forEach((f) => f.classList.remove('is-invalid'));
    }, 0);
  });

  function updateCountSafe() {
    if (requests && charCount) {
      charCount.textContent = `0 / ${requests.maxLength}`;
    }
  }
});

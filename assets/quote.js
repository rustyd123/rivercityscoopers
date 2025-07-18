/**
 * assets/quote.js
 * - Calculates first‑visit vs. ongoing price
 * - Applies the $5 yard‑badge discount if checked
 * - Swaps out the “Pay & Submit” label
 */
document.addEventListener('DOMContentLoaded', () => {
  const svcType   = document.getElementById('serviceType');
  const freqEl    = document.getElementById('frequency');
  const dogsEl    = document.getElementById('numDogs');
  const badgeChk  = document.getElementById('yardBadge');
  const priceWrap = document.getElementById('priceDisplay');
  const payBtn    = document.getElementById('paySubmit');

  // your pricing matrix (replace these numbers with your actual tables)
  const initialTable = {
    'Once a Week':    [60,  75,  90,  105],
    'Two Times a Week':[80,  95,  110, 125],
    'Bi-Weekly':      [50,  65,  80,  95],
    'Once a Month':   [40,  55,  70,  85]
  };
  const ongoingTable = {
    'Once a Week':    [20.8, 25.4, 27.7, 30.05],
    'Two Times a Week':[20.8, 25.4, 27.7, 30.05],
    'Bi-Weekly':      [34.6, 38.05, 41.5, 44.95],
    'Once a Month':   [56.25, 61.88, 67.5, 73.13]
  };

  function recalc() {
    const svc      = svcType.value;
    const freq     = freqEl.value;
    const dogs     = parseInt(dogsEl.value, 10) - 1; // zero‑index
    const hasBadge = badgeChk.checked;

    // first‑visit = initialTable[freq][dogs]
    const first = initialTable[freq][dogs] || 0;
    // ongoing = ongoingTable[freq][dogs]
    const ongoing = ongoingTable[freq][dogs] || 0;
    // apply badge discount only on ongoing
    const discount = hasBadge ? 5 : 0;
    const paidFirst = svc === 'One-Time Cleanup'
      ? first
      : first  // still pay initial on subscriptions
    ;
    const displayOngoing = svc === 'Subscription Service'
      ? (ongoing - discount).toFixed(2)
      : ongoing.toFixed(2);

    // update UI
    if (svc === 'One-Time Cleanup') {
      priceWrap.textContent = `Your Price: $${paidFirst.toFixed(2)}`;
      payBtn.textContent       = 'Pay & Submit';
    } else {
      priceWrap.textContent = `First Visit: $${paidFirst.toFixed(2)} · After: $${displayOngoing}`;
      payBtn.textContent       = 'Subscribe & Pay';
    }
  }

  // re‑calculate whenever inputs change
  [svcType, freqEl, dogsEl, badgeChk].forEach(el =>
    el.addEventListener('change', recalc)
  );
  recalc();
});

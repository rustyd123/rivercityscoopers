/**
 * signup page quote/redirect script
 */
document.addEventListener('DOMContentLoaded', () => {
  // form fields
  const svcEl   = document.getElementById('serviceType');
  const freqRow = document.getElementById('frequency-row');
  const freqEl  = document.getElementById('frequency');
  const dogsEl  = document.getElementById('numDogs');
  const badgeEl = document.getElementById('yardBadge');
  const nameEl  = document.getElementById('fullName');
  const addrEl  = document.getElementById('address');
  const cityEl  = document.getElementById('city');
  const phoneEl = document.getElementById('phone');
  const emailEl = document.getElementById('email');
  const priceEl = document.getElementById('priceDisplay');
  const goBtn   = document.getElementById('getQuoteBtn');
  const sinceEl = document.getElementById('timeSince');

  // pricing tables (replace w/ real numbers later)
  const initialTable = {
    'Once a Week':      [60, 75, 90, 105],
    'Two Times a Week': [80, 95, 110, 125],
    'Bi-Weekly':        [50, 65, 80, 95],
    'Once a Month':     [40, 55, 70, 85]
  };
  const ongoingTable = {
    'Once a Week':      [20.8, 25.4, 27.7, 30.05],
    'Two Times a Week': [20.8, 25.4, 27.7, 30.05], // placeholder: same as weekly
    'Bi-Weekly':        [34.6, 38.05, 41.5, 44.95],
    'Once a Month':     [56.25, 61.88, 67.5, 73.13]
  };

  function dogIdx() {
    // Dogs: 1..4+ (we map 4+ to 4th column)
    let d = parseInt(dogsEl.value, 10);
    if (isNaN(d) || d < 1) d = 1;
    if (d > 4) d = 4;
    return d - 1;
  }

  function recalc() {
    const svc  = svcEl.value;
    const freq = freqEl.value;
    const di   = dogIdx();
    const hasBadge = badgeEl.checked;

    // Only show frequency row if subscription
    freqRow.style.display = (svc === 'Subscription Service') ? '' : 'none';

    let firstVisit = 0;
    let ongoing    = 0;
    if (svc === 'Subscription Service') {
      firstVisit = (initialTable[freq]  || [0,0,0,0])[di];
      ongoing    = (ongoingTable[freq] || [0,0,0,0])[di];
    } else {
      // One-Time cleanup — guess cost from the "time since" param
      // Simplest: reuse initialTable 'Once a Week' column; adjust later if you like
      firstVisit = (initialTable['Once a Week'] || [0,0,0,0])[di];
      ongoing    = 0;
    }

    const discount = (svc === 'Subscription Service' && hasBadge) ? 5 : 0;
    const ongoingNet = Math.max(ongoing - discount, 0);

    if (svc === 'Subscription Service') {
      priceEl.textContent = `First Visit: $${firstVisit.toFixed(2)} · After: $${ongoingNet.toFixed(2)} / visit`;
    } else {
      priceEl.textContent = `Your Price: $${firstVisit.toFixed(2)}`;
    }
  }

  // update on change
  [svcEl, freqEl, dogsEl, badgeEl, sinceEl].forEach(el => {
    el.addEventListener('change', recalc);
  });

  // initial
  recalc();

  // redirect to breakdown page
  goBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const params = new URLSearchParams({
      name:  nameEl.value.trim(),
      addr:  addrEl.value.trim(),
      city:  cityEl.value.trim(),
      phone: phoneEl.value.trim(),
      email: emailEl.value.trim(),
      svc:   svcEl.value,
      freq:  (svcEl.value === 'Subscription Service') ? freqEl.value : '',
      dogs:  dogsEl.value,
      since: sinceEl.value,
      badge: badgeEl.checked ? '1' : '0'
    });
    window.location.href = 'quote-breakdown.html?' + params.toString();
  });
});

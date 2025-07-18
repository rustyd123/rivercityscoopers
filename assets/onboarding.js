// Toggle frequency visibility based on service type
const svc = document.getElementById("serviceType"); const freq = document.getElementById("frequency"); const freqWrap = freq.parentElement;
function _upd(){ freqWrap.style.display = svc.value==="One-Time Cleanup" ? "none" : "block"; }
svc.addEventListener("change",_upd);
_upd();
// —— CONFIGURE THESE —————————————————— //
const SQUARE_APP_ID      = 'YOUR_SQUARE_APP_ID';
const SQUARE_LOCATION_ID = 'YOUR_LOCATION_ID';
const SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/…/exec';
// ——————————————————————————————————————————————— //

document.addEventListener('DOMContentLoaded', async () => {
  const el      = id => document.getElementById(id);
  const show    = id => el(id).classList.remove('hidden');
  const hide    = id => el(id).classList.add('hidden');

  // form elements
  const serviceType = el('rsc-service-type'),
        frequency   = el('rsc-frequency'),
        dogsEl      = el('rsc-dogs'),
        timeSinceEl = el('rsc-time-since'),
        badgeEl     = el('rsc-badge'),
        quoteSum    = el('rsc-quote-summary'),
        finalSum    = el('rsc-final-summary'),
        getQuote    = el('rsc-get-quote'),
        payBtn      = el('rsc-pay-button');

  // initial‑cleanup table (lower bounds)
  const initialRates = {
    oneweek:      {1:0,   2:0,   3:0,   4:0},
    twoweeks:     {1:10,  2:15,  3:25,  4:35},
    threeweeks:   {1:15,  2:25,  3:35,  4:45},
    onemonth:     {1:25,  2:35,  3:45,  4:55},
    twomonths:    {1:35,  2:50,  3:65,  4:75},
    '3to4months': {1:65,  2:70,  3:85,  4:100},
    '5to6months': {1:75,  2:90,  3:110, 4:130},
    '7to9months': {1:90,  2:110, 3:135, 4:160},
    '10plusmonths':{1:125, 2:130, 3:160, 4:190}
  };

  // subscription service rate rules
  const BASE_RATE      = 20;  // first dog
  const EXTRA_DOG_RATE = 5;   // each additional dog
  const BADGE_DISCOUNT = 5;   // per visit

  function calcInitial() {
    const t = timeSinceEl.value, d = +dogsEl.value;
    let fee = initialRates[t][d] || 0;
    // enforce $20 floor on one‑time cleanup only
    if (serviceType.value==='onetime') fee = Math.max(fee,20);
    return fee;
  }

  function calcWeeklyRate() {
    const base = BASE_RATE + ( +dogsEl.value - 1 )*EXTRA_DOG_RATE;
    return badgeEl.checked ? base - BADGE_DISCOUNT : base;
  }

  // Hide frequency until subscription selected
serviceType.addEventListener('change', () => {
  if (serviceType.value === 'onetime') {
    hide('frequency-container');
  } else {
    show('frequency-container');
  }
});
  // initialize frequency visibility on load
  if (serviceType.value === 'onetime') { hide('frequency-container'); } else { show('frequency-container'); }

  // STEP 1 → Get Quote & show card entry immediately
  getQuote.addEventListener('click', async () => {
    const initial   = calcInitial();
    const weeklyRt  = calcWeeklyRate();
    let html = '';

    if (serviceType.value==='onetime') {
      if (frequency.value==='weekly') {
        html += `<strong>Total for first visit (weekly subscription):</strong> $${initial.toFixed(2)}<br>`;
        html += `<em>Your first service fee is waived!</em><br>`;
        html += `Base weekly rate: $${(BASE_RATE + ( +dogsEl.value -1 )*EXTRA_DOG_RATE).toFixed(2)} per visit<br>`;
        if (badgeEl.checked) {
          html += `Yard Badge discount: −$${BADGE_DISCOUNT.toFixed(2)} per visit<br>`;
        }
        html += `<strong>Final rate: $${weeklyRt.toFixed(2)} per visit</strong>`;
      } else {
        html += `Initial Cleanup Fee: $${initial.toFixed(2)}<br>`;
        html += `${frequency.options[frequency.selectedIndex].text} rate: $${weeklyRt.toFixed(2)} per visit<br>`;
        html += `<strong>Total Today: $${(initial+weeklyRt).toFixed(2)}</strong>`;
      }
    } else {
      // one‑time cleanup
      html = `One‑time cleanup: $${initial.toFixed(2)}`;
    }

    quoteSum.innerHTML = html;
    finalSum.innerHTML = html;

    // move to payment step
    hide('step1');
    show('step2');

    // immediately attach Square card input
    const payments = Square.payments(SQUARE_APP_ID, SQUARE_LOCATION_ID);
    const card     = await payments.card();
    await card.attach('#rsc-card-container');
  });

  // STEP 2 → Pay & Submit
  payBtn.addEventListener('click', async () => {
    payBtn.disabled = true;
    const tokenRes = await Square.payments(SQUARE_APP_ID, SQUARE_LOCATION_ID)
                          .card().then(c=>c.tokenize());
    if (tokenRes.status!=='OK') {
      alert(tokenRes.errors[0].message);
      payBtn.disabled = false;
      return;
    }

    const initial   = calcInitial();
    const weeklyRt  = calcWeeklyRate();
    const total     = serviceType.value==='onetime'
                       ? (frequency.value==='weekly' ? initial : initial+weeklyRt)
                       : initial;

    // payload to your webhook / backend
    const payload = {
      name:        el('rsc-name').value,
      address:     el('rsc-address').value,
      city:        el('rsc-city').value,
      phone:       el('rsc-phone').value,
      email:       el('rsc-email').value,
      serviceType: serviceType.value,
      frequency:   serviceType.value==='onetime'?frequency.value:'',
      dogs:        dogsEl.value,
      timeSince:   timeSinceEl.value,
      badge:       badgeEl.checked?'Yes':'No',
      initialFee:  initial.toFixed(2),
      serviceRate: serviceType.value==='onetime'?weeklyRt.toFixed(2):'0.00',
      total:       total.toFixed(2),
      squareToken: tokenRes.token
    };

    const resp = await fetch(SHEETS_WEBHOOK_URL, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    if (resp.ok) {
      document.querySelector('.container').innerHTML =
        '<h2>Thank you! Your signup is complete.</h2>';
    } else {
      alert('Submission failed.');
      payBtn.disabled = false;
    }
  });
});

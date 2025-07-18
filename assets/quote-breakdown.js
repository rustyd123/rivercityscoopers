/**
 * quote-breakdown.js
 * Reads selections from query string, recomputes prices,
 * renders line items: Initial Visit, Recurring (if subscription),
 * Badge discount, etc.
 */
(function(){
  const qs = new URLSearchParams(window.location.search);
  const data = {
    name:  qs.get('name')  || '',
    addr:  qs.get('addr')  || '',
    city:  qs.get('city')  || '',
    phone: qs.get('phone') || '',
    email: qs.get('email') || '',
    svc:   qs.get('svc')   || 'Subscription Service',
    freq:  qs.get('freq')  || 'Once a Week',
    dogs:  parseInt(qs.get('dogs') || '1',10),
    badge: qs.get('badge') === '1',
    since: qs.get('since') || ''
  };

  // normalize dogs (max 4 bucket)
  let dogsIdx = data.dogs;
  if (isNaN(dogsIdx) || dogsIdx < 1) dogsIdx = 1;
  if (dogsIdx > 4) dogsIdx = 4;
  dogsIdx -= 1;

  // same placeholder tables as signup.js (keep in sync!)
  const initialTable = {
    'Once a Week':      [60, 75, 90, 105],
    'Two Times a Week': [80, 95, 110, 125],
    'Bi-Weekly':        [50, 65, 80, 95],
    'Once a Month':     [40, 55, 70, 85]
  };
  const ongoingTable = {
    'Once a Week':      [20.8, 25.4, 27.7, 30.05],
    'Two Times a Week': [20.8, 25.4, 27.7, 30.05],
    'Bi-Weekly':        [34.6, 38.05, 41.5, 44.95],
    'Once a Month':     [56.25, 61.88, 67.5, 73.13]
  };

  const badgeDisc = data.badge ? 5 : 0;

  let first = 0, ongoing = 0;
  if (data.svc === 'Subscription Service') {
    first   = (initialTable[data.freq]  || [0,0,0,0])[dogsIdx];
    ongoing = (ongoingTable[data.freq] || [0,0,0,0])[dogsIdx];
  } else {
    first   = (initialTable['Once a Week'] || [0,0,0,0])[dogsIdx]; // adjust per rules
    ongoing = 0;
  }

  const ongoingNet = (data.svc === 'Subscription Service')
    ? Math.max(ongoing - badgeDisc, 0)
    : 0;

  // render customer summary
  const custSummary = document.getElementById('custSummary');
  custSummary.textContent =
    `${data.name} — ${data.addr}, ${data.city} (${data.dogs} dog${data.dogs>1?'s':''})`;

  // render line items
  const tbody = document.querySelector('#quoteLines tbody');
  function addLine(desc, amt){
    const tr = document.createElement('tr');
    const td1 = document.createElement('td');
    const td2 = document.createElement('td');
    td1.textContent = desc;
    td2.textContent = `$${amt.toFixed(2)}`;
    td2.className = 'money';
    tr.append(td1,td2);
    tbody.appendChild(tr);
  }

  addLine('Initial Cleanup Visit', first);
  if (data.svc === 'Subscription Service') {
    addLine(`${data.freq} Service`, ongoing);
    if (badgeDisc > 0) addLine('Yard Badge Discount (per visit)', -badgeDisc);
  }

  const grand = (data.svc === 'Subscription Service')
    ? first + ongoingNet
    : first;

  document.getElementById('grandTotal').textContent = `$${grand.toFixed(2)}`;

  // pass everything to payment (later)
  document.getElementById('acceptBtn').addEventListener('click', (e)=>{
    e.preventDefault();
    // TODO: swap to /pay.html once we build Square step
    alert('Next: payment step (not yet wired).');
  });
})();

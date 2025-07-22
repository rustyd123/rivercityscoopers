(async function(){
  function showStep(n){
    document.querySelectorAll('.rsc-step')
      .forEach((el,i)=> el.classList.toggle('hidden', i+1 !== n));
  }

  document.getElementById('next1')
    .addEventListener('click', ()=>{ calculateQuote(); showStep(2) });

  document.getElementById('prev2')
    .addEventListener('click', ()=> showStep(1));

  document.getElementById('next2')
    .addEventListener('click', async ()=> {
      const payments = Square.payments(
        RSC_CONFIG.squareAppId, RSC_CONFIG.squareLocationId
      );
      window.card = await payments.card();
      await card.attach('#card-container');
      document.getElementById('rsc-pay-btn').disabled = false;
      showStep(3);
    });

  document.getElementById('prev3')
    .addEventListener('click', ()=> showStep(2));

  document.getElementById('rsc-pay-btn')
    .addEventListener('click', async () => {
      const btn = document.getElementById('rsc-pay-btn'),
            msg = document.getElementById('rsc-msg');
      btn.disabled = true; msg.classList.add('hidden');
      const result = await window.card.tokenize();
      if (result.status !== 'OK') {
        msg.textContent = result.errors?.[0]?.message || 'Tokenization failed';
        msg.classList.remove('hidden');
        btn.disabled = false;
        return;
      }
      const payload = buildPayload(result.token);
      try {
        await fetch(RSC_CONFIG.apiUrl, {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify(payload)
        });
        alert('🎉 Payment successful!');
        showStep(1);
      } catch (e) {
        msg.textContent = 'Payment error';
        msg.classList.remove('hidden');
        btn.disabled = false;
      }
    });
})();

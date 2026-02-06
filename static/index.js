
    const form = document.getElementById('predict-form');
    const predictBtn = document.getElementById('predict-btn');
    const clearBtn = document.getElementById('clear-btn');
    const spinner = document.getElementById('spinner');
    const resultArea = document.getElementById('result-area');

    function showSpinner(show){spinner.style.display = show ? 'inline-block' : 'none'; predictBtn.disabled = show}

    function buildRequestPayload(){
      // Gather values from the form; modify here to match your model's input schema
      const amt = parseFloat(document.getElementById('amount').value) || 0;
      const city = document.getElementById('city').value;
      const category = document.getElementById('category').value;
      const city_pop = parseFloat(document.getElementById('city_pop').value);
      const age = parseFloat(document.getElementById('age').value);
      const job = document.getElementById('job').value;
      const gender = document.querySelector('input[name="myOption"]:checked').value;

      const datetime = document.getElementById('time').value.toString();

      const [datePart, timePart] = datetime.split('T');

      const hour = parseInt(timePart.split(":")[0])

      const [year, month, day] = datePart.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);

      const Weekday = (dateObj.getDay() + 6) % 7;
      console.log("Month:", month);   
      console.log("Weekday:", Weekday);  
      console.log(job)

      return {category, amt, gender, age, city_pop, city, job, hour, Weekday, day, month };
    }

    function renderResult(obj){
      // obj = { fraud_prediction: 0|1, probability: 0.87 }
      const probPct = Math.round((obj.probability || 0) * 100);
      const isFraud = obj.fraud_prediction === 1;

  resultArea.innerHTML = `
    <div class="result ${isFraud ? 'res-fraud' : 'res-legit'}">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <strong style="font-size:18px">
            ${isFraud ? 'Potential Fraud' : 'Likely Legitimate'}
          </strong>
          <div class="meta">Probability: <strong>${probPct}%</strong></div>
        </div>
        <div style="text-align:right">
          <div class="small">Model label: <strong>${isFraud ? 'Fraud' : 'Legit'}</strong></div>
          <div class="small">Timestamp: <strong>${new Date().toLocaleString()}</strong></div>
        </div>
      </div>
      <div style="margin-top:8px;color:var(--muted)">
        Explanation: The backend should return additional fields like <code>top_contributors</code> if you want per-feature explainability displayed here.
      </div>
    </div>`;
    }

    form.addEventListener('submit', async (e)=>{
     
      e.preventDefault();
      showSpinner(true);
      resultArea.innerHTML = '<div class="meta">Sending request to backend...</div>';

      const payload = buildRequestPayload();
      try{
        
        
        const res = await fetch('/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if(!res.ok){
          const txt = await res.text();
          throw new Error('Server returned ' + res.status + ' — ' + txt);
        }

        const data = await res.json();
        renderResult(data);
      }catch(err){
        resultArea.innerHTML = `<div class="result res-fraud"><strong>Error</strong><div class=\"meta\">${err.message}</div></div>`;
      }finally{showSpinner(false)}
    });

    clearBtn.addEventListener('click', ()=>{
      form.reset();
      resultArea.innerHTML = '<div class="meta">Model result will appear here.</div>';
    });
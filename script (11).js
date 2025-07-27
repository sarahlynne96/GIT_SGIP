<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>California SGIP Eligibility & Rebate Estimator (v16)</title>
  <style>
    :root { --primary:#fdb813; --secondary:#003c71; --accent:#005eb8; --bg:#f9f9f9; --text:#333; --muted:#666; --card-bg:#fff; }
    *,*::before,*::after { box-sizing:border-box; margin:0; padding:0 }
    body { font-family:Arial,Helvetica,sans-serif; background:var(--bg); color:var(--text); line-height:1.6; padding:1rem 0 4rem }
    h1 { font-size:2rem; font-weight:700; color:var(--primary); text-align:center; margin:1rem 0 }
    .wrapper { max-width:960px; margin:0 auto; padding:0 1rem }

    /* Stepper */
    .stepper { counter-reset:step; display:flex; list-style:none; margin:1rem 0 2rem; align-items:center }
    .stepper li { flex:1; display:flex; flex-direction:column; align-items:center; position:relative; padding:0 .5rem }
    .stepper li::before { counter-increment:step; content:counter(step); display:inline-block; width:2rem; height:2rem; line-height:2rem; background:var(--secondary); color:#fff; border-radius:50%; margin-bottom:.5rem }
    .stepper li.active::before { background:var(--primary) }
    .stepper li:not(:last-child)::after { content:""; position:absolute; top:1rem; left:calc(50% + 1rem); width:calc(100% - 2rem); height:2px; background:var(--muted); }

    /* Layout */
    .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem }
    @media(max-width:768px) { .grid-2 { display:block } }

    /* Cards & Fields */
    .card, fieldset { background:var(--card-bg); box-shadow:0 2px 6px rgba(0,0,0,0.1); border:none; border-radius:6px; padding:1rem; margin-bottom:1rem }
    legend { font-weight:600; color:var(--secondary); padding:0 .5rem }
    label { display:block; font-weight:600; color:var(--secondary); margin:.9rem 0 .4rem }
    select,input { width:100%; padding:10px; border:1px solid #ccc; border-radius:4px; font-size:1rem }
    small, .note, #thresholdHint { display:block; margin-top:4px; color:var(--muted); font-size:.85rem }
    .tooltip { margin-left:.3rem; cursor:help; color:var(--accent); border-bottom:1px dotted var(--accent) }

    /* Buttons */
    .actions { display:flex; justify-content:space-between; gap:1rem; margin-top:1rem; position:sticky; bottom:0; background:var(--bg); padding:1rem 0 }
    .primary-btn { flex:1; background:var(--primary); color:#fff; border:none; padding:12px; font-size:1rem; border-radius:4px; font-weight:600; cursor:pointer; transition:background .3s }
    .primary-btn:hover { background:var(--accent) }
    .secondary-btn { flex:1; border:1px solid var(--secondary); background:transparent; color:var(--secondary); padding:12px; font-size:1rem; border-radius:4px; font-weight:600; cursor:pointer }

    /* Results */
    #incomeResult,#result { display:none; margin-top:1rem; padding:18px; background:#f0f8ff; border-left:5px solid var(--primary); border-radius:4px; font-size:1rem; opacity:0; transform:translateY(-10px); transition:opacity .3s ease, transform .3s ease }
    #incomeResult.show,#result.show { display:block; opacity:1; transform:translateY(0) }
    .badge { display:inline-block; background:var(--secondary); color:#fff; padding:.25rem .55rem; border-radius:3px; font-size:.78rem; margin-right:6px }
    .track { margin-bottom:1.5rem }
    .contact { margin-top:1rem; padding-top:1rem; border-top:1px solid #ddd }

    footer { font-size:.85rem; color:var(--muted); text-align:center; margin:3rem 0 }
    details { margin-top:1rem }
    summary { font-weight:600; cursor:pointer; }
    iframe { width:100%; height:300px; border:none }
  </style>
</head>
<body>
  <h1>California SGIP Rebate Estimator</h1>
  <div class="wrapper">
    <ul class="stepper">
      <li class="active">Project</li>
      <li>Customer</li>
      <li>Resiliency</li>
      <li>Size</li>
      <li>Contact</li>
    </ul>
    <p class="note">Answer a few questions to see every SGIP track you may qualify for and a ball‑park rebate estimate.</p>

    <form id="calcForm" autocomplete="off" novalidate>
      <!-- Project Details -->
      <div class="card">
        <fieldset>
          <legend>1. Project details</legend>
          <label for="address">Installation address <em>(optional)</em></label>
          <input id="address" name="address" placeholder="1234 Main St, Fresno CA" />

          <label for="utility">Utility company</label>
          <select id="utility" name="utility" required>
            <option value="">Choose…</option>
            <option>CSE</option><option>SCE</option><option>SCG</option><option>PG&E</option><option>LADWP</option>
          </select>

          <label for="county">County <em>(for income test)</em></label>
          <select id="county" name="county" required></select>

          <label for="hhSize">Household size (persons)</label>
          <input id="hhSize" name="hhSize" type="number" min="1" max="8" value="4">

          <label for="hhIncome">Annual household income ($)</label>
          <input id="hhIncome" name="hhIncome" type="number" min="0" step="1000" placeholder="e.g. 95000">
          <div id="thresholdHint" class="note"></div>

          <details>
            <summary>Disadvantaged Communities & Fire Threat Map</summary>
            <iframe src="https://www.arcgis.com/apps/MapSeries/index.html?appid=DAC_HFTD_Map_ID"></iframe>
          </details>
        </fieldset>
      </div>

      <!-- Customer & Resiliency -->
      <div class="grid-2">
        <div class="card">
          <fieldset>
            <legend>2. Customer</legend>
            <label for="custType">Customer type</label>
            <select id="custType" name="custType" required>
              <option value="">Choose…</option>
              <option value="single">Home – Single Family</option>
              <option value="multi">Home – Multifamily</option>
              <option value="nonres">Business / Non-Residential</option>
            </select>

            <label for="critFlag">Medical Baseline or critical well-pump?<span class="tooltip" title="Medical baseline or critical well-pump customers">?</span></label>
            <select id="critFlag" name="critFlag" required>
              <option value="">Choose…</option><option value="yes">Yes</option><option value="no">No</option>
            </select>
          </fieldset>
        </div>
        <div class="card">
          <fieldset>
            <legend>3. Resiliency</legend>
            <label for="dacFlag">DAC or HFTD?<span class="tooltip" title="Disadvantaged Community or High Fire Threat District">?</span></label>
            <select id="dacFlag" name="dacFlag" required>
              <option value="">Choose…</option><option value="yes">Yes</option><option value="no">No / Unsure</option>
            </select>

            <label for="pspsFlag">≥ 2 PSPS shut‑offs?<span class="tooltip" title="Public Safety Power Shutoff events">?</span></label>
            <select id="pspsFlag" name="pspsFlag" required>
              <option value="">Choose…</option><option value="yes">Yes</option><option value="no">No / Unsure</option>
            </select>

            <label for="sjvFlag">SJ Valley pilot city?<span class="tooltip" title="SJ Valley pilot cities">?</span></label>
            <select id="sjvFlag" name="sjvFlag" required>
              <option value="">Choose…</option><option value="yes">Yes</option><option value="no">No</option>
            </select>
          </fieldset>
        </div>
      </div>

      <!-- Size & Contact -->
      <div class="grid-2">
        <div class="card">
          <fieldset>
            <legend>4. System size</legend>
            <label for="storageKWh">Battery capacity (kWh)</label>
            <input id="storageKWh" name="storageKWh" type="number" min="0" step="0.1" required>

            <label for="solarKW">Solar array (kW)<em>(optional)</em></label>
            <input id="solarKW" name="solarKW" type="number" min="0" step="0.1">
          </fieldset>
        </div>
        <div class="card">
          <fieldset>
            <legend>5. Contact details</legend>
            <label for="contactName">Full name</label>
            <input id="contactName" name="contactName" required>
            <label for="contactPhone">Phone</label>
            <input id="contactPhone" name="contactPhone" type="tel" required>
            <label for="contactEmail">Email</label>
            <input id="contactEmail" name="contactEmail" type="email" required>
          </fieldset>
        </div>
      </div>

      <div class="actions">
        <button type="reset" class="secondary-btn">Reset</button>
        <button type="submit" class="primary-btn">Calculate & save</button>
      </div>
    </form>

    <div id="incomeResult" class="show"></div>
    <div id="result" class="show"></div>
  </div>

  <footer>Unofficial tool – rates current as of July 27 2025. Actual rebate subject to SGIP budget & PA review.</footer>

  <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>
  <script>
    const $ = s => document.querySelector(s);
    const money = v => v.toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
    const rateFmt = v => `$${v.toFixed(2)}`;

    // Full list of counties
    const COUNTY_AMI = {"Alameda":159800,"Alpine":129500,"Amador":109900,"Butte":96600,"Calaveras":101500,
      "Colusa":96400,"Contra Costa":159800,"Del Norte":93900,"El Dorado":120800,"Fresno":93900,
      "Glenn":93900,"Humboldt":93900,"Imperial":93900,"Inyo":97200,"Kern":93900,"Kings":93900,
      "Lake":93900,"Lassen":93900,"Los Angeles":106600,"Madera":93900,"Marin":186600,"Mariposa":93900,
      "Mendocino":93900,"Merced":93900,"Modoc":93900,"Mono":118500,"Monterey":104500,"Napa":146700,
      "Nevada":124600,"Orange":136600,"Placer":120800,"Plumas":95300,"Riverside":103900,"Sacramento":120800,
      "San Benito":140200,"San Bernardino":103900,"San Diego":130800,"San Francisco":186600,"San Joaquin":104600,
      "San Luis Obispo":125600,"San Mateo":186600,"Santa Barbara":119100,"Santa Clara":195200,"Santa Cruz":132800,
      "Shasta":101800,"Sierra":93900,"Siskiyou":93900,"Solano":124600,"Sonoma":132000,"Stanislaus":98500,
      "Sutter":98900,"Tehama":93900,"Trinity":93900,"Tulare":93900,"Tuolumne":101600,"Ventura":131300,
      "Yolo":135900,"Yuba":98900 };

    const SIZE_FACTOR=[0.7,0.8,0.9,1,1.08,1.16,1.24,1.32];
    function calc80(county,size){ const base=COUNTY_AMI[county]; if(!base)return null; const idx=Math.min(Math.max(size-1,0),SIZE_FACTOR.length-1); return base*SIZE_FACTOR[idx]*0.8; }

    function populateCounties(){ const sel=$('#county'); sel.innerHTML='<option value="">Choose county…</option>'+
      Object.keys(COUNTY_AMI).sort().map(c=>`<option value="${c}">${c}</option>`).join(''); }

    function updateThresholdHint(){ const county=$('#county').value, size=parseInt($('#hhSize').value,10)||0;
      const thresh=calc80(county,size);
      $('#thresholdHint').textContent = thresh ? `80% AMI threshold (${county}, ${size}): ${money(thresh)}` : '';
    }

    window.addEventListener('DOMContentLoaded',()=>{
      populateCounties(); updateThresholdHint();
      $('#county').addEventListener('change', updateThresholdHint);
      $('#hhSize').addEventListener('input', updateThresholdHint);

      const autocomplete = new google.maps.places.Autocomplete($('#address'), { types:['address'], componentRestrictions:{ country:'us' } });
      autocomplete.addListener('place_changed', ()=>{
        const place = autocomplete.getPlace();
        const comp = place.address_components.find(c=>c.types.includes('administrative_area_level_2'));
        if(comp){ const countyName=comp.long_name.replace(/ County$/,''); if(COUNTY_AMI[countyName]){ $('#county').value=countyName; updateThresholdHint(); }}
      });

      $('#calcForm').addEventListener('submit', e=>{
        e.preventDefault(); const data=Object.fromEntries(new FormData(e.target).entries());
        localStorage.setItem('sgipDraft', JSON.stringify(data));
        // submit logic
      });
    });
  </script>
</body>
</html>

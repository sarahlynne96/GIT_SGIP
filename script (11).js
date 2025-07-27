<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>California SGIP Eligibility & Rebate Estimator</title>
  <style>
    :root { --primary:#fdb813; --secondary:#003c71; --accent:#005eb8; --bg:#f9f9f9; --text:#333; --muted:#666; }
    *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:Arial,sans-serif; background:var(--bg); color:var(--text); padding:2rem; }
    h1 { text-align:center; color:var(--primary); margin-bottom:1rem; }
    .wrapper { max-width:800px; margin:0 auto; }
    fieldset { background:#fff; border:1px solid #ddd; border-radius:6px; padding:1rem; margin-bottom:1.5rem; }
    legend { font-weight:600; color:var(--secondary); padding:0 .5rem; }
    label { display:block; margin-top:1rem; font-weight:600; }
    input, select { width:100%; padding:.5rem; margin-top:.3rem; border:1px solid #ccc; border-radius:4px; font-size:1rem; }
    small.note { display:block; margin-top:.3rem; color:var(--muted); font-size:.85rem; }
    button { width:100%; padding:.75rem; margin-top:1rem; background:var(--primary); color:#fff; border:none; border-radius:4px; font-size:1rem; cursor:pointer; }
    button:hover { background:var(--accent); }
    button:disabled { opacity:.6; cursor:not-allowed; }
    #result { display:none; margin-top:2rem; padding:1rem; background:#fff; border-left:5px solid var(--primary); border-radius:4px; }
    #result h3 { margin-top:0; color:var(--secondary); }
    #result p, #result ul { margin:.5rem 0; }
    #result ul { list-style:disc; padding-left:1.2rem; }
    .doc-list { margin:.5rem 0; padding-left:1.2rem; list-style:disc; }
    hr { border:none; border-top:1px solid #eee; margin:1rem 0; }
  </style>
  <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
</head>
<body>
  <h1>California SGIP Rebate Estimator</h1>
  <div class="wrapper">
    <form id="calcForm" autocomplete="off" novalidate>
      <fieldset>
        <legend>1. Location & Income</legend>
        <label for="county">County of residence</label>
        <select id="county" name="county" required>
          <option value="" disabled selected>Select county…</option>
        </select>
        <small id="medianNote" class="note"></small>
        <label for="hhIncome">Annual household income ($)</label>
        <input id="hhIncome" name="hhIncome" type="number" min="0" step="1000" placeholder="e.g. 95,000" required />
      </fieldset>

      <fieldset>
        <legend>2. Customer Profile</legend>
        <label for="address">Installation address <small>(optional)</small></label>
        <input id="address" name="address" placeholder="1234 Main St, City, CA" />
        <label for="custType">Customer type</label>
        <select id="custType" name="custType" required>
          <option value="" disabled selected>Select type…</option>
          <option value="single">Home – Single-Family</option>
          <option value="multi">Home – Multifamily</option>
          <option value="nonres">Business / Non-Residential</option>
        </select>
      </fieldset>

      <fieldset>
        <legend>3. Resiliency</legend>
        <label for="dacFlag">Is your home in a Disadvantaged Community (DAC) or High Fire Threat District (HFTD)?</label>
        <select id="dacFlag" name="dacFlag" required>
          <option value="" disabled selected>Select…</option>
          <option value="yes">Yes – I am in DAC or HFTD</option>
          <option value="no">No / Not sure (use maps below)</option>
        </select>
        <small class="note">Use the maps below to confirm your location.</small>

        <label for="pspsFlag">Have you experienced 2 or more PSPS events at this address?</label>
        <select id="pspsFlag" name="pspsFlag" required>
          <option value="" disabled selected>Select…</option>
          <option value="yes">Yes – 2+ shut-offs</option>
          <option value="no">No / Not sure (check map below)</option>
        </select>

        <label for="critFlag">Does anyone receive Medical Baseline or operate a critical well-pump?</label>
        <select id="critFlag" name="critFlag" required>
          <option value="" disabled selected>Select…</option>
          <option value="yes">Yes – Medical Baseline or well-pump</option>
          <option value="no">No</option>
        </select>

        <details style="margin-top:1rem">
          <summary style="cursor:pointer;font-weight:600;color:var(--secondary)">View Resiliency Maps</summary>
          <div style="margin-top:.5rem">
            <iframe src="https://experience.arcgis.com/experience/1c21c53da8de48f1b946f3402fbae55c" width="100%" height="200" style="border:none;"></iframe>
            <iframe src="https://capuc.maps.arcgis.com/apps/dashboards/ecd21b1c204f47da8b1fcc4c5c3b7d3a" width="100%" height="200" style="border:none; margin-top:.5rem;"></iframe>
            <iframe src="https://capuc.maps.arcgis.com/apps/webappviewer/index.html?id=5bdb921d747a46929d9f00dbdb6d0fa2" width="100%" height="200" style="border:none; margin-top:.5rem;"></iframe>
          </div>
        </details>
      </fieldset>

      <fieldset>
        <legend>4. System Size</legend>
        <label for="storageKWh">Battery usable capacity (kWh)</label>
        <input id="storageKWh" name="storageKWh" type="number" min="0" step="0.1" required />
        <label for="solarKW">Solar array size (kW) <small>(optional)</small></label>
        <input id="solarKW" name="solarKW" type="number" min="0" step="0.1" />
      </fieldset>

      <button type="submit">Calculate</button>
    </form>

    <div id="result"></div>
  </div>

  <script>
    const COUNTY_AMI = {/* all 58 counties as before */};
    const SIZE_ADJ = [0.7,0.8,0.9,1,1.08,1.16,1.24,1.32];
    const money = v => isNaN(v) ? 'N/A' : v.toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});

    function populateCounties() {
      const sel = document.getElementById('county');
      sel.innerHTML = '<option value="" disabled selected>Select county…</option>' +
        Object.keys(COUNTY_AMI).sort().map(c => `<option value="${c}">${c}</option>`).join('');
    }
    function updateMedian() {
      const c = document.getElementById('county').value;
      document.getElementById('medianNote').textContent =
        c ? `4-person AMI for ${c}: ${money(COUNTY_AMI[c])}` : '';
    }
    function geocode(addr) {
      return new Promise(res => {
        new google.maps.Geocoder().geocode({address: addr}, (r,s) =>
          res(s==='OK' && r[0] ? r[0].geometry.location : null)
        );
      });
    }
    async function fetchFeatures(url) {
      try {
        let r = await fetch(url);
        if(!r.ok) throw '';
        let j = await r.json();
        return j.features || [];
      } catch { return []; }
    }
    async function checkDAC(lat,lng) {
      const f = await fetchFeatures(
        `https://gis.data.ca.gov/arcgis/rest/services/Environmental/CalEnviroScreen_4/MapServer/3/query?geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326&outFields=SB535&returnGeometry=false&f=json`
      );
      return f.some(x => x.attributes.SB535==='Y');
    }
    async function checkHFTD(lat,lng) {
      const f = await fetchFeatures(
        `https://services2.arcgis.com/.../FeatureServer/0/query?geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326&outFields=FHSZONES&returnGeometry=false&f=json`
      );
      return f.some(x => ['2','3'].includes(String(x.attributes.FHSZONES)));
    }
    async function checkPSPS(lat,lng) {
      const f = await fetchFeatures(
        `https://services2.arcgis.com/.../PSPS_Events_Layer/FeatureServer/0/query?geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326&outFields=*&returnGeometry=false&f=json`
      );
      return f.length>0;
    }
    function threshold(county,size) {
      const b = COUNTY_AMI[county];
      if(!b || isNaN(size)) return null;
      const idx = Math.min(Math.max(size-1,0),7);
      return b * SIZE_ADJ[idx] * 0.8;
    }

    async function onSubmit(e) {
      e.preventDefault();
      const f = e.target,
            btn = f.querySelector('button'),
            res = document.getElementById('result');
      btn.disabled = true;
      res.style.display = 'none';
      res.innerHTML = '';

      const d = Object.fromEntries(new FormData(f)),
            income = +d.hhIncome,
            bat = +d.storageKWh || 0,
            sol = +d.solarKW || 0;

      if(!d.county || isNaN(income) || !d.custType) {
        alert('Please fill in all required fields.');
        btn.disabled = false;
        return;
      }

      const thr = threshold(d.county, 4),
            low = income <= thr,
            tracks = [];

      // Equity Solar + Storage
      if(d.custType==='single' && sol>0 && bat>0) {
        const est = 1.10*bat*1000 + 3.10*sol*1000;
        tracks.push({
          title: 'Equity Solar + Storage',
          desc: 'Low-income residence adding new battery and solar receives the highest SGIP incentive.',
          reb: est,
          rate: '($1.10/Wh + $3.10/W)',
          docs: [
            'Recent utility bill',
            'System equipment quote/contract',
            'Interconnection application (or NBT/NEM doc)',
            'Proof of CARE/FERA or income affidavit'
          ],
          next: 'Reserve incentive → Sign SGIP agreement → Install system → File incentive claim.'
        });
      }

      // Equity Resiliency
      if(d.dacFlag==='yes' || d.pspsFlag==='yes' || d.critFlag==='yes') {
        const est = 1.00 * bat * 1000;
        tracks.push({
          title: 'Equity Resiliency',
          desc: 'Low-income residence in wildfire/PSPS risk (or medical baseline) receives $1/Wh bonus.',
          reb: est,
          rate: '($1.00/Wh)',
          docs: [
            'Recent utility bill',
            'System equipment quote/contract',
            'Interconnection application (or NBT/NEM doc)',
            'Proof of CARE/FERA or income affidavit',
            'Medical Baseline letter or well-pump affidavit',
            'Proof of ≥2 PSPS events or HFTD map'
          ],
          next: 'Reserve incentive → Sign SGIP agreement → Install system → File incentive claim.'
        });
      }

      // Equity Storage-Only
      if(low && bat>0 && sol===0) {
        const est = 0.85 * bat * 1000;
        tracks.push({
          title: 'Equity Storage-Only',
          desc: 'Low-income residence installing a stand-alone battery.',
          reb: est,
          rate: '($0.85/Wh)',
          docs: [
            'Recent utility bill',
            'System equipment quote/contract',
            'Interconnection application (or NBT/NEM doc)',
            'Proof of CARE/FERA or income affidavit'
          ],
          next: 'Reserve incentive → Sign SGIP agreement → Install system → File incentive claim.'
        });
      }

      // Generation (PV-Only)
      if(sol>0 && bat===0) {
        const est = 2.00 * sol * 1000;
        tracks.push({
          title: 'Generation (PV-Only)',
          desc: 'PV generation incentive (flat $2/W).',
          reb: est,
          rate: '($2.00/W)',
          docs: [
            'Recent utility bill',
            'System equipment quote/contract',
            'Interconnection application (or NBT/NEM doc)'
          ],
          next: 'Reserve incentive → Sign SGIP agreement → Install system → File incentive claim.'
        });
      }

      if(!tracks.length) {
        tracks.push({ title: 'No tracks found.', desc: '', reb:0, rate:'', docs:[], next:'' });
      }

      let html = '<h3>Estimated Rebates</h3>';
      tracks.forEach(item => {
        html += `
          <h4>${item.title}</h4>
          <p>${item.desc}</p>
          <p><strong>Estimated rebate:</strong> ${money(item.reb)}</p>
          <p>${item.rate}</p>
          <p><strong>Documents you’ll likely need:</strong></p>
          <ul class="doc-list">${item.docs.map(d=>`<li>${d}</li>`).join('')}</ul>
          <p><strong>Next steps:</strong> ${item.next}</p>
          <hr>
        `;
      });
      res.innerHTML = html;

      // PDF export of entire form + results
      if(!document.getElementById('downloadBtn')) {
        const b = document.createElement('button');
        b.id = 'downloadBtn';
        b.textContent = 'Download PDF';
        b.onclick = () => html2pdf().from(document.querySelector('.wrapper')).save();
        res.appendChild(b);
      }

      res.style.display = 'block';
      btn.disabled = false;
    }

    document.addEventListener('DOMContentLoaded', () => {
      populateCounties();
      document.getElementById('county').addEventListener('change', updateMedian);
      document.getElementById('calcForm').addEventListener('submit', onSubmit);
      if(window.google && google.maps && google.maps.places) {
        new google.maps.places.Autocomplete(
          document.getElementById('address'),
          { types:['address'], componentRestrictions:{ country:'us' } }
        );
      }
    });
  </script>
</body>
</html>
// Unit Converter with categories, swap, precision, quick table, theme + autosave
(function(){
  const $ = (s)=>document.querySelector(s);
  const els = {
    themeToggle: $('#themeToggle'),
    category: $('#category'),
    fromUnit: $('#fromUnit'),
    toUnit: $('#toUnit'),
    swapBtn: $('#swapBtn'),
    value: $('#value'),
    precision: $('#precision'),
    precisionOut: $('#precisionOut'),
    convertBtn: $('#convertBtn'),
    copyBtn: $('#copyBtn'),
    resetBtn: $('#resetBtn'),
    saveBtn: $('#saveBtn'),
    result: $('#result'),
    formula: $('#formula'),
    tableWrap: $('#tableWrap'),
  };

  (function initTheme(){
    const saved = localStorage.getItem('unit-theme');
    if(saved === 'light') document.documentElement.classList.add('light');
    els.themeToggle.textContent = document.documentElement.classList.contains('light') ? '🌙' : '☀️';
  })();
  els.themeToggle.addEventListener('click', ()=>{
    const isLight = document.documentElement.classList.toggle('light');
    localStorage.setItem('unit-theme', isLight ? 'light' : 'dark');
    els.themeToggle.textContent = isLight ? '🌙' : '☀️';
  });

  const CATS = {
    length: { label: 'Length', base: 'm', units: {
      km:{label:'Kilometer (km)',to:1000}, m:{label:'Meter (m)',to:1}, cm:{label:'Centimeter (cm)',to:0.01}, mm:{label:'Millimeter (mm)',to:0.001},
      mi:{label:'Mile (mi)',to:1609.344}, yd:{label:'Yard (yd)',to:0.9144}, ft:{label:'Foot (ft)',to:0.3048}, in:{label:'Inch (in)',to:0.0254}
    }},
    temperature: {
      label:'Temperature', base:'C',
      units:{ C:{label:'Celsius (°C)'}, F:{label:'Fahrenheit (°F)'}, K:{label:'Kelvin (K)'} },
      toBase:(v,u)=> u==='C'? v : (u==='F'? (v-32)*5/9 : (v-273.15)),
      fromBase:(v,u)=> u==='C'? v : (u==='F'? (v*9/5)+32 : (v+273.15)),
      formula:(from,to)=>{
        if(from==='C'&&to==='F') return '(°C × 9/5) + 32';
        if(from==='F'&&to==='C') return '(°F − 32) × 5/9';
        if(from==='C'&&to==='K') return '°C + 273.15';
        if(from==='K'&&to==='C') return 'K − 273.15';
        if(from==='F'&&to==='K') return '(°F − 32) × 5/9 + 273.15';
        if(from==='K'&&to==='F') return '(K − 273.15) × 9/5 + 32';
        return 'Linear conversion';
      }
    },
    area: { label:'Area', base:'m2', units:{
      km2:{label:'Square kilometer (km²)',to:1e6}, m2:{label:'Square meter (m²)',to:1}, cm2:{label:'Square centimeter (cm²)',to:1e-4},
      mm2:{label:'Square millimeter (mm²)',to:1e-6}, ha:{label:'Hectare (ha)',to:1e4}, acre:{label:'Acre (ac)',to:4046.8564224},
      mi2:{label:'Square mile (mi²)',to:2589988.110336}, yd2:{label:'Square yard (yd²)',to:0.83612736},
      ft2:{label:'Square foot (ft²)',to:0.09290304}, in2:{label:'Square inch (in²)',to:0.00064516}
    }},
    volume: { label:'Volume', base:'L', units:{
      m3:{label:'Cubic meter (m³)',to:1000}, L:{label:'Liter (L)',to:1}, mL:{label:'Milliliter (mL)',to:0.001}, cm3:{label:'Cubic centimeter (cm³)',to:0.001},
      gal:{label:'US gallon (gal)',to:3.785411784}, qt:{label:'US quart (qt)',to:0.946352946}, pt:{label:'US pint (pt)',to:0.473176473},
      cup:{label:'US cup',to:0.2365882365}, floz:{label:'US fluid ounce (fl oz)',to:0.0295735295625}
    }},
    weight: { label:'Weight', base:'kg', units:{
      t:{label:'Metric ton (t)',to:1000}, kg:{label:'Kilogram (kg)',to:1}, g:{label:'Gram (g)',to:0.001}, mg:{label:'Milligram (mg)',to:0.000001},
      lb:{label:'Pound (lb)',to:0.45359237}, oz:{label:'Ounce (oz)',to:0.028349523125}, st:{label:'Stone (st)',to:6.35029318}
    }},
    time: { label:'Time', base:'s', units:{
      y:{label:'Year (yr)*',to:31557600}, mo:{label:'Month (mo)*',to:2629800}, wk:{label:'Week (wk)',to:604800},
      d:{label:'Day (d)',to:86400}, h:{label:'Hour (h)',to:3600}, min:{label:'Minute (min)',to:60}, s:{label:'Second (s)',to:1}, ms:{label:'Millisecond (ms)',to:0.001}
    }}
  };

  (function initCategories(){
    els.category.innerHTML = '';
    Object.keys(CATS).forEach(key => {
      const opt = document.createElement('option');
      opt.value = key; opt.textContent = CATS[key].label;
      els.category.appendChild(opt);
    });
  })();

  function populateUnits(catKey){
    const cat = CATS[catKey];
    els.fromUnit.innerHTML = '';
    els.toUnit.innerHTML = '';
    Object.keys(cat.units).forEach(u => {
      const o1 = document.createElement('option');
      o1.value = u; o1.textContent = cat.units[u].label;
      const o2 = o1.cloneNode(true);
      els.fromUnit.appendChild(o1);
      els.toUnit.appendChild(o2);
    });
    const keys = Object.keys(cat.units);
    els.fromUnit.value = keys[0];
    els.toUnit.value = keys[1] || keys[0];
  }

  function toBase(v, catKey, unit){
    const cat = CATS[catKey];
    if(catKey === 'temperature') return cat.toBase(v, unit);
    return v * cat.units[unit].to;
  }
  function fromBase(v, catKey, unit){
    const cat = CATS[catKey];
    if(catKey === 'temperature') return cat.fromBase(v, unit);
    return v / cat.units[unit].to;
  }

  function formatNumber(n, decimals){
    if(!isFinite(n)) return '—';
    const abs = Math.abs(n);
    if(abs !== 0 && (abs < 0.001 || abs > 1e6)){
      return n.toExponential(Math.max(1, decimals));
    }
    return n.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: 0 });
  }

  function convert(){
    const catKey = els.category.value;
    const from = els.fromUnit.value;
    const to = els.toUnit.value;
    const val = parseFloat(els.value.value);
    const decimals = parseInt(els.precision.value,10) || 4;
    els.precisionOut.textContent = `${decimals} ${decimals===1?'decimal':'decimals'}`;

    if(!catKey || !from || !to || isNaN(val)){
      els.result.innerHTML = '—';
      els.copyBtn.disabled = true;
      els.formula.classList.add('hidden');
      return;
    }

    const base = toBase(val, catKey, from);
    const out = fromBase(base, catKey, to);
    const txt = `${formatNumber(val, decimals)} ${labelShort(from)} = <span class="big">${formatNumber(out, decimals)} ${labelShort(to)}</span>`;
    els.result.innerHTML = txt;
    els.copyBtn.disabled = false;

    if(catKey === 'temperature'){
      els.formula.textContent = 'Formula: ' + CATS.temperature.formula(from, to);
      els.formula.classList.remove('hidden');
    } else {
      els.formula.classList.add('hidden');
    }

    renderTable(catKey, base, decimals);
  }

  function labelShort(u){
    const cat = CATS[els.category.value];
    const full = cat.units[u].label;
    const m = /\(([^)]+)\)/.exec(full);
    return m ? m[1] : u;
  }

  function renderTable(catKey, baseVal, decimals){
    const cat = CATS[catKey];
    const rows = Object.keys(cat.units).map(u => {
      const v = formatNumber(fromBase(baseVal, catKey, u), decimals);
      return `<tr><td>${cat.units[u].label}</td><td>${v}</td></tr>`;
    }).join('');
    els.tableWrap.innerHTML = `<div class="table-scroll"><table><thead><tr><th>Unit</th><th>Value</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  els.swapBtn.addEventListener('click', ()=>{
    const a = els.fromUnit.value, b = els.toUnit.value;
    els.fromUnit.value = b; els.toUnit.value = a;
    convert();
  });

  els.precision.addEventListener('input', ()=>{
    const d = parseInt(els.precision.value,10) || 4;
    els.precisionOut.textContent = `${d} ${d===1?'decimal':'decimals'}`;
    convert();
  });

  els.copyBtn.addEventListener('click', async ()=>{
    try{
      const text = els.result.textContent.replace(/\s+/g,' ').trim();
      await navigator.clipboard.writeText(text);
      els.copyBtn.textContent = 'Copied!';
      setTimeout(()=> els.copyBtn.textContent = 'Copy result', 1200);
    }catch{ alert('Copy failed.'); }
  });

  els.resetBtn.addEventListener('click', ()=>{
    els.value.value = '';
    els.result.textContent = '—';
    els.tableWrap.textContent = 'Pick a category and enter a value to see top conversions.';
    els.copyBtn.disabled = true;
    els.formula.classList.add('hidden');
  });

  function autosave(){
    const s = {
      cat: els.category.value,
      from: els.fromUnit.value,
      to: els.toUnit.value,
      prec: els.precision.value,
    };
    localStorage.setItem('unit-state', JSON.stringify(s));
  }
  function restore(){
    try{
      const saved = JSON.parse(localStorage.getItem('unit-state') || '{}');
      const catKey = saved.cat || 'length';
      els.category.value = catKey;
      populateUnits(catKey);
      if(saved.from) els.fromUnit.value = saved.from;
      if(saved.to) els.toUnit.value = saved.to;
      els.precision.value = saved.prec || '4';
      els.precision.dispatchEvent(new Event('input'));
    }catch{
      els.category.value = 'length';
      populateUnits('length');
    }
  }
  els.saveBtn.addEventListener('click', autosave);

  els.category.addEventListener('change', ()=>{ populateUnits(els.category.value); convert(); });
  [els.fromUnit, els.toUnit].forEach(el => el.addEventListener('change', convert));
  els.value.addEventListener('input', convert);
  els.convertBtn.addEventListener('click', convert);
  window.addEventListener('keydown', (e)=>{ if((e.ctrlKey||e.metaKey) && e.key==='Enter') convert(); });

  restore();
})();

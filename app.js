(() => {
  const HISTORICAL_RETURNS = [
    0.4381, -0.0830, -0.2512, -0.4384, -0.0864, 0.4998, -0.0119, 0.4674, 0.3194, -0.3534,
    0.2928, -0.0110, -0.1067, -0.1277, 0.1917, 0.2506, 0.1903, 0.3582, -0.0818, 0.0520,
    0.0570, 0.1830, 0.3081, 0.2368, 0.1815, -0.0121, 0.5256, 0.3260, 0.0744, -0.1046,
    0.4336, 0.1196, 0.0053, 0.2664, -0.0881, 0.2261, 0.1642, 0.1240, -0.0997, 0.2380,
    0.1081, -0.0824, 0.0356, 0.1422, 0.1876, -0.1431, -0.2590, 0.3700, 0.2383, -0.0706,
    0.0651, 0.1844, 0.3250, -0.0492, 0.2141, 0.2246, 0.0611, 0.3173, 0.1867, 0.0525,
    0.1661, 0.3169, -0.0310, 0.3047, 0.0762, 0.1008, 0.0132, 0.3758, 0.2296, 0.3336,
    0.2858, 0.2104, -0.0910, -0.1189, -0.2210, 0.2868, 0.1088, 0.0491, 0.1579, 0.0549,
    -0.3849, 0.2646, 0.1506, 0.0211, 0.1600, 0.3239, 0.1369, 0.0138, 0.1196, 0.2183,
    -0.0438, 0.3149, 0.1840, 0.2871, -0.1811, 0.2629
  ];

  let accumChart, drawdownChart;
  let currentFireMode = 'spend';

  const defaultTooltipConfig = {
    mode: 'index',
    intersect: false,
    callbacks: {
      label: function(context) {
        let label = context.dataset.label || '';
        if (label) label += ': ';
        if (context.parsed.y !== null) label += '$' + Math.round(context.parsed.y).toLocaleString();
        return label;
      },
      labelColor: function(context) {
        const color = context.dataset.borderColor;
        return { borderColor: color, backgroundColor: color };
      }
    }
  };

  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const bodyEl = document.body;

  function setTheme(theme, refreshCharts = true) {
    bodyEl.setAttribute('data-theme', theme);
    localStorage.setItem('fire_calc_theme', theme);
    themeToggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    if (refreshCharts) {
      calcAccumulation();
      calcDrawdown();
    }
  }

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = bodyEl.getAttribute('data-theme');
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });

  const savedTheme = localStorage.getItem('fire_calc_theme') || 'dark';
  setTheme(savedTheme, false);

  function getThemeColors() {
    const isDark = bodyEl.getAttribute('data-theme') === 'dark';
    return {
      text: isDark ? '#e8eaf0' : '#1e293b',
      muted: isDark ? '#9aa3b2' : '#64748b',
      grid: isDark ? '#2a2f3a' : '#cbd5e1'
    };
  }

  function formatNumberWithCommas(n) {
    if (n === '' || isNaN(n)) return '';
    return Number(n).toLocaleString('en-US');
  }

  function initCurrencyInputs() {
    document.querySelectorAll('input[data-type="currency"]').forEach(input => {
      input.value = formatNumberWithCommas(input.value);

      input.addEventListener('focus', function() {
        this.value = this.value.replace(/,/g, '');
      });

      input.addEventListener('blur', function() {
        let val = parseFloat(this.value.replace(/,/g, ''));
        if (!isNaN(val)) {
          this.value = formatNumberWithCommas(val);
        } else {
          this.value = '';
        }
      });
    });
  }

  function getCleanInputValue(id) {
    const el = document.getElementById(id);
    if (!el) return 0;
    let valStr = el.value.toString().replace(/,/g, '');
    let val = parseFloat(valStr);
    return isNaN(val) ? 0 : val;
  }

  document.querySelectorAll('.tab').forEach(t=>{
    t.addEventListener('click',()=>{
      document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
      document.getElementById('panel-'+t.dataset.tab).classList.add('active');
    });
  });

  function fmt(n){ return '$'+Math.round(n).toLocaleString(); }

  function getClampedVal(id, min, max, fallback){
    const el = document.getElementById(id);
    let val = getCleanInputValue(id);
    if(isNaN(val)) val = fallback;
    val = Math.min(Math.max(val, min), max);
    el.value = el.dataset.type === 'currency' ? formatNumberWithCommas(val) : val;
    return val;
  }

  function bindEnterKey(containerId, buttonHandler){
    const container = document.getElementById(containerId);
    if(!container) return;
    container.querySelectorAll('input, select').forEach(el=>{
      el.addEventListener('keydown', (e)=>{
        if(e.key === 'Enter'){
          e.preventDefault();
          buttonHandler();
        }
      });
    });
  }

  const accumDrawerBtn = document.getElementById('accum-drawer-btn');
  const accumDrawer = document.getElementById('accum-drawer');
  accumDrawerBtn.addEventListener('click', () => {
    accumDrawer.classList.toggle('hidden');
    accumDrawerBtn.classList.toggle('open');
  });

  const toggleSpendBtn = document.getElementById('a-toggle-spend');
  const toggleFireBtn = document.getElementById('a-toggle-fire');
  const spendGroup = document.getElementById('a-spend-group');
  const firenumGroup = document.getElementById('a-firenum-group');
  const spendInput = document.getElementById('a-spend');
  const firenumInput = document.getElementById('a-firenum');

  function syncFireFromSpend() {
    const spendVal = getCleanInputValue('a-spend');
    const calculatedFire = spendVal * 25;
    firenumInput.value = formatNumberWithCommas(calculatedFire);
  }

  toggleSpendBtn.addEventListener('click', () => {
    currentFireMode = 'spend';
    toggleSpendBtn.classList.add('active');
    toggleFireBtn.classList.remove('active');
    spendGroup.classList.remove('hidden');
    firenumGroup.classList.add('hidden');
    syncFireFromSpend();
    calcAccumulation();
  });

  toggleFireBtn.addEventListener('click', () => {
    currentFireMode = 'fire';
    toggleFireBtn.classList.add('active');
    toggleSpendBtn.classList.remove('active');
    firenumGroup.classList.remove('hidden');
    spendGroup.classList.add('hidden');
    syncFireFromSpend();
    calcAccumulation();
  });

  spendInput.addEventListener('input', () => {
    if (currentFireMode === 'spend') {
      syncFireFromSpend();
    }
  });

  function calcAccumulation() {
    const portfolio = getClampedVal('a-portfolio', 0, 100000000, 100000);
    const contrib0 = getClampedVal('a-contrib', 0, 10000000, 20000);
    const r = getClampedVal('a-return', -50, 100, 7) / 100;
    const years = getClampedVal('a-years', 1, 100, 25);
    
    let fireNum;
    if (currentFireMode === 'spend') {
      const spend = getClampedVal('a-spend', 0, 10000000, 60000);
      fireNum = spend * 25;
    } else {
      fireNum = getClampedVal('a-firenum', 0, 100000000, 1500000);
    }

    const contribGrowth = getClampedVal('a-contribgrowth', -50, 50, 0) / 100;

    let rows = [];
    let activeBal = portfolio;
    let coastBal = portfolio;
    let contrib = contrib0;

    let activeFireYear = null;

    for (let y = 0; y <= 100; y++) {
      if (y <= years) {
        rows.push({ year: y, active: activeBal, coast: coastBal });
      }

      if (fireNum > 0 && activeBal >= fireNum && activeFireYear === null) {
        activeFireYear = y;
      }

      activeBal = activeBal * (1 + r) + contrib;
      coastBal = coastBal * (1 + r);
      contrib *= (1 + contribGrowth);
    }

    // Set standard projected portfolio card
    document.getElementById('a-stat-proj').textContent = fmt(rows[years].active);
    document.getElementById('a-stat-proj-sub').textContent = `at year ${years} with contributions`;

    // Calculate Active FIRE Target Card
    const activeStatEl = document.getElementById('a-stat-active-fire');
    const activeSubEl = document.getElementById('a-stat-active-fire-sub');

    if (fireNum <= 0) {
      activeStatEl.textContent = 'N/A';
      activeSubEl.textContent = 'Set a Spend or FIRE Target in Advanced Options';
    } else if (portfolio >= fireNum) {
      activeStatEl.textContent = 'Achieved!';
      activeSubEl.textContent = 'Current portfolio already hits target';
    } else if (activeFireYear !== null) {
      activeStatEl.textContent = activeFireYear + (activeFireYear === 1 ? ' Year' : ' Years');
      activeSubEl.textContent = `to hit ${fmt(fireNum)} while saving`;
    } else {
      activeStatEl.textContent = '> 100 Years';
      activeSubEl.textContent = `takes >100 years to reach ${fmt(fireNum)}`;
    }

    // Calculate Coast FIRE Target Card
    const coastStatEl = document.getElementById('a-stat-coast');
    const coastSubEl = document.getElementById('a-stat-coast-sub');

    if (fireNum <= 0) {
      coastStatEl.textContent = 'N/A';
      coastSubEl.textContent = 'Set a Spend or FIRE Target in Advanced Options';
    } else if (portfolio <= 0) {
      coastStatEl.textContent = 'Never';
      coastSubEl.textContent = 'Requires a starting balance to coast';
    } else if (fireNum <= portfolio) {
      coastStatEl.textContent = 'Achieved!';
      coastSubEl.textContent = 'Current portfolio already hits target';
    } else if (r <= 0) {
      coastStatEl.textContent = 'Never';
      coastSubEl.textContent = 'Return rate must be > 0%';
    } else {
      let reqYears = Math.log(fireNum / portfolio) / Math.log(1 + r);
      coastStatEl.textContent = reqYears.toFixed(1) + ' Years';
      coastSubEl.textContent = `to coast to ${fmt(fireNum)}`;
    }

    let milestones = [1];
    for (let i = 5; i <= years; i += 5) milestones.push(i);
    if (!milestones.includes(years) && years > 0) milestones.push(years);

    const tbody = document.querySelector('#a-table tbody');
    tbody.innerHTML = milestones.map(m => {
      const row = rows[m];
      return `<tr><td>Year ${m}</td><td>${fmt(row.active)}</td><td>${fmt(row.coast)}</td></tr>`;
    }).join('');

    const themeColors = getThemeColors();
    const ctx = document.getElementById('accumChart');
    if (accumChart) accumChart.destroy();

    let datasets = [
      {
        label: 'Active Savings Path',
        data: rows.map(r => r.active),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,.1)',
        fill: true,
        tension: 0.2,
        pointRadius: 0
      },
      {
        label: 'Coast Path (No Extra Savings)',
        data: rows.map(r => r.coast),
        borderColor: '#9aa3b2',
        borderDash: [5, 5],
        fill: false,
        tension: 0.2,
        pointRadius: 0
      }
    ];

    if (fireNum > 0) {
      datasets.push({
        label: 'FIRE Target',
        data: rows.map(() => fireNum),
        borderColor: '#33d69f',
        borderDash: [3, 3],
        fill: false,
        pointRadius: 0
      });
    }

    accumChart = new Chart(ctx, {
      type: 'line',
      data: { labels: rows.map(r => r.year), datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { 
          legend: { labels: { color: themeColors.text } },
          tooltip: defaultTooltipConfig
        },
        scales: {
          x: { ticks: { color: themeColors.muted }, grid: { color: themeColors.grid } },
          y: { ticks: { color: themeColors.muted, callback: v => '$' + (v / 1000).toFixed(0) + 'k' }, grid: { color: themeColors.grid } }
        }
      }
    });
  }

  document.getElementById('d-seqtype').addEventListener('change', toggleMonteCarloInput);
  document.getElementById('d-use-historical').addEventListener('change', toggleHistoricalInputs);
  document.getElementById('d-method').addEventListener('change', updateWithdrawalLabel);

  function updateWithdrawalLabel(){
    const method = document.getElementById('d-method').value;
    const label = document.getElementById('d-withdrawal-label');
    if(method === 'rate'){
      label.textContent = 'Withdrawal rate (%)';
    } else {
      label.textContent = 'Withdrawal amount ($)';
    }
  }

  function toggleMonteCarloInput(){
    const seqType = document.getElementById('d-seqtype').value;
    const settingsWrap = document.getElementById('d-mc-settings');
    const stdGroup = document.getElementById('d-stdreturn-group');
    const btn = document.getElementById('d-calc-btn');
    const compareBtn = document.getElementById('d-compare-btn');

    if (seqType === 'random' || seqType === 'montecarlo') {
      stdGroup.classList.remove('hidden');
    } else {
      stdGroup.classList.add('hidden');
    }

    if(seqType === 'montecarlo'){
      settingsWrap.classList.remove('hidden');
      compareBtn.classList.add('hidden');
      btn.textContent = 'Run Monte Carlo Simulation';
    } else {
      settingsWrap.classList.add('hidden');
      compareBtn.classList.remove('hidden');
      btn.textContent = 'Simulate';
    }

    toggleHistoricalInputs();
  }

  function toggleHistoricalInputs(){
    const seqType = document.getElementById('d-seqtype').value;
    const isHistorical = document.getElementById('d-use-historical').checked;
    
    if (seqType === 'montecarlo' && isHistorical) {
      document.getElementById('d-avgreturn').disabled = true;
      document.getElementById('d-stdreturn').disabled = true;
    } else {
      document.getElementById('d-avgreturn').disabled = false;
      document.getElementById('d-stdreturn').disabled = false;
    }
  }

  function getHistoricalSequence(years) {
    const seq = [];
    const startIdx = Math.floor(Math.random() * HISTORICAL_RETURNS.length);
    for (let i = 0; i < years; i++) {
      seq.push(HISTORICAL_RETURNS[(startIdx + i) % HISTORICAL_RETURNS.length]);
    }
    return seq;
  }

  function genReturns(type, years, avg, std){
    let seq=[];
    if(type==='flat'){ for(let i=0;i<years;i++) seq.push(avg); }
    else if(type==='random'){ for(let i=0;i<years;i++) seq.push(randNormal(avg,std)); }
    else if(type==='bad-early'){
      for(let i=0;i<years;i++){
        let factor = i < years*0.3 ? -1 : 1;
        seq.push(avg + factor*std*0.8);
      }
    } else if(type==='bad-late'){
      for(let i=0;i<years;i++){
        let factor = i > years*0.7 ? -1 : 1;
        seq.push(avg + factor*std*0.8);
      }
    }
    return seq;
  }

  function randNormal(mean,std){
    let u=0,v=0;
    while(u===0) u=Math.random();
    while(v===0) v=Math.random();
    return mean + std*Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);
  }

  function simulateDrawdown(portfolio, years, withdrawalRate, withdrawalAmount, returns, inflation){
    let balance=portfolio;
    let withdrawal = withdrawalAmount!=null?withdrawalAmount:portfolio*withdrawalRate;
    let rows=[]; let success=true; let depYear=null;
    for(let y=1;y<=years;y++){
      balance -= withdrawal;
      if(balance<=0){balance=0; success=false; depYear=y;}
      const r = returns[y-1]!=null?returns[y-1]:returns[returns.length-1];
      balance *= (1+r);
      rows.push({year:y,balance:balance,withdrawal:withdrawal,ret:r});
      withdrawal *= (1+inflation);
      if(!success) break;
    }
    return {rows,success,depYear};
  }

  function handleDrawdownCalculate(){
    const seqType = document.getElementById('d-seqtype').value;
    if(seqType === 'montecarlo'){
      calcMonteCarlo();
    } else {
      calcDrawdown();
    }
  }

  function showSingleRunUI(){
    document.getElementById('d-mc-result').classList.add('hidden');
    document.getElementById('d-mc-sub').classList.add('hidden');
    document.getElementById('d-endbal-row').classList.remove('hidden');
    document.getElementById('d-depyear-row').classList.remove('hidden');
    document.getElementById('d-returns-table-wrap').classList.remove('hidden');
  }

  function showMonteCarloUI(){
    document.getElementById('d-mc-result').classList.remove('hidden');
    document.getElementById('d-mc-sub').classList.remove('hidden');
    document.getElementById('d-endbal-row').classList.add('hidden');
    document.getElementById('d-depyear-row').classList.add('hidden');
    document.getElementById('d-returns-table-wrap').classList.add('hidden');
  }

  function updateReturnsTable(returns1, returns2 = null, label1 = 'Return (%)', label2 = 'Reversed Return (%)') {
    const wrap = document.getElementById('d-returns-table-wrap');
    wrap.classList.remove('hidden');
    const tbody = document.querySelector('#d-returns-table tbody');
    const th1 = document.getElementById('d-th-col1');
    const th2 = document.getElementById('d-th-col2');

    th1.textContent = label1;
    if (returns2) {
      th2.classList.remove('hidden');
      th2.textContent = label2;
    } else {
      th2.classList.add('hidden');
    }

    let html = '';
    for (let i = 0; i < returns1.length; i++) {
      let r1Val = (returns1[i] * 100).toFixed(2) + '%';
      let rowHtml = `<tr><td>${i + 1}</td><td>${r1Val}</td>`;
      if (returns2) {
        let r2Val = (returns2[i] * 100).toFixed(2) + '%';
        rowHtml += `<td>${r2Val}</td>`;
      }
      rowHtml += `</tr>`;
      html += rowHtml;
    }
    tbody.innerHTML = html;
  }

  function calcDrawdown(){
    showSingleRunUI();
    const portfolio = getClampedVal('d-portfolio', 0, 100000000, 1000000);
    const years = getClampedVal('d-years', 1, 100, 30);
    const method = document.getElementById('d-method').value;
    const wVal = getClampedVal('d-withdrawal', 0.1, 1000000, 4);
    const inflation = getClampedVal('d-inflation', -10, 50, 0) / 100;
    const seqType = document.getElementById('d-seqtype').value;
    const avg = getClampedVal('d-avgreturn', -50, 100, 7) / 100;
    const std = getClampedVal('d-stdreturn', 0, 100, 15) / 100;

    const returns = genReturns(seqType, years, avg, std);
    const wRate = method==='rate'? wVal/100 : null;
    const wAmt = method==='amount'? wVal : null;

    const res = simulateDrawdown(portfolio, years, wRate, wAmt, returns, inflation);
    document.getElementById('d-badge').innerHTML = res.success?
      '<span class="badge ok" style="padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;background:rgba(51,214,159,.15);color:var(--accent2)">SUCCESS — money lasted full duration</span>':
      '<span class="badge no" style="padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;background:rgba(255,92,92,.15);color:var(--danger)">FAILED — depleted in year '+res.depYear+'</span>';
    document.getElementById('d-endbal').textContent = fmt(res.rows[res.rows.length-1].balance);
    document.getElementById('d-depyear').textContent = res.depYear || 'N/A';

    updateReturnsTable(returns, null, 'Return (%)');
    drawChart('drawdownChart', [res.rows], ['Portfolio balance']);
  }

  async function calcMonteCarlo(){
    showMonteCarloUI();
    const btn = document.getElementById('d-calc-btn');
    btn.disabled = true;
    btn.textContent = 'Calculating...';

    const portfolio = getClampedVal('d-portfolio', 0, 100000000, 1000000);
    const years = getClampedVal('d-years', 1, 100, 30);
    const method = document.getElementById('d-method').value;
    const wVal = getClampedVal('d-withdrawal', 0.1, 1000000, 4);
    const inflation = getClampedVal('d-inflation', -10, 50, 3) / 100;
    const avg = getClampedVal('d-avgreturn', -50, 100, 7) / 100;
    const std = getClampedVal('d-stdreturn', 0, 100, 15) / 100;
    const sims = getClampedVal('d-simcount', 100, 50000, 1000);
    const useHistorical = document.getElementById('d-use-historical').checked;

    const wRate = method==='rate'? wVal/100 : null;
    const wAmt = method==='amount'? wVal : null;

    const resultEl = document.getElementById('d-mc-result');
    resultEl.textContent = 'Running...';
    resultEl.className = 'result-hero';
    document.getElementById('d-badge').innerHTML = '';

    let successes = 0;
    let sampleTrajectories = [];
    const chunkSize = 2000;

    for(let i = 0; i < sims; i += chunkSize) {
      const chunkEnd = Math.min(i + chunkSize, sims);
      for(let j = i; j < chunkEnd; j++){
        let returns = [];
        if (useHistorical) {
          returns = getHistoricalSequence(years);
        } else {
          for(let y=0;y<years;y++) returns.push(randNormal(avg,std));
        }
        
        const res = simulateDrawdown(portfolio, years, wRate, wAmt, returns, inflation);
        if(res.success) successes++;
        if(j < 30) sampleTrajectories.push(res.rows);
      }
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    const prob = successes / sims;
    resultEl.textContent = (prob*100).toFixed(1)+'%';
    resultEl.className = 'result-hero ' + (prob>0.85?'success':(prob<0.6?'fail':''));
    
    drawMonteCarloChart(sampleTrajectories);
    btn.disabled = false;
    btn.textContent = 'Run Monte Carlo Simulation';
  }

  function compareSequences(){
    showSingleRunUI();
    const portfolio = getClampedVal('d-portfolio', 0, 100000000, 1000000);
    const years = getClampedVal('d-years', 1, 100, 30);
    const method = document.getElementById('d-method').value;
    const wVal = getClampedVal('d-withdrawal', 0.1, 1000000, 4);
    const inflation = getClampedVal('d-inflation', -10, 50, 3) / 100;
    const avg = getClampedVal('d-avgreturn', -50, 100, 7) / 100;
    const std = getClampedVal('d-stdreturn', 0, 100, 15) / 100;
    const wRate = method==='rate'? wVal/100 : null;
    const wAmt = method==='amount'? wVal : null;

    const seqType = document.getElementById('d-seqtype').value;
    const base = genReturns(seqType, years, avg, std);
    const rev = [...base].reverse();

    const fwd = simulateDrawdown(portfolio, years, wRate, wAmt, base, inflation);
    const rv = simulateDrawdown(portfolio, years, wRate, wAmt, rev, inflation);

    document.getElementById('d-badge').innerHTML =
      'Forward: '+(fwd.success?'<span style="padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;background:rgba(51,214,159,.15);color:var(--accent2)">SUCCESS</span>':'<span style="padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;background:rgba(255,92,92,.15);color:var(--danger)">FAILED yr '+fwd.depYear+'</span>')+
      '  &nbsp; Reversed: '+(rv.success?'<span style="padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;background:rgba(51,214,159,.15);color:var(--accent2)">SUCCESS</span>':'<span style="padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;background:rgba(255,92,92,.15);color:var(--danger)">FAILED yr '+rv.depYear+'</span>');
    document.getElementById('d-endbal').textContent = fmt(fwd.rows[fwd.rows.length-1].balance)+' / '+fmt(rv.rows[rv.rows.length-1].balance);
    document.getElementById('d-depyear').textContent = (fwd.depYear||'N/A')+' / '+(rv.depYear||'N/A');

    updateReturnsTable(base, rev, 'Forward Return (%)', 'Reversed Return (%)');
    drawChart('drawdownChart', [fwd.rows, rv.rows], ['Forward order ('+seqType+')','Reversed order']);
  }

  function drawChart(canvasId, rowsArr, labels){
    const ctx = document.getElementById(canvasId);
    if(drawdownChart) drawdownChart.destroy();
    const colors=['#2563eb','#d97706','#059669'];
    const maxLen = Math.max(...rowsArr.map(r=>r.length));
    const themeColors = getThemeColors();
    drawdownChart = new Chart(ctx,{
      type:'line',
      data:{labels:Array.from({length:maxLen},(_,i)=>i+1),
        datasets:rowsArr.map((rows,i)=>({label:labels[i],data:rows.map(r=>r.balance),
          borderColor:colors[i],backgroundColor:colors[i]+'22',fill:false,tension:.15,pointRadius:0}))},
      options:{
        responsive:true,
        maintainAspectRatio:false,
        interaction:{ mode:'index', intersect:false },
        plugins:{
          legend:{labels:{color:themeColors.text}},
          tooltip: defaultTooltipConfig
        },
        scales:{x:{title:{display:true,text:'Year',color:themeColors.muted},ticks:{color:themeColors.muted},grid:{color:themeColors.grid}},
          y:{ticks:{color:themeColors.muted,callback:v=>'$'+(v/1000).toFixed(0)+'k'},grid:{color:themeColors.grid}}}}
    });
  }

  function drawMonteCarloChart(sampleTrajectories){
    const ctx = document.getElementById('drawdownChart');
    if(drawdownChart) drawdownChart.destroy();
    const maxLen = Math.max(...sampleTrajectories.map(r=>r.length), 1);
    const themeColors = getThemeColors();
    drawdownChart = new Chart(ctx,{
      type:'line',
      data:{labels:Array.from({length:maxLen},(_,i)=>i+1),
        datasets:sampleTrajectories.map((rows, idx)=>({
          label:`Simulation ${idx + 1}`,
          data:rows.map(r=>r.balance),
          borderColor: rows[rows.length-1].balance<=0? 'rgba(220,38,38,0.5)':'rgba(37,99,235,0.35)',
          borderWidth:1, pointRadius:0, fill:false
        }))},
      options:{
        responsive:true,
        maintainAspectRatio:false,
        interaction:{ mode:'nearest', intersect:false },
        plugins:{
          legend:{display:false},
          tooltip: {
            mode: 'nearest',
            intersect: false,
            callbacks: {
              label: function(context) {
                return `$${Math.round(context.parsed.y).toLocaleString()}`;
              },
              labelColor: function(context) {
                const color = context.dataset.borderColor;
                return { borderColor: color, backgroundColor: color };
              }
            }
          }
        },
        scales:{x:{title:{display:true,text:'Year',color:themeColors.muted},ticks:{color:themeColors.muted},grid:{color:themeColors.grid}},
          y:{ticks:{color:themeColors.muted,callback:v=>'$'+(v/1000).toFixed(0)+'k'},grid:{color:themeColors.grid}}}}
    });
  }

  document.addEventListener('touchstart', function(e) {
    const accumCanvas = document.getElementById('accumChart');
    const drawdownCanvas = document.getElementById('drawdownChart');

    const touchedAccum = accumCanvas && accumCanvas.contains(e.target);
    const touchedDrawdown = drawdownCanvas && drawdownCanvas.contains(e.target);

    if (!touchedAccum && accumChart) {
      accumChart.setActiveElements([], { x: 0, y: 0 });
      if (accumChart.tooltip) {
        accumChart.tooltip.setActiveElements([], { x: 0, y: 0 });
      }
      accumChart.update();
    }

    if (!touchedDrawdown && drawdownCanvas) {
      drawdownChart.setActiveElements([], { x: 0, y: 0 });
      if (drawdownChart.tooltip) {
        drawdownChart.tooltip.setActiveElements([], { x: 0, y: 0 });
      }
      drawdownChart.update();
    }
  }, { passive: true });

  initCurrencyInputs();
  syncFireFromSpend();

  document.getElementById('a-calc-btn').addEventListener('click', calcAccumulation);
  document.getElementById('d-calc-btn').addEventListener('click', handleDrawdownCalculate);
  document.getElementById('d-compare-btn').addEventListener('click', compareSequences);

  bindEnterKey('accum-inputs', calcAccumulation);
  bindEnterKey('drawdown-inputs', handleDrawdownCalculate);

  toggleMonteCarloInput();
  calcAccumulation();
  calcDrawdown();

})();
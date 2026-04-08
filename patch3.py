import re
import os

##### 1. PATCH INDEX.HTML #####
with open("index.html", "r", encoding="utf-8") as f:
    idx_content = f.read()

# Add 15 new destinations
NEW_DESTS = """                <option value="Bali">🌺 Bali</option>
                <option value="Delhi">🏛️ Delhi & Taj Mahal</option>
                <option value="Paris">🗼 Paris</option>
                <option value="Tokyo">🌸 Tokyo</option>
                <option value="Rome">🏛️ Rome</option>
                <option value="New_York">🗽 New York</option>
                <option value="London">🎡 London</option>
                <option value="Maldives">🏝️ Maldives</option>
                <option value="Singapore">🦁 Singapore</option>
                <option value="Switzerland">⛷️ Switzerland</option>
                <option value="Phuket">🏝️ Phuket</option>
                <option value="Sydney">🦘 Sydney</option>
                <option value="Istanbul">🕌 Istanbul</option>
                <option value="Cape_Town">🐧 Cape Town</option>
                <option value="Amsterdam">🚲 Amsterdam</option>
                <option value="Barcelona">💃 Barcelona</option>
                <option value="Kashmir">🏔️ Kashmir</option>
                <option value="Jaisalmer">🐪 Jaisalmer</option>
                <option value="Wayanad">🌿 Wayanad</option>
                <option value="Meghalaya">🌧️ Meghalaya</option>
                <option value="Spiti">⛰️ Spiti Valley</option>
                <option value="Bangkok">🛕 Bangkok</option>
                <option value="Athens">🏛️ Athens</option>"""

idx_content = re.sub(r'<option value="Bali">.*?</select>', NEW_DESTS + "\n              </select>", idx_content, flags=re.DOTALL)

# Add Weather, Nearby, Packing List, Local Guide HTML
NEW_HTML = """
      <!-- Local Guide Button -->
      <div style="text-align: center; margin-bottom: 2rem;">
        <button id="localGuideBtn" class="btn-primary" style="background: var(--bg-hover); color: white; gap: 8px;">
          <i data-lucide="users"></i> Book a Local Guide
        </button>
      </div>

      <!-- Packing & Weather -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
        <div class="result-card" style="background: var(--bg-card);">
          <h3 class="card-title"><i data-lucide="cloud-sun" class="card-icon"></i> Local Weather & Pack List</h3>
          <div id="weatherBox" style="margin-bottom: 1rem; padding: 1rem; border-radius: 8px; background: rgba(0,0,0,0.1); display: flex; justify-content: space-between;">
             <div><strong>Temp:</strong> <span id="w_temp">--</span></div>
             <div><strong>Type:</strong> <span id="w_cond">--</span></div>
          </div>
          <h4 style="margin-bottom: 0.5rem;">Mandatory to Carry:</h4>
          <ul id="packingList" style="list-style-type: none; padding-left: 0; line-height: 1.8;">
          </ul>
        </div>
        
        <div class="result-card" style="background: var(--bg-card);">
          <h3 class="card-title"><i data-lucide="map" class="card-icon"></i> Nearby Escapes (< 200km)</h3>
          <div class="attractions-grid" id="nearbyList" style="display: flex; flex-direction: column; gap: 1rem;">
             <!-- Nearby places injected here -->
          </div>
        </div>
      </div>
      
      <!-- Attractions Grid -->
"""

idx_content = idx_content.replace('<!-- Attractions Grid -->', NEW_HTML)
with open("index.html", "w", encoding="utf-8") as f:
    f.write(idx_content)


##### 2. PATCH APP.JS #####
with open("app.js", "r", encoding="utf-8") as f:
    app_content = f.read()

# Fix handleEstimate error (remove compareCards toggle inside fetch which was failing)
NEW_HANDLE = """async function handleEstimate() {
  const dest = $("destination").value;
  if (!dest) { shakeBtn(); return; }

  const nights = calculatedNights;
  const days   = calculatedDays;
  const adults = parseInt(adultsVal.textContent);
  const kids   = parseInt(kidsVal.textContent);
  const seniors = parseInt(seniorsVal.textContent);
  const hotel  = $("hotelType").value;
  const foodType = $("foodType").value;
  const selectedStyle = document.querySelector('input[name="tripStyle"]:checked');
  const luxuryMult = (selectedStyle ? parseInt(selectedStyle.value) : 50) / 100;
  const meals = {
    breakfast: $("mealBreakfast").checked,
    brunch:    $("mealBrunch").checked,
    lunch:     $("mealLunch").checked,
    dinner:    $("mealDinner").checked,
  };

  outputSection.classList.add("visible");
  loadingState.classList.add("active");
  resultsGrid.classList.remove("visible");
  outputSection.scrollIntoView({ behavior: "smooth", block: "start" });

  try {
    const res = await fetch('/api/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dest, nights, days, adults, kids, seniors, hotel, foodType, meals, luxuryMult })
    });
    
    if (!res.ok) throw new Error("API failed");
    
    const data = await res.json();
    
    loadingState.classList.remove("active");
    resultsGrid.classList.add("visible");
    
    renderTotalCard(data.costs, dest, nights, days, adults, kids, seniors, hotel, data.rangeL, data.rangeH, data.info);
    renderChart(data.costs);
    renderInsights(data.season, data.insights);
    renderSuggestions(data.suggestions);
    renderBreakdownTable(data.costs);
    renderAttractions(data.attractions, dest);
    renderTransport(data.transport, dest);
    
    // NEW RENDERERS
    renderWeatherAndPacking(data.weather, data.packing);
    renderNearby(data.nearby);
    
    if(document.getElementById("compareCards")) {
       document.getElementById("compareCards").classList.remove("visible");
    }
    
    lucide.createIcons();
    
    // Bind Local Guide Button
    const guideBtn = document.getElementById("localGuideBtn");
    if(guideBtn) {
        guideBtn.onclick = () => alert("Connecting you to verified local guides in " + dest + " soon!");
    }
    
  } catch (error) {
    console.error("Failed to fetch estimate", error);
    loadingState.classList.remove("active");
    alert("Error fetching estimation from backend! Is the Node server running?");
  }
}
"""

app_content = re.sub(r'async function handleEstimate\(\).*?\}\n\}', NEW_HANDLE, app_content, flags=re.DOTALL)

# Add Renderers for Nearby & Weather/Packing
NEW_RENDERERS = """
function renderWeatherAndPacking(weather, packing) {
  const wTemp = document.getElementById("w_temp");
  const wCond = document.getElementById("w_cond");
  if(wTemp && wCond) {
      wTemp.textContent = weather.temp;
      wCond.textContent = weather.condition;
  }
  
  const plist = document.getElementById("packingList");
  if(plist) {
      plist.innerHTML = packing.map(p => `<li>✅ ${p}</li>`).join("");
  }
}

function renderNearby(nearbyList) {
  const container = document.getElementById("nearbyList");
  if (!container) return;
  if (nearbyList.length === 0) {
    container.innerHTML = `<p style="padding:16px; color:var(--text-muted); font-size:0.9rem;">No nearby places listed.</p>`;
    return;
  }
  container.innerHTML = nearbyList.map((item, i) => `
    <div class="attraction-item" style="animation: fadeUp 0.5s ease-out ${i*0.1}s both;">
      <div class="att-head">
        <h4 class="att-name">🚗 ${item.name}</h4>
        <span class="att-cost">${item.dist}</span>
      </div>
      <p class="att-desc">${item.desc}</p>
    </div>
  `).join("");
}

function renderTransport(list, dest) {
  const container = document.getElementById("transportList");
  if (!container) return;
  if (list.length === 0) return;
  
  container.innerHTML = list.map((item, i) => `
    <div class="transport-item ${item.type ? item.type.toLowerCase() : ''}" style="animation: fadeUp 0.5s ease-out ${i*0.1}s both;">
      <div class="trans-head">
        <h4 class="trans-mode">🚖 ${item.mode}</h4>
        <span class="trans-cost">${formatCurrency(item.price)} <small>avg.</small></span>
      </div>
      <p class="trans-desc">${item.desc}</p>
      ${item.type ? `<small style="background:var(--bg-hover); padding: 2px 6px; border-radius: 4px; font-size:0.75rem;">${item.type} Class</small>` : ''}
    </div>
  `).join("");
}
"""

app_content = re.sub(r'function renderTransport[\s\S]*$', NEW_RENDERERS, app_content)

with open("app.js", "w", encoding="utf-8") as f:
    f.write(app_content)

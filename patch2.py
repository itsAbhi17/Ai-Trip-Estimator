import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove data variables
content = re.sub(r'const HOTEL_RATES = \{.*?\n\};\n+const CHART_COLORS', 'const CHART_COLORS', content, flags=re.DOTALL)
content = re.sub(r'const FOOD_RATES = \{.*?\n\};\n+', '', content, flags=re.DOTALL)
content = re.sub(r'const ACTIVITY_RATES = \{.*?\n\};\n+', '', content, flags=re.DOTALL)
content = re.sub(r'const DESTINATION_INFO = \{.*?\n\};\n+', '', content, flags=re.DOTALL)

# 2. Re-write handleEstimate and calcCost
# Actually we can just find 'function calcCost' all the way down to 'function shakeBtn()' and replace it.

part1 = content.split('function calcCost')[0]
part2 = 'function shakeBtn()' + content.split('function shakeBtn()')[1]

new_handle_estimate = """
async function handleEstimate() {
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
    
    // Compare Cards feature (frontend fallback or can just be disabled, let's keep it disabled for now)
    compareCards.classList.remove("visible");
    
    lucide.createIcons();
  } catch (error) {
    console.error("Failed to fetch estimate", error);
    loadingState.classList.remove("active");
    alert("Error fetching estimation from backend. Is the server running?");
  }
}

"""

new_content = part1 + new_handle_estimate + part2

# 3. Re-write the render functions because they no longer have access to data.*
# I will replace the render helpers blocks.

new_content = new_content.replace(
"""function renderTotalCard(costs, dest, nights, days, adults, kids, seniors, hotel, rangeL, rangeH) {""",
"""function renderTotalCard(costs, dest, nights, days, adults, kids, seniors, hotel, rangeL, rangeH, info) {""")

new_content = new_content.replace(
"""$("costMeta").textContent = `${DESTINATION_INFO[dest]?.emoji ?? "✈️"} ${dest} · ${duration} · ${travelerParts.join(", ")} · ${hotelLabel(hotel)}`;""",
"""$("costMeta").textContent = `${info?.emoji ?? "✈️"} ${dest} · ${duration} · ${travelerParts.join(", ")} · ${hotelLabel(hotel)}`;""")

# Replace insights
new_content = re.sub(r'function renderInsights\(.*?\).*?function renderSuggestions', 
"""function renderInsights(season, insights) {
  $("seasonVal").textContent = season;
  $("insightsList").innerHTML = insights.map((ins) =>
    `<div class="insight-item info">
       <span class="insight-icon">💡</span>
       <span>${ins}</span>
     </div>`
  ).join("");
}

function renderSuggestions""", new_content, flags=re.DOTALL)

# Replace suggestions
new_content = re.sub(r'function renderSuggestions\([^)]+\) \{.*?function renderBreakdownTable',
"""function renderSuggestions(suggestions) {
  $("suggestionsList").innerHTML = suggestions.slice(0, 4).map((s) =>
    `<div class="suggestion-item">
       <span class="sugg-text">💡 ${s.text}</span>
       <span class="sugg-save">Save ${formatCurrency(Math.abs(s.saving))}</span>
     </div>`
  ).join("");
}

function renderBreakdownTable""", new_content, flags=re.DOTALL)

# Replace attractions
new_content = re.sub(r'function renderAttractions\(dest\) \{.*?function renderTransport',
"""function renderAttractions(list, dest) {
  const container = $("attractionsList");
  if (!container) return;
  if (list.length === 0) {
    container.innerHTML = `<p style="padding:16px; color:var(--text-muted); font-size:0.9rem;">No specific attractions data available for ${dest}.</p>`;
    return;
  }
  container.innerHTML = list.map((item, i) => `
    <div class="attraction-item" style="animation: fadeUp 0.5s ease-out ${i*0.1}s both;">
      <div class="att-head">
        <h4 class="att-name">📍 ${item.name}</h4>
        <span class="att-cost">${item.cost > 0 ? formatCurrency(item.cost) : 'Free Entry'}</span>
      </div>
      <p class="att-desc">${item.desc}</p>
      <div class="att-time">
        <i data-lucide="clock" class="att-time-icon"></i> Time to visit: <strong>${item.time}</strong>
      </div>
    </div>
  `).join("");
}

function renderTransport""", new_content, flags=re.DOTALL)

# Replace transport
new_content = re.sub(r'function renderTransport\(dest\) \{.*?$',
"""function renderTransport(list, dest) {
  const container = $("transportList");
  if (!container) return;
  if (list.length === 0) {
    container.innerHTML = `<p style="padding:16px; color:var(--text-muted); font-size:0.9rem;">No local transport details available for ${dest}.</p>`;
    return;
  }
  container.innerHTML = list.map((item, i) => `
    <div class="transport-item" style="animation: fadeUp 0.5s ease-out ${i*0.1}s both;">
      <div class="trans-head">
        <h4 class="trans-mode">🚖 ${item.mode}</h4>
        <span class="trans-cost">${formatCurrency(item.price)} <small>avg.</small></span>
      </div>
      <p class="trans-desc">${item.desc}</p>
    </div>
  `).join("");
}
""", new_content, flags=re.DOTALL)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

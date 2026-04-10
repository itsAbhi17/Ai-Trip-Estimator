/* ═══════════════════════════════════════════════════════════════
   AI TRIP COST ESTIMATOR – app.js
   All business logic, cost calculation, chart rendering, UI interactions
═══════════════════════════════════════════════════════════════ */

"use strict";

// ════════════════════════════════════════
// ROTATING HERO BADGE TAGLINES
// ════════════════════════════════════════
const TAGLINES = [
  "Budget Smarter. Explore Further. 🌏",
  "Your AI Travel CFO is Ready ✈️",
  "Pack Light. Plan Right. 🎒",
  "Turn Dreams into Destinations 🗺️",
  "Stop Guessing. Start Exploring. 🚀",
  "AI That Thinks Before You Pack 🧠",
];
let taglineIdx = 0;
function rotateTagline() {
  const el = document.getElementById("badgeTagline");
  if (!el) return;
  el.style.transition = "opacity 0.4s ease";
  el.style.opacity = "0";
  setTimeout(() => {
    taglineIdx = (taglineIdx + 1) % TAGLINES.length;
    el.textContent = TAGLINES[taglineIdx];
    el.style.opacity = "1";
  }, 420);
}
setInterval(rotateTagline, 3000);

const CHART_COLORS = ["#FF6B6B", "#4ECDC4", "#FFD700", "#A78BFA"];
const CATEGORIES = ["Stay", "Food", "Activities", "Misc"];

// ════════════════════════════════════════
// STATE
// ════════════════════════════════════════
let pieChart = null;

// ════════════════════════════════════════
// DOM REFERENCES
// ════════════════════════════════════════
const $ = (id) => document.getElementById(id);

const startDate = $("startDate");
const endDate = $("endDate");
const calculatedDuration = $("calculatedDuration");
let calculatedNights = 4;
let calculatedDays = 5;

// Init dates
function initDates() {
  const today = new Date();
  const tmrw = new Date(today);
  tmrw.setDate(tmrw.getDate() + 4);
  
  if (startDate && endDate) {
    startDate.value = today.toISOString().split('T')[0];
    endDate.value = tmrw.toISOString().split('T')[0];
    
    const updateDuration = () => {
      const start = new Date(startDate.value);
      const end = new Date(endDate.value);
      
      if (end >= start) {
        const diffTime = Math.abs(end - start);
        calculatedNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        calculatedDays = calculatedNights + 1;
        if(calculatedDuration) {
          calculatedDuration.textContent = `${calculatedNights} Night${calculatedNights !== 1 ? 's' : ''} / ${calculatedDays} Day${calculatedDays !== 1 ? 's' : ''}`;
        }
      } else {
        if(calculatedDuration) {
          calculatedDuration.textContent = "End date must be after start date";
        }
        calculatedNights = 1;
        calculatedDays = 2;
      }
    };
    
    startDate.addEventListener("change", () => {
      if (new Date(endDate.value) < new Date(startDate.value)) {
        const newEnd = new Date(startDate.value);
        newEnd.setDate(newEnd.getDate() + 1);
        endDate.value = newEnd.toISOString().split('T')[0];
      }
      updateDuration();
    });
    endDate.addEventListener("change", updateDuration);
    updateDuration();
  }
}

const totalInc   = $("increaseTotal");
const totalDec   = $("decreaseTotal");
const totalVal   = $("totalValue");
const adultsInc  = $("increaseAdults");
const adultsDec  = $("decreaseAdults");
const adultsVal  = $("adultsValue");
const kidsInc    = $("increaseKids");
const kidsDec    = $("decreaseKids");
const kidsVal    = $("kidsValue");
const seniorsInc = $("increaseSeniors");
const seniorsDec = $("decreaseSeniors");
const seniorsVal = $("seniorsValue");

const estimateBtn = $("estimateBtn");
const resetBtn = $("resetBtn");
const outputSection = $("outputSection");
const loadingState = $("loadingState");
const resultsGrid = $("resultsGrid");
const comparePlans = $("comparePlans");
const compareCards = $("compareCards");

// ════════════════════════════════════════
// DESTINATION FLAIR DATA
const DEST_FLAIR = {
  "Goa":       { quote: "Susegad!",                         tagline: "The Goan art of relaxed living 🏖️",              bg: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1600&q=80" },
  "Manali":    { quote: "Valley of Gods",                   tagline: "Adventure awaits in the Himalayas 🏔️",          bg: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1600&q=90" },
  "Kerala":    { quote: "Namaskaram",                       tagline: "Peace in God's Own Country 🌴",                 bg: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1600&q=80" },
  "Jaipur":    { quote: "Padharo Mhare Des",                tagline: "Welcome to the Royal Pink City 🏰",             bg: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1600&q=80" },
  "Dubai":     { quote: "Marhaba!",                         tagline: "Luxury meets the Desert dunes 🌆",               bg: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1600&q=80" },
  "Leh":       { quote: "Julley!",                          tagline: "Breathtaking altitudes and monasteries 🛵",       bg: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80" },
  "Rishikesh": { quote: "Om Shanti",                        tagline: "The Yoga Capital of the World 🧘",                bg: "https://images.unsplash.com/photo-1545105597-401456a92843?w=1600&q=90" },
  "Darjeeling":{ quote: "Queen of the Hills",               tagline: "Tea gardens and Kanchenjunga views 🚂",           bg: "https://images.unsplash.com/photo-1544256221-a3f2db014af1?w=1600&q=80" },
  "Andaman":   { quote: "Tropical Paradise",                tagline: "Crystal clear waters and coral reefs 🐠",         bg: "https://images.unsplash.com/photo-1589135398309-1723c3b1424b?w=1600&q=90" },
  "Varanasi":  { quote: "City of Light",                    tagline: "The spiritual heart of India 🕉️",                bg: "https://images.unsplash.com/photo-1590050752117-2346761001bc?w=1600&q=90" },
  "Kutch":     { quote: "Kutch Nahi Dekha Toh Kuch Nahi",   tagline: "The surreal White Desert of Gujarat 🏜️",       bg: "https://images.unsplash.com/photo-1549114674-0af4ef52194b?w=1600&q=90" },
  "Bali":      { quote: "Island of the Gods",               tagline: "Tropical beaches and lush rice terraces 🌺",    bg: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&q=80" },
  "Delhi":     { quote: "Dilwalon ki Dilli",                tagline: "Historic avenues and the Taj Mahal 🏛️",         bg: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1600&q=80" },
};

function initDestinationFlair() {
  const destSelect = $("destination");
  const plannerSection = document.querySelector('.planner-section');
  const flairBox = $("destFlair");
  const flairQuote = $("flairQuote");
  const flairTagline = $("flairTagline");

  destSelect.addEventListener("change", () => {
    const val = destSelect.value;
    if (DEST_FLAIR[val]) {
      const data = DEST_FLAIR[val];
      // Update Background
      plannerSection.style.backgroundImage = `url('${data.bg}')`;
      plannerSection.classList.add('has-bg');
      
      // Update Quote with Animation
      flairQuote.textContent = data.quote;
      flairTagline.textContent = data.tagline;
      flairBox.style.display = 'inline-flex';
      
      // Trigger simple animation restart
      flairBox.style.animation = 'none';
      flairBox.offsetHeight; /* trigger reflow */
      flairBox.style.animation = null;
    } else {
      plannerSection.style.backgroundImage = 'none';
      plannerSection.classList.remove('has-bg');
      flairBox.style.display = 'none';
    }
  });
}

function init() {
  lucide.createIcons();
  initDates();
  initStepper();
  initSliders();
  initDestinationFlair();
  initMealToggles();
  initDestPlanBtns();
  initDarkMode();
  initPrint();
  
  estimateBtn.addEventListener("click", handleEstimate);
  if (resetBtn) resetBtn.addEventListener("click", handleReset);
  comparePlans.addEventListener("change", toggleCompareCards);
  $("toggleAllMeals").addEventListener("click", handleToggleAllMeals);
  
  const currencySelect = $("currency");
  if (currencySelect) {
    currencySelect.addEventListener("change", () => {
      if (outputSection.classList.contains("visible") && !loadingState.classList.contains("active")) {
        handleEstimate(); // re-calculate when currency is changed
      }
    });
  }
}

function initDarkMode() {
  const themeToggle = $("themeToggle");
  if (!themeToggle) return;
  const icon = themeToggle.querySelector("i");
  
  const currentTheme = localStorage.getItem("theme") || "light";
  if (currentTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    icon.setAttribute("data-lucide", "sun");
  }
  
  themeToggle.addEventListener("click", () => {
    let theme = document.documentElement.getAttribute("data-theme");
    if (theme === "dark") {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
      icon.setAttribute("data-lucide", "moon");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
      icon.setAttribute("data-lucide", "sun");
    }
    lucide.createIcons();
  });
}

function initPrint() {
  const btn = $("downloadPlanBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    window.print();
  });
}

function handleReset() {
  $("destination").value = "";
  
  // Clear dates instead of resetting to today
  if ($("startDate")) $("startDate").value = "";
  if ($("endDate")) $("endDate").value = "";
  if ($("calculatedDuration")) $("calculatedDuration").textContent = "Select dates";
  calculatedNights = 4; // Reset internal values for safe fallbacks
  calculatedDays = 5;
  
  adultsVal.textContent = "2";
  kidsVal.textContent = "0";
  seniorsVal.textContent = "0";
  totalVal.textContent = "2";
  $("hotelType").value = "3star";
  $("foodType").value = "nonveg";
  
  ["Breakfast", "Lunch", "Dinner"].forEach((meal) => {
    $("meal" + meal).checked = true;
    $("toggle" + meal).classList.add("active");
  });
  $("mealBrunch").checked = false;
  $("toggleBrunch").classList.remove("active");
  
  const toggleBtn = $("toggleAllMeals");
  if (toggleBtn) toggleBtn.textContent = "Select All";
  
  const tripStyles = document.querySelectorAll('input[name="tripStyle"]');
  tripStyles.forEach(ts => {
    ts.checked = (ts.value === "80");
  });
  
  comparePlans.checked = false;
  outputSection.classList.remove("visible");
  resultsGrid.classList.remove("visible");
  
  // reset flair
  const flairBox = $("destFlair");
  const plannerSection = document.querySelector('.planner-section');
  if (flairBox) flairBox.style.display = 'none';
  if (plannerSection) {
    plannerSection.style.backgroundImage = 'none';
    plannerSection.classList.remove('has-bg');
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ════════════════════════════════════════
// INIT
// ════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  init();
});

// ════════════════════════════════════════
// SLIDERS
// ════════════════════════════════════════
function initSliders() {
  // Slider marks and fills (if any remaining)
  document.querySelectorAll('input[type="range"]').forEach(slider => {
    slider.addEventListener("input", () => {
      const min = slider.min || 0;
      const max = slider.max || 100;
      updateSliderFill(slider, min, max);
    });
    updateSliderFill(slider, slider.min || 0, slider.max || 100);
  });
}

function updateSliderFill(slider, min, max) {
  const pct = ((slider.value - min) / (max - min)) * 100;
  slider.style.setProperty("--val", pct + "%");
}

// ════════════════════════════════════════
// STEPPER
// ════════════════════════════════════════
function initStepper() {
  // Hierarchical Travelers: Pool Logic
  const syncTotal = () => {
    const a = parseInt(adultsVal.textContent);
    const k = parseInt(kidsVal.textContent);
    const s = parseInt(seniorsVal.textContent);
    totalVal.textContent = a + k + s;
  };

  // Adjust Total: Affects Adults primary
  totalInc.addEventListener("click", () => {
    let a = parseInt(adultsVal.textContent);
    if (parseInt(totalVal.textContent) < 50) {
      adultsVal.textContent = a + 1;
      syncTotal();
    }
  });
  totalDec.addEventListener("click", () => {
    let a = parseInt(adultsVal.textContent);
    let k = parseInt(kidsVal.textContent);
    let s = parseInt(seniorsVal.textContent);
    if (a + k + s > 1) {
      if (a > 1) adultsVal.textContent = a - 1;
      else if (s > 0) seniorsVal.textContent = s - 1;
      else if (k > 0) kidsVal.textContent = k - 1;
      syncTotal();
    }
  });

  // Breakdown Logic: Smart Assignment
  adultsInc.addEventListener("click", () => {
    let a = parseInt(adultsVal.textContent);
    if (a < 30) { adultsVal.textContent = a + 1; syncTotal(); }
  });
  adultsDec.addEventListener("click", () => {
    let a = parseInt(adultsVal.textContent);
    if (a > 1) { adultsVal.textContent = a - 1; syncTotal(); }
  });

  kidsInc.addEventListener("click", () => {
    let k = parseInt(kidsVal.textContent);
    let a = parseInt(adultsVal.textContent);
    if (k < 20) {
      // If we have "extra" adults, swap one for a kid to keep Total same
      if (a > 1) adultsVal.textContent = a - 1;
      kidsVal.textContent = k + 1;
      syncTotal();
    }
  });
  kidsDec.addEventListener("click", () => {
    let k = parseInt(kidsVal.textContent);
    if (k > 0) { kidsVal.textContent = k - 1; syncTotal(); }
  });

  seniorsInc.addEventListener("click", () => {
    let s = parseInt(seniorsVal.textContent);
    let a = parseInt(adultsVal.textContent);
    if (s < 20) {
      if (a > 1) adultsVal.textContent = a - 1;
      seniorsVal.textContent = s + 1;
      syncTotal();
    }
  });
  seniorsDec.addEventListener("click", () => {
    let s = parseInt(seniorsVal.textContent);
    if (s > 0) { seniorsVal.textContent = s - 1; syncTotal(); }
  });
}

// ════════════════════════════════════════
// MEAL TOGGLES
// ════════════════════════════════════════
function initMealToggles() {
  ["Breakfast", "Brunch", "Lunch", "Dinner"].forEach((meal) => {
    const toggle = $("toggle" + meal);
    const cb = $("meal" + meal);
    if (!toggle || !cb) return;
    toggle.addEventListener("click", () => {
      cb.checked = !cb.checked;
      toggle.classList.toggle("active", cb.checked);
      updateToggleAllText();
    });
  });
}

function handleToggleAllMeals() {
  const cbs = ["mealBreakfast", "mealBrunch", "mealLunch", "mealDinner"].map($);
  const allChecked = cbs.filter(cb => cb).every((cb) => cb.checked);
  const targetState = !allChecked;
  
  ["Breakfast", "Brunch", "Lunch", "Dinner"].forEach((meal) => {
    const cb = $("meal" + meal);
    const toggle = $("toggle" + meal);
    if (cb && toggle) {
      cb.checked = targetState;
      toggle.classList.toggle("active", targetState);
    }
  });
  updateToggleAllText();
}

function updateToggleAllText() {
  const cbs = ["mealBreakfast", "mealBrunch", "mealLunch", "mealDinner"].map($);
  const allChecked = cbs.filter(cb => cb).every((cb) => cb.checked);
  const btn = $("toggleAllMeals");
  if (btn) btn.textContent = allChecked ? "Clear All" : "Select All";
}

// ════════════════════════════════════════
// COMPARE TOGGLE
// ════════════════════════════════════════
function toggleCompareCards() {
  if (resultsGrid.classList.contains("visible")) {
    compareCards.classList.toggle("visible", comparePlans.checked);
  }
}

// ════════════════════════════════════════
// DESTINATION PLAN BUTTONS
// ════════════════════════════════════════
function initDestPlanBtns() {
  document.querySelectorAll(".dest-plan-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dest = btn.dataset.dest;
      $("destination").value = dest;
      document.querySelector("#planner").scrollIntoView({ behavior: "smooth" });
    });
  });
}

// ════════════════════════════════════════
// COST CALCULATION ENGINE
// ════════════════════════════════════════

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


function shakeBtn() {
  estimateBtn.style.animation = "none";
  estimateBtn.offsetHeight;
  estimateBtn.style.animation = "shake 0.4s ease";
  estimateBtn.addEventListener("animationend", () => { estimateBtn.style.animation = ""; }, { once: true });

  // Highlight destination select
  const sel = $("destination");
  sel.style.borderColor = "#FF6B6B";
  sel.style.boxShadow = "0 0 0 3px rgba(255, 107, 107, 0.25)";
  setTimeout(() => { sel.style.borderColor = ""; sel.style.boxShadow = ""; }, 1500);
}

// ════════════════════════════════════════
// RENDER HELPERS
// ════════════════════════════════════════
function formatCurrency(amount) {
  const currencySelect = $("currency");
  if (!currencySelect) return "₹" + amount.toLocaleString("en-IN");
  
  const selectedOpt = currencySelect.options[currencySelect.selectedIndex];
  const rate = parseFloat(selectedOpt.dataset.rate) || 1;
  const symbol = selectedOpt.dataset.symbol || "₹";
  
  const converted = Math.round(amount * rate);
  
  // Update the badge in total card
  const badge = document.getElementById("outputCurrencyBadge");
  if (badge) {
    badge.textContent = selectedOpt.text;
  }
  
  // Format with basic separated logic for other currencies, strict IN for INR
  if (symbol === "₹") {
    return symbol + converted.toLocaleString("en-IN");
  }
  return symbol + converted.toLocaleString();
}

function renderTotalCard(costs, dest, nights, days, adults, kids, seniors, hotel, rangeL, rangeH, info) {
  if ($("totalAmount")) $("totalAmount").textContent = formatCurrency(costs.total);
  if ($("costRange")) $("costRange").textContent = `Range: ${formatCurrency(rangeL)} – ${formatCurrency(rangeH)}`;
  
  const travelerParts = [];
  if (adults > 0) travelerParts.push(`${adults} Adult${adults > 1 ? "s" : ""}`);
  if (kids > 0) travelerParts.push(`${kids} Kid${kids > 1 ? "s" : ""}`);
  if (seniors > 0) travelerParts.push(`${seniors} Senior${seniors > 1 ? "s" : ""}`);
  
  const duration  = nights > 0 ? `${nights} Night${nights > 1 ? "s" : ""} / ${days} Day${days > 1 ? "s" : ""}` : `${days} Day (Full-day)`;
  if ($("costMeta")) $("costMeta").textContent = `${info?.emoji ?? "✈️"} ${dest} · ${duration} · ${travelerParts.join(", ")} · ${hotelLabel(hotel)}`;
}

function hotelLabel(key) {
  return { "5star": "5-Star", "3star": "3-Star", "2star": "2-Star", "basic_premium": "Basic Premium", "budget": "Budget", "dormitory": "Dormitory" }[key] ?? key;
}

function renderChart(costs) {
  const ctxEl = document.getElementById("breakdownChart");
  if (!ctxEl) return;
  const data = [costs.stay, costs.food, costs.activities, costs.misc];
  const ctx = ctxEl.getContext("2d");

  if (pieChart) pieChart.destroy();

  pieChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: CATEGORIES,
      datasets: [{
        data,
        backgroundColor: CHART_COLORS,
        borderWidth: 3,
        borderColor: "#FFFFFF",
        hoverOffset: 12,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.raw)} (${Math.round(ctx.raw / costs.total * 100)}%)`
          },
          backgroundColor: "rgba(15, 27, 45, 0.92)",
          titleColor: "#fff",
          bodyColor: "rgba(255, 255, 255, 0.75)",
          padding: 12,
          cornerRadius: 10,
        }
      },
      animation: { animateRotate: true, duration: 900, easing: "easeInOutQuart" }
    }
  });

  // Custom legend
  const legendEl = $("chartLegend");
  if (legendEl) {
    legendEl.innerHTML = CATEGORIES.map((cat, i) =>
      `<div class="legend-item">
         <span class="legend-dot" style="background:${CHART_COLORS[i]}"></span>
         ${cat}: ${formatCurrency(data[i])}
       </div>`
    ).join("");
  }
}

function renderInsights(season, insights) {
  if ($("seasonVal")) $("seasonVal").textContent = season;
  if ($("insightsList")) {
    $("insightsList").innerHTML = insights.map((ins) =>
      `<div class="insight-item info">
         <span class="insight-icon">💡</span>
         <span>${ins}</span>
       </div>`
    ).join("");
  }
}

function renderSuggestions(suggestions) {
  if ($("suggestionsList")) {
    $("suggestionsList").innerHTML = suggestions.slice(0, 4).map((s) =>
      `<div class="suggestion-item">
         <span class="sugg-text">💡 ${s.text}</span>
         <span class="sugg-save">Save ${formatCurrency(Math.abs(s.saving))}</span>
       </div>`
    ).join("");
  }
}

function renderBreakdownTable(costs) {
  const rows = [
    { icon: "🏨", name: "Stay / Accommodation", amount: costs.stay },
    { icon: "🍽️", name: "Food & Meals", amount: costs.food },
    { icon: "🎯", name: "Activities & Sightseeing", amount: costs.activities },
    { icon: "🛒", name: "Misc (Transport, Shopping, Tips)", amount: costs.misc },
  ];
  const total = costs.total;
  if ($("breakdownTable")) {
    $("breakdownTable").innerHTML = rows.map((row, i) => {
      const pct = Math.round((row.amount / total) * 100);
      return `
        <div class="breakdown-row">
          <span class="br-icon">${row.icon}</span>
          <span class="br-name">${row.name}</span>
          <div class="br-bar-wrap">
            <div class="br-bar" style="width: 0%; background: ${CHART_COLORS[i]}; transition: width 1.2s ${i * 0.15}s cubic-bezier(0.4, 0, 0.2, 1);" data-target="${pct}"></div>
          </div>
          <span class="br-pct">${pct}%</span>
          <span class="br-amount">${formatCurrency(row.amount)}</span>
        </div>`;
    }).join("");

    // Animate bars
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.querySelectorAll(".br-bar").forEach((bar) => {
          bar.style.width = bar.dataset.target + "%";
        });
      });
    });
  }
}

// ════════════════════════════════════════
// HERO BACKGROUND ROTATION
// ════════════════════════════════════════
const heroBgs = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1800&auto=format&fit=crop&q=90",
  "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1800&auto=format&fit=crop&q=90",
  "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1800&auto=format&fit=crop&q=90",
  "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1800&auto=format&fit=crop&q=90",
];
let heroBgIdx = 0;
function rotateHeroBg() {
  heroBgIdx = (heroBgIdx + 1) % heroBgs.length;
  const img = $("heroBg");
  if (!img) return;
  img.style.opacity = 0;
  img.style.transition = "opacity 1.2s ease";
  setTimeout(() => {
    img.src = heroBgs[heroBgIdx];
    img.onload = () => {
      img.style.opacity = 1;
    };
  }, 600);
}
setInterval(rotateHeroBg, 5000);

// ════════════════════════════════════════
// CSS INJECTION (shake animation)
// ════════════════════════════════════════
const styleTag = document.createElement("style");
styleTag.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-5px); }
    80% { transform: translateX(5px); }
  }
`;
document.head.appendChild(styleTag);

function renderAttractions(list, dest) {
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

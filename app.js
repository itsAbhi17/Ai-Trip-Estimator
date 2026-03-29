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

const HOTEL_RATES = {
  // Daily cost per person in INR
  Goa: { "5star": 7500, "3star": 3800, "2star": 2200, "budget": 1100, "dormitory": 550 },
  Manali: { "5star": 6500, "3star": 3200, "2star": 1900, "budget": 950, "dormitory": 450 },
  Kerala: { "5star": 8500, "3star": 4200, "2star": 2600, "budget": 1250, "dormitory": 600 },
  Jaipur: { "5star": 7000, "3star": 3500, "2star": 2000, "budget": 1000, "dormitory": 500 },
  Dubai: { "5star": 22000, "3star": 11000, "2star": 7500, "budget": 4500, "dormitory": 2500 },
  Leh: { "5star": 8000, "3star": 4000, "2star": 2500, "budget": 1200, "dormitory": 600 },
  Rishikesh: { "5star": 9000, "3star": 3500, "2star": 1800, "budget": 800, "dormitory": 400 },
  Darjeeling: { "5star": 7500, "3star": 3500, "2star": 2000, "budget": 1000, "dormitory": 500 },
  Andaman: { "5star": 12000, "3star": 6000, "2star": 3500, "budget": 1800, "dormitory": 800 },
  Varanasi: { "5star": 6500, "3star": 3000, "2star": 1500, "budget": 800, "dormitory": 350 },
  Kutch: { "5star": 9500, "3star": 4500, "2star": 2800, "budget": 1500, "dormitory": 800 },
  Bali: { "5star": 15000, "3star": 6500, "2star": 3000, "budget": 1500, "dormitory": 600 },
  Delhi: { "5star": 11000, "3star": 4000, "2star": 2200, "budget": 1000, "dormitory": 500 },
};

const FOOD_RATES = {
  // Per person per meal in INR
  veg: { breakfast: 180, brunch: 280, lunch: 380, dinner: 450 },
  nonveg: { breakfast: 280, brunch: 420, lunch: 580, dinner: 780 },
  mixed: { breakfast: 230, brunch: 350, lunch: 480, dinner: 620 },
};

const ACTIVITY_RATES = {
  // Per person per day in INR
  Goa: 900, Manali: 1400, Kerala: 1100, Jaipur: 800, Dubai: 3500,
  Leh: 2200, Rishikesh: 1500, Darjeeling: 900, Andaman: 2500, 
  Varanasi: 600, Kutch: 1200, Bali: 3000, Delhi: 1800,
};

const DESTINATION_INFO = {
  Goa: { emoji: "🏖️", season: "Oct – Mar", peaksMonths: [11, 12, 1, 2] },
  Manali: { emoji: "🏔️", season: "Apr – Jun, Oct", peaksMonths: [4, 5, 6, 10] },
  Kerala: { emoji: "🌴", season: "Sep – Mar", peaksMonths: [10, 11, 12, 1, 2] },
  Jaipur: { emoji: "🏰", season: "Oct – Mar", peaksMonths: [10, 11, 12, 1, 2] },
  Dubai: { emoji: "🌆", season: "Nov – Mar", peaksMonths: [11, 12, 1, 2, 3] },
  Leh: { emoji: "🛵", season: "May – Sep", peaksMonths: [5, 6, 7, 8] },
  Rishikesh: { emoji: "🧘", season: "Sep – Nov, Feb – Apr", peaksMonths: [3, 4, 9, 10] },
  Darjeeling: { emoji: "🚂", season: "Mar – May, Oct – Dec", peaksMonths: [4, 5, 10, 11] },
  Andaman: { emoji: "🐠", season: "Oct – May", peaksMonths: [11, 12, 1] },
  Varanasi: { emoji: "🕉️", season: "Oct – Mar", peaksMonths: [10, 11, 12, 1, 2] },
  Kutch: { emoji: "🏜️", season: "Nov – Feb", peaksMonths: [12, 1] },
  Bali: { emoji: "🌺", season: "Apr – Oct", peaksMonths: [7, 8, 12] },
  Delhi: { emoji: "🏛️", season: "Oct – Mar", peaksMonths: [11, 12, 1] },
};

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
  "Manali":    { quote: "Valley of Gods",                   tagline: "Adventure awaits in the Himalayas 🏔️",          bg: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80" },
  "Kerala":    { quote: "Namaskaram",                       tagline: "Peace in God's Own Country 🌴",                 bg: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1600&q=80" },
  "Jaipur":    { quote: "Padharo Mhare Des",                tagline: "Welcome to the Royal Pink City 🏰",             bg: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1600&q=80" },
  "Dubai":     { quote: "Marhaba!",                         tagline: "Luxury meets the Desert dunes 🌆",               bg: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1600&q=80" },
  "Leh":       { quote: "Julley!",                          tagline: "Breathtaking altitudes and monasteries 🛵",       bg: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80" },
  "Rishikesh": { quote: "Om Shanti",                        tagline: "The Yoga Capital of the World 🧘",                bg: "https://images.unsplash.com/photo-1584535789935-b28c67c16e8a?w=1600&q=80" },
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
  
  estimateBtn.addEventListener("click", handleEstimate);
  if (resetBtn) resetBtn.addEventListener("click", handleReset);
  comparePlans.addEventListener("change", toggleCompareCards);
  $("toggleAllMeals").addEventListener("click", handleToggleAllMeals);
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
    ts.checked = (ts.value === "50");
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
function calcCost(dest, nights, days, adults, kids, seniors, hotel, foodType, meals, luxuryMult) {
  const hRate = HOTEL_RATES[dest]?.[hotel] ?? 2000;
  // Stay: Seniors get same rate as adults
  const stay = Math.round((adults * hRate + kids * hRate * 0.7 + seniors * hRate) * nights);

  const foodRates = FOOD_RATES[foodType] ?? FOOD_RATES.mixed;
  let foodPerAdult = 0;
  if (meals.breakfast) foodPerAdult += foodRates.breakfast;
  if (meals.brunch)    foodPerAdult += foodRates.brunch;
  if (meals.lunch)     foodPerAdult += foodRates.lunch;
  if (meals.dinner)    foodPerAdult += foodRates.dinner;

  // Food: Seniors same as adults
  const food = Math.round((adults * foodPerAdult + kids * foodPerAdult * 0.6 + seniors * foodPerAdult) * days);

  const aRate = ACTIVITY_RATES[dest] ?? 1000;
  // Activities: Seniors get 0.8x weight
  const activities = Math.round((adults * aRate + kids * aRate * 0.5 + seniors * aRate * 0.8) * days);

  const miscBase = (stay + food + activities) * 0.12;

  // Luxury multiplier: 0.7 (budget) → 1.4 (luxury)
  const lm = 0.7 + luxuryMult * 0.7;

  const resStay = Math.round(stay * lm);
  const resFood = Math.round(food * lm);
  const resActs = Math.round(activities * lm);
  const resMisc = Math.round(miscBase * lm);
  const total   = resStay + resFood + resActs + resMisc;

  return { stay: resStay, food: resFood, activities: resActs, misc: resMisc, total };
}

// ════════════════════════════════════════
// MAIN ESTIMATE HANDLER
// ════════════════════════════════════════
function handleEstimate() {
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

  // Show output section and loading
  outputSection.classList.add("visible");
  loadingState.classList.add("active");
  resultsGrid.classList.remove("visible");
  outputSection.scrollIntoView({ behavior: "smooth", block: "start" });

  // Simulate AI analysis delay
  setTimeout(() => {
    loadingState.classList.remove("active");
    resultsGrid.classList.add("visible");

    const costs = calcCost(dest, nights, days, adults, kids, seniors, hotel, foodType, meals, luxuryMult);
    const loOff = 1 - 0.10;
    const hiOff = 1 + 0.15;
    const rangeL = Math.round(costs.total * loOff);
    const rangeH = Math.round(costs.total * hiOff);

    renderTotalCard(costs, dest, nights, days, adults, kids, seniors, hotel, rangeL, rangeH);
    renderChart(costs);
    renderInsights(dest, hotel, days, luxuryMult);
    renderSuggestions(costs, dest, nights, days, adults, kids, seniors, hotel, foodType, meals, luxuryMult);
    renderBreakdownTable(costs);

    // Compare cards
    if (comparePlans.checked) {
      const budgetCost = calcCost(dest, nights, days, adults, kids, seniors, "budget", foodType, meals, 0);
      const luxuryCost = calcCost(dest, nights, days, adults, kids, seniors, "5star", foodType, meals, 1);
      $("budgetPlanPrice").textContent = formatINR(budgetCost.total);
      $("luxuryPlanPrice").textContent = formatINR(luxuryCost.total);
      compareCards.classList.add("visible");
    } else {
      compareCards.classList.remove("visible");
    }

    lucide.createIcons();
  }, 2000);
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
function formatINR(amount) {
  return "₹" + amount.toLocaleString("en-IN");
}

function renderTotalCard(costs, dest, nights, days, adults, kids, seniors, hotel, rangeL, rangeH) {
  $("totalAmount").textContent = formatINR(costs.total);
  $("costRange").textContent = `Range: ${formatINR(rangeL)} – ${formatINR(rangeH)}`;
  
  const travelerParts = [];
  if (adults > 0) travelerParts.push(`${adults} Adult${adults > 1 ? "s" : ""}`);
  if (kids > 0) travelerParts.push(`${kids} Kid${kids > 1 ? "s" : ""}`);
  if (seniors > 0) travelerParts.push(`${seniors} Senior${seniors > 1 ? "s" : ""}`);
  
  const duration  = nights > 0 ? `${nights} Night${nights > 1 ? "s" : ""} / ${days} Day${days > 1 ? "s" : ""}` : `${days} Day (Full-day)`;
  $("costMeta").textContent = `${DESTINATION_INFO[dest]?.emoji ?? "✈️"} ${dest} · ${duration} · ${travelerParts.join(", ")} · ${hotelLabel(hotel)}`;
}

function hotelLabel(key) {
  return { "5star": "5-Star", "3star": "3-Star", "2star": "2-Star", "budget": "Budget", "dormitory": "Dormitory" }[key] ?? key;
}

function renderChart(costs) {
  const data = [costs.stay, costs.food, costs.activities, costs.misc];
  const ctx = document.getElementById("breakdownChart").getContext("2d");

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
            label: (ctx) => ` ${ctx.label}: ${formatINR(ctx.raw)} (${Math.round(ctx.raw / costs.total * 100)}%)`
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
  legendEl.innerHTML = CATEGORIES.map((cat, i) =>
    `<div class="legend-item">
       <span class="legend-dot" style="background:${CHART_COLORS[i]}"></span>
       ${cat}: ${formatINR(data[i])}
     </div>`
  ).join("");
}

function renderInsights(dest, hotel, days, luxuryMult) {
  const startD = $("startDate") && $("startDate").value ? new Date($("startDate").value) : new Date();
  const currentMonth = startD.getMonth() + 1;
  const info = DESTINATION_INFO[dest] ?? {};
  const isPeak = info.peaksMonths?.includes(currentMonth);

  const insights = [];

  if (isPeak) {
    insights.push({ type: "warn", icon: "📈", text: `Peak season right now in ${dest}! Prices can be 20–30% higher. Consider off-season travel for savings.` });
  } else {
    insights.push({ type: "tip", icon: "✅", text: `Great timing! ${dest} is currently in off-season. You can enjoy lower prices and fewer crowds.` });
  }

  if (hotel === "dormitory" || hotel === "budget") {
    insights.push({ type: "tip", icon: "💡", text: "Budget accommodation is a smart choice. Consider 2-star hotels for a moderate upgrade with much better amenities." });
  } else if (hotel === "3star") {
    insights.push({ type: "info", icon: "⭐", text: "3-star hotels offer the best value-for-money. You get comfort without the premium price tag." });
  } else if (hotel === "5star") {
    insights.push({ type: "warn", icon: "💎", text: "5-star stay significantly increases your budget. Dropping to 3-star can save 40–50% on accommodation." });
  }

  if (days > 10) {
    insights.push({ type: "tip", icon: "📅", text: `${days} days is a great duration! Longer trips often qualify for weekly hotel discounts of 10–15%.` });
  }

  if (luxuryMult > 0.75) {
    insights.push({ type: "info", icon: "🌟", text: "Your luxury preference increases costs. Consider a 'Value' or 'Economy' setting for a comfortable yet cost-effective experience." });
  }

  $("insightsList").innerHTML = insights.map((ins) =>
    `<div class="insight-item ${ins.type}">
       <span class="insight-icon">${ins.icon}</span>
       <span>${ins.text}</span>
     </div>`
  ).join("");
}

function renderSuggestions(costs, dest, nights, days, adults, kids, seniors, hotel, foodType, meals, luxuryMult) {
  const suggestions = [];

  // Suggest cheaper hotel
  const hotelOrder = ["5star", "3star", "2star", "budget", "dormitory"];
  const hotelIdx = hotelOrder.indexOf(hotel);
  if (hotelIdx < hotelOrder.length - 1) {
    const cheaperHotel = hotelOrder[hotelIdx + 1];
    const cheapCosts = calcCost(dest, nights, days, adults, kids, seniors, cheaperHotel, foodType, meals, luxuryMult);
    const saving = costs.total - cheapCosts.total;
    if (saving > 0) {
      suggestions.push({ text: `Switch to ${hotelLabel(cheaperHotel)} hotel`, saving });
    }
  }

  // Suggest fewer days
  if (days > 3) {
    const fewerDays = calcCost(dest, nights > 0 ? nights - 1 : 0, days - 1, adults, kids, seniors, hotel, foodType, meals, luxuryMult);
    const saving = costs.total - fewerDays.total;
    suggestions.push({ text: `Reduce trip by 1 day`, saving });
  }

  // Suggest switching to Vegetarian
  if (foodType !== "veg") {
    const vegCosts = calcCost(dest, nights, days, adults, kids, seniors, hotel, "veg", meals, luxuryMult);
    const saving   = costs.total - vegCosts.total;
    if (saving > 0) suggestions.push({ text: "Switch to Vegetarian food", saving });
  }

  // Suggest reducing luxury
  if (luxuryMult > 0.5) {
    const reducedLux = calcCost(dest, nights, days, adults, kids, seniors, hotel, foodType, meals, 0.4);
    const saving = costs.total - reducedLux.total;
    suggestions.push({ text: "Switch to 'Value' trip style", saving });
  }

  $("suggestionsList").innerHTML = suggestions.slice(0, 4).map((s) =>
    `<div class="suggestion-item">
       <span class="sugg-text">💡 ${s.text}</span>
       <span class="sugg-save">Save ${formatINR(Math.abs(s.saving))}</span>
     </div>`
  ).join("");
}

function renderBreakdownTable(costs) {
  const rows = [
    { icon: "🏨", name: "Stay / Accommodation", amount: costs.stay },
    { icon: "🍽️", name: "Food & Meals", amount: costs.food },
    { icon: "🎯", name: "Activities & Sightseeing", amount: costs.activities },
    { icon: "🛍️", name: "Misc (Transport, Shopping, Tips)", amount: costs.misc },
  ];
  const total = costs.total;
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
        <span class="br-amount">${formatINR(row.amount)}</span>
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

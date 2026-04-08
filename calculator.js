const data = require('./data.js');

function calcCost(dest, nights, days, adults, kids, seniors, hotel, foodType, meals, luxuryMult) {
  // Stay
  const rates = data.HOTEL_RATES[dest] || data.HOTEL_RATES["Goa"];
  const hRate = rates[hotel] ?? rates["3star"];
  const stay = Math.round((adults + kids * 0.5 + seniors) * hRate * nights);

  // Food
  const fRates = data.FOOD_RATES[foodType] || data.FOOD_RATES.mixed;
  let foodPerAdult = 0;
  if (meals.breakfast) foodPerAdult += fRates.breakfast;
  if (meals.brunch)    foodPerAdult += fRates.brunch;
  if (meals.lunch)     foodPerAdult += fRates.lunch;
  if (meals.dinner)    foodPerAdult += fRates.dinner;

  const food = Math.round((adults * foodPerAdult + kids * foodPerAdult * 0.6 + seniors * foodPerAdult) * days);

  // Activities
  const aRate = data.ACTIVITY_RATES[dest] ?? 1000;
  const activities = Math.round((adults * aRate + kids * aRate * 0.5 + seniors * aRate * 0.8) * days);

  // Misc
  const miscBase = (stay + food + activities) * 0.12;

  // Luxury multiplier
  const lm = 0.7 + luxuryMult * 0.7;

  const resStay = Math.round(stay * lm);
  const resFood = Math.round(food * lm);
  const resActs = Math.round(activities * lm);
  const resMisc = Math.round(miscBase * lm);
  const total   = resStay + resFood + resActs + resMisc;

  return { stay: resStay, food: resFood, activities: resActs, misc: resMisc, total };
}

function generateInsights(dest, hotel, days, luxuryMult) {
  const dInfo = data.DESTINATION_INFO[dest];
  const season = dInfo?.season || "Year-round";
  
  const currentMonth = new Date().getMonth() + 1;
  const isPeak = dInfo?.peaksMonths?.includes(currentMonth);
  
  let insights = [];
  
  if (isPeak) {
    insights.push(`Currently peak season in ${dest}. Expect higher crowds.`);
  } else {
    insights.push(`Off-peak season! Great time for budget travel to ${dest}.`);
  }
  
  if (luxuryMult > 0.6) {
    insights.push("You've selected a premium style. Consider exclusive local experiences.");
  }
  
  return { season, insights };
}

function generateSuggestions(costs, dest, nights, days, adults, kids, seniors, hotel, foodType, meals, luxuryMult) {
  const diffCosts = {};
  const currentTotal = costs.total;
  
  const altHotels = ["5star", "3star", "budget"].filter(h => h !== hotel);
  altHotels.forEach(h => {
    const c = calcCost(dest, nights, days, adults, kids, seniors, h, foodType, meals, luxuryMult);
    diffCosts[`hotel_${h}`] = c.total - currentTotal;
  });

  const altFood = foodType === "veg" ? "nonveg" : "veg";
  const fc = calcCost(dest, nights, days, adults, kids, seniors, hotel, altFood, meals, luxuryMult);
  diffCosts[`food_${altFood}`] = fc.total - currentTotal;

  // Meal drop suggestions
  if (meals.lunch) {
    const m = { ...meals, lunch: false };
    const c = calcCost(dest, nights, days, adults, kids, seniors, hotel, foodType, m, luxuryMult);
    diffCosts[`drop_lunch`] = c.total - currentTotal;
  }
  
  const suggestions = [];
  for (const [key, diff] of Object.entries(diffCosts)) {
    if (diff < -500) {
      if (key.startsWith("hotel_")) {
        const hName = key.split("_")[1];
        suggestions.push({ text: `Switch to ${hName} stay`, saving: Math.abs(diff) });
      }
      if (key.startsWith("food_")) {
        suggestions.push({ text: `Switch to ${key.split("_")[1]} food`, saving: Math.abs(diff) });
      }
      if (key === "drop_lunch") {
        suggestions.push({ text: `Skip lunch (eat locally/snacks)`, saving: Math.abs(diff) });
      }
    }
  }

  return suggestions.sort((a,b) => b.saving - a.saving);
}

module.exports = {
  calcCost,
  generateInsights,
  generateSuggestions
};

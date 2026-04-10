const express = require('express');
const cors = require('cors');
const path = require('path');
const calc = require('./calculator');
const data = require('./data');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// The endpoint for estimation
app.post('/api/estimate', (req, res) => {
  const { dest, nights, days, adults, kids, seniors, hotel, foodType, meals, luxuryMult } = req.body;

  if (!dest) {
    return res.status(400).json({ error: "Destination is required" });
  }

  // 1. Calculate main costs
  const costs = calc.calcCost(dest, nights, days, adults, kids, seniors, hotel, foodType, meals, luxuryMult);
  
  // 2. Generate insights
  const { season, insights } = calc.generateInsights(dest, hotel, days, luxuryMult);
  
  // 3. Generate suggestions
  const suggestions = calc.generateSuggestions(costs, dest, nights, days, adults, kids, seniors, hotel, foodType, meals, luxuryMult);

  // 4. Determine Ranges
  const rangeL = Math.round(costs.total * 0.90);
  const rangeH = Math.round(costs.total * 1.15);

  // 5. Load Attractions and Transport Arrays directly from data
  const attractions = data.DESTINATION_ATTRACTIONS[dest] || [];
  const transport = data.DESTINATION_TRANSPORT[dest] || data.DEFAULT_TRANSPORT;
  const info = data.DESTINATION_INFO[dest] || { emoji: "✈️" };
  const weather = data.DESTINATION_WEATHER[dest] || data.DEFAULT_WEATHER;
  const nearby = data.DESTINATION_NEARBY[dest] || data.DEFAULT_NEARBY;
  const packing = data.PACKING_LIST[dest] || data.DEFAULT_PACKING;

  res.json({
    costs,
    rangeL,
    rangeH,
    insights,
    season,
    suggestions,
    attractions,
    transport,
    info,
    weather,
    nearby,
    packing
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Backend and Frontend running simultaneously!`);
    console.log(`🌐 Application URL: http://localhost:${PORT}`);
  });
}

module.exports = app;

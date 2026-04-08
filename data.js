const HOTEL_RATES = {
  Goa: { "5star": 7500, "3star": 3800, "2star": 2200, "budget": 1100, "dormitory": 550 },
  Manali: { "5star": 6500, "3star": 3200, "2star": 1900, "budget": 950, "dormitory": 450 },
  Kerala: { "5star": 8500, "3star": 4200, "2star": 2600, "budget": 1250, "dormitory": 600 },
  Jaipur: { "5star": 7000, "3star": 3500, "2star": 2000, "budget": 1000, "dormitory": 500 },
  Dubai: { "5star": 22000, "3star": 11000, "2star": 7500, "budget": 4500, "dormitory": 2500 },
  Delhi: { "5star": 11000, "3star": 4000, "2star": 2200, "budget": 1000, "dormitory": 500 },
  Paris: { "5star": 35000, "3star": 18000, "2star": 12000, "budget": 6000, "dormitory": 3000 },
  Tokyo: { "5star": 40000, "3star": 20000, "2star": 14000, "budget": 7000, "dormitory": 3500 },
  Rome: { "5star": 30000, "3star": 15000, "2star": 10000, "budget": 5000, "dormitory": 2500 },
  New_York: { "5star": 45000, "3star": 22000, "2star": 15000, "budget": 8000, "dormitory": 4000 },
  London: { "5star": 38000, "3star": 19000, "2star": 13000, "budget": 6500, "dormitory": 3200 },
  Maldives: { "5star": 60000, "3star": 30000, "2star": 20000, "budget": 10000, "dormitory": 5000 },
  Singapore: { "5star": 25000, "3star": 12000, "2star": 8000, "budget": 4500, "dormitory": 2000 },
  Switzerland: { "5star": 42000, "3star": 25000, "2star": 15000, "budget": 9000, "dormitory": 4000 },
  Phuket: { "5star": 12000, "3star": 5000, "2star": 3000, "budget": 1500, "dormitory": 800 },
  Sydney: { "5star": 35000, "3star": 16000, "2star": 10000, "budget": 6000, "dormitory": 3000 },
  Istanbul: { "5star": 18000, "3star": 8000, "2star": 5000, "budget": 2500, "dormitory": 1200 },
  Cape_Town: { "5star": 22000, "3star": 10000, "2star": 6000, "budget": 3500, "dormitory": 1800 },
  Amsterdam: { "5star": 30000, "3star": 15000, "2star": 9000, "budget": 5000, "dormitory": 2800 },
  Barcelona: { "5star": 28000, "3star": 14000, "2star": 8500, "budget": 4800, "dormitory": 2500 },
  Kashmir: { "5star": 15000, "3star": 6500, "2star": 3500, "budget": 1800, "dormitory": 900 },
  Jaisalmer: { "5star": 12000, "3star": 4500, "2star": 2500, "budget": 1200, "dormitory": 600 },
  Wayanad: { "5star": 9000, "3star": 4000, "2star": 2200, "budget": 1100, "dormitory": 550 },
  Meghalaya: { "5star": 8500, "3star": 3800, "2star": 2000, "budget": 1000, "dormitory": 500 },
  Spiti: { "5star": 6000, "3star": 3000, "2star": 1800, "budget": 900, "dormitory": 400 },
  Bangkok: { "5star": 14000, "3star": 6000, "2star": 3500, "budget": 1800, "dormitory": 800 },
  Athens: { "5star": 20000, "3star": 9500, "2star": 5500, "budget": 3000, "dormitory": 1500 }
};

const FOOD_RATES = {
  veg: { breakfast: 180, brunch: 280, lunch: 380, dinner: 450 },
  nonveg: { breakfast: 280, brunch: 420, lunch: 580, dinner: 780 },
  mixed: { breakfast: 230, brunch: 350, lunch: 480, dinner: 620 },
};

const ACTIVITY_RATES = {
  Goa: 900, Manali: 1400, Kerala: 1100, Jaipur: 800, Dubai: 3500, Delhi: 1800,
  Paris: 5000, Tokyo: 4500, Rome: 4000, New_York: 6000, London: 5500, Maldives: 4000,
  Singapore: 4500, Switzerland: 7000, Phuket: 2500, Sydney: 4800, Istanbul: 2000, 
  Cape_Town: 3500, Amsterdam: 3800, Barcelona: 3200, Kashmir: 1800, Jaisalmer: 1500, 
  Wayanad: 1200, Meghalaya: 1400, Spiti: 1000, Bangkok: 2200, Athens: 2800
};

const DESTINATION_INFO = {
  Goa: { emoji: "🏖️", season: "Oct – Mar", peaksMonths: [11, 12, 1, 2] },
  Manali: { emoji: "🏔️", season: "Apr – Jun, Oct", peaksMonths: [4, 5, 6, 10] },
  Dubai: { emoji: "🌆", season: "Nov – Mar", peaksMonths: [11, 12, 1, 2, 3] },
  Paris: { emoji: "🗼", season: "Apr – Oct", peaksMonths: [6, 7, 8] }
};

const DESTINATION_WEATHER = {
  Goa: { temp: "22°C - 33°C", condition: "Sunny / Humid", best: "Winter" },
  Manali: { temp: "10°C - 25°C", condition: "Pleasant / Snowy", best: "Summer & Peak Winter" },
  Dubai: { temp: "20°C - 40°C", condition: "Hot / Sunny", best: "Winter" },
  Paris: { temp: "5°C - 25°C", condition: "Mild / Breezy", best: "Spring" },
  Tokyo: { temp: "2°C - 30°C", condition: "Humid Continental", best: "Spring / Autumn" }
};

const DESTINATION_NEARBY = {
  Goa: [
    { name: "Gokarna", desc: "Laid back temple town with pristine beaches.", dist: "135 km" },
    { name: "Dandeli", desc: "Nature and adventure activities like rafting.", dist: "100 km" }
  ],
  Manali: [
    { name: "Kasol & Kheerganga", desc: "A hub for trekkers and nature lovers.", dist: "75 km" },
    { name: "Sissu", desc: "A beautiful valley town right after Atal Tunnel.", dist: "40 km" },
    { name: "Naggar Castle", desc: "Historic architecture and art gallery.", dist: "20 km" }
  ],
  Dubai: [
    { name: "Sharjah", desc: "Cultural capital of the UAE.", dist: "30 km" },
    { name: "Abu Dhabi", desc: "Capital city full of modern marvels.", dist: "140 km" },
    { name: "Al Ain", desc: "The garden city of the Emirates.", dist: "150 km" }
  ],
  Paris: [
    { name: "Versailles", desc: "The magnificent royal palace and gardens.", dist: "20 km" },
    { name: "Disneyland Paris", desc: "Magic kingdom for all ages.", dist: "32 km" },
    { name: "Fontainebleau", desc: "Historic chateau and beautiful forest.", dist: "70 km" }
  ]
};

const PACKING_LIST = {
  Goa: ["Sunscreen (SPF 50+)", "Swimwear & Flip-flops", "Sunglasses & Hat", "Light Cotton Clothes", "Waterproof Bag"],
  Manali: ["Heavy Woolen Jackets", "Thermals & Gloves", "Trekking Shoes", "Lip Balm & Cold Cream", "Power Banks (Batteries drain faster in cold)"],
  Dubai: ["Modest lightweight clothing", "Intense Sunscreen", "Comfortable walking shoes", "Universal Adapter", "Light sweater (ACs are very cold)"],
  Paris: ["Stylish but comfortable walking shoes", "Chic layers (Trench coat/scarf)", "Universal Travel Adapter", "Crossbody bag (anti-theft)", "Umbrella (weather is unpredictable)"],
  Tokyo: ["Comfortable slip-on shoes (for temples)", "Japan Rail (JR) Pass", "Portable Wi-Fi / E-Sim", "Cash (Yen)", "Small towel/handkerchief"]
};

// Generic fallbacks for missing destinations
const DEFAULT_WEATHER = { temp: "15°C - 30°C", condition: "Variable", best: "Year Round" };
const DEFAULT_PACKING = ["Comfortable Walking Shoes", "Universal Travel Adapter", "Portable Charger", "Valid ID / Passport", "Prescription Meds", "Reusable Water Bottle"];
const DEFAULT_NEARBY = [
  { name: "Local Countryside", desc: "Explore the outskirts for a quiet retreat.", dist: "25 km" },
  { name: "Neighboring Historic Town", desc: "Discover historic landmarks and regional food.", dist: "60 km" }
];

const DESTINATION_TRANSPORT = {
  Manali: [
    { mode: "Standard Auto Rickshaw", desc: "Best for local commute.", price: 150, type: "Economy" },
    { mode: "Scooter Rental", desc: "Flexible for nearby sights.", price: 600, type: "Standard" },
    { mode: "Private SUV (Innova)", desc: "Comfortable for Rohtang trips.", price: 3500, type: "Premium" }
  ],
  Goa: [
    { mode: "Local Bus", desc: "Cheapest but slow.", price: 30, type: "Economy" },
    { mode: "Scooter/Bike Rental", desc: "The classic Goa experience.", price: 400, type: "Standard" },
    { mode: "AC Private Taxi", desc: "For airport drops or night travel.", price: 1800, type: "Premium" }
  ],
  Dubai: [
    { mode: "Dubai Metro", desc: "Clean and connects all hubs.", price: 150, type: "Economy" },
    { mode: "RTA Metered Taxi", desc: "Standard cabs, very common.", price: 800, type: "Standard" },
    { mode: "Uber Black / Lexus", desc: "Premium rides.", price: 2000, type: "Premium" }
  ]
};

// For destinations not strictly defined in transport
const DEFAULT_TRANSPORT = [
  { mode: "Public Transit (Bus/Metro)", desc: "Cost-effective city travel.", price: 100, type: "Economy" },
  { mode: "Standard Taxi / Uber", desc: "On-demand convenient travel.", price: 500, type: "Standard" },
  { mode: "Private Chauffeur", desc: "Luxury full-day booking.", price: 4000, type: "Premium" }
];

const DESTINATION_ATTRACTIONS = {
  Goa: [ { name: "Baga Beach", desc: "Famous for nightlife", time: "3-4 hours", cost: 0 } ],
  Manali: [ { name: "Solang Valley", desc: "Hub for adventure sports", time: "Half day", cost: 500 } ],
  Dubai: [ { name: "Burj Khalifa", desc: "World tallest building", time: "2 hours", cost: 3500 } ],
  Paris: [ { name: "Eiffel Tower", desc: "Iconic structure", time: "2 hours", cost: 2500 } ]
};

module.exports = {
  HOTEL_RATES, FOOD_RATES, ACTIVITY_RATES, DESTINATION_INFO, 
  DESTINATION_ATTRACTIONS, DESTINATION_TRANSPORT, DEFAULT_TRANSPORT,
  DESTINATION_NEARBY, DEFAULT_NEARBY, DESTINATION_WEATHER, DEFAULT_WEATHER,
  PACKING_LIST, DEFAULT_PACKING
};

# ✈️ AI Trip Cost Estimator

Welcome to the **AI Trip Cost Estimator**, an intelligent full-stack web application designed to help travelers effortlessly generate highly accurate budget estimates for domestic and international trips! 

Using an algorithmic backend to process dynamic destination data, you can fine-tune every variable of your journey—from the number of companions to the star rating of your hotel—and receive a beautifully interactive dashboard detailing your financial layout, packed full of intelligent insights.

## 🌟 Key Features
- **Dynamic Cost Engine:** Instantly calculates estimated expenses based on 25+ preconfigured global destinations, including Dubai, Paris, Tokyo, Manali, and Bali.
- **Interactive UI & Dashboards:** Renders visual breakdown modules through Chart.js out-of-the-box, ensuring budget distributions are visibly pristine. 
- **Deep Personalization:** Control variables for Adults/Kids/Seniors, exact trip dates, preferred accommodation tiers (budget to premium luxury), and meal configurations.
- **Smart Destination Intel:** Programmatically provides local temperature estimates, vital packing lists, nearby city escapes, and specific local transport pricing.
- **AI Savings Suggestions:** Scans the selected inputs and highlights intelligent fallback decisions to instantly save money (e.g., dropping a lunch format, switching away from a 5-star hotel).
- **Responsive Aesthetics:** Built from the ground up for seamless navigation spanning desktop setups to constrained mobile displays. Dark Mode included!

## ⚙️ Tech Stack
- **Frontend**: HTML5, Vanilla JavaScript, CSS3 (with Glassmorphism design elements), integration with Chart.js & Lucide Icons.
- **Backend**: Node.js & Express
- **API Flow**: Single-core application. Express effortlessly bridges local routing while serving raw backend algorithmic endpoints simultaneously. 

## 🚀 How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/itsAbhi17/Ai-Trip-Estimator.git
   cd Ai-Trip-Estimator
   ```

2. **Install Node dependencies:**
   Make sure you have Node.js installed on your machine.
   ```bash
   npm install
   ```

3. **Start the Express Backend Server:**
   ```bash
   npm start
   ```

4. **Experience the Magic:**
   Open your preferred web browser and navigate to:
   ```text
   http://localhost:3000
   ```

## 🌐 Deploying to Production
Because the Node application independently serves the local graphical interface alongside operating `/api/estimate` endpoints, deployment only requires hosting the repository onto a container-friendly cloud network such as **Render**, **Heroku**, or **DigitalOcean App Platform**.
Simply plug this repository in, specify the start command as `node server.js`, let the platform allocate internal bindings to `process.env.PORT`, and you are entirely live. 

---
*Ready to budget smarter and explore further? The AI Travel CFO awaits!*

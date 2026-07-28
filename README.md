# <img src="favicon.svg" width="32" height="32" alt="Logo" style="vertical-align: middle;"> FIRE & Retirement Calculator

A client-side web application designed to help users plan their path to Financial Independence, Retire Early (FIRE)[cite: 6]. The app provides tools to project portfolio accumulation, calculate Coast FIRE timelines, simulate retirement drawdown strategies, and analyze sequence of returns risk using Monte Carlo simulations[cite: 5, 6].

---

## 🚀 Features

### 📈 1. Accumulation & Coast Planner
* **Active Savings Projection:** Models portfolio growth over time based on starting capital, annual contributions, expected return rates, and annual contribution growth rates[cite: 5, 6].
* **Coast FIRE Status:** Calculates how long it will take for your current portfolio to grow to your target FIRE number without making any additional contributions[cite: 5, 6].
* **Growth Milestones:** Displays year-by-year projections comparing active savings vs. coast trajectories in both table and chart formats[cite: 5, 6].

### 📉 2. Retirement Drawdown & Sequence Risk
* **Flexible Withdrawal Methods:** Supports fixed dollar amounts or percentage-based initial portfolio withdrawals adjusted for annual inflation[cite: 5, 6].
* **Sequence of Returns Modeling:** Simulates spending under different market conditions:
  * Flat average return[cite: 6]
  * Random/volatile returns[cite: 6]
  * Front-loaded bad returns (worst-case sequence)[cite: 5, 6]
  * Back-loaded bad returns (best-case sequence)[cite: 5, 6]
* **Forward vs. Reversed Comparison:** Tests how reversing the exact order of market returns impacts portfolio longevity[cite: 5, 6].

### 🎲 3. Monte Carlo Simulation
* **Probability of Success:** Runs up to 50,000 randomized simulations to determine the statistical likelihood of your money lasting through retirement[cite: 5, 6].
* **Historical S&P 500 Data (1928–2023):** Option to run simulations using real historical market return blocks instead of normal distribution assumptions[cite: 5, 6].
* **Trajectory Visualization:** Displays multi-run visual charts showing successful vs. depleted portfolio paths over time[cite: 5].

---

## 🛠️ Built With

* **HTML5 & CSS3:** Responsive UI with custom tabbed navigation and light/dark theme switching[cite: 5, 6].
* **JavaScript (Vanilla ES6):** All financial calculations, simulations, and DOM manipulations run directly in the browser[cite: 5, 6].
* **[Chart.js v4](https://www.chartjs.org/):** Used for rendering visual trajectories and milestones[cite: 5, 6].

---

## 📂 File Structure

* `index.html` — Application markup, layout, and CDN scripts
* `styles.css` — UI styling and theme variable definitions
* `app.js` — Core calculation engine, Chart.js integrations, and event logic
* `favicon.svg` — Application icon

---

## 💡 Key Calculations Explained

### How to Calculate Your FIRE Number
Because the calculator takes your **FIRE target number** as a direct user input rather than prompting for estimated annual retirement expenses[cite: 6], you can calculate your target manually using the traditional **4% Rule** (the inverse multiplier rule):

* `FIRE Target = Expected Annual Retirement Expenses × 25`
* `FIRE Target = Expected Annual Retirement Expenses / Safe Withdrawal Rate`

**Examples:**
* **Standard 4% SWR:** If you expect to spend $60,000 per year, your target FIRE number is `$60,000 × 25 = $1,500,000`.
* **Conservative 3.5% SWR:** If you prefer a conservative 3.5% withdrawal rate, your target FIRE number is `$60,000 / 0.035 = $1,714,285`.

### Coast FIRE Calculation
Coast FIRE determines the required time **t** (in years) for a current portfolio **P** to grow to a target FIRE number **F** at an expected annual return rate **r** without further contributions[cite: 5]:

`t = ln(F / P) / ln(1 + r)`

*Note: If target portfolio F is less than or equal to current portfolio P, Coast FIRE is already achieved[cite: 5].*

### Withdrawal Adjustment (Inflation)
In drawdown simulations, annual withdrawals **W_y** are adjusted each year **y** for inflation rate **i**[cite: 5]:

`W_y = W_(y-1) × (1 + i)`

---

## ⚙️ How to Use

1. **Clone or Download:** Place `index.html`, `styles.css`, and `app.js` in the same directory.
2. **Open in Browser:** Open `index.html` in any web browser (no local server or build tools required).
3. **Accumulation Tab:**
   * Input your starting portfolio balance, annual savings, and expected rate of return[cite: 6].
   * Open **Advanced & FIRE Targets** to set your personal target FIRE number to compute Coast FIRE metrics[cite: 5, 6].
4. **Drawdown Tab:**
   * Set your starting retirement balance and annual withdrawal rate/amount[cite: 6].
   * Select **Monte Carlo** sequence type to run multi-scenario probability stress tests[cite: 5, 6].

---

## ⚠️ Disclaimer

This tool is built strictly for educational and personal financial planning purposes[cite: 6]. It does not constitute formal financial advice, nor does it guarantee future investment returns[cite: 6].
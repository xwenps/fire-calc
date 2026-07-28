# <img src="favicon.svg" width="32" height="32" alt="Logo" style="vertical-align: middle;"> FIRE & Retirement Calculator

A client-side web application designed to help users plan their path to Financial Independence, Retire Early (FIRE). The app provides tools to project portfolio accumulation, calculate Coast FIRE timelines, simulate retirement drawdown strategies, and analyze sequence of returns risk using Monte Carlo simulations.

---

## 🚀 Features

### 📈 1. Accumulation & Coast Planner
* **Active Savings Projection:** Models portfolio growth over time based on starting capital, annual contributions, expected return rates, and annual contribution growth rates.
* **Coast FIRE Status:** Calculates how long it will take for your current portfolio to grow to your target FIRE number without making any additional contributions.
* **Growth Milestones:** Displays year-by-year projections comparing active savings vs. coast trajectories in both table and chart formats.

### 📉 2. Retirement Drawdown & Sequence Risk
* **Flexible Withdrawal Methods:** Supports fixed dollar amounts or percentage-based initial portfolio withdrawals adjusted for annual inflation.
* **Sequence of Returns Modeling:** Simulates spending under different market conditions:
  * Flat average return
  * Random/volatile returns
  * Front-loaded bad returns (worst-case sequence)
  * Back-loaded bad returns (best-case sequence)
* **Forward vs. Reversed Comparison:** Tests how reversing the exact order of market returns impacts portfolio longevity.

### 🎲 3. Monte Carlo Simulation
* **Probability of Success:** Runs up to 50,000 randomized simulations to determine the statistical likelihood of your money lasting through retirement.
* **Historical S&P 500 Data (1928–2023):** Option to run simulations using real historical market return blocks instead of normal distribution assumptions.
* **Trajectory Visualization:** Displays multi-run visual charts showing successful vs. depleted portfolio paths over time.

---

## 🛠️ Built With

* **HTML5 & CSS3:** Responsive UI with custom tabbed navigation and light/dark theme switching.
* **JavaScript (Vanilla ES6):** All financial calculations, simulations, and DOM manipulations run directly in the browser.
* **[Chart.js v4](https://www.chartjs.org/):** Used for rendering visual trajectories and milestones.

---

## 📂 File Structure

* `index.html` — Application markup, layout, and CDN scripts
* `styles.css` — UI styling and theme variable definitions
* `app.js` — Core calculation engine, Chart.js integrations, and event logic
* `favicon.svg` — Application icon

---

## 💡 Key Calculations Explained

### How to Calculate Your FIRE Number
Because the calculator takes your **FIRE target number** as a direct user input rather than prompting for estimated annual retirement expenses, you can calculate your target manually using the traditional **4% Rule** (the inverse multiplier rule):

* `FIRE Target = Expected Annual Retirement Expenses × 25`
* `FIRE Target = Expected Annual Retirement Expenses / Safe Withdrawal Rate`

**Examples:**
* **Standard 4% SWR:** If you expect to spend $60,000 per year, your target FIRE number is `$60,000 × 25 = $1,500,000`.
* **Conservative 3.5% SWR:** If you prefer a conservative 3.5% withdrawal rate, your target FIRE number is `$60,000 / 0.035 = $1,714,285`.

### Coast FIRE Calculation
Coast FIRE determines the required time **t** (in years) for a current portfolio **P** to grow to a target FIRE number **F** at an expected annual return rate **r** without further contributions:

`t = ln(F / P) / ln(1 + r)`

*Note: If target portfolio F is less than or equal to current portfolio P, Coast FIRE is already achieved.*

### Withdrawal Adjustment (Inflation)
In drawdown simulations, annual withdrawals **W_y** are adjusted each year **y** for inflation rate **i**:

`W_y = W_(y-1) × (1 + i)`

---

## ⚙️ How to Use

1. **Clone or Download:** Place `index.html`, `styles.css`, and `app.js` in the same directory.
2. **Open in Browser:** Open `index.html` in any web browser (no local server or build tools required).
3. **Accumulation Tab:**
   * Input your starting portfolio balance, annual savings, and expected rate of return.
   * Open **Advanced & FIRE Targets** to set your personal target FIRE number to compute Coast FIRE metrics.
4. **Drawdown Tab:**
   * Set your starting retirement balance and annual withdrawal rate/amount.
   * Select **Monte Carlo** sequence type to run multi-scenario probability stress tests.

---

## ⚠️ Disclaimer

This tool is built strictly for educational and personal financial planning purposes. It does not constitute formal financial advice, nor does it guarantee future investment returns.
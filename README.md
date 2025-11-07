# Steam Revenue Calculator

A web-based tool to estimate potential revenue for Steam games based on review counts and pricing data. This calculator helps game developers and publishers get rough revenue estimates using publicly available Steam data.

## Features

- **Two Input Methods:**
  - Manual input for review count and price
  - Automatic data fetching from Steam store URLs
- **Revenue Breakdown:** Shows detailed calculation steps including Steam's cut, discounts, and other factors
- **Per-Developer Analysis:** Calculate revenue per developer based on team size and development time
- **Real-time Validation:** Input validation with visual feedback
- **Responsive Design:** Works on desktop and mobile devices

## How to Use

### Method 1: Manual Input
1. Select "Manual Input" tab
2. Enter the total number of Steam reviews
3. Enter the game's current price in USD
4. Click "Generate Revenue Estimation"

### Method 2: Steam URL
1. Select "Steam URL" tab
2. Paste a Steam store page URL (e.g., `https://store.steampowered.com/app/123456/GameName/`)
3. Click "Fetch Game Data" to automatically retrieve price and review data
4. Click "Generate Revenue Estimation"

### Per-Developer Calculation
After generating the total revenue estimation:
1. Enter the number of developers who worked on the game
2. Enter the development time in years
3. Click "Calculate Per Developer" to see individual developer earnings

## Revenue Formula Explained

The calculator uses the following formula to estimate total revenue:

### Step 1: Estimate Total Users
```
Estimated Users = Review Count × 40
```
**Rationale:** Industry research suggests that approximately 1 in 40 players who purchase a game will leave a review on Steam. This ratio can vary significantly between games but serves as a reasonable baseline estimate.

### Step 2: Calculate Gross Revenue
```
Gross Revenue = Estimated Users × Game Price
```
**Rationale:** Simple multiplication of estimated sales by the current price.

### Step 3: Steam Platform Fee (30%)
```
Revenue After Steam Cut = Gross Revenue × 0.7
```
**Rationale:** Steam takes a 30% cut of all sales (reducing to 25% after $10M and 20% after $50M in revenue, but we use 30% as the standard rate).

### Step 4: Regional Pricing & Discounts (30% reduction)
```
Revenue After Discounts = Revenue After Steam Cut × 0.7
```
**Rationale:** This accounts for:
- Regional pricing differences (games often cost less in developing markets)
- Seasonal sales and discounts
- Bundle sales at reduced prices
- Key reseller margins

### Step 5: Final Adjustment (10% reduction)
```
Final Revenue Estimate = Revenue After Discounts × 0.9
```
**Rationale:** Additional buffer for:
- Refunds and chargebacks
- Payment processing fees
- Other unexpected revenue reductions
- Conservative estimation approach

### Complete Formula
```
Final Revenue = (Review Count × 40) × Price × 0.7 × 0.7 × 0.9
Final Revenue = Review Count × Price × 17.64
```

## Important Disclaimers

⚠️ **This tool provides rough estimates only!** Actual revenue can vary significantly based on:

- **Review-to-sale ratio variations:** Some games have higher or lower review rates
- **Pricing history:** Many sales occur during discounts not reflected in current price
- **Regional markets:** Different regions have different purchasing power and pricing
- **Marketing and visibility:** Game discoverability affects sales patterns
- **Game genre and audience:** Different types of games have different review behaviors
- **Launch timing and market conditions**
- **Long-tail sales over time**

## Technical Details

- **Frontend:** Pure HTML, CSS, and JavaScript
- **APIs Used:** 
  - Steam Store API for game details and pricing
  - Steam Reviews API for review counts
  - AllOrigins.win for CORS proxy
- **No Backend Required:** Runs entirely in the browser

## Files

- `index.html` - Main application interface
- `script.js` - Core calculator logic and Steam API integration
- `styles.css` - Application styling
- `example.json` - Sample data structure for testing

## Development

To run locally:
1. Clone this repository
2. Open `index.html` in a web browser
3. No build process or server required

## Contributing

Feel free to submit issues and enhancement requests! This tool is designed to be simple and educational.

## License

This project is open source. Feel free to use, modify, and distribute.

---

**Remember:** This calculator is for estimation purposes only. Always conduct proper market research and financial analysis before making business decisions.
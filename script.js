class SteamRevenueCalculator {
    constructor() {
        this.totalRevenue = 0;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Calculate total revenue button
        document.getElementById('calculateRevenue').addEventListener('click', () => {
            this.calculateTotalRevenue();
        });

        // Calculate per dev button
        document.getElementById('calculatePerDev').addEventListener('click', () => {
            this.calculatePerDeveloper();
        });

        // Add input validation
        this.addInputValidation();
    }

    addInputValidation() {
        const inputs = document.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.validateInput(e.target);
            });

            // Allow Enter key to trigger calculation
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    if (input.id === 'reviewCount' || input.id === 'steamPrice') {
                        this.calculateTotalRevenue();
                    } else if (input.id === 'devCount' || input.id === 'devTime') {
                        this.calculatePerDeveloper();
                    }
                }
            });
        });
    }

    validateInput(input) {
        const value = parseFloat(input.value);
        
        // Remove previous validation classes
        input.classList.remove('error', 'success');
        
        if (input.value === '') {
            return;
        }
        
        if (isNaN(value) || value < 0) {
            input.classList.add('error');
            return false;
        } else {
            input.classList.add('success');
            return true;
        }
    }

    calculateTotalRevenue() {
        const reviewCountInput = document.getElementById('reviewCount');
        const steamPriceInput = document.getElementById('steamPrice');
        
        const reviewCount = parseFloat(reviewCountInput.value);
        const steamPrice = parseFloat(steamPriceInput.value);

        // Validate inputs
        if (!this.validateInput(reviewCountInput) || !this.validateInput(steamPriceInput)) {
            this.showError('Please enter valid positive numbers for both fields.');
            return;
        }

        if (isNaN(reviewCount) || isNaN(steamPrice) || reviewCount <= 0 || steamPrice <= 0) {
            this.showError('Please enter valid positive numbers for both fields.');
            return;
        }

        // Calculate according to the formula
        const estimatedUsers = reviewCount * 40;
        const grossRevenue = estimatedUsers * steamPrice;
        const afterSteamCut = grossRevenue * 0.7; // Steam takes 30%
        const afterDiscounts = afterSteamCut * 0.7; // 30% for international pricing and discounts
        const finalRevenue = afterDiscounts * 0.9; // 10% generic modifier

        // Store total revenue for per-dev calculation
        this.totalRevenue = finalRevenue;

        // Update the results
        this.updateTotalRevenueDisplay(estimatedUsers, grossRevenue, afterSteamCut, afterDiscounts, finalRevenue);
        
        // Show the per-dev section
        this.showPerDevSection();
    }

    updateTotalRevenueDisplay(estimatedUsers, grossRevenue, afterSteamCut, afterDiscounts, finalRevenue) {
        document.getElementById('estimatedUsers').textContent = this.formatNumber(estimatedUsers);
        document.getElementById('grossRevenue').textContent = this.formatRevenue(grossRevenue);
        document.getElementById('afterSteamCut').textContent = this.formatRevenue(afterSteamCut);
        document.getElementById('afterDiscounts').textContent = this.formatRevenue(afterDiscounts);
        document.getElementById('finalRevenue').textContent = this.formatRevenue(finalRevenue);

        // Show the result box with animation
        const resultBox = document.getElementById('totalRevenueResult');
        resultBox.classList.remove('hidden');
        
        // Trigger animation
        setTimeout(() => {
            resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }

    showPerDevSection() {
        const perDevSection = document.getElementById('perDevSection');
        perDevSection.classList.remove('hidden');
        perDevSection.classList.add('show');
        
        // Scroll to the per-dev section after a short delay
        setTimeout(() => {
            perDevSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
    }

    calculatePerDeveloper() {
        if (this.totalRevenue <= 0) {
            this.showError('Please calculate total revenue first.');
            return;
        }

        const devCountInput = document.getElementById('devCount');
        const devTimeInput = document.getElementById('devTime');
        
        const devCount = parseFloat(devCountInput.value);
        const devTime = parseFloat(devTimeInput.value);

        // Validate inputs
        if (!this.validateInput(devCountInput) || !this.validateInput(devTimeInput)) {
            this.showError('Please enter valid positive numbers for both fields.');
            return;
        }

        if (isNaN(devCount) || isNaN(devTime) || devCount <= 0 || devTime <= 0) {
            this.showError('Please enter valid positive numbers for both fields.');
            return;
        }

        // Calculate per developer metrics
        const revenuePerDev = this.totalRevenue / devCount;
        const yearlyPerDev = revenuePerDev / devTime;

        // Update the display
        this.updatePerDevDisplay(revenuePerDev, yearlyPerDev);
    }

    updatePerDevDisplay(revenuePerDev, yearlyPerDev) {
        document.getElementById('revenuePerDev').textContent = this.formatCurrency(revenuePerDev);
        document.getElementById('yearlyPerDev').textContent = this.formatCurrency(yearlyPerDev);

        // Show the result box
        const resultBox = document.getElementById('perDevResult');
        resultBox.classList.remove('hidden');
        
        // Scroll to results
        setTimeout(() => {
            resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    formatRevenue(amount) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Math.round(amount));
    }

    formatNumber(number) {
        return new Intl.NumberFormat('en-US').format(Math.round(number));
    }

    showError(message) {
        // Create or update error message
        let errorDiv = document.querySelector('.error-message');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.cssText = `
                background: #fee;
                color: #c33;
                padding: 12px;
                border-radius: 8px;
                margin: 15px 0;
                border: 1px solid #fcc;
                text-align: center;
                font-weight: 600;
                animation: slideIn 0.3s ease-out;
            `;
            document.querySelector('.calculator-section').insertBefore(errorDiv, document.querySelector('.section-card'));
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';

        // Auto-hide error after 4 seconds
        setTimeout(() => {
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
        }, 4000);
    }
}

// Initialize the calculator when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SteamRevenueCalculator();
    
    // Add smooth scrolling for better UX
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add some interactive feedback
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
});

// Add some Easter eggs and polish
document.addEventListener('DOMContentLoaded', () => {
    // Add loading states to buttons
    const addLoadingState = (button, duration = 1000) => {
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = 'Calculating...';
        
        setTimeout(() => {
            button.disabled = false;
            button.textContent = originalText;
        }, duration);
    };

    // Enhanced button interactions
    document.getElementById('calculateRevenue').addEventListener('click', function() {
        addLoadingState(this, 500);
    });

    document.getElementById('calculatePerDev').addEventListener('click', function() {
        addLoadingState(this, 300);
    });
});
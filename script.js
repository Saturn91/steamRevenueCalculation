class SteamRevenueCalculator {
    constructor() {
        this.totalRevenue = 0;
        this.fetchedReviewCount = null;
        this.fetchedPrice = null;
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

        // Input method toggle
        this.initializeInputToggle();

        // Fetch button (placeholder for now)
        document.querySelector('.btn-fetch').addEventListener('click', () => {
            this.fetchGameData();
        });

        // Add input validation
        this.addInputValidation();
    }

    initializeInputToggle() {
        const toggleButtons = document.querySelectorAll('.toggle-btn');
        const manualSection = document.getElementById('manualInputs');
        const urlSection = document.getElementById('urlInputs');

        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const method = button.dataset.method;
                
                // Update active button
                toggleButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Show/hide sections
                if (method === 'manual') {
                    manualSection.classList.remove('hidden');
                    urlSection.classList.add('hidden');
                } else {
                    manualSection.classList.add('hidden');
                    urlSection.classList.remove('hidden');
                }
            });
        });
    }

    async fetchGameData() {
        const urlInput = document.getElementById('steamUrl');
        const fetchedDataSection = document.getElementById('fetchedData');
        const fetchButton = document.querySelector('.btn-fetch');
        
        if (!urlInput.value.trim()) {
            this.showError('Please enter a Steam store URL.');
            return;
        }

        // Extract App ID from Steam URL
        const appId = this.extractAppIdFromUrl(urlInput.value.trim());
        if (!appId) {
            this.showError('Invalid Steam store URL. Please use a valid Steam store page URL.');
            return;
        }

        // Update button state
        fetchButton.textContent = '🔄 Fetching...';
        fetchButton.disabled = true;

        try {
            // Fetch game data from Steam API
            const gameData = await this.fetchSteamGameData(appId);
            
            if (gameData && gameData.success) {
                const data = gameData.data;
                
                // Store the fetched data for calculation
                this.fetchedReviewCount = this.extractReviewCount(gameData); // Pass full gameData, not just data
                this.fetchedPrice = this.extractPrice(data);
                
                // Update UI
                document.getElementById('gameName').textContent = data.name || 'Unknown Game';
                
                // Handle review count display
                const manualReviewInput = document.getElementById('manualReviewInput');
                if (this.fetchedReviewCount !== null) {
                    document.getElementById('previewReviews').textContent = this.formatNumber(this.fetchedReviewCount);
                    manualReviewInput.classList.add('hidden');
                } else {
                    document.getElementById('previewReviews').textContent = 'Manual input required';
                    manualReviewInput.classList.remove('hidden');
                }
                
                document.getElementById('previewPrice').textContent = `$${this.fetchedPrice.toFixed(2)}`;
                
                fetchedDataSection.classList.remove('hidden');
                
                if (this.fetchedReviewCount === null) {
                    this.showInfo(`Fetched price for "${data.name}". Please enter the review count manually from the Steam page.`);
                } else {
                    this.showInfo(`Successfully fetched data for "${data.name}"`);
                }
            } else {
                throw new Error('Game data not found or not available');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            this.showError('Failed to fetch game data. Please check the URL and try again.');
        } finally {
            // Reset button
            fetchButton.textContent = '🔍 Fetch Game Data';
            fetchButton.disabled = false;
        }
    }

    extractAppIdFromUrl(url) {
        // Match Steam store URLs like:
        // https://store.steampowered.com/app/123456/GameName/
        // https://store.steampowered.com/app/123456
        const match = url.match(/\/app\/(\d+)/);
        return match ? match[1] : null;
    }

    async fetchSteamGameData(appId) {
        try {
            console.log('Fetching data for App ID:', appId); // Debug log
            
            // Fetch both game details and review data in parallel
            const [gameResponse, reviewResponse] = await Promise.all([
                this.fetchWithCors(`https://store.steampowered.com/api/appdetails?appids=${appId}&filters=basic,price_overview`),
                this.fetchWithCors(`https://store.steampowered.com/appreviews/${appId}?json=1&filter=all&language=all&purchase_type=all`)
            ]);

            console.log('Game response:', gameResponse); // Debug log
            console.log('Review response:', reviewResponse); // Debug log

            const gameData = gameResponse[appId];
            const reviewData = reviewResponse;

            // Combine the data
            if (gameData && gameData.success) {
                gameData.reviewData = reviewData;
                console.log('Combined game data:', gameData); // Debug log
                return gameData;
            }
            return gameData;
        } catch (error) {
            console.error('Fetch error in fetchSteamGameData:', error); // Debug log
            throw new Error('Unable to fetch game data due to network restrictions');
        }
    }

    async fetchWithCors(url) {
        try {            
            const proxyResponse = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
            
            if (!proxyResponse.ok) {
                throw new Error(`Proxy request failed with status: ${proxyResponse.status}`);
            }
            
            const proxyData = await proxyResponse.json();
            
            if (proxyData.status && proxyData.status.http_code !== 200) {
                throw new Error(`Steam API returned status: ${proxyData.status.http_code}`);
            }
            
            return JSON.parse(proxyData.contents);
        } catch (error) {
            console.error('CORS proxy error:', error); // Debug log
            throw error;
        }
    }

    extractReviewCount(gameData) {
        // Use the review data from Steam's review API
        console.log('Game data received for extraction:', gameData);
        
        if (gameData && gameData.reviewData) {
            console.log('Review data exists:', gameData.reviewData);
            
            // Check if review data has the expected structure
            if (gameData.reviewData.success === 1) {
                console.log('Review API success confirmed');
                
                if (gameData.reviewData.query_summary && gameData.reviewData.query_summary.total_reviews !== undefined) {
                    const totalReviews = gameData.reviewData.query_summary.total_reviews;
                    console.log('SUCCESS: Total reviews extracted:', totalReviews);
                    return totalReviews;
                } else {
                    console.log('Query summary or total_reviews missing:', gameData.reviewData.query_summary);
                }
            } else {
                console.log('Review API returned success !== 1:', gameData.reviewData.success);
            }
        } else {
            console.log('No review data in game data:', gameData);
        }
        
        console.log('FAILED: Returning null - no valid review data found');
        return null;
    }

    extractPrice(gameData) {
        if (gameData.price_overview) {
            // Price is in cents, convert to dollars
            return gameData.price_overview.initial / 100;
        }
        
        if (gameData.is_free) {
            return 0;
        }
        
        // Default price if not available
        return 19.99;
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
        let reviewCount, steamPrice;
        
        // Check which input method is active
        const isManualInput = !document.getElementById('manualInputs').classList.contains('hidden');
        
        if (isManualInput) {
            // Manual input method
            const reviewCountInput = document.getElementById('reviewCount');
            const steamPriceInput = document.getElementById('steamPrice');
            
            reviewCount = parseFloat(reviewCountInput.value);
            steamPrice = parseFloat(steamPriceInput.value);

            // Validate inputs
            if (!this.validateInput(reviewCountInput) || !this.validateInput(steamPriceInput)) {
                this.showError('Please enter valid positive numbers for both fields.');
                return;
            }

            if (isNaN(reviewCount) || isNaN(steamPrice) || reviewCount <= 0 || steamPrice <= 0) {
                this.showError('Please enter valid positive numbers for both fields.');
                return;
            }
        } else {
            // URL input method - check if data has been fetched
            const fetchedDataSection = document.getElementById('fetchedData');
            
            if (fetchedDataSection.classList.contains('hidden')) {
                this.showError('Please fetch game data first by clicking "Fetch Game Data".');
                return;
            }
            
            if (this.fetchedPrice === null) {
                this.showError('Price data is incomplete. Please try fetching again or use Manual Input.');
                return;
            }
            
            // Check if we have review count or need manual input
            if (this.fetchedReviewCount === null) {
                const manualReviewInput = document.getElementById('fetchedReviewCount');
                const manualReviewCount = parseFloat(manualReviewInput.value);
                
                if (!manualReviewInput.value.trim() || isNaN(manualReviewCount) || manualReviewCount <= 0) {
                    this.showError('Please enter a valid review count in the manual input field.');
                    return;
                }
                
                reviewCount = manualReviewCount;
            } else {
                reviewCount = this.fetchedReviewCount;
            }
            
            steamPrice = this.fetchedPrice;
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
        this.showMessage(message, 'error');
    }

    showInfo(message) {
        this.showMessage(message, 'info');
    }

    showMessage(message, type = 'error') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.error-message, .info-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;
        
        const styles = {
            error: {
                background: '#fee',
                color: '#c33',
                border: '1px solid #fcc'
            },
            info: {
                background: '#e8f4ff',
                color: '#0066cc',
                border: '1px solid #b3d9ff'
            }
        };
        
        messageDiv.style.cssText = `
            background: ${styles[type].background};
            color: ${styles[type].color};
            padding: 12px;
            border-radius: 8px;
            margin: 15px 0;
            border: ${styles[type].border};
            text-align: center;
            font-weight: 600;
            animation: slideIn 0.3s ease-out;
        `;
        
        messageDiv.textContent = message;
        
        // Insert before first section
        const firstSection = document.querySelector('.section-card') || document.querySelector('h2');
        firstSection.parentNode.insertBefore(messageDiv, firstSection);

        // Auto-hide message after 4 seconds
        setTimeout(() => {
            if (messageDiv) {
                messageDiv.remove();
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
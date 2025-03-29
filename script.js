// DOM Elements
const sipForm = document.getElementById('sipForm');
const resultsDiv = document.getElementById('results');
const loadingDiv = document.getElementById('loading');
const themeToggle = document.getElementById('themeToggle');
const growthChartCtx = document.getElementById('growthChart').getContext('2d');
const historyBody = document.getElementById('historyBody');

// Chart instance
let growthChart;

// Theme toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
    }
});

// Form submission
sipForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const monthlyInvestment = parseFloat(document.getElementById('monthlyInvestment').value);
    const annualReturn = parseFloat(document.getElementById('annualReturn').value);
    const years = parseInt(document.getElementById('years').value);
    const inflationAdjust = document.getElementById('inflationAdjust').checked;

    // Show loading state
    resultsDiv.classList.add('hidden');
    loadingDiv.classList.remove('hidden');

    try {
        // Call API
        const response = await fetch('http://localhost:5000/api/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                monthly_investment: monthlyInvestment,
                annual_return: inflationAdjust ? annualReturn - 6 : annualReturn,
                years: years
            })
        });

        const data = await response.json();

        // Update UI with results
        document.getElementById('totalInvested').textContent = `₹${data.total_invested.toLocaleString()}`;
        document.getElementById('estimatedReturns').textContent = `₹${data.estimated_returns.toLocaleString()}`;
        document.getElementById('totalValue').textContent = `₹${data.total_value.toLocaleString()}`;

        // Generate growth chart
        generateGrowthChart(monthlyInvestment, annualReturn, years, data.total_value);

        // Load history
        loadHistory();

        // Show results
        loadingDiv.classList.add('hidden');
        resultsDiv.classList.remove('hidden');
    } catch (error) {
        console.error('Error:', error);
        loadingDiv.innerHTML = '<p class="text-red-500">Error calculating SIP. Please try again.</p>';
    }
});

// Generate growth chart
function generateGrowthChart(monthlyInvestment, annualReturn, years, totalValue) {
    const months = years * 12;
    const monthlyRate = annualReturn / 12 / 100;
    let invested = 0;
    let currentValue = 0;
    
    const labels = [];
    const investedData = [];
    const valueData = [];
    
    for (let i = 1; i <= months; i++) {
        invested += monthlyInvestment;
        currentValue = (currentValue + monthlyInvestment) * (1 + monthlyRate);
        
        if (i % 12 === 0 || i === months) {
            labels.push(`Year ${Math.ceil(i/12)}`);
            investedData.push(invested);
            valueData.push(currentValue);
        }
    }

    if (growthChart) {
        growthChart.destroy();
    }

    growthChart = new Chart(growthChartCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Invested Amount',
                    data: investedData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.1
                },
                {
                    label: 'Investment Value',
                    data: valueData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ₹${context.raw.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Load calculation history
async function loadHistory() {
    try {
        const response = await fetch('http://localhost:5000/api/history');
        const history = await response.json();
        
        historyBody.innerHTML = history.map(item => `
            <tr class="border-b">
                <td class="py-2 px-4">${new Date().toLocaleDateString()}</td>
                <td class="py-2 px-4">₹${item.monthly_investment.toLocaleString()}</td>
                <td class="py-2 px-4">${item.annual_return}%</td>
                <td class="py-2 px-4">${item.years}</td>
                <td class="py-2 px-4">₹${item.total_invested.toLocaleString()}</td>
                <td class="py-2 px-4">₹${item.estimated_returns.toLocaleString()}</td>
                <td class="py-2 px-4">₹${item.total_value.toLocaleString()}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

// Initial load
loadHistory();

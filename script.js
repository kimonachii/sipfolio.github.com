document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('sip-form');
    const resultsDiv = document.getElementById('results');
    const chartCtx = document.getElementById('sip-chart').getContext('2d');
    let sipChart;

    // Add Chart.js CDN dynamically
    const chartScript = document.createElement('script');
    chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    document.head.appendChild(chartScript);

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateSIP();
    });

    function calculateSIP() {
        // Get input values
        const monthlyInvestment = parseFloat(document.getElementById('monthly-investment').value);
        const annualReturn = parseFloat(document.getElementById('annual-return').value);
        const duration = parseInt(document.getElementById('investment-duration').value);
        const compounding = document.getElementById('compounding-frequency').value;

        // Validate inputs
        if (isNaN(monthlyInvestment) || isNaN(annualReturn) || isNaN(duration) || 
            monthlyInvestment <= 0 || annualReturn <= 0 || duration <= 0) {
            alert('Please enter valid positive numbers for all fields');
            return;
        }

        // Calculate based on compounding frequency
        let periodsPerYear, ratePerPeriod;
        switch(compounding) {
            case 'monthly':
                periodsPerYear = 12;
                ratePerPeriod = annualReturn / 12 / 100;
                break;
            case 'quarterly':
                periodsPerYear = 4;
                ratePerPeriod = annualReturn / 4 / 100;
                break;
            case 'annually':
                periodsPerYear = 1;
                ratePerPeriod = annualReturn / 100;
                break;
        }

        const totalPeriods = duration * periodsPerYear;
        const totalInvestment = monthlyInvestment * 12 * duration;

        // SIP calculation formula
        const maturityValue = monthlyInvestment * 
            ((Math.pow(1 + ratePerPeriod, totalPeriods) - 1) / ratePerPeriod) * 
            (1 + ratePerPeriod);

        const estimatedReturns = maturityValue - totalInvestment;

        // Display results
        document.getElementById('total-invested').textContent = 
            `Total Invested: ₹${totalInvestment.toLocaleString('en-IN')}`;
        document.getElementById('estimated-returns').textContent = 
            `Estimated Returns: ₹${estimatedReturns.toLocaleString('en-IN')}`;
        document.getElementById('total-maturity').textContent = 
            `Maturity Value: ₹${maturityValue.toLocaleString('en-IN')}`;

        resultsDiv.classList.remove('hidden');

        // Update chart
        updateChart(totalInvestment, estimatedReturns);
    }

    function updateChart(invested, returns) {
        if (sipChart) {
            sipChart.destroy();
        }

        sipChart = new Chart(chartCtx, {
            type: 'doughnut',
            data: {
                labels: ['Total Invested', 'Estimated Returns'],
                datasets: [{
                    data: [invested, returns],
                    backgroundColor: ['#3b82f6', '#10b981'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ₹${context.raw.toLocaleString('en-IN')}`;
                            }
                        }
                    }
                }
            }
        });
    }
});

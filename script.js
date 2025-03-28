document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts
    const growthCtx = document.getElementById('growthChart').getContext('2d');
    const compositionCtx = document.getElementById('compositionChart').getContext('2d');
    
    let growthChart = new Chart(growthCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Investment Growth',
                data: [],
                borderColor: '#4361ee',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '₹' + context.raw.toLocaleString('en-IN');
                        }
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString('en-IN');
                        }
                    }
                }
            }
        }
    });
    
    let compositionChart = new Chart(compositionCtx, {
        type: 'doughnut',
        data: {
            labels: ['Invested Amount', 'Estimated Returns'],
            datasets: [{
                data: [0, 0],
                backgroundColor: [
                    '#3a0ca3',
                    '#4cc9f0'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '₹' + context.raw.toLocaleString('en-IN');
                        }
                    }
                }
            }
        }
    });
    
    // Form submission handler
    document.getElementById('sipForm').addEventListener('submit', function(e) {
        e.preventDefault();
        calculateSIP();
    });
    
    // Initial calculation
    calculateSIP();
    
    function calculateSIP() {
        // Get input values
        const monthlyInvestment = parseFloat(document.getElementById('monthlyInvestment').value);
        const investmentPeriod = parseInt(document.getElementById('investmentPeriod').value);
        const expectedReturn = parseFloat(document.getElementById('expectedReturn').value);
        
        // Calculate values
        const months = investmentPeriod * 12;
        const monthlyRate = expectedReturn / 12 / 100;
        
        // Future value of SIP formula
        const futureValue = monthlyInvestment * 
                          (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * 
                          (1 + monthlyRate);
        
        const investedAmount = monthlyInvestment * months;
        const estimatedReturns = futureValue - investedAmount;
        
        // Update results display
        document.getElementById('investedAmount').textContent = '₹' + investedAmount.toLocaleString('en-IN', {maximumFractionDigits: 0});
        document.getElementById('estimatedReturns').textContent = '₹' + estimatedReturns.toLocaleString('en-IN', {maximumFractionDigits: 0});
        document.getElementById('totalValue').textContent = '₹' + futureValue.toLocaleString('en-IN', {maximumFractionDigits: 0});
        
        // Update charts
        updateGrowthChart(monthlyInvestment, investmentPeriod, expectedReturn);
        updateCompositionChart(investedAmount, estimatedReturns);
        
        // Update yearly breakdown table
        updateYearlyTable(monthlyInvestment, investmentPeriod, expectedReturn);
    }
    
    function updateGrowthChart(monthlyInvestment, years, expectedReturn) {
        const labels = [];
        const data = [];
        
        for (let year = 1; year <= years; year++) {
            labels.push(`Year ${year}`);
            
            const months = year * 12;
            const monthlyRate = expectedReturn / 12 / 100;
            const futureValue = monthlyInvestment * 
                              (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * 
                              (1 + monthlyRate);
            
            data.push(Math.round(futureValue));
        }
        
        growthChart.data.labels = labels;
        growthChart.data.datasets[0].data = data;
        growthChart.update();
    }
    
    function updateCompositionChart(investedAmount, estimatedReturns) {
        compositionChart.data.datasets[0].data = [investedAmount, estimatedReturns];
        compositionChart.update();
    }
    
    function updateYearlyTable(monthlyInvestment, years, expectedReturn) {
        const tableBody = document.querySelector('#yearlyTable tbody');
        tableBody.innerHTML = '';
        
        let cumulativeInvestment = 0;
        let cumulativeValue = 0

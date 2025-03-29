// server.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// SIP Calculation Function
function calculateSIP(monthlyInvestment, annualRate, years) {
    const monthlyRate = annualRate / 12 / 100;
    const months = years * 12;
    
    // SIP Future Value formula: FV = P * [(1 + r)^n - 1] / r * (1 + r)
    const futureValue = monthlyInvestment * 
                       ((Math.pow(1 + monthlyRate, months) - 1) / 
                       monthlyRate * 
                       (1 + monthlyRate);
    
    const totalInvestment = monthlyInvestment * months;
    const estimatedReturns = futureValue - totalInvestment;
    
    return {
        investedAmount: Math.round(totalInvestment),
        estimatedReturns: Math.round(estimatedReturns),
        totalValue: Math.round(futureValue)
    };
}

// SIP Calculation Endpoint
app.post('/api/calculate-sip', (req, res) => {
    try {
        const { monthlyInvestment, annualRate, years } = req.body;
        
        // Input validation
        if (!monthlyInvestment || !annualRate || !years) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        if (monthlyInvestment <= 0 || annualRate <= 0 || years <= 0) {
            return res.status(400).json({ error: 'Values must be positive' });
        }
        
        const result = calculateSIP(
            parseFloat(monthlyInvestment),
            parseFloat(annualRate),
            parseFloat(years)
        );
        
        res.json(result);
    } catch (error) {
        console.error('Error in SIP calculation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

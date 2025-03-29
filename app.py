from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import math

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sip_calculator.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class CalculationHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    monthly_investment = db.Column(db.Float, nullable=False)
    annual_return = db.Column(db.Float, nullable=False)
    years = db.Column(db.Integer, nullable=False)
    total_invested = db.Column(db.Float, nullable=False)
    estimated_returns = db.Column(db.Float, nullable=False)
    total_value = db.Column(db.Float, nullable=False)

def calculate_sip(monthly_investment, annual_return, years):
    monthly_rate = annual_return / 12 / 100
    months = years * 12
    total_value = monthly_investment * ((math.pow(1 + monthly_rate, months) - 1) / monthly_rate) * (1 + monthly_rate)
    total_invested = monthly_investment * months
    estimated_returns = total_value - total_invested
    return {
        'total_invested': round(total_invested, 2),
        'estimated_returns': round(estimated_returns, 2),
        'total_value': round(total_value, 2)
    }

@app.route('/api/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    result = calculate_sip(
        data['monthly_investment'],
        data['annual_return'],
        data['years']
    )
    
    # Save to history
    history = CalculationHistory(
        monthly_investment=data['monthly_investment'],
        annual_return=data['annual_return'],
        years=data['years'],
        total_invested=result['total_invested'],
        estimated_returns=result['estimated_returns'],
        total_value=result['total_value']
    )
    db.session.add(history)
    db.session.commit()
    
    return jsonify(result)

@app.route('/api/history', methods=['GET'])
def get_history():
    history = CalculationHistory.query.order_by(CalculationHistory.id.desc()).all()
    return jsonify([{
        'id': h.id,
        'monthly_investment': h.monthly_investment,
        'annual_return': h.annual_return,
        'years': h.years,
        'total_invested': h.total_invested,
        'estimated_returns': h.estimated_returns,
        'total_value': h.total_value
    } for h in history])

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)

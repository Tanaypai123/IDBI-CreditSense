# ml_engine.py
import os
import pickle
import numpy as np
import pandas as pd
import shap
from typing import List, Dict, Any, Tuple

# Resolve absolute path to the models directory
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BACKEND_DIR)
MODELS_DIR = os.path.join(PROJECT_DIR, "models")

# Display names mapping
DISPLAY_NAMES = {
    "Business_Age_Yrs": "Business Age (Years)",
    "Annual_Turnover": "Annual Turnover (INR)",
    "Digital_Adoption_Score": "Digital Adoption Index",
    "Industry_Risk": "Sector Risk Profile",
    "Revenue_Std": "Revenue Volatility (Std Dev)",
    "Revenue_Growth_MoM_Mean": "Revenue Growth Rate (MoM)",
    "Profit_Margin_Mean": "Operating Profit Margin",
    "Working_Capital_Mean": "Mean Working Capital",
    "Current_Ratio_Mean": "Current Liquidity Ratio",
    "Quick_Ratio_Mean": "Quick Liquidity Ratio",
    "DPO_Mean": "Days Payable Outstanding (DPO)",
    "Cashflow_Stability_Mean": "Cashflow Stability Score",
    "Revenue_Trend_Slope": "Revenue Trend Slope",
    "Profit_Margin_Trend": "Profit Margin Growth Trend",
    "GST_Compliance_Mean": "GST Compliance Score",
    "GST_Delay_Days_Std": "GST Filing Delay Dispersion",
    "GST_Filing_Consistency": "GST Filing Consistency",
    "GST_OnTime_Rate": "GST On-Time Filing Rate",
    "UPI_Transactions_Mean": "UPI Monthly Transactions",
    "UPI_Volume_Total": "Total UPI Transaction Volume",
    "UPI_Order_Value_Mean": "UPI Average Order Value",
    "Active_Loan_Count": "Active Loan Count",
    "Total_Loan_Amount": "Historical Loan Principal",
    "Outstanding_Principal_Total": "Outstanding Principal Debt",
    "EMI_Delay_Count": "Late EMI Repayments",
    "Default_History": "Historical Defaults Count",
    "Annual_Attrition_Rate": "Employee Attrition Rate",
    "Hiring_Trend_Pct": "Hiring Growth Trend",
    "Net_Employees_Added": "Net New Hires Added",
    "Average_Salary": "Average Staff Salary",
    "EPFO_Registered": "EPFO Registered Status",
    "Skill_Level_Index": "Employee Skill Capability"
}

# Global loaded variables
_models_loaded = False
model_health = None
model_default = None
model_loan = None
feature_columns = None
shap_explainer = None

def load_resources():
    global _models_loaded, model_health, model_default, model_loan, feature_columns, shap_explainer
    if _models_loaded:
        return
        
    health_path = os.path.join(MODELS_DIR, "best_health_model.pkl")
    default_path = os.path.join(MODELS_DIR, "best_default_model.pkl")
    loan_path = os.path.join(MODELS_DIR, "best_loan_model.pkl")
    cols_path = os.path.join(MODELS_DIR, "feature_columns.pkl")
    
    with open(health_path, "rb") as f:
        model_health = pickle.load(f)
    with open(default_path, "rb") as f:
        model_default = pickle.load(f)
    with open(loan_path, "rb") as f:
        model_loan = pickle.load(f)
    with open(cols_path, "rb") as f:
        feature_columns = pickle.load(f)
        
    shap_explainer = shap.TreeExplainer(model_health)
    _models_loaded = True

def build_feature_vector(inputs_dict: Dict[str, Any]) -> pd.DataFrame:
    load_resources()
    feat_vec = {col: 0.0 for col in feature_columns}
    
    # Map numerical values
    for col in feature_columns:
        if col in inputs_dict:
            feat_vec[col] = float(inputs_dict[col])
            
    # One-hot encoding variables
    ind_col = f"Industry_{inputs_dict.get('Industry', '')}"
    if ind_col in feat_vec:
        feat_vec[ind_col] = 1.0
        
    state_col = f"State_{inputs_dict.get('State', '')}"
    if state_col in feat_vec:
        feat_vec[state_col] = 1.0
        
    type_col = f"MSME_Type_{inputs_dict.get('MSME_Type', '')}"
    if type_col in feat_vec:
        feat_vec[type_col] = 1.0
        
    return pd.DataFrame([feat_vec])

def predict_single(inputs_dict: Dict[str, Any]) -> Tuple[float, str, float, bool, float, List[Dict[str, Any]], List[Dict[str, Any]]]:
    load_resources()
    row_df = build_feature_vector(inputs_dict)
    
    # 1. Health Score
    score = float(model_health.predict(row_df)[0])
    score = np.clip(score, 0.0, 100.0)
    
    # 2. Risk classification
    if score >= 85:
        risk_category = "Excellent"
    elif score >= 70:
        risk_category = "Low Risk"
    elif score >= 50:
        risk_category = "Medium Risk"
    elif score >= 30:
        risk_category = "High Risk"
    else:
        risk_category = "Critical Risk"
        
    # 3. Default Probability
    default_prob = float(model_default.predict(row_df)[0])
    default_prob = np.clip(default_prob, 0.0, 1.0)
    
    # 4. Loan Eligibility
    eligible = bool(model_loan.predict(row_df)[0])
    
    # Recommended Limit
    max_loan = 0.0
    turnover = float(inputs_dict.get("Annual_Turnover", 10000000.0))
    if eligible:
        max_loan = float(np.round((turnover * 0.25 * (score / 100.0)), -4))
        
    # 5. Local SHAP explainability
    sv = shap_explainer(row_df)
    contribs = pd.Series(sv.values[0], index=feature_columns)
    
    # Split into positive drivers (sorted desc) and negative drivers (sorted asc)
    pos = contribs[contribs > 0].sort_values(ascending=False).head(3)
    neg = contribs[contribs < 0].sort_values(ascending=True).head(3)
    
    top_positive = [
        {"feature": feat, "impact": float(val), "display_name": DISPLAY_NAMES.get(feat, feat)}
        for feat, val in pos.items()
    ]
    
    top_negative = [
        {"feature": feat, "impact": float(val), "display_name": DISPLAY_NAMES.get(feat, feat)}
        for feat, val in neg.items()
    ]
    
    return score, risk_category, default_prob, eligible, max_loan, top_positive, top_negative

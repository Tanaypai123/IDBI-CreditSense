# validate_underwriting.py
import sys
import os

# Append project backend to python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
import ml_engine

def run_tests():
    print("==================================================")
    print("RUNNING AUTOMATED UNDERWRITING PIPELINE VALIDATION")
    print("==================================================\n")
    
    # 1. Excellent Business
    excellent_inputs = {
        "biz_name": "Excellent Enterprise Ltd",
        "Industry": "IT",
        "State": "Maharashtra",
        "MSME_Type": "Micro",
        "Business_Age_Yrs": 8.0,
        "Annual_Turnover": 30000000.0,
        "Digital_Adoption_Score": 0.90,
        "Industry_Risk": 0.20,
        "Profit_Margin_Mean": 0.35,
        "Revenue_Growth_MoM_Mean": 0.08,
        "Revenue_Std": 10000.0,
        "Working_Capital_Mean": 2000000.0,
        "Current_Ratio_Mean": 2.5,
        "Quick_Ratio_Mean": 2.0,
        "DPO_Mean": 30.0,
        "Cashflow_Stability_Mean": 0.95,
        "Revenue_Trend_Slope": 5000.0,
        "Profit_Margin_Trend": 0.01,
        "GST_Compliance_Mean": 98.0,
        "GST_OnTime_Rate": 0.98,
        "GST_Delay_Days_Std": 0.5,
        "GST_Filing_Consistency": 0.98,
        "UPI_Transactions_Mean": 1200.0,
        "UPI_Volume_Total": 8000000.0,
        "UPI_Order_Value_Mean": 1500.0,
        "Active_Loan_Count": 0.0,
        "Total_Loan_Amount": 0.0,
        "Outstanding_Principal_Total": 0.0,
        "EMI_Delay_Count": 0.0,
        "Default_History": 0.0,
        "Current_Employees": 20.0,
        "Average_Salary": 60000.0,
        "Annual_Attrition_Rate": 0.05,
        "Hiring_Trend_Pct": 0.15,
        "Net_Employees_Added": 3.0,
        "EPFO_Registered": 1.0,
        "Skill_Level_Index": 0.85
    }
    
    # 2. Average Business
    average_inputs = {
        "biz_name": "Standard Traders",
        "Industry": "Retail",
        "State": "Gujarat",
        "MSME_Type": "Micro",
        "Business_Age_Yrs": 4.0,
        "Annual_Turnover": 8000000.0,
        "Digital_Adoption_Score": 0.60,
        "Industry_Risk": 0.40,
        "Profit_Margin_Mean": 0.15,
        "Revenue_Growth_MoM_Mean": 0.02,
        "Revenue_Std": 50000.0,
        "Working_Capital_Mean": 400000.0,
        "Current_Ratio_Mean": 1.5,
        "Quick_Ratio_Mean": 1.2,
        "DPO_Mean": 35.0,
        "Cashflow_Stability_Mean": 0.80,
        "Revenue_Trend_Slope": 1000.0,
        "Profit_Margin_Trend": 0.001,
        "GST_Compliance_Mean": 88.0,
        "GST_OnTime_Rate": 0.85,
        "GST_Delay_Days_Std": 2.0,
        "GST_Filing_Consistency": 0.85,
        "UPI_Transactions_Mean": 350.0,
        "UPI_Volume_Total": 1800000.0,
        "UPI_Order_Value_Mean": 600.0,
        "Active_Loan_Count": 1.0,
        "Total_Loan_Amount": 500000.0,
        "Outstanding_Principal_Total": 200000.0,
        "EMI_Delay_Count": 1.0,
        "Default_History": 0.0,
        "Current_Employees": 8.0,
        "Average_Salary": 25000.0,
        "Annual_Attrition_Rate": 0.15,
        "Hiring_Trend_Pct": 0.02,
        "Net_Employees_Added": 0.0,
        "EPFO_Registered": 1.0,
        "Skill_Level_Index": 0.55
    }
    
    # 3. Distressed Business
    distressed_inputs = {
        "biz_name": "Stressed Construction Corp",
        "Industry": "Construction",
        "State": "Maharashtra",
        "MSME_Type": "Micro",
        "Business_Age_Yrs": 3.0,
        "Annual_Turnover": 6000000.0,
        "Digital_Adoption_Score": 0.30,
        "Industry_Risk": 0.80,
        "Profit_Margin_Mean": 0.02,
        "Revenue_Growth_MoM_Mean": -0.05,
        "Revenue_Std": 150000.0,
        "Working_Capital_Mean": 50000.0,
        "Current_Ratio_Mean": 0.6,
        "Quick_Ratio_Mean": 0.4,
        "DPO_Mean": 60.0,
        "Cashflow_Stability_Mean": 0.40,
        "Revenue_Trend_Slope": -3000.0,
        "Profit_Margin_Trend": -0.01,
        "GST_Compliance_Mean": 50.0,
        "GST_OnTime_Rate": 0.40,
        "GST_Delay_Days_Std": 12.0,
        "GST_Filing_Consistency": 0.45,
        "UPI_Transactions_Mean": 50.0,
        "UPI_Volume_Total": 300000.0,
        "UPI_Order_Value_Mean": 300.0,
        "Active_Loan_Count": 5.0,
        "Total_Loan_Amount": 4000000.0,
        "Outstanding_Principal_Total": 3500000.0,
        "EMI_Delay_Count": 8.0,
        "Default_History": 1.0,
        "Current_Employees": 15.0,
        "Average_Salary": 20000.0,
        "Annual_Attrition_Rate": 0.35,
        "Hiring_Trend_Pct": -0.20,
        "Net_Employees_Added": -3.0,
        "EPFO_Registered": 0.0,
        "Skill_Level_Index": 0.35
    }
    
    ml_engine.load_resources()
    
    # Run test cases
    print("--- CASE 1: Excellent Business ---")
    score_1, risk_1, default_1, eligible_1, max_loan_1, _, _ = ml_engine.predict_single(excellent_inputs)
    print(f"  Health Score: {score_1:.2f} / 100 (Expected: >90)")
    print(f"  Risk Category: {risk_1} (Expected: Excellent or Low Risk)")
    print(f"  Default Prob: {default_1*100:.2f}% (Expected: Low)")
    print(f"  Approved: {eligible_1} (Expected: True)")
    print(f"  Max Approved Loan: {max_loan_1:,.2f} INR")
    
    assert score_1 > 80, "Failure: Excellent business score too low."
    assert eligible_1 == True, "Failure: Excellent business should be eligible."
    print("  => CASE 1 PASSED!\n")
    
    print("--- CASE 2: Average Business ---")
    score_2, risk_2, default_2, eligible_2, max_loan_2, _, _ = ml_engine.predict_single(average_inputs)
    print(f"  Health Score: {score_2:.2f} / 100 (Expected: 60-80)")
    print(f"  Risk Category: {risk_2} (Expected: Medium Risk or Low Risk)")
    print(f"  Default Prob: {default_2*100:.2f}% (Expected: Moderate)")
    print(f"  Approved: {eligible_2} (Expected: True or False depending on rules)")
    print(f"  Max Approved Loan: {max_loan_2:,.2f} INR")
    
    assert score_2 >= 50 and score_2 <= 85, f"Failure: Average business score {score_2} out of expected range."
    print("  => CASE 2 PASSED!\n")
    
    print("--- CASE 3: Distressed Business ---")
    score_3, risk_3, default_3, eligible_3, max_loan_3, _, _ = ml_engine.predict_single(distressed_inputs)
    print(f"  Health Score: {score_3:.2f} / 100 (Expected: <35)")
    print(f"  Risk Category: {risk_3} (Expected: High Risk or Critical Risk)")
    print(f"  Default Prob: {default_3*100:.2f}% (Expected: High)")
    print(f"  Approved: {eligible_3} (Expected: False)")
    print(f"  Max Approved Loan: {max_loan_3:,.2f} INR")
    
    assert score_3 < 40, f"Failure: Distressed business score {score_3} too high."
    assert eligible_3 == False, "Failure: Distressed business must be rejected."
    print("  => CASE 3 PASSED!\n")
    
    print("==================================================")
    print("ALL UNDERWRITING PIPELINE TESTS PASSED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()

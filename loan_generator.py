import numpy as np
import pandas as pd
from config import Config
from utils import generate_ids
from tqdm import tqdm

class LoanGenerator:
    def __init__(self, business_df, monthly_df):
        self.b_df = business_df
        # Get the latest month's health for loan baseline
        self.latest_health = monthly_df[monthly_df['Month_Index'] == Config.MONTHS_HISTORY][['Business_ID', 'Business_Health_Index']]
        np.random.seed(Config.RANDOM_SEED)

    def generate(self):
        print("Generating Loan History...")
        
        df = self.b_df[['Business_ID', 'Annual_Turnover', 'Industry_Risk', 'Business_Age_Yrs', 'Account_Age_Yrs', 'Base_Financial_Stability']].copy()
        df = df.merge(self.latest_health, on='Business_ID', how='left')
        
        # 1. Loan Application & Approval
        # Probability of applying for a loan
        apply_prob = np.clip(0.3 + (df['Annual_Turnover'] / 50000000) - (df['Base_Financial_Stability'] * 0.2), 0.1, 0.85)
        df['Applied_For_Loan'] = np.random.rand(len(df)) < apply_prob
        
        # Approval Probability based on Health and Risk
        approval_prob = np.clip(df['Business_Health_Index'] - df['Industry_Risk'] + 0.4, 0.05, 0.95)
        df['Loan_Approved'] = np.where(df['Applied_For_Loan'], np.random.rand(len(df)) < approval_prob, False)
        
        # Filter to only approved loans for detail generation
        loans = df[df['Loan_Approved']].copy()
        num_loans = len(loans)
        
        loans['Loan_ID'] = generate_ids("LID", num_loans)
        
        # 2. Loan Terms
        # Maximum eligible loan roughly 20% of Turnover
        max_loan = loans['Annual_Turnover'] * 0.20
        loans['Loan_Amount'] = (max_loan * np.random.uniform(0.4, 1.0, num_loans)).round(-4) # Round to nearest 10k
        loans['Loan_Amount'] = np.clip(loans['Loan_Amount'], 50000, 50000000)
        
        loans['Tenure_Months'] = np.random.choice([12, 24, 36, 48, 60], size=num_loans, p=[0.1, 0.3, 0.4, 0.15, 0.05])
        
        # Interest Rate (Base 8% + Risk Premium)
        risk_premium = loans['Industry_Risk'] * 5.0 + (1.0 - loans['Business_Health_Index']) * 10.0
        loans['Interest_Rate_Pct'] = np.clip(8.0 + risk_premium + np.random.normal(0, 0.5, num_loans), 8.0, 24.0).round(2)
        
        # EMI Calculation (Standard Amortization Formula: P * r * (1+r)^n / ((1+r)^n - 1))
        r = (loans['Interest_Rate_Pct'] / 100) / 12
        n = loans['Tenure_Months']
        loans['EMI'] = (loans['Loan_Amount'] * r * (1 + r)**n) / ((1 + r)**n - 1)
        loans['EMI'] = loans['EMI'].round(2)
        
        # 3. Performance & Default
        # Randomize how many months into the loan they are
        loans['Months_Paid'] = (np.random.rand(num_loans) * loans['Tenure_Months']).astype(int)
        
        # Outstanding principal (approximate for ML purposes)
        loans['Outstanding_Principal'] = np.maximum(loans['Loan_Amount'] - (loans['EMI'] * loans['Months_Paid'] * 0.7), 0).round(2)
        
        # Default/Missed EMI probability correlated with Health Index
        missed_prob = np.clip(0.5 - (loans['Business_Health_Index'] * 0.5) + (loans['Industry_Risk'] * 0.2), 0.01, 0.6)
        
        # Generate Missed EMIs
        is_struggling = np.random.rand(num_loans) < missed_prob
        loans['Missed_EMIs'] = np.where(is_struggling, np.random.gamma(1.5, 2.0, num_loans).astype(int), 0)
        loans['Missed_EMIs'] = np.clip(loans['Missed_EMIs'], 0, loans['Months_Paid'])
        
        loans['Is_Default'] = loans['Missed_EMIs'] >= 3
        loans['Account_Status'] = np.where(
            loans['Is_Default'], 'NPA',
            np.where(loans['Outstanding_Principal'] <= 0, 'CLOSED', 
            np.where(loans['Missed_EMIs'] > 0, 'SMA', 'STANDARD'))
        )
        
        # Clean up and export
        drop_cols = ['Annual_Turnover', 'Industry_Risk', 'Business_Age_Yrs', 'Account_Age_Yrs', 'Base_Financial_Stability', 'Business_Health_Index', 'Applied_For_Loan', 'Loan_Approved']
        loans = loans.drop(columns=drop_cols)
        
        loans.to_csv(f"{Config.OUTPUT_DIR}/loan_history.csv", index=False)
        return df[['Business_ID', 'Applied_For_Loan', 'Loan_Approved']] # Return summary for labels
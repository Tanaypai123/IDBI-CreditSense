import numpy as np
import pandas as pd
from config import Config
from tqdm import tqdm

class GSTGenerator:
    def __init__(self, monthly_df, business_df):
        self.m_df = monthly_df
        self.b_df = business_df
        np.random.seed(Config.RANDOM_SEED)

    def generate(self):
        print("Generating GST History...")
        
        # GST is directly correlated with Revenue and Expenses from Monthly Financials
        df = self.m_df[['Business_ID', 'Month_Index', 'Date', 'Revenue', 'Operating_Expense', 'Business_Health_Index']].copy()
        
        # Merge base details
        df = df.merge(self.b_df[['Business_ID', 'GSTIN', 'Industry_Risk']], on='Business_ID', how='left')
        
        # 1. Tax Generation (Output = Sales Tax, Input = Purchase Tax)
        # Assuming average GST rate of 18%
        df['Output_Tax'] = df['Revenue'] * 0.18
        # Input credit based on expenses (assume 60% of OpEx is GST applicable at 18%)
        df['Input_Credit'] = (df['Operating_Expense'] * 0.60) * 0.18
        
        df['GST_Collected'] = df['Output_Tax'] * np.random.uniform(0.95, 1.05, len(df))
        df['GST_Paid'] = np.maximum(df['GST_Collected'] - df['Input_Credit'], 0)
        
        # 2. Compliance and Delays
        # Higher Industry Risk & Lower Health = Higher Delay Probability
        delay_prob = np.clip(df['Industry_Risk'] - (df['Business_Health_Index'] * 0.5) + 0.2, 0.01, 0.9)
        
        # Generate delays (Days)
        is_delayed = np.random.rand(len(df)) < delay_prob
        df['Delay_Days'] = np.where(is_delayed, np.random.exponential(scale=15, size=len(df)).astype(int), 0)
        df['Delay_Days'] = np.clip(df['Delay_Days'], 0, 180)
        
        # Penalty (e.g., 50 Rs per day of delay)
        df['Penalty'] = df['Delay_Days'] * 50
        
        # Standard filing date is 20th of the next month
        filing_base_date = df['Date'] + pd.DateOffset(months=1) + pd.Timedelta(days=19)
        df['GST_Filing_Date'] = filing_base_date + pd.to_timedelta(df['Delay_Days'], unit='d')
        
        # 3. Compliance Score (0 to 100)
        df['Compliance_Score'] = 100 - np.clip((df['Delay_Days'] / 30) * 20, 0, 100)
        
        # Cleanup
        df = df.drop(columns=['Revenue', 'Operating_Expense', 'Business_Health_Index', 'Industry_Risk'])
        
        float_cols = df.select_dtypes(include=['float64']).columns
        df[float_cols] = df[float_cols].astype('float32').round(2)
        
        df.to_csv(f"{Config.OUTPUT_DIR}/gst_history.csv", index=False)
        return df
import numpy as np
import pandas as pd
from config import Config
from tqdm import tqdm

class EmployeeGenerator:
    def __init__(self, business_df):
        self.b_df = business_df
        np.random.seed(Config.RANDOM_SEED)

    def generate(self):
        print("Generating Employee Details...")
        
        # Base DataFrame
        df = self.b_df[['Business_ID', 'Employee_Count', 'Industry', 'Annual_Turnover', 'Business_Momentum']].copy()
        
        # Attrition Rate (Correlated with Industry and Momentum)
        # High turnover in Retail/Restaurant, lower in IT/Medical
        base_attrition = np.where(
            df['Industry'].isin(['Retail', 'Restaurant', 'Construction']), 0.25,
            np.where(df['Industry'].isin(['IT', 'Medical', 'Pharmacy']), 0.10, 0.18)
        )
        
        # High momentum = growing company = lower attrition
        df['Annual_Attrition_Rate'] = np.clip(base_attrition - (df['Business_Momentum'] * 0.05) + np.random.normal(0, 0.02, len(df)), 0.02, 0.50)
        
        # Hiring Trend (Net new employees this year)
        # Driven purely by business momentum
        growth_factor = (df['Business_Momentum'] - 1.0) # > 0 means growing
        df['Hiring_Trend_Pct'] = np.clip(growth_factor + np.random.normal(0, 0.05, len(df)), -0.3, 0.5)
        df['Net_Employees_Added'] = (df['Employee_Count'] * df['Hiring_Trend_Pct']).astype(int)
        
        # Salary distributions
        df['Average_Salary'] = np.clip((df['Annual_Turnover'] * 0.15) / np.maximum(df['Employee_Count'], 1), 120000, 1500000)
        
        # EPFO Compliance (Proxy for formalization)
        # Higher turnover and higher employee count = more likely to be EPFO compliant
        compliance_prob = np.clip((df['Employee_Count'] / 20) + (df['Annual_Turnover'] / 50000000), 0.1, 0.99)
        df['EPFO_Registered'] = np.random.rand(len(df)) < compliance_prob
        
        # Skill Level Distribution (Categorical representation for ML)
        df['Skill_Level_Index'] = np.where(
            df['Industry'].isin(['IT', 'Medical', 'Education']), np.random.normal(0.8, 0.1, len(df)),
            np.where(df['Industry'].isin(['Construction', 'Agriculture', 'Transport']), np.random.normal(0.3, 0.1, len(df)),
                     np.random.normal(0.5, 0.15, len(df)))
        )
        df['Skill_Level_Index'] = np.clip(df['Skill_Level_Index'], 0.1, 1.0)
        
        # Cleanup
        df = df.drop(columns=['Industry', 'Annual_Turnover', 'Business_Momentum'])
        
        float_cols = ['Annual_Attrition_Rate', 'Hiring_Trend_Pct', 'Average_Salary', 'Skill_Level_Index']
        df[float_cols] = df[float_cols].astype('float32').round(3)
        
        df.to_csv(f"{Config.OUTPUT_DIR}/employee_details.csv", index=False)
        return df
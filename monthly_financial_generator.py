import numpy as np
import pandas as pd
from config import Config
from business_rules import BusinessRules
from tqdm import tqdm
from utils import generate_correlated_noise

class MonthlyFinancialGenerator:
    def __init__(self, business_df):
        self.b_df = business_df
        self.num_months = Config.MONTHS_HISTORY
        self.num_businesses = len(business_df)
        np.random.seed(Config.RANDOM_SEED)

    def generate(self):
        print("Generating Monthly Financials (Time-Series)...")
        
        # 1. Create Base Grid (25,000 MSMEs * 24 Months = 600,000 rows)
        business_ids = self.b_df['Business_ID'].values
        months = np.arange(1, self.num_months + 1)
        
        # Vectorized cartesian product
        grid_b_ids = np.repeat(business_ids, self.num_months)
        grid_months = np.tile(months, self.num_businesses)
        
        # Base dates
        start_date = pd.Timestamp(f"{Config.START_YEAR}-{Config.START_MONTH:02d}-01")
        dates = [start_date + pd.DateOffset(months=i) for i in range(self.num_months)]
        grid_dates = np.tile(dates, self.num_businesses)
        grid_month_idx = pd.DatetimeIndex(grid_dates).month
        
        df = pd.DataFrame({
            'Business_ID': grid_b_ids,
            'Month_Index': grid_months,
            'Date': grid_dates,
            'Calendar_Month': grid_month_idx
        })
        
        # 2. Merge Base Business Data
        df = df.merge(self.b_df[['Business_ID', 'Industry', 'Annual_Turnover', 'Industry_Risk', 'Business_Momentum', 'Digital_Adoption_Score', 'Employee_Count']], on='Business_ID', how='left')
        
        # 3. Macro Factors
        # Inflation trend: Starts at 1.0, increases slightly over 24 months
        inflation_factor = np.linspace(1.0, 1.12, self.num_months)
        economic_index = np.linspace(1.0, 1.05, self.num_months) + np.random.normal(0, 0.02, self.num_months)
        
        # Map to grid
        df['Inflation_Factor'] = np.tile(inflation_factor, self.num_businesses)
        df['Economic_Index'] = np.tile(economic_index, self.num_businesses)
        
        # 4. Seasonality Vectorization
        # Create a mapping of (Industry, Calendar_Month) -> Seasonality Multiplier
        def get_seasonality(row):
            return BusinessRules.SEASONALITY[row['Industry']][row['Calendar_Month'] - 1]
        
        # Vectorized application using numpy indexing
        industries = df['Industry'].values
        cal_months = df['Calendar_Month'].values - 1
        
        # Build 2D array of seasonality
        ind_list = list(BusinessRules.SEASONALITY.keys())
        season_matrix = np.array([BusinessRules.SEASONALITY[ind] for ind in ind_list])
        ind_map = {ind: i for i, ind in enumerate(ind_list)}
        ind_indices = np.vectorize(ind_map.get)(industries)
        
        df['Festival_Factor'] = season_matrix[ind_indices, cal_months]
        
        # 5. Core Financials
        base_monthly_rev = (df['Annual_Turnover'] / 12)
        
        # Revenue = Base * Momentum * Seasonality * Macro * Noise
        noise = np.random.normal(1.0, 0.05, len(df))
        df['Revenue'] = base_monthly_rev * df['Business_Momentum'] * df['Festival_Factor'] * df['Economic_Index'] * noise
        
        # Margins based on Industry
        base_margin = np.vectorize(BusinessRules.INDUSTRY_MARGIN.get)(df['Industry'])
        df['Operating_Margin'] = np.clip(base_margin + np.random.normal(0, 0.02, len(df)), 0.02, 0.60)
        
        # Expenses
        df['Gross_Profit'] = df['Revenue'] * (df['Operating_Margin'] + 0.15) # Gross > Operating
        df['Operating_Expense'] = df['Revenue'] - df['Gross_Profit']
        
        # Payroll (Correlated to Employee Count and Inflation)
        base_salary = np.random.normal(25000, 5000, len(df))
        df['Payroll'] = df['Employee_Count'] * base_salary * df['Inflation_Factor']
        
        # Cap OpEx so Payroll doesn't exceed it unrealistically
        df['Operating_Expense'] = np.maximum(df['Operating_Expense'], df['Payroll'] * 1.2)
        
        # Profits
        df['Net_Profit'] = df['Gross_Profit'] - df['Operating_Expense']
        df['Profit_Margin'] = np.where(df['Revenue'] > 0, df['Net_Profit'] / df['Revenue'], 0)
        
        # 6. Working Capital & Ratios
        df['Receivables'] = df['Revenue'] * np.random.uniform(0.5, 1.5, len(df)) * df['Industry_Risk']
        df['Payables'] = df['Operating_Expense'] * np.random.uniform(0.5, 1.2, len(df))
        df['Inventory'] = df['Operating_Expense'] * np.random.uniform(0.2, 2.0, len(df))
        
        df['Working_Capital'] = (df['Receivables'] + df['Inventory']) - df['Payables']
        
        # Ratios
        current_assets = df['Receivables'] + df['Inventory'] + (df['Revenue'] * 0.5) # Cash approx
        current_liabilities = df['Payables'] + (df['Operating_Expense'] * 0.2)
        
        df['Current_Ratio'] = current_assets / np.maximum(current_liabilities, 1)
        df['Quick_Ratio'] = (current_assets - df['Inventory']) / np.maximum(current_liabilities, 1)
        
        # Days Sales Outstanding / Days Payable Outstanding
        df['DSO'] = (df['Receivables'] / np.maximum(df['Revenue'], 1)) * 30
        df['DPO'] = (df['Payables'] / np.maximum(df['Operating_Expense'], 1)) * 30
        df['Cash_Conversion_Cycle'] = df['DSO'] + 30 - df['DPO'] # Approx inventory days = 30
        
        # 7. Cashflow Metrics
        df['Cash_Inflow'] = df['Revenue'] * np.random.uniform(0.8, 1.1, len(df))
        df['Cash_Outflow'] = df['Operating_Expense'] * np.random.uniform(0.9, 1.2, len(df))
        df['Cashflow_Stability'] = 1.0 - np.clip(np.abs(df['Cash_Inflow'] - df['Cash_Outflow']) / np.maximum(df['Cash_Inflow'], 1), 0, 1)
        
        # 8. Operational Metrics
        df['Average_Order_Value'] = np.random.lognormal(mean=7, sigma=1.5, size=len(df))
        df['Customer_Count'] = (df['Revenue'] / df['Average_Order_Value']).astype(int)
        
        # Digital adoption reduces refund/cancellation, industry risk increases it
        df['Refund_Rate'] = np.clip(df['Industry_Risk'] * 0.05 + np.random.normal(0.01, 0.005, len(df)) - (df['Digital_Adoption_Score'] * 0.02), 0, 0.15)
        df['Cancellation_Rate'] = np.clip(df['Refund_Rate'] * 1.2, 0, 0.20)
        df['Digital_Collection_Pct'] = np.clip(df['Digital_Adoption_Score'] + np.random.normal(0, 0.05, len(df)), 0.1, 0.99)
        
        # 9. Time-Series specific variables (Growth)
        df['Revenue_Growth'] = df.groupby('Business_ID')['Revenue'].pct_change().fillna(0)
        
        # 10. Intermediate Health Index (Hidden variable for labels)
        df['Business_Health_Index'] = (
            (df['Profit_Margin'] * 0.3) + 
            (df['Cashflow_Stability'] * 0.3) + 
            (np.clip(df['Current_Ratio'] / 2.0, 0, 1) * 0.2) + 
            (df['Revenue_Growth'] * 0.2)
        )
        
        # Cleanup
        drop_cols = ['Annual_Turnover', 'Industry_Risk', 'Business_Momentum', 'Employee_Count', 'Industry', 'Digital_Adoption_Score']
        df = df.drop(columns=drop_cols)
        
        # Round numerical columns
        float_cols = df.select_dtypes(include=['float64']).columns
        df[float_cols] = df[float_cols].astype('float32').round(2)
        
        df.to_csv(f"{Config.OUTPUT_DIR}/monthly_financials.csv", index=False)
        return df
import numpy as np
import pandas as pd
from config import Config
from business_rules import BusinessRules
from utils import generate_ids
from tqdm import tqdm

class UPIGenerator:
    def __init__(self, business_df):
        self.b_df = business_df
        self.num_months = Config.MONTHS_HISTORY
        self.num_businesses = len(business_df)
        np.random.seed(Config.RANDOM_SEED)
        
        # Industry Profiles: (Base_Txn_Count, Base_AOV, Weekend_Pct)
        self.industry_profiles = {
            'Restaurant': (2200, 350, 0.65),
            'Bakery': (1500, 250, 0.60),
            'Dairy': (1800, 150, 0.50),
            'Medical': (1200, 450, 0.25),
            'Pharmacy': (1200, 450, 0.25),
            'Retail': (1000, 800, 0.45),
            'Textile': (800, 1200, 0.50),
            'Hardware': (600, 2500, 0.30),
            'Mobile Shop': (500, 5000, 0.55),
            'Electronics': (300, 8500, 0.50),
            'Transport': (400, 2500, 0.35),
            'Furniture': (150, 12000, 0.40),
            'Education': (200, 15000, 0.15),
            'Automobile': (100, 25000, 0.40),
            'Manufacturing': (70, 45000, 0.10),
            'Agriculture': (150, 8000, 0.20),
            'IT': (80, 18000, 0.15),
            'Construction': (50, 55000, 0.10),
            'Wholesale': (200, 25000, 0.20),
            'Printing': (150, 3500, 0.25)
        }

    def generate(self):
        print("Step 1: Generating Monthly UPI Behavioral Features...")
        
        # 1. Base Grid (Businesses x Months)
        b_ids = self.b_df['Business_ID'].values
        months = np.arange(1, self.num_months + 1)
        
        grid_b_ids = np.repeat(b_ids, self.num_months)
        grid_month_index = np.tile(months, self.num_businesses)
        
        # Calculate actual Calendar Year and Month
        start_date = pd.Timestamp(f"{Config.START_YEAR}-{Config.START_MONTH:02d}-01")
        dates = [start_date + pd.DateOffset(months=i) for i in range(self.num_months)]
        grid_dates = np.tile(dates, self.num_businesses)
        
        df = pd.DataFrame({
            'Business_ID': grid_b_ids,
            'Month_Index': grid_month_index,
            'Date': grid_dates,
            'Year': pd.DatetimeIndex(grid_dates).year,
            'Month': pd.DatetimeIndex(grid_dates).month
        })
        
        # 2. Merge Business Master Context
        df = df.merge(self.b_df[['Business_ID', 'Industry', 'Business_Momentum', 'Digital_Adoption_Score']], on='Business_ID', how='left')
        
        # 3. Apply Industry Profiles Vectorized
        industries = df['Industry'].values
        
        # Pre-extract tuples into dictionaries for vectorization
        txn_map = {k: v[0] for k, v in self.industry_profiles.items()}
        aov_map = {k: v[1] for k, v in self.industry_profiles.items()}
        weekend_map = {k: v[2] for k, v in self.industry_profiles.items()}
        
        base_txns = np.vectorize(txn_map.get)(industries)
        base_aov = np.vectorize(aov_map.get)(industries)
        base_weekend = np.vectorize(weekend_map.get)(industries)
        
        # 4. Generate Core Monthly Features (Correlated)
        
        # Inflation Factor (approx 0.5% increase per month)
        inflation = 1.0 + (df['Month_Index'] * 0.005)
        
        # Growth Factor based on Business Momentum
        monthly_growth_rate = (df['Business_Momentum'] - 1.0) / 12
        growth_multiplier = (1.0 + monthly_growth_rate) ** df['Month_Index']
        
        # Seasonality & Festivals
        cal_months = df['Month'].values - 1
        ind_list = list(BusinessRules.SEASONALITY.keys())
        season_matrix = np.array([BusinessRules.SEASONALITY[ind] for ind in ind_list])
        ind_map = {ind: i for i, ind in enumerate(ind_list)}
        ind_indices = np.vectorize(ind_map.get)(industries)
        
        seasonality = season_matrix[ind_indices, cal_months]
        
        # Festival Impact (October/November spikes for retail/consumer goods)
        is_festival = df['Month'].isin([10, 11])
        is_b2c = df['Industry'].isin(['Retail', 'Restaurant', 'Electronics', 'Textile', 'Mobile Shop', 'Bakery'])
        festival_impact = np.where(is_festival & is_b2c, np.random.uniform(1.2, 1.5, len(df)), 1.0)
        
        # Calculate Target Metrics
        df['Average_Order_Value'] = base_aov * inflation * np.random.normal(1.0, 0.05, len(df))
        df['Target_Weekend_Pct'] = np.clip(base_weekend + np.random.normal(0, 0.02, len(df)), 0.05, 0.95)
        
        # Success Rate (Highly correlated to Digital Adoption)
        df['Target_Success_Rate'] = np.clip(0.85 + (df['Digital_Adoption_Score'] * 0.14) + np.random.normal(0, 0.01, len(df)), 0.50, 0.999)
        
        # Actual Transaction Count
        raw_txns = base_txns * growth_multiplier * seasonality * festival_impact * np.random.normal(1.0, 0.08, len(df))
        df['Actual_Transaction_Count'] = np.clip(raw_txns, 1, None).astype(int)
        
        # Sampled Count for CSV Generation (max 200 per month)
        df['Sample_Count'] = np.clip(df['Actual_Transaction_Count'], 1, 200)
        
        # Drop temp columns
        df = df.drop(columns=['Industry', 'Business_Momentum', 'Digital_Adoption_Score'])
        
        # Save the monthly summary feature set
        summary_df = df.copy()
        summary_cols = ['Business_ID', 'Year', 'Month', 'Actual_Transaction_Count', 'Sample_Count', 'Average_Order_Value', 'Target_Weekend_Pct', 'Target_Success_Rate']
        summary_df[summary_cols].to_csv(f"{Config.OUTPUT_DIR}/upi_monthly_summary.csv", index=False)
        print(f"-> Monthly Summary saved to upi_monthly_summary.csv")

        # =====================================================================
        # Step 2: Generate Sampled Transactions based on Monthly Features
        # =====================================================================
        print("Step 2: Generating Sampled Transactions Data (Max 200 per business/month)...")
        
        chunk_size = 50_000 # Process 50k month-rows at a time to save RAM
        num_chunks = (len(df) // chunk_size) + 1
        
        header_written = False
        txn_id_counter = 1
        
        for i in tqdm(range(num_chunks), desc="Generating Transaction Chunks"):
            chunk = df.iloc[i * chunk_size : (i + 1) * chunk_size].copy()
            if len(chunk) == 0:
                break
                
            # Vectorized row expansion (e.g., if Sample_Count is 50, repeat the row 50 times)
            repeats = chunk['Sample_Count'].values
            
            b_ids_exp = np.repeat(chunk['Business_ID'].values, repeats)
            aov_exp = np.repeat(chunk['Average_Order_Value'].values, repeats)
            weekend_pct_exp = np.repeat(chunk['Target_Weekend_Pct'].values, repeats)
            success_rate_exp = np.repeat(chunk['Target_Success_Rate'].values, repeats)
            date_exp = np.repeat(chunk['Date'].values, repeats)
            
            total_samples = len(b_ids_exp)
            
            # Generate Transaction IDs
            txn_ids = generate_ids(f"UTXN{i}", total_samples)
            
            # Timestamp Generation
            # Randomize a day between 1 and 28 to ensure valid dates in all months
            random_days = np.random.randint(0, 28, size=total_samples)
            random_seconds = np.random.randint(0, 86400, size=total_samples)
            
            ts = pd.to_datetime(date_exp) + pd.to_timedelta(random_days, unit='d') + pd.to_timedelta(random_seconds, unit='s')
            
            # Apply Weekend Logic Vectorized
            # Randomly decide if THIS transaction should fall on a weekend based on the target percentage
            force_weekend = np.random.rand(total_samples) < weekend_pct_exp
            is_currently_weekend = ts.dayofweek >= 5
            
            # Shift dates to match the forced condition
            # If forced weekend but currently weekday -> shift forward to Saturday (5)
            shift_to_weekend = np.where(force_weekend & ~is_currently_weekend, 5 - ts.dayofweek, 0)
            # If forced weekday but currently weekend -> shift backward to Friday (4)
            shift_to_weekday = np.where(~force_weekend & is_currently_weekend, 4 - ts.dayofweek, 0)
            
            final_ts = ts + pd.to_timedelta(shift_to_weekend + shift_to_weekday, unit='d')
            
            # Amount Distribution (Lognormal centered closely around the specific AOV)
            # mu = ln(AOV), sigma = 0.6 (provides realistic right-skewed transaction tails)
            mu = np.log(np.maximum(aov_exp, 1))
            amounts = np.random.lognormal(mean=mu, sigma=0.6, size=total_samples)
            amounts = np.clip(amounts, 10, aov_exp * 10).round(2) # Prevent absurdly high outliers
            
            # Payment Status
            rand_status = np.random.rand(total_samples)
            status = np.where(
                rand_status < success_rate_exp, 'SUCCESS',
                np.where(rand_status < success_rate_exp + 0.05, 'FAILED', 'PENDING')
            )
            
            # Refund (Only valid on SUCCESS, 1-3% chance depending on AOV size)
            refund_chance = np.where(amounts > 2000, 0.03, 0.01)
            is_refund = np.where(status == 'SUCCESS', np.random.rand(total_samples) < refund_chance, False)
            
            # Build DataFrame
            txn_df = pd.DataFrame({
                'Transaction_ID': txn_ids,
                'Business_ID': b_ids_exp,
                'Timestamp': final_ts,
                'Amount': amounts,
                'Payment_Status': status,
                'Is_Refund': is_refund
            })
            
            # Append to disk
            mode = 'w' if not header_written else 'a'
            txn_df.to_csv(f"{Config.OUTPUT_DIR}/upi_transactions.csv", mode=mode, header=not header_written, index=False)
            header_written = True

        print("-> Sampled Transactions saved to upi_transactions.csv")
        return summary_df
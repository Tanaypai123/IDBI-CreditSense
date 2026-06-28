import numpy as np
import pandas as pd
from faker import Faker
from config import Config
from business_rules import BusinessRules
from utils import generate_ids, generate_pans, generate_gstins
from tqdm import tqdm

class BusinessGenerator:
    def __init__(self):
        self.num = Config.NUM_MSMES
        self.faker = Faker('en_IN')
        np.random.seed(Config.RANDOM_SEED)
        Faker.seed(Config.RANDOM_SEED)

    def generate(self):
        print("Generating Business Master...")
        
        # 1. Base IDs
        b_ids = generate_ids("BIZ", self.num)
        
        # 2. Industries
        
        industry_weights = {
            "Retail": 0.18,
            "Restaurant": 0.12,
            "Electronics": 0.08,
            "Medical": 0.08,
            "Textile": 0.07,
            "Manufacturing": 0.10,
            "Agriculture": 0.05,
            "Transport": 0.06,
            "IT": 0.05,
            "Construction": 0.04,
            "Furniture": 0.03,
            "Pharmacy": 0.03,
            "Bakery": 0.03,
            "Wholesale": 0.03,
            "Hardware": 0.02,
            "Dairy": 0.02,
            "Education": 0.02,
            "Mobile Shop": 0.03,
            "Automobile": 0.03,
            "Printing": 0.03
        }

        weights = np.array(list(industry_weights.values()), dtype=float)
        weights = weights / weights.sum()

        industries = np.random.choice(
            list(industry_weights.keys()),
            size=self.num,
            p=weights
        )

        # 3. Geo data
        states = np.random.choice(Config.STATES, p=Config.STATE_WEIGHTS, size=self.num)
        state_codes = pd.factorize(states)[0] + 10 # Dummy state codes 10+
        
        # 4. PAN & GSTIN
        pans = generate_pans(self.num)
        gstins = generate_gstins(state_codes, pans)
        
        # 5. Core Business Metrics (Correlated)
        # Turnover distributed log-normally, scaled by MSME Type
        msme_types = np.random.choice(Config.MSME_TYPES, p=Config.MSME_WEIGHTS, size=self.num)
        base_turnover = np.where(
            msme_types == "Micro", np.random.lognormal(mean=14, sigma=1.2, size=self.num),
            np.where(msme_types == "Small", np.random.lognormal(mean=16, sigma=0.8, size=self.num),
                     np.random.lognormal(mean=18, sigma=0.5, size=self.num))
        )
        base_turnover = np.clip(base_turnover, 500000, 2500000000) # 5L to 250Cr
        
        # Age
        business_age = np.random.gamma(shape=2.0, scale=3.0, size=self.num).astype(int)
        business_age = np.clip(business_age, 1, 40)
        account_age = np.clip(business_age - np.random.randint(0, 3, size=self.num), 1, 40)
        
        # Hidden variables (AI target foundations)
        # Momentum: Higher is growing fast.
        business_momentum = np.random.normal(1.0, 0.2, size=self.num) 
        # Base Health: 0 to 1
        financial_stability = np.clip(np.random.normal(0.6, 0.2, size=self.num), 0.1, 0.99)
        
        # Employee mapping (dependent on turnover)
        emp_count = np.clip((base_turnover / 1500000).astype(int), 1, 500)
        
        # Digital Adoption (dependent on age and industry)
        industry_risks = np.vectorize(BusinessRules.INDUSTRY_RISK.get)(industries)
        digital_adoption = np.clip(1.0 - (business_age * 0.01) - (industry_risks * 0.5) + np.random.normal(0.2, 0.1, size=self.num), 0.1, 0.99)
        
        # 6. Names (Using Faker, vectorized loop for speed)
        names = [self.faker.company() for _ in range(self.num)]
        owners = [self.faker.name() for _ in range(self.num)]
        
        df = pd.DataFrame({
            'Business_ID': b_ids,
            'Business_Name': names,
            'Owner_Name': owners,
            'Industry': industries,
            'MSME_Type': msme_types,
            'State': states,
            'Business_Age_Yrs': business_age,
            'Account_Age_Yrs': account_age,
            'PAN': pans,
            'GSTIN': gstins,
            'Annual_Turnover': np.round(base_turnover, 2),
            'Employee_Count': emp_count,
            'Digital_Adoption_Score': np.round(digital_adoption, 2),
            'Industry_Risk': industry_risks,
            'Base_Financial_Stability': np.round(financial_stability, 3), # Hidden feature for generation
            'Business_Momentum': np.round(business_momentum, 3) # Hidden feature for generation
        })
        
        df.to_csv(f"{Config.OUTPUT_DIR}/business_master.csv", index=False)
        return df
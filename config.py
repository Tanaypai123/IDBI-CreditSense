import os

class Config:
    # Scale Parameters
    NUM_MSMES = 25000
    MONTHS_HISTORY = 24
    TRANSACTIONS_PER_MSME_PER_MONTH = 3.33  # Approx 2 million total (25000 * 24 * 3.33)
    
    # Paths
    OUTPUT_DIR = "output"
    
    # Random Seed for reproducibility
    RANDOM_SEED = 42
    
    # Date Configuration
    START_YEAR = 2024
    START_MONTH = 1

    # Indian Geographic Data (Weighted)
    STATES = ["Maharashtra", "Gujarat", "Karnataka", "Tamil Nadu", "Delhi", "Uttar Pradesh", "Telangana", "Rajasthan"]
    STATE_WEIGHTS = [0.25, 0.15, 0.15, 0.15, 0.10, 0.08, 0.07, 0.05]
    
    # MSME Types
    MSME_TYPES = ["Micro", "Small", "Medium"]
    MSME_WEIGHTS = [0.75, 0.20, 0.05]
    
    # Data Types Optimization
    TYPES_BUSINESS = {
        'Turnover': 'float32',
        'Employee Count': 'int16',
        'Monthly Payroll': 'float32',
        'Average Balance': 'float32',
        'Digital Adoption': 'float32',
        'Industry Risk': 'float32',
        'Credit Limit': 'float32'
    }

    @staticmethod
    def setup():
        os.makedirs(Config.OUTPUT_DIR, exist_ok=True)
import numpy as np

class BusinessRules:
    INDUSTRIES = [
        "Retail", "Restaurant", "Electronics", "Medical", "Textile", 
        "Manufacturing", "Agriculture", "Transport", "IT", "Construction", 
        "Furniture", "Pharmacy", "Bakery", "Wholesale", "Hardware", 
        "Dairy", "Education", "Mobile Shop", "Automobile", "Printing"
    ]
    
    # Base risk profile (0.1 to 0.9, lower is better)
    INDUSTRY_RISK = {
        "Retail": 0.4, "Restaurant": 0.6, "Electronics": 0.3, "Medical": 0.1, 
        "Textile": 0.5, "Manufacturing": 0.4, "Agriculture": 0.7, "Transport": 0.6, 
        "IT": 0.2, "Construction": 0.8, "Furniture": 0.5, "Pharmacy": 0.1, 
        "Bakery": 0.4, "Wholesale": 0.3, "Hardware": 0.4, "Dairy": 0.3, 
        "Education": 0.2, "Mobile Shop": 0.4, "Automobile": 0.5, "Printing": 0.5
    }

    # Operating Margin Baseline
    INDUSTRY_MARGIN = {
        "Retail": 0.15, "Restaurant": 0.20, "Electronics": 0.12, "Medical": 0.25, 
        "Textile": 0.18, "Manufacturing": 0.22, "Agriculture": 0.15, "Transport": 0.10, 
        "IT": 0.40, "Construction": 0.15, "Furniture": 0.25, "Pharmacy": 0.20, 
        "Bakery": 0.22, "Wholesale": 0.08, "Hardware": 0.18, "Dairy": 0.12, 
        "Education": 0.30, "Mobile Shop": 0.12, "Automobile": 0.15, "Printing": 0.20
    }

    # 12-month seasonality multipliers
    SEASONALITY = {
        "Retail":       [0.9, 0.9, 1.0, 1.0, 1.0, 0.9, 0.9, 1.1, 1.2, 1.5, 1.3, 1.1], # Festival spikes
        "Restaurant":   [1.1, 1.0, 1.0, 1.0, 1.2, 1.1, 0.9, 0.9, 1.0, 1.2, 1.1, 1.3], # Holidays/Summer
        "Electronics":  [0.8, 0.8, 1.0, 1.1, 1.0, 0.9, 0.8, 1.1, 1.4, 1.8, 1.1, 1.0], # Diwali huge spike
        "Medical":      [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.1, 1.1, 1.0, 1.0, 1.0, 1.0], # Stable, slight monsoon bump
        "Textile":      [0.9, 0.8, 0.9, 1.0, 1.0, 0.8, 0.8, 1.1, 1.3, 1.5, 1.2, 1.0],
        "Manufacturing":[1.0, 1.0, 1.2, 1.1, 1.0, 0.9, 0.9, 1.0, 1.1, 1.2, 1.1, 1.0], # Financial year ends
        "Agriculture":  [0.7, 0.7, 0.8, 1.5, 1.4, 0.8, 0.7, 0.7, 1.2, 1.3, 1.0, 0.8], # Harvest seasons
        "Transport":    [1.0, 1.0, 1.1, 1.0, 1.1, 1.0, 0.9, 0.9, 1.1, 1.2, 1.1, 1.0],
        "IT":           [1.0, 1.0, 1.05, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.05], # Stable
        "Construction": [1.1, 1.1, 1.2, 1.2, 1.1, 0.7, 0.6, 0.8, 1.0, 1.1, 1.1, 1.1], # Monsoon dips
        "Furniture":    [0.9, 0.9, 1.0, 1.0, 1.0, 0.9, 0.9, 1.0, 1.2, 1.4, 1.1, 1.0],
        "Pharmacy":     [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.1, 1.2, 1.1, 1.0, 1.0, 1.0],
        "Bakery":       [1.1, 1.1, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.1, 1.2, 1.2, 1.4], # Winter/Xmas spike
        "Wholesale":    [1.0, 1.0, 1.1, 1.0, 1.0, 0.9, 0.9, 1.2, 1.3, 1.4, 1.1, 1.0],
        "Hardware":     [1.0, 1.0, 1.1, 1.1, 1.0, 0.8, 0.8, 0.9, 1.0, 1.1, 1.0, 1.0],
        "Dairy":        [1.0, 1.0, 1.1, 1.2, 1.2, 1.1, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0], # Summer peak
        "Education":    [0.8, 0.8, 1.2, 1.1, 0.9, 1.3, 1.4, 1.1, 1.0, 0.9, 0.9, 0.8], # Admission cycles
        "Mobile Shop":  [0.9, 0.9, 1.0, 1.0, 1.0, 0.9, 0.9, 1.1, 1.3, 1.5, 1.1, 1.0],
        "Automobile":   [0.9, 0.9, 1.1, 1.0, 1.0, 0.9, 0.9, 1.1, 1.3, 1.5, 1.1, 1.0],
        "Printing":     [0.9, 0.9, 1.2, 1.1, 1.0, 0.9, 0.9, 1.0, 1.1, 1.1, 1.0, 0.9]
    }
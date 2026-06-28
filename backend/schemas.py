# schemas.py
from pydantic import BaseModel, Field
from typing import List, Dict, Any

class MSMERequest(BaseModel):
    biz_name: str = Field(..., example="Sharma Wholesale Traders")
    Industry: str = Field(..., example="Retail")
    State: str = Field(..., example="Maharashtra")
    MSME_Type: str = Field(..., example="Micro")
    Business_Age_Yrs: float = Field(..., ge=1, le=40, example=5.0)
    Annual_Turnover: float = Field(..., ge=100000, example=12000000.0)
    Digital_Adoption_Score: float = Field(..., ge=0.0, le=1.0, example=0.70)
    Industry_Risk: float = Field(..., ge=0.0, le=1.0, example=0.40)
    
    # Financial Statement Metrics
    Profit_Margin_Mean: float = Field(..., example=0.18)
    Revenue_Growth_MoM_Mean: float = Field(..., example=0.03)
    Revenue_Std: float = Field(..., example=80000.0)
    Working_Capital_Mean: float = Field(..., example=600000.0)
    Current_Ratio_Mean: float = Field(..., example=1.8)
    Quick_Ratio_Mean: float = Field(..., example=1.4)
    DPO_Mean: float = Field(..., example=35.0)
    Cashflow_Stability_Mean: float = Field(..., example=0.85)
    Revenue_Trend_Slope: float = Field(..., example=1500.0)
    Profit_Margin_Trend: float = Field(..., example=0.002)
    
    # Tax & Transaction Compliance
    GST_Compliance_Mean: float = Field(..., example=94.0)
    GST_OnTime_Rate: float = Field(..., example=0.90)
    GST_Delay_Days_Std: float = Field(..., example=2.5)
    GST_Filing_Consistency: float = Field(..., example=0.88)
    UPI_Transactions_Mean: float = Field(..., example=450.0)
    UPI_Volume_Total: float = Field(..., example=2500000.0)
    UPI_Order_Value_Mean: float = Field(..., example=650.0)
    
    # Loans & HR
    Active_Loan_Count: float = Field(..., example=0.0)
    Total_Loan_Amount: float = Field(..., example=0.0)
    Outstanding_Principal_Total: float = Field(..., example=0.0)
    EMI_Delay_Count: float = Field(..., example=0.0)
    Default_History: float = Field(..., example=0.0)
    Current_Employees: float = Field(..., example=12.0)
    Average_Salary: float = Field(..., example=30000.0)
    Annual_Attrition_Rate: float = Field(..., example=0.12)
    Hiring_Trend_Pct: float = Field(..., example=0.05)
    Net_Employees_Added: float = Field(..., example=1.0)
    EPFO_Registered: float = Field(..., example=1.0)
    Skill_Level_Index: float = Field(..., example=0.60)

class SHAPDriver(BaseModel):
    feature: str
    impact: float
    display_name: str

class MSMEResponse(BaseModel):
    score: float
    risk_category: str
    default_probability: float
    eligible: bool
    max_loan: float
    top_positive: List[SHAPDriver]
    top_negative: List[SHAPDriver]

class BatchItemResponse(BaseModel):
    Business_ID: str
    score: float
    risk_category: str
    default_probability: float
    eligible: bool
    max_loan: float

class BatchPredictResponse(BaseModel):
    results: List[BatchItemResponse]

class GlobalFeatureImportance(BaseModel):
    feature: str
    importance: float
    display_name: str

class GlobalAnalyticsResponse(BaseModel):
    health_importance: List[GlobalFeatureImportance]
    default_importance: List[GlobalFeatureImportance]
    correlation_top20: List[Dict[str, Any]]

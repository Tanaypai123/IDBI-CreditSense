import numpy as np
import pandas as pd
from config import Config


class LabelGenerator:

    def __init__(self, b_df, m_df, gst_df, upi_df, loan_df):
        self.b_df = b_df
        self.m_df = m_df
        self.gst_df = gst_df
        self.upi_df = upi_df
        self.loan_df = loan_df
        np.random.seed(Config.RANDOM_SEED)

    def generate(self):

        print("Generating Final AI Labels...")

        # ----------------------------
        # Monthly Financial Features
        # ----------------------------

        monthly = self.m_df.groupby("Business_ID").agg({

            "Business_Health_Index":"mean",
            "Profit_Margin":"mean",
            "Revenue":"mean",
            "Revenue_Growth":"mean",
            "Cashflow_Stability":"mean",
            "Current_Ratio":"mean",
            "Quick_Ratio":"mean"

        }).reset_index()

        monthly.rename(columns={

            "Business_Health_Index":"Health",
            "Profit_Margin":"Margin",
            "Revenue":"Revenue",
            "Revenue_Growth":"Growth",
            "Cashflow_Stability":"Cashflow",
            "Current_Ratio":"Current",
            "Quick_Ratio":"Quick"

        }, inplace=True)

        # ----------------------------
        # GST
        # ----------------------------

        gst = self.gst_df.groupby("Business_ID").agg({

            "Compliance_Score":"mean",
            "Penalty":"sum"

        }).reset_index()

        gst.rename(columns={

            "Compliance_Score":"GST",
            "Penalty":"Penalty"

        }, inplace=True)

        # ----------------------------
        # UPI
        # ----------------------------

        upi = self.upi_df.groupby("Business_ID").agg({

            "Actual_Transaction_Count":"mean",
            "Target_Success_Rate":"mean"

        }).reset_index()

        upi.rename(columns={

            "Actual_Transaction_Count":"Txn",
            "Target_Success_Rate":"Success"

        }, inplace=True)

        # ----------------------------
        # Loan
        # ----------------------------

        loan = self.loan_df.copy()

        # ----------------------------
        # Merge
        # ----------------------------

        df = self.b_df[[

            "Business_ID",
            "Industry_Risk",
            "Business_Momentum",
            "Digital_Adoption_Score"

        ]].copy()

        df = df.merge(monthly,on="Business_ID")
        df = df.merge(gst,on="Business_ID")
        df = df.merge(upi,on="Business_ID")
        df = df.merge(loan,on="Business_ID",how="left")

        df.fillna(0,inplace=True)

        # ----------------------------
        # Normalize helper
        # ----------------------------

        def norm(col):

            col=np.asarray(col,dtype=float)

            mn=col.min()
            mx=col.max()

            if mx-mn<1e-9:
                return np.zeros(len(col))

            return (col-mn)/(mx-mn)
        
                # ----------------------------------------------------
        # Feature Engineering
        # ----------------------------------------------------

        health = norm(df["Health"])
        margin = norm(df["Margin"])
        growth = norm(df["Growth"])
        cash = norm(df["Cashflow"])
        current = norm(df["Current"])
        quick = norm(df["Quick"])

        gst_score = norm(df["GST"])
        txn = norm(df["Txn"])
        success = norm(df["Success"])

        digital = norm(df["Digital_Adoption_Score"])

        momentum = norm(df["Business_Momentum"])

        risk = norm(df["Industry_Risk"])

        penalty = 1 - norm(df["Penalty"])

        # ----------------------------------------------------
        # Financial Health Score
        # ----------------------------------------------------

        score = (

            health * 0.22 +

            margin * 0.18 +

            cash * 0.18 +

            gst_score * 0.12 +

            growth * 0.10 +

            txn * 0.05 +

            success * 0.05 +

            current * 0.04 +

            quick * 0.03 +

            digital * 0.02 +

            momentum * 0.06 -

            risk * 0.08 +

            penalty * 0.03

        )

        score = np.clip(score,0,1)

        df["Financial_Health_Score"] = np.round(score*100,1)

        # ----------------------------------------------------
        # Risk Category
        # ----------------------------------------------------

        df["Risk_Category"] = pd.cut(

            df["Financial_Health_Score"],

            bins=[0,30,50,70,85,100],

            labels=[
                "Critical Risk",
                "High Risk",
                "Medium Risk",
                "Low Risk",
                "Excellent"
            ],

            include_lowest=True

        )

        # ----------------------------------------------------
        # Default Probability
        # ----------------------------------------------------

        df["Default_Probability"] = np.round(

            np.clip(

                1-score +

                np.random.normal(0,0.03,len(df)),

                0.01,

                0.99

            ),

            3

        )

        # ----------------------------------------------------
        # Loan Eligibility
        # ----------------------------------------------------

        df["Loan_Eligibility"] = (

            df["Financial_Health_Score"]>=60

        )

        turnover = self.b_df["Annual_Turnover"]

        df["Max_Approved_Loan"] = np.where(

            df["Loan_Eligibility"],

            (turnover*0.25*(df["Financial_Health_Score"]/100)).round(-4),

            0

        )

        # ----------------------------------------------------
        # Fraud Probability
        # ----------------------------------------------------

        fraud = (

            risk*0.45 +

            (1-success)*0.20 +

            (1-gst_score)*0.20 +

            (1-digital)*0.15

        )

        df["Fraud_Probability"] = np.round(

            np.clip(

                fraud+

                np.random.normal(0,0.02,len(df)),

                0,

                1

            ),

            3

        )

        # ----------------------------------------------------
        # Recommended Action
        # ----------------------------------------------------

        actions=[]

        for _,r in df.iterrows():

            if r["Fraud_Probability"]>0.70:
                actions.append("Fraud Investigation")

            elif r["Default_Probability"]>0.70:
                actions.append("Reject Loan")

            elif r["Financial_Health_Score"]>=85:
                actions.append("Premium Credit Offer")

            elif r["Financial_Health_Score"]>=70:
                actions.append("Working Capital Loan")

            elif r["Financial_Health_Score"]>=50:
                actions.append("Monitor Business")

            else:
                actions.append("Financial Assistance Required")

        df["Recommended_Action"]=actions

        df=df[[

            "Business_ID",

            "Financial_Health_Score",

            "Risk_Category",

            "Default_Probability",

            "Loan_Eligibility",

            "Max_Approved_Loan",

            "Fraud_Probability",

            "Recommended_Action"

        ]]

        df.to_csv(

            f"{Config.OUTPUT_DIR}/ai_labels.csv",

            index=False

        )

        return df
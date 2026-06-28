import numpy as np
import pandas as pd
import os
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
        # Loan Summary (Aggregate actual loans)
        # ----------------------------
        loan_hist_path = f"{Config.OUTPUT_DIR}/loan_history.csv"
        if os.path.exists(loan_hist_path):
            loan_hist_df = pd.read_csv(loan_hist_path)
            loan_hist_df["Is_Active"] = (loan_hist_df["Account_Status"] != "CLOSED").astype(int)
            if loan_hist_df["Is_Default"].dtype == object or loan_hist_df["Is_Default"].dtype == str:
                loan_hist_df["Is_Default"] = loan_hist_df["Is_Default"].astype(str).str.lower().map({"true": 1, "false": 0, "1": 1, "0": 0})
            else:
                loan_hist_df["Is_Default"] = loan_hist_df["Is_Default"].astype(int)
            
            loan_agg = loan_hist_df.groupby("Business_ID").agg({
                "Is_Active": "sum",
                "Loan_Amount": "sum",
                "Outstanding_Principal": "sum",
                "Missed_EMIs": "sum",
                "Is_Default": "max"
            }).reset_index().rename(columns={
                "Is_Active": "Active_Loan_Count",
                "Loan_Amount": "Total_Loan_Amount",
                "Outstanding_Principal": "Outstanding_Principal_Total",
                "Missed_EMIs": "EMI_Delay_Count",
                "Is_Default": "Default_History"
            })
        else:
            loan_agg = pd.DataFrame(columns=["Business_ID", "Active_Loan_Count", "Total_Loan_Amount", "Outstanding_Principal_Total", "EMI_Delay_Count", "Default_History"])

        # Load employee details
        emp_path = f"{Config.OUTPUT_DIR}/employee_details.csv"
        if os.path.exists(emp_path):
            emp_df = pd.read_csv(emp_path)
        else:
            emp_df = pd.DataFrame(columns=["Business_ID", "Annual_Attrition_Rate", "EPFO_Registered", "Skill_Level_Index"])

        # ----------------------------
        # Merge
        # ----------------------------

        df = self.b_df[[

            "Business_ID",
            "Industry_Risk",
            "Business_Momentum",
            "Digital_Adoption_Score",
            "Annual_Turnover"

        ]].copy()

        df = df.merge(monthly,on="Business_ID")
        df = df.merge(gst,on="Business_ID")
        df = df.merge(upi,on="Business_ID")
        df = df.merge(loan_agg,on="Business_ID",how="left")
        df = df.merge(emp_df,on="Business_ID",how="left")

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
        # Feature Normalization
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
        # Financial Health Score (Direct Risk/Liabilities integration)
        # ----------------------------------------------------

        positive_score = (
            health * 0.22 +
            margin * 0.18 +
            cash * 0.18 +
            gst_score * 0.12 +
            growth * 0.10 +
            current * 0.05 +
            quick * 0.05 +
            digital * 0.05 +
            momentum * 0.05
        )

        # Penalties:
        penalty_default = 0.40 * df["Default_History"]
        penalty_emi = np.clip(df["EMI_Delay_Count"] * 0.05, 0.0, 0.30)
        penalty_active_loans = np.clip(df["Active_Loan_Count"] * 0.05, 0.0, 0.15)
        
        leverage = df["Outstanding_Principal_Total"] / np.maximum(df["Annual_Turnover"], 1.0)
        penalty_leverage = np.clip(leverage * 0.25, 0.0, 0.25)
        
        penalty_attrition = np.clip((df["Annual_Attrition_Rate"] - 0.15) * 0.20, 0.0, 0.10)
        penalty_epfo = 0.05 * (1.0 - df["EPFO_Registered"].astype(float))
        penalty_skill = 0.05 * (1.0 - df["Skill_Level_Index"])
        penalty_industry_risk = 0.08 * risk

        score = positive_score - (
            penalty_default +
            penalty_emi +
            penalty_active_loans +
            penalty_leverage +
            penalty_attrition +
            penalty_epfo +
            penalty_skill +
            penalty_industry_risk
        )

        score_min = score.min()
        score_max = score.max()
        if score_max - score_min > 1e-9:
            scaled_score = 15.0 + (score - score_min) / (score_max - score_min) * (98.0 - 15.0)
        else:
            scaled_score = score * 100.0
            
        df["Financial_Health_Score"] = np.round(scaled_score, 1)

        # ----------------------------------------------------
        # Default Probability (Independent probabilistic target)
        # ----------------------------------------------------
        
        def compute_trend_slopes(m_df, group_col, time_col, value_col):
            df_sorted = m_df.sort_values([group_col, time_col])
            pivot_df = df_sorted.pivot(index=group_col, columns=time_col, values=value_col)
            months = pivot_df.columns.values.astype(float)
            x = months - months.mean()
            x_sum_sq = np.sum(x ** 2)
            if x_sum_sq == 0:
                slopes = np.zeros(len(pivot_df))
            else:
                w = x / x_sum_sq
                slopes = np.dot(pivot_df.values, w)
            return pd.Series(slopes, index=pivot_df.index)

        slopes_rev = compute_trend_slopes(self.m_df, "Business_ID", "Month_Index", "Revenue").reindex(df["Business_ID"]).fillna(0).values

        def_prob = 0.05 + 0.15 * risk
        def_prob += 0.40 * df["Default_History"]
        def_prob += np.clip(df["EMI_Delay_Count"] * 0.06, 0.0, 0.35)
        def_prob += np.clip(leverage * 0.25, 0.0, 0.25)
        def_prob += 0.10 * (1.0 - cash)
        def_prob += 0.10 * (1.0 - gst_score)
        def_prob += np.where(df["Current"] < 0.3, 0.10, 0.0)
        def_prob += np.where(slopes_rev < 0, 0.10, 0.0)
        
        def_prob += np.random.normal(0, 0.02, len(df))
        def_prob = np.clip(def_prob, 0.01, 0.99)
        df["Default_Probability"] = np.round(def_prob, 3)

        # ----------------------------------------------------
        # Risk Category (Multi-factor risk score classification)
        # ----------------------------------------------------

        health_deficit = 1.0 - (df["Financial_Health_Score"] / 100.0)
        gst_deficit = 1.0 - (df["GST"] / 100.0)
        liquidity_deficit = np.clip(1.0 - (df["Current"] / 0.5), 0.0, 1.0)
        
        risk_score = (
            health_deficit * 0.25 +
            df["Default_Probability"] * 0.25 +
            df["Default_History"] * 0.20 +
            np.clip(df["EMI_Delay_Count"] * 0.05, 0.0, 0.15) +
            np.clip(leverage * 0.15, 0.0, 0.15) +
            liquidity_deficit * 0.05 +
            gst_deficit * 0.05
        )
        risk_score = np.clip(risk_score, 0.0, 1.0)

        df["Risk_Category"] = pd.cut(
            risk_score,
            bins=[0.0, 0.25, 0.45, 0.65, 0.85, 1.0],
            labels=[
                "Excellent",
                "Low Risk",
                "Medium Risk",
                "High Risk",
                "Critical Risk"
            ],
            include_lowest=True
        )

        # ----------------------------------------------------
        # Loan Eligibility (Multi-conditional compliance checks)
        # ----------------------------------------------------

        eligible = (
            (df["Financial_Health_Score"] >= 60.0) &
            (df["Default_Probability"] <= 0.40) &
            (df["Default_History"] == 0) &
            (df["EMI_Delay_Count"] <= 3) &
            (leverage <= 0.5) &
            (df["GST"] >= 65)
        )
        df["Loan_Eligibility"] = eligible

        df["Max_Approved_Loan"] = np.where(
            df["Loan_Eligibility"],
            (df["Annual_Turnover"] * 0.25 * (df["Financial_Health_Score"] / 100.0)).round(-4),
            0.0
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
            lev = r["Outstanding_Principal_Total"] / max(r["Annual_Turnover"], 1.0)

            if r["Fraud_Probability"]>0.70:
                actions.append("Fraud Investigation")
            elif r["Default_History"] == 1 or r["EMI_Delay_Count"] > 5 or r["Default_Probability"] > 0.60:
                actions.append("Reject Loan")
            elif r["Financial_Health_Score"] < 50.0:
                actions.append("Reject Loan")
            elif r["Financial_Health_Score"] < 70.0 or r["EMI_Delay_Count"] > 2 or lev > 0.35:
                actions.append("Monitor Business")
            elif r["Financial_Health_Score"]>=85.0:
                actions.append("Premium Credit Offer")
            else:
                actions.append("Working Capital Loan")

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
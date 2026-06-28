#!/usr/bin/env python3
"""
Feature Engineering Pipeline
MSME Financial Health Assessment Platform - IDBI Innovate 2026

This script reads raw synthetic MSME datasets, performs aggregations and merges,
handles missing values, encodes categoricals, removes data leakage & highly
correlated features, and outputs a clean training_dataset.csv.
"""

import os
import sys
import pandas as pd
import numpy as np

# Set random seed for reproducibility
np.random.seed(42)

def load_data(output_dir="output"):
    """
    Reads all required CSV files automatically from the output folder.
    """
    print(f"Reading raw datasets from output directory: '{output_dir}'...")
    
    files = {
        "business_master": "business_master.csv",
        "monthly_financials": "monthly_financials.csv",
        "gst_history": "gst_history.csv",
        "upi_monthly_summary": "upi_monthly_summary.csv",
        "loan_history": "loan_history.csv",
        "employee_details": "employee_details.csv",
        "ai_labels": "ai_labels.csv"
    }
    
    dfs = {}
    for key, filename in files.items():
        filepath = os.path.join(output_dir, filename)
        if not os.path.exists(filepath):
            print(f"Error: Required file '{filename}' not found in '{output_dir}'.")
            sys.exit(1)
        dfs[key] = pd.read_csv(filepath)
        print(f"  Loaded {filename}: shape {dfs[key].shape}")
        
    return dfs

def compute_trend_slopes(df, group_col, time_col, value_col):
    """
    Vectorized calculation of linear regression slope over a sequential time series.
    Assumes standard sequence (e.g. Month_Index 1 to 24).
    """
    # Sort data to ensure sequential alignment
    df_sorted = df.sort_values([group_col, time_col])
    
    # Pivot to get a matrix of shape (num_businesses, num_months)
    pivot_df = df_sorted.pivot(index=group_col, columns=time_col, values=value_col)
    
    # Calculate weights vector for regression slope: w = (x - x_mean) / sum((x - x_mean)^2)
    months = pivot_df.columns.values.astype(float)
    x = months - months.mean()
    x_sum_sq = np.sum(x ** 2)
    
    if x_sum_sq == 0:
        slopes = np.zeros(len(pivot_df))
    else:
        w = x / x_sum_sq
        slopes = np.dot(pivot_df.values, w)
        
    return pd.Series(slopes, index=pivot_df.index)

def aggregate_monthly_financials(monthly_df):
    """
    Aggregates monthly financials into business-level features.
    """
    print("\nAggregating Monthly Financials...")
    
    # 1. Simple Aggregations
    financial_agg = monthly_df.groupby("Business_ID").agg({
        "Revenue": ["mean", "std", "min", "max"],
        "Revenue_Growth": "mean",
        "Profit_Margin": "mean",
        "Gross_Profit": "mean",
        "Operating_Expense": "mean",
        "Payroll": ["mean", "sum"],
        "Working_Capital": "mean",
        "Current_Ratio": "mean",
        "Quick_Ratio": "mean",
        "DSO": "mean",
        "DPO": "mean",
        "Cash_Conversion_Cycle": "mean",
        "Cashflow_Stability": "mean"
    })
    
    # Flatten MultiIndex columns
    financial_agg.columns = [f"{col[0]}_{col[1]}" for col in financial_agg.columns]
    financial_agg = financial_agg.rename(columns={
        "Revenue_mean": "Revenue_Mean",
        "Revenue_std": "Revenue_Std",
        "Revenue_min": "Revenue_Min",
        "Revenue_max": "Revenue_Max",
        "Revenue_Growth_mean": "Revenue_Growth_MoM_Mean",
        "Profit_Margin_mean": "Profit_Margin_Mean",
        "Gross_Profit_mean": "Gross_Profit_Mean",
        "Operating_Expense_mean": "Operating_Expense_Mean",
        "Payroll_mean": "Payroll_Mean",
        "Payroll_sum": "Payroll_Total",
        "Working_Capital_mean": "Working_Capital_Mean",
        "Current_Ratio_mean": "Current_Ratio_Mean",
        "Quick_Ratio_mean": "Quick_Ratio_Mean",
        "DSO_mean": "DSO_Mean",
        "DPO_mean": "DPO_Mean",
        "Cash_Conversion_Cycle_mean": "Cash_Conversion_Cycle_Mean",
        "Cashflow_Stability_mean": "Cashflow_Stability_Mean"
    })
    
    # 2. Trend features (Slopes)
    financial_agg["Revenue_Trend_Slope"] = compute_trend_slopes(
        monthly_df, "Business_ID", "Month_Index", "Revenue"
    )
    financial_agg["Profit_Margin_Trend"] = compute_trend_slopes(
        monthly_df, "Business_ID", "Month_Index", "Profit_Margin"
    )
    
    return financial_agg.reset_index()

def aggregate_gst_history(gst_df):
    """
    Aggregates monthly GST history into business-level features.
    """
    print("Aggregating GST History...")
    
    # Aggregation
    gst_agg = gst_df.groupby("Business_ID").agg({
        "Compliance_Score": "mean",
        "Penalty": "sum",
        "Delay_Days": ["std", lambda x: 1.0 / (1.0 + np.std(x)), lambda x: np.mean(x == 0)]
    })
    
    # Flatten and rename columns
    gst_agg.columns = [
        "GST_Compliance_Mean",
        "GST_Penalty_Total",
        "GST_Delay_Days_Std",
        "GST_Filing_Consistency",
        "GST_OnTime_Rate"
    ]
    
    return gst_agg.reset_index()

def aggregate_upi_summary(upi_df, monthly_df):
    """
    Aggregates UPI summary data into business-level features.
    """
    print("Aggregating UPI Monthly Summary...")
    
    upi_df = upi_df.copy()
    upi_df["Monthly_UPI_Volume"] = upi_df["Actual_Transaction_Count"] * upi_df["Average_Order_Value"]
    upi_df["Weighted_Success"] = upi_df["Actual_Transaction_Count"] * upi_df["Target_Success_Rate"]
    
    # Use standard pandas groupby.agg to preserve index naming
    upi_agg = upi_df.groupby("Business_ID").agg({
        "Actual_Transaction_Count": "mean",
        "Monthly_UPI_Volume": "sum",
        "Weighted_Success": "sum",
        "Average_Order_Value": "mean"
    })
    
    # Calculate transaction-weighted success rate
    sum_txns = upi_df.groupby("Business_ID")["Actual_Transaction_Count"].sum()
    upi_agg["UPI_Success_Rate"] = upi_agg["Weighted_Success"] / np.maximum(sum_txns, 1)
    upi_agg = upi_agg.drop(columns=["Weighted_Success"])
    
    # Rename columns
    upi_agg = upi_agg.rename(columns={
        "Actual_Transaction_Count": "UPI_Transactions_Mean",
        "Monthly_UPI_Volume": "UPI_Volume_Total",
        "Average_Order_Value": "UPI_Order_Value_Mean"
    })
    
    # Add Refund Rate from Monthly Financials (which contains UPI Refund Rate)
    refund_mean = monthly_df.groupby("Business_ID")["Refund_Rate"].mean()
    upi_agg["UPI_Refund_Rate_Mean"] = refund_mean
    
    return upi_agg.reset_index()

def aggregate_loan_history(loan_df):
    """
    Aggregates loan history into business-level features.
    """
    print("Aggregating Loan History...")
    
    loan_df = loan_df.copy()
    # Loan is active if status is standard, SMA, or NPA (not CLOSED)
    loan_df["Is_Active"] = (loan_df["Account_Status"] != "CLOSED").astype(int)
    
    # Safe conversion of Is_Default to integer
    if loan_df["Is_Default"].dtype == object or loan_df["Is_Default"].dtype == str:
        loan_df["Is_Default"] = loan_df["Is_Default"].astype(str).str.lower().map({"true": 1, "false": 0, "1": 1, "0": 0})
    else:
        loan_df["Is_Default"] = loan_df["Is_Default"].astype(int)
        
    loan_agg = loan_df.groupby("Business_ID").agg({
        "Is_Active": "sum",
        "Loan_Amount": "sum",
        "Outstanding_Principal": "sum",
        "Missed_EMIs": "sum",
        "Is_Default": "max"
    })
    
    # Rename columns
    loan_agg = loan_agg.rename(columns={
        "Is_Active": "Active_Loan_Count",
        "Loan_Amount": "Total_Loan_Amount",
        "Outstanding_Principal": "Outstanding_Principal_Total",
        "Missed_EMIs": "EMI_Delay_Count",
        "Is_Default": "Default_History"
    })
    
    return loan_agg.reset_index()

def remove_duplicate_columns(df):
    """
    Removes columns that have identical contents.
    """
    print("\nChecking for duplicate columns...")
    dupes = []
    cols = df.columns
    for i in range(len(cols)):
        for j in range(i + 1, len(cols)):
            col1 = cols[i]
            col2 = cols[j]
            if df[col1].dtype == df[col2].dtype:
                if df[col1].equals(df[col2]):
                    dupes.append(col2)
                    
    dupes = list(set(dupes))
    if dupes:
        print(f"  Removing duplicate columns: {dupes}")
        df = df.drop(columns=dupes)
    else:
        print("  No duplicate columns detected.")
    return df

def drop_correlated_features(df, threshold=0.95, target_cols=None, id_col="Business_ID"):
    """
    Detects and removes highly correlated features (>0.95).
    """
    if target_cols is None:
        target_cols = []
        
    feature_cols = [c for c in df.columns if c not in target_cols and c != id_col]
    numeric_features = df[feature_cols].select_dtypes(include=[np.number]).columns.tolist()
    
    corr_matrix = df[numeric_features].corr().abs()
    upper = corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
    
    to_drop = []
    dropped_info = []
    for col in upper.columns:
        correlated_features = upper.index[upper[col] > threshold].tolist()
        correlated_features = [f for f in correlated_features if f not in to_drop]
        if len(correlated_features) > 0:
            to_drop.append(col)
            dropped_info.append((col, correlated_features, [df[col].corr(df[f]) for f in correlated_features]))
            
    print(f"\n--- Correlation Analysis (Threshold = {threshold}) ---")
    if len(to_drop) > 0:
        print(f"Detected {len(to_drop)} highly correlated feature(s) to remove:")
        for col, corr_with, corr_vals in dropped_info:
            corr_str = ", ".join([f"'{f}' (r = {v:.3f})" for f, v in zip(corr_with, corr_vals)])
            print(f"  - Dropping '{col}' because it is highly correlated with: {corr_str}")
        df_reduced = df.drop(columns=to_drop)
    else:
        print("No highly correlated features (> 0.95) detected.")
        df_reduced = df.copy()
        
    return df_reduced, to_drop

def handle_missing_values(df, loan_cols, target_cols=None):
    """
    Imputes missing values properly.
    """
    print("\nHandling missing values...")
    if target_cols is None:
        target_cols = []
        
    df_clean = df.copy()
    
    # 1. Fill loan columns with 0 for businesses with no loan history
    print("  Imputing loan metrics with 0 for businesses without active/past loans...")
    for col in loan_cols:
        if col in df_clean.columns:
            df_clean[col] = df_clean[col].fillna(0)
            
    # 2. Impute other numeric features with median
    numeric_cols = df_clean.select_dtypes(include=[np.number]).columns
    num_imputed = 0
    for col in numeric_cols:
        if col not in target_cols and col != "Business_ID":
            null_count = df_clean[col].isnull().sum()
            if null_count > 0:
                median_val = df_clean[col].median()
                df_clean[col] = df_clean[col].fillna(median_val)
                num_imputed += null_count
                
    # 3. Impute categorical features with mode
    cat_cols = df_clean.select_dtypes(exclude=[np.number]).columns
    cat_imputed = 0
    for col in cat_cols:
        if col not in target_cols and col != "Business_ID":
            null_count = df_clean[col].isnull().sum()
            if null_count > 0:
                mode_val = df_clean[col].mode()[0] if not df_clean[col].mode().empty else "Unknown"
                df_clean[col] = df_clean[col].fillna(mode_val)
                cat_imputed += null_count
                
    print(f"  Imputed {num_imputed} numeric NaNs and {cat_imputed} categorical NaNs.")
    return df_clean

def main():
    dfs = load_data()
    
    # 1. Aggregations
    fin_agg = aggregate_monthly_financials(dfs["monthly_financials"])
    gst_agg = aggregate_gst_history(dfs["gst_history"])
    upi_agg = aggregate_upi_summary(dfs["upi_monthly_summary"], dfs["monthly_financials"])
    loan_agg = aggregate_loan_history(dfs["loan_history"])
    
    # 2. Extract Business Master and Employee Details
    biz_df = dfs["business_master"].copy()
    emp_df = dfs["employee_details"].copy()
    
    # To prevent duplicate column names during merge, drop identical Employee_Count from emp_df
    if "Employee_Count" in emp_df.columns:
        emp_df = emp_df.drop(columns=["Employee_Count"])
        
    # 3. Merging Pipeline
    print("\nMerging all datasets on Business_ID...")
    # Base is Business Master
    merged_df = biz_df.copy()
    
    # Merge aggregations
    merged_df = merged_df.merge(fin_agg, on="Business_ID", how="left")
    merged_df = merged_df.merge(gst_agg, on="Business_ID", how="left")
    merged_df = merged_df.merge(upi_agg, on="Business_ID", how="left")
    merged_df = merged_df.merge(loan_agg, on="Business_ID", how="left")
    merged_df = merged_df.merge(emp_df, on="Business_ID", how="left")
    
    # 4. Remove Target Leakage Columns
    # Identify leakage and identifier columns to remove from features
    leakage_and_id_cols = [
        "Business_Name",
        "Owner_Name",
        "PAN",
        "GSTIN",
        "Business_Health_Index",  # Precursor to Financial Health Score
        "Business_Momentum",      # Simulation hidden parameter
        "Base_Financial_Stability" # Simulation hidden parameter
    ]
    print(f"\nRemoving leakage and high-cardinality ID columns from feature space: {leakage_and_id_cols}")
    merged_df = merged_df.drop(columns=leakage_and_id_cols, errors="ignore")
    
    # 5. Handle missing values
    loan_cols = [
        "Active_Loan_Count",
        "Total_Loan_Amount",
        "Outstanding_Principal_Total",
        "EMI_Delay_Count",
        "Default_History"
    ]
    # Identify target columns to preserve intact
    target_cols = [
        "Financial_Health_Score",
        "Risk_Category",
        "Default_Probability",
        "Loan_Eligibility",
        "Max_Approved_Loan",
        "Fraud_Probability",
        "Recommended_Action"
    ]
    merged_df = handle_missing_values(merged_df, loan_cols, target_cols)
    
    # Convert boolean columns to integer (like EPFO_Registered)
    bool_cols = merged_df.select_dtypes(include=["bool"]).columns
    if len(bool_cols) > 0:
        print(f"Converting boolean columns to integer: {bool_cols.tolist()}")
        merged_df[bool_cols] = merged_df[bool_cols].astype(int)
    
    # 6. Encode Categorical Columns
    categorical_cols = ["Industry", "State", "MSME_Type"]
    print(f"\nEncoding categorical columns using One-Hot Encoding: {categorical_cols}")
    merged_df = pd.get_dummies(merged_df, columns=categorical_cols, prefix=categorical_cols, dtype=int)
    
    # 7. Remove Duplicate Columns
    merged_df = remove_duplicate_columns(merged_df)
    
    # 8. Detect & Drop Highly Correlated Columns (>0.95)
    merged_df, dropped_corr_cols = drop_correlated_features(
        merged_df, threshold=0.95, target_cols=target_cols, id_col="Business_ID"
    )
    
    # 9. Merge AI Labels (Targets) at the end of the pipeline
    print("\nMerging target labels from ai_labels.csv...")
    labels_df = dfs["ai_labels"]
    final_df = merged_df.merge(labels_df, on="Business_ID", how="left")
    
    # Verify final missing values in targets
    for col in target_cols:
        nulls = final_df[col].isnull().sum()
        if nulls > 0:
            print(f"Warning: Target column '{col}' has {nulls} missing values.")
            
    # 10. Save training dataset
    os.makedirs("output", exist_ok=True)
    output_path = os.path.join("output", "training_dataset.csv")
    final_df.to_csv(output_path, index=False)
    print(f"\nSaved final training dataset to '{output_path}'")
    
    # 11. Print Outputs
    print("\n" + "="*50)
    print("FEATURE ENGINEERING PLATFORM METRICS SUMMARY")
    print("="*50)
    print(f"Final Dataset Shape: {final_df.shape}")
    
    print("\nMissing Values Summary:")
    missing_counts = final_df.isnull().sum()
    total_missing = missing_counts.sum()
    if total_missing == 0:
        print("  Clean! No missing values in the final dataset.")
    else:
        for col, count in missing_counts[missing_counts > 0].items():
            print(f"  - '{col}': {count} missing values")
            
    print("\nCorrelation Drop Summary:")
    if dropped_corr_cols:
        print(f"  Dropped {len(dropped_corr_cols)} features with correlation >0.95:")
        for col in dropped_corr_cols:
            print(f"    * {col}")
    else:
        print("  No features dropped due to high correlation.")
        
    print("\nFinal Feature List:")
    feature_cols = [c for c in final_df.columns if c not in target_cols and c != "Business_ID"]
    print(f"  Total Features: {len(feature_cols)}")
    for i, col in enumerate(feature_cols, 1):
        print(f"    {i:2d}. {col}")
        
    print("\nFinal Targets List:")
    for i, col in enumerate(target_cols, 1):
        print(f"    {i:2d}. {col}")
    print("="*50)

if __name__ == "__main__":
    main()

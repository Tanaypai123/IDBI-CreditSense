#!/usr/bin/env python3
"""
Model Training Pipeline
MSME Financial Health Assessment Platform - IDBI Innovate 2026

This script reads training_dataset.csv, performs train-test split (80/20) for leakage
verification, trains and compares multiple ML models (Random Forest, XGBoost, LightGBM,
CatBoost) using 5-Fold Cross-Validation, tunes hyperparameters, evaluates on the test
split, logs metrics, tracks training/prediction times, and saves winning models, metrics,
importance scores, and evaluation plots.
"""

import os
import time
import pickle
import logging
import warnings
import numpy as np
import pandas as pd

# Headless matplotlib configuration to prevent GUI crashes
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import KFold, RandomizedSearchCV
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    roc_curve
)

# Suppress warnings for clean stdout
warnings.filterwarnings("ignore")

# Setup Directories
os.makedirs("output", exist_ok=True)
os.makedirs("output/plots", exist_ok=True)
os.makedirs("models", exist_ok=True)

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("output/train_model.log", mode="w"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("TrainModel")

# Set random seed for reproducibility
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

def load_and_preprocess_dataset(filepath="output/training_dataset.csv"):
    """
    Loads training_dataset.csv and separates feature columns (X) from the target columns (Y).
    """
    logger.info(f"Loading training dataset from '{filepath}'...")
    if not os.path.exists(filepath):
        logger.error(f"Dataset not found at '{filepath}'. Run feature_engineering.py first.")
        raise FileNotFoundError(f"Dataset '{filepath}' is missing.")
        
    df = pd.read_csv(filepath)
    logger.info(f"Successfully loaded dataset with shape: {df.shape}")
    
    # Identify target columns
    target_cols = [
        "Financial_Health_Score",
        "Risk_Category",
        "Default_Probability",
        "Loan_Eligibility",
        "Max_Approved_Loan",
        "Fraud_Probability",
        "Recommended_Action"
    ]
    
    # Identify feature columns (everything except targets and Business_ID)
    feature_cols = [col for col in df.columns if col not in target_cols and col != "Business_ID"]
    
    # Check for constant-value columns in features
    constant_cols = [col for col in feature_cols if df[col].nunique() <= 1]
    if constant_cols:
        logger.warning(f"Feature columns with zero variance detected and dropped: {constant_cols}")
        feature_cols = [col for col in feature_cols if col not in constant_cols]
        
    # Serialize feature columns list to root and models directory
    for path in ["feature_columns.pkl", "models/feature_columns.pkl"]:
        with open(path, "wb") as f:
            pickle.dump(feature_cols, f)
    logger.info("Saved feature column names to 'feature_columns.pkl' and 'models/feature_columns.pkl'")
    
    # Parse features (X) and Targets (Y)
    X = df[feature_cols].copy()
    Y = df[target_cols].copy()
    
    # Ensure Loan_Eligibility is integer (binary classification)
    Y["Loan_Eligibility"] = Y["Loan_Eligibility"].astype(int)
    
    return X, Y, feature_cols, target_cols

def verify_no_leakage(X_train, X_test, feature_cols, target_cols):
    """
    Verifies that there is no train-test leakage or target leakage.
    """
    logger.info("\n" + "-"*40)
    logger.info("TRAIN-TEST LEAKAGE VERIFICATION RUN")
    logger.info("-"*40)
    
    # Check 1: Disjoint indices
    overlapping_indices = X_train.index.intersection(X_test.index)
    index_check = len(overlapping_indices) == 0
    logger.info(f"  [CHECK] Train and Test indices are completely disjoint: {index_check} (overlap size = {len(overlapping_indices)})")
    
    # Check 2: Targets not in feature set
    target_overlap_train = set(X_train.columns).intersection(set(target_cols))
    target_overlap_test = set(X_test.columns).intersection(set(target_cols))
    target_check = len(target_overlap_train) == 0 and len(target_overlap_test) == 0
    logger.info(f"  [CHECK] Target columns are absent from features: {target_check} (overlap train = {target_overlap_train}, test = {target_overlap_test})")
    
    # Check 3: Business_ID or PII not in features
    pii_cols = ["Business_ID", "PAN", "GSTIN", "Business_Name", "Owner_Name", "Loan_ID"]
    pii_overlap = [c for c in pii_cols if c in X_train.columns]
    pii_check = len(pii_overlap) == 0
    logger.info(f"  [CHECK] High-cardinality/PII columns absent from features: {pii_check} (found = {pii_overlap})")
    
    if index_check and target_check and pii_check:
        logger.info("  [VERDICT] PASS: No train-test or target leakage detected!")
    else:
        logger.error("  [VERDICT] FAIL: Train-test or target leakage detected!")
        raise ValueError("Data leakage detected in pipeline.")
    logger.info("-"*40 + "\n")

def get_tuning_grids(is_classification=False):
    """
    Returns model instances and randomized hyperparameter search grids.
    Configured to compare: Random Forest, XGBoost, LightGBM, CatBoost.
    """
    import xgboost as xgb
    import lightgbm as lgb
    import catboost as cb

    if is_classification:
        models = {
            "RandomForest": RandomForestClassifier(random_state=RANDOM_SEED, n_jobs=-1),
            "XGBoost": xgb.XGBClassifier(random_state=RANDOM_SEED, n_jobs=-1, eval_metric="logloss"),
            "LightGBM": lgb.LGBMClassifier(random_state=RANDOM_SEED, n_jobs=-1, verbose=-1),
            "CatBoost": cb.CatBoostClassifier(random_seed=RANDOM_SEED, verbose=0)
        }
        
        grids = {
            "RandomForest": {
                "n_estimators": [50, 100],
                "max_depth": [10, 20, None],
                "min_samples_split": [2, 5]
            },
            "XGBoost": {
                "n_estimators": [100, 150],
                "max_depth": [4, 6, 8],
                "learning_rate": [0.05, 0.1],
                "subsample": [0.8, 1.0]
            },
            "LightGBM": {
                "n_estimators": [100, 150],
                "max_depth": [4, 6, 8],
                "learning_rate": [0.05, 0.1],
                "num_leaves": [15, 31, 63]
            },
            "CatBoost": {
                "iterations": [100, 150],
                "depth": [4, 6, 8],
                "learning_rate": [0.05, 0.1],
                "l2_leaf_reg": [3, 5]
            }
        }
    else:
        models = {
            "RandomForest": RandomForestRegressor(random_state=RANDOM_SEED, n_jobs=-1),
            "XGBoost": xgb.XGBRegressor(random_state=RANDOM_SEED, n_jobs=-1),
            "LightGBM": lgb.LGBMRegressor(random_state=RANDOM_SEED, n_jobs=-1, verbose=-1),
            "CatBoost": cb.CatBoostRegressor(random_seed=RANDOM_SEED, verbose=0)
        }
        
        grids = {
            "RandomForest": {
                "n_estimators": [50, 100],
                "max_depth": [10, 20, None],
                "min_samples_split": [2, 5]
            },
            "XGBoost": {
                "n_estimators": [100, 150],
                "max_depth": [4, 6, 8],
                "learning_rate": [0.05, 0.1],
                "subsample": [0.8, 1.0]
            },
            "LightGBM": {
                "n_estimators": [100, 150],
                "max_depth": [4, 6, 8],
                "learning_rate": [0.05, 0.1],
                "num_leaves": [15, 31, 63]
            },
            "CatBoost": {
                "iterations": [100, 150],
                "depth": [4, 6, 8],
                "learning_rate": [0.05, 0.1],
                "l2_leaf_reg": [3, 5]
            }
        }
        
    return models, grids

def calculate_mape(y_true, y_pred):
    """
    Safely calculates Mean Absolute Percentage Error (MAPE).
    """
    return np.mean(np.abs((y_true - y_pred) / np.maximum(y_true, 1e-9))) * 100

def train_and_tune(X_train, y_train, target_name, is_classification=False):
    """
    Performs 5-Fold CV hyperparameter tuning on the training split,
    comparing RandomForest, XGBoost, LightGBM, and CatBoost.
    """
    logger.info(f"\n" + "="*60)
    logger.info(f"Tuning Models on Train Split (80%) for: '{target_name}'")
    logger.info("="*60)
    
    models, grids = get_tuning_grids(is_classification)
    cv = KFold(n_splits=5, shuffle=True, random_state=RANDOM_SEED)
    
    best_models = {}
    best_scores = {}
    
    scoring = "roc_auc" if is_classification else "neg_mean_absolute_error"
    
    for model_name, model in models.items():
        logger.info(f"Running Hyperparameter Tuning on '{model_name}'...")
        
        search = RandomizedSearchCV(
            estimator=model,
            param_distributions=grids[model_name],
            n_iter=5,
            scoring=scoring,
            cv=cv,
            random_state=RANDOM_SEED,
            n_jobs=-1
        )
        search.fit(X_train, y_train)
        
        best_estimator = search.best_estimator_
        best_models[model_name] = best_estimator
        
        if is_classification:
            best_score = search.best_score_
            best_scores[model_name] = best_score
            logger.info(f"  * Best parameters: {search.best_params_}")
            logger.info(f"  * Best 5-Fold ROC-AUC: {best_score:.4f}")
        else:
            best_score = -search.best_score_
            best_scores[model_name] = best_score
            logger.info(f"  * Best parameters: {search.best_params_}")
            logger.info(f"  * Best 5-Fold MAE: {best_score:.4f}")
            
    # Winning model selection
    if is_classification:
        winner_name = max(best_scores, key=best_scores.get)
    else:
        winner_name = min(best_scores, key=best_scores.get)
        
    winner_model = best_models[winner_name]
    logger.info(f"\n>>> Winning Model for '{target_name}': {winner_name} (Score: {best_scores[winner_name]:.4f})")
    
    return winner_model, winner_name

def evaluate_and_plot(best_model, X_train, y_train, X_test, y_test, target_name, model_name, is_classification=False):
    """
    Evaluates winning model on test split, measures training/prediction time,
    prints winning hyperparameters and top 20 features, and saves plots.
    """
    logger.info(f"\n--- Fitting and Evaluating final {model_name} for '{target_name}' ---")
    
    # 1. Measure Training Time
    t_start = time.time()
    best_model.fit(X_train, y_train)
    train_time = time.time() - t_start
    logger.info(f"  * Training Time (Fit on 80% Train Set): {train_time:.4f} seconds")
    
    # 2. Measure Prediction Time
    t_start = time.time()
    y_pred = best_model.predict(X_test)
    predict_time = time.time() - t_start
    logger.info(f"  * Prediction Time (Predict on 20% Test Set): {predict_time:.4f} seconds")
    
    # Log hyperparameters
    logger.info(f"  * Winning Hyperparameters: {best_model.get_params() if hasattr(best_model, 'get_params') else 'custom'}")
    
    metrics = {
        "Target": target_name,
        "Winning_Model": model_name,
        "Training_Time_Sec": train_time,
        "Prediction_Time_Sec": predict_time
    }
    
    if is_classification:
        y_prob = best_model.predict_proba(X_test)[:, 1]
        
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_prob)
        cm = confusion_matrix(y_test, y_pred)
        
        logger.info(f"  * Test Accuracy : {acc:.4f}")
        logger.info(f"  * Test Precision: {prec:.4f}")
        logger.info(f"  * Test Recall   : {rec:.4f}")
        logger.info(f"  * Test F1-Score : {f1:.4f}")
        logger.info(f"  * Test ROC-AUC  : {roc_auc:.4f}")
        logger.info(f"  * Confusion Matrix:\n{cm}")
        
        metrics.update({
            "Accuracy": acc, "Precision": prec, "Recall": rec, "F1": f1, "ROC_AUC": roc_auc,
            "MAE": np.nan, "RMSE": np.nan, "R2": np.nan, "MAPE": np.nan
        })
        
        # Save Confusion Matrix Heatmap
        plt.figure(figsize=(6, 5))
        sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", cbar=False,
                    xticklabels=["Ineligible", "Eligible"], yticklabels=["Ineligible", "Eligible"])
        plt.title(f"Confusion Matrix - {target_name} ({model_name})")
        plt.xlabel("Predicted Status")
        plt.ylabel("Actual Status")
        plt.tight_layout()
        plt.savefig(f"output/plots/confusion_matrix.png")
        plt.close()
        
        # Save ROC Curve
        fpr, tpr, _ = roc_curve(y_test, y_prob)
        plt.figure(figsize=(7, 5))
        plt.plot(fpr, tpr, color="darkorange", lw=2, label=f"ROC Curve (AUC = {roc_auc:.4f})")
        plt.plot([0, 1], [0, 1], color="navy", lw=2, linestyle="--")
        plt.xlim([0.0, 1.0])
        plt.ylim([0.0, 1.05])
        plt.xlabel("False Positive Rate")
        plt.ylabel("True Positive Rate")
        plt.title(f"Receiver Operating Characteristic (ROC) Curve - {target_name}")
        plt.legend(loc="lower right")
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(f"output/plots/roc_curve.png")
        plt.close()
        
    else:
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        mape = calculate_mape(y_test, y_pred)
        
        logger.info(f"  * Test MAE  : {mae:.4f}")
        logger.info(f"  * Test RMSE : {rmse:.4f}")
        logger.info(f"  * Test R²   : {r2:.4f}")
        logger.info(f"  * Test MAPE : {mape:.4f}%")
        
        metrics.update({
            "MAE": mae, "RMSE": rmse, "R2": r2, "MAPE": mape,
            "Accuracy": np.nan, "Precision": np.nan, "Recall": np.nan, "F1": np.nan, "ROC_AUC": np.nan
        })
        
        # Save Actual vs Predicted Scatter Plot
        plt.figure(figsize=(7, 6))
        plt.scatter(y_test, y_pred, alpha=0.3, color="teal")
        mn, mx = min(y_test.min(), y_pred.min()), max(y_test.max(), y_pred.max())
        plt.plot([mn, mx], [mn, mx], color="red", linestyle="--", lw=2)
        plt.xlabel("Actual Value")
        plt.ylabel("Predicted Value")
        plt.title(f"Actual vs Predicted - {target_name} ({model_name})")
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(f"output/plots/{target_name.lower()}_actual_vs_predicted.png")
        plt.close()
        
        # Save Residual Plot
        residuals = y_test - y_pred
        plt.figure(figsize=(7, 5))
        plt.scatter(y_pred, residuals, alpha=0.3, color="purple")
        plt.axhline(0, color="red", linestyle="--", lw=2)
        plt.xlabel("Predicted Value")
        plt.ylabel("Residuals")
        plt.title(f"Residual Plot - {target_name} ({model_name})")
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(f"output/plots/{target_name.lower()}_residuals.png")
        plt.close()
        
    # 3. Extract and Process Feature Importances
    importances = None
    if hasattr(best_model, "feature_importances_"):
        importances = best_model.feature_importances_
    elif hasattr(best_model, "get_feature_importance"):
        importances = best_model.get_feature_importance()
        
    importance_df = pd.DataFrame()
    if importances is not None:
        feature_names = X_train.columns.tolist()
        feat_imp_series = pd.Series(importances, index=feature_names).sort_values(ascending=False)
        
        # Log top 20 feature importances
        logger.info(f"  * Top 20 Feature Importances for '{target_name}' model:")
        for idx, (feat, score) in enumerate(feat_imp_series.head(20).items(), 1):
            logger.info(f"    {idx:2d}. {feat:30s}: {score:.5f}")
            
        # Plot Feature Importance
        plt.figure(figsize=(8, 6))
        top_feats = feat_imp_series.head(15)
        sns.barplot(x=top_feats.values, y=top_feats.index, palette="viridis")
        plt.xlabel("Importance Score")
        plt.ylabel("Feature")
        plt.title(f"Top 15 Feature Importances - {target_name} ({model_name})")
        plt.tight_layout()
        plt.savefig(f"output/plots/{target_name.lower()}_feature_importance.png")
        plt.close()
        
        importance_df = pd.DataFrame({
            "Target": target_name,
            "Feature": feat_imp_series.index,
            "Importance": feat_imp_series.values
        })
        
    return metrics, importance_df

def main():
    logger.info("Initializing Model Training and Evaluation Pipeline...")
    
    # 1. Ingestion
    X, Y, feature_cols, target_cols = load_and_preprocess_dataset()
    
    # Define independent models to train
    targets = [
        ("Financial_Health_Score", "models/best_health_model.pkl", False),
        ("Default_Probability", "models/best_default_model.pkl", False),
        ("Loan_Eligibility", "models/best_loan_model.pkl", True)
    ]
    
    all_metrics = []
    all_importances = []
    
    for target_name, save_filename, is_classification in targets:
        y = Y[target_name]
        
        # Train-Test Split (80/20) for leakage verification and final evaluation
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=RANDOM_SEED
        )
        
        # Verify no data leakage between splits
        verify_no_leakage(X_train, X_test, feature_cols, target_cols)
        
        # 2. Hyperparameter Tuning and Model Comparison on Train Set (80%)
        best_model, winning_model_name = train_and_tune(X_train, y_train, target_name, is_classification)
        
        # 3. Model Evaluation on Test Split (20%), time tracking, and plot saving
        metrics, importance_df = evaluate_and_plot(
            best_model, X_train, y_train, X_test, y_test, target_name, winning_model_name, is_classification
        )
        
        all_metrics.append(metrics)
        if not importance_df.empty:
            all_importances.append(importance_df)
            
        # 4. Serialize best model to models/
        logger.info(f"Saving best '{target_name}' model to '{save_filename}'...")
        with open(save_filename, "wb") as f:
            pickle.dump(best_model, f)
        # Save a duplicate copy in root directory for convenience
        root_filename = os.path.basename(save_filename)
        with open(root_filename, "wb") as f:
            pickle.dump(best_model, f)
        logger.info(f"Successfully saved best model: {save_filename} and {root_filename}")
        
    # 5. Save Model Metrics CSV to root and output/
    metrics_df = pd.DataFrame(all_metrics)
    metrics_df.to_csv("model_metrics.csv", index=False)
    metrics_df.to_csv("output/model_metrics.csv", index=False)
    logger.info("Saved final model metrics comparison to 'model_metrics.csv' and 'output/model_metrics.csv'")
    
    # 6. Save Feature Importances CSV to root and output/
    if all_importances:
        importances_df = pd.concat(all_importances, ignore_index=True)
        importances_df.to_csv("feature_importance.csv", index=False)
        importances_df.to_csv("output/feature_importance.csv", index=False)
        logger.info("Saved feature importances to 'feature_importance.csv' and 'output/feature_importance.csv'")
        
    logger.info("\n" + "="*60)
    logger.info("MODEL TRAINING PLATFORM EXECUTION COMPLETED SUCCESSFULLY")
    logger.info("="*60)

if __name__ == "__main__":
    main()

# main.py
import os
import io
import pandas as pd
from typing import List

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

import schemas
import ml_engine
import pdf_engine

app = FastAPI(
    title="IDBI Innovate 2026 MSME ML Backend",
    description="REST API serving underwriting models and explainability vectors."
)

# CORS Policy Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Enable access from React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pre-load ML resources on startup
@app.on_event("startup")
def startup_event():
    ml_engine.load_resources()

@app.post("/api/predict", response_model=schemas.MSMEResponse)
def predict_single_msme(payload: schemas.MSMERequest):
    """
    Evaluates risk and financial metrics for a single business.
    """
    try:
        inputs = payload.dict()
        score, risk_category, default_prob, eligible, max_loan, top_pos, top_neg = ml_engine.predict_single(inputs)
        return schemas.MSMEResponse(
            score=score,
            risk_category=risk_category,
            default_probability=default_prob,
            eligible=eligible,
            max_loan=max_loan,
            top_positive=top_pos,
            top_negative=top_neg
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")

@app.post("/api/predict/batch", response_model=schemas.BatchPredictResponse)
async def predict_batch_msme(file: UploadFile = File(...)):
    """
    Processes a multi-row business ledger CSV and runs predictions.
    """
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        if "Business_ID" not in df.columns:
            raise HTTPException(status_code=400, detail="Missing 'Business_ID' column in CSV ledger.")
            
        results = []
        ml_engine.load_resources()
        feat_cols = ml_engine.feature_columns
        
        for idx, row in df.iterrows():
            biz_id = str(row["Business_ID"])
            to_val = float(row.get("Annual_Turnover", 10000000.0))
            
            # Form row inputs dict
            row_dict = {col: row[col] for col in feat_cols if col in df.columns}
            row_df = pd.DataFrame([row_dict])
            
            # Align features with columns list
            aligned_feat = {col: 0.0 for col in feat_cols}
            for col in feat_cols:
                if col in row_df.columns:
                    aligned_feat[col] = float(row_df.loc[0, col])
            aligned_df = pd.DataFrame([aligned_feat])
            
            # Predict
            score, risk_category, default_prob, eligible, max_loan = ml_engine.predict_metrics(aligned_df, to_val)
            
            results.append(schemas.BatchItemResponse(
                Business_ID=biz_id,
                score=score,
                risk_category=risk_category,
                default_probability=default_prob,
                eligible=eligible,
                max_loan=max_loan
            ))
            
        return schemas.BatchPredictResponse(results=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch error: {str(e)}")

@app.get("/api/analytics/global", response_model=schemas.GlobalAnalyticsResponse)
def get_global_analytics():
    """
    Retrieves feature importances and top correlation indices.
    """
    try:
        health_imp = []
        default_imp = []
        
        # Load from previously saved local files
        importance_path = os.path.join(ml_engine.PROJECT_DIR, "feature_importance.csv")
        if os.path.exists(importance_path):
            df_imp = pd.read_csv(importance_path)
            
            # Health Importance
            df_h = df_imp[df_imp["Target"] == "Financial_Health_Score"].head(10)
            for idx, row in df_h.iterrows():
                feat = str(row["Feature"])
                health_imp.append(schemas.GlobalFeatureImportance(
                    feature=feat,
                    importance=float(row["Importance"]),
                    display_name=ml_engine.DISPLAY_NAMES.get(feat, feat)
                ))
                
            # Default Importance
            df_d = df_imp[df_imp["Target"] == "Default_Probability"].head(10)
            for idx, row in df_d.iterrows():
                feat = str(row["Feature"])
                default_imp.append(schemas.GlobalFeatureImportance(
                    feature=feat,
                    importance=float(row["Importance"]),
                    display_name=ml_engine.DISPLAY_NAMES.get(feat, feat)
                ))
        
        # Build a list representing correlation matrix structure
        # (This is returned to populate Recharts heatmap nodes on the client)
        corr_data = []
        dataset_path = os.path.join(ml_engine.PROJECT_DIR, "output", "training_dataset.csv")
        if os.path.exists(dataset_path):
            df = pd.read_csv(dataset_path)
            top_cols = ["Cashflow_Stability_Mean", "Profit_Margin_Mean", "Revenue_Growth_MoM_Mean", "GST_Compliance_Mean", "Current_Ratio_Mean"]
            cols_present = [c for c in top_cols if c in df.columns]
            if len(cols_present) > 1:
                matrix = df[cols_present].corr().round(2).to_dict()
                for c1 in cols_present:
                    for c2 in cols_present:
                        corr_data.append({
                            "x": ml_engine.DISPLAY_NAMES.get(c1, c1),
                            "y": ml_engine.DISPLAY_NAMES.get(c2, c2),
                            "val": float(matrix[c1][c2])
                        })
                        
        return schemas.GlobalAnalyticsResponse(
            health_importance=health_imp,
            default_importance=default_imp,
            correlation_top20=corr_data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics retrieval error: {str(e)}")

@app.post("/api/report/pdf")
def export_pdf_report(payload: schemas.MSMERequest):
    """
    Generates and downloads a custom report PDF.
    """
    try:
        inputs = payload.dict()
        score, risk_category, default_prob, eligible, max_loan, _, _ = ml_engine.predict_single(inputs)
        pdf_bytes = pdf_engine.generate_pdf_report(
            inputs["biz_name"], score, risk_category, default_prob, eligible, max_loan, inputs
        )
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=MSME_Assessment_{inputs['biz_name'].replace(' ', '_')}.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF engine crash: {str(e)}")

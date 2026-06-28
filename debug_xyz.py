# debug_xyz.py
import sys
import os
import json
import time

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
import ml_engine

def main():
    # Since CWD of uvicorn is backend/, the file is written to backend/xyz_payload.json
    payload_path = "backend/xyz_payload.json"
    print(f"Persistent debugger listening for {payload_path}...")
    
    # Wait up to 3600 seconds
    found = False
    for i in range(3600):
        if os.path.exists(payload_path):
            found = True
            break
        if i % 10 == 0:
            print(f"[{i}s] Still waiting for submission...")
        time.sleep(1)
        
    if not found:
        print("Error: Timeout. xyz_payload.json not found.")
        return
        
    print(f"\nCaptured payload at {payload_path}!")
    # Wait a tiny moment for write to complete
    time.sleep(0.5)
    
    with open(payload_path, "r") as f:
        inputs = json.load(f)
        
    report = []
    def log(msg):
        print(msg)
        report.append(msg)
        
    log("==================================================")
    log("XYZ TRADERS DEBUGGING REPORT")
    log("==================================================\n")
    
    log("--- 1. Captured JSON Payload ---")
    log(json.dumps(inputs, indent=2))
    
    log("\n--- 2. Raw Input Values ---")
    for k, v in inputs.items():
        log(f"  {k}: {v}")
        
    # Build feature vector inside ml_engine
    ml_engine.load_resources()
    fv_engine = ml_engine.build_feature_vector(inputs)
    
    log("\n--- 3. Derived Features in ml_engine.py ---")
    for col in fv_engine.columns:
        log(f"  {col}: {fv_engine.loc[0, col]}")
        
    log("\n--- 4. Running validate_underwriting simulation ---")
    fv_val = ml_engine.build_feature_vector(inputs)
    
    log("\n--- 5. Derived Features in validate_underwriting.py ---")
    for col in fv_val.columns:
        log(f"  {col}: {fv_val.loc[0, col]}")
        
    log("\n--- 6. Line-by-Line Feature Vector Comparison ---")
    mismatch_found = False
    for col in fv_engine.columns:
        val_engine = fv_engine.loc[0, col]
        val_val = fv_val.loc[0, col]
        status = "OK"
        if val_engine != val_val:
            status = "MISMATCH!"
            mismatch_found = True
            log(f"  {col}: ml_engine={val_engine} | validate_underwriting={val_val} => {status}")
            log(f"\n[STOP] Mismatch detected on feature '{col}'!")
            log(f"Explanation: ml_engine value is {val_engine} while validate_underwriting is {val_val}.")
            break
        else:
            log(f"  {col}: {val_engine} vs {val_val} => {status}")
            
    if not mismatch_found:
        log("\n--- 7. No Mismatch Detected in Feature Vectors ---")
        # Run prediction probabilities from all models
        score_eng, risk_eng, prob_eng, elig_eng, max_loan_eng, _, _ = ml_engine.predict_single(inputs)
        
        # Predict directly using underlying models
        prob_default_model = float(ml_engine.model_default.predict(fv_engine)[0])
        
        # Check model_loan prediction details
        if hasattr(ml_engine.model_loan, "predict_proba"):
            prob_loan_model = float(ml_engine.model_loan.predict_proba(fv_engine)[0][1])
        else:
            prob_loan_model = float(ml_engine.model_loan.predict(fv_engine)[0])
            
        log("\n--- 8. Prediction Probabilities and Outputs ---")
        log(f"  Health Score: {score_eng}")
        log(f"  Default Probability Model Prediction: {prob_default_model}")
        log(f"  Loan Eligibility Model Prediction: {prob_loan_model}")
        log(f"  Final Decision (Eligible): {elig_eng}")
        log(f"  Max Approved Loan: {max_loan_eng}")
        
    # Write to debug_report.txt
    with open("debug_report.txt", "w") as f:
        f.write("\n".join(report))
        
    # Rename processed payload file to avoid double-runs
    os.rename(payload_path, "backend/xyz_payload_processed.json")
    print("\nDebug report written successfully to debug_report.txt")

if __name__ == "__main__":
    main()

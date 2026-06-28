import time
from config import Config
from business_generator import BusinessGenerator
from monthly_financial_generator import MonthlyFinancialGenerator
from gst_generator import GSTGenerator
from upi_generator import UPIGenerator
from loan_generator import LoanGenerator
from employee_generator import EmployeeGenerator
from label_generator import LabelGenerator

def main():
    print("==================================================")
    print(f"Starting Synthetic MSME Ecosystem Generation")
    print(f"Target: {Config.NUM_MSMES} MSMEs over {Config.MONTHS_HISTORY} Months")
    print("==================================================\n")
    
    start_time = time.time()
    Config.setup()
    
    # 1. Generate Business Master
    t0 = time.time()
    b_gen = BusinessGenerator()
    business_df = b_gen.generate()
    print(f"Business Master Done. ({time.time() - t0:.2f}s)\n")
    
    # 2. Generate Monthly Financials
    t0 = time.time()
    m_gen = MonthlyFinancialGenerator(business_df)
    monthly_df = m_gen.generate()
    print(f"Monthly Financials Done. ({time.time() - t0:.2f}s)\n")
    
    # 3. Generate GST History
    t0 = time.time()
    gst_gen = GSTGenerator(monthly_df, business_df)
    gst_df = gst_gen.generate()
    print(f"GST History Done. ({time.time() - t0:.2f}s)\n")
    
    # 4. Generate UPI Transactions
    t0 = time.time()
    upi_gen = UPIGenerator(business_df)
    upi_df = upi_gen.generate()  # Note: Writes to disk in chunks to save memory
    print(f"UPI Transactions Done. ({time.time() - t0:.2f}s)\n")
    
    # 5. Generate Loan History
    t0 = time.time()
    loan_gen = LoanGenerator(business_df, monthly_df)
    loan_summary_df = loan_gen.generate()
    print(f"Loan History Done. ({time.time() - t0:.2f}s)\n")
    
    # 6. Generate Employee Details
    t0 = time.time()
    emp_gen = EmployeeGenerator(business_df)
    emp_df = emp_gen.generate()
    print(f"Employee Details Done. ({time.time() - t0:.2f}s)\n")
    
    # 7. Generate Final AI Labels
    t0 = time.time()
    label_gen = LabelGenerator(business_df, monthly_df, gst_df, upi_df, loan_summary_df)
    label_gen.generate()
    print(f"AI Labels Done. ({time.time() - t0:.2f}s)\n")
    
    total_time = time.time() - start_time
    print("==================================================")
    print(f"Generation Complete! Total Time: {total_time:.2f} seconds.")
    print(f"All files saved to ./{Config.OUTPUT_DIR}/")
    print("==================================================")

if __name__ == "__main__":
    main()
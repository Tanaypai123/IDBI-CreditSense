import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip, Cell } from 'recharts';
import { 
  Building2, 
  ArrowLeft, 
  ArrowRight, 
  Download,
  AlertTriangle,
  UserCheck,
  CheckCircle,
  HelpCircle,
  Cpu,
  Layers,
  Database,
  ShieldCheck,
  FileText,
  Printer,
  Code,
  Globe,
  Info,
  DollarSign,
  TrendingUp,
  Percent
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import ScoreGauge from '../components/ScoreGauge';
import StatusBadge from '../components/StatusBadge';
import PageHeader from '../components/PageHeader';
import ChartCard from '../components/ChartCard';

const INDUSTRIES = [
  "Retail", "Restaurant", "Electronics", "Medical", "Textile", 
  "Manufacturing", "Agriculture", "Transport", "IT", "Construction", 
  "Furniture", "Pharmacy", "Bakery", "Wholesale", "Hardware", 
  "Dairy", "Education", "Mobile Shop", "Automobile", "Printing"
];

const STATES = ["Maharashtra", "Gujarat", "Karnataka", "Tamil Nadu", "Delhi", "Uttar Pradesh", "Telangana", "Rajasthan"];
const MSME_TYPES = ["Micro", "Small", "Medium"];

const initialForm = {
  biz_name: "Sharma Wholesale Traders",
  Industry: "Retail",
  State: "Maharashtra",
  MSME_Type: "Micro",
  Business_Age_Yrs: 5,
  Annual_Turnover: 12000000.0,
  Digital_Adoption_Score: 0.70,
  Industry_Risk: 0.40,
  Profit_Margin_Mean: 0.18,
  Revenue_Growth_MoM_Mean: 0.03,
  Revenue_Std: 80000.0,
  Working_Capital_Mean: 600000.0,
  Current_Ratio_Mean: 1.8,
  Quick_Ratio_Mean: 1.4,
  DPO_Mean: 35,
  Cashflow_Stability_Mean: 0.85,
  Revenue_Trend_Slope: 1500.0,
  Profit_Margin_Trend: 0.002,
  GST_Compliance_Mean: 94.0,
  GST_OnTime_Rate: 0.90,
  GST_Delay_Days_Std: 2.5,
  GST_Filing_Consistency: 0.88,
  UPI_Transactions_Mean: 450.0,
  UPI_Volume_Total: 2500000.0,
  UPI_Order_Value_Mean: 650.0,
  Active_Loan_Count: 0,
  Total_Loan_Amount: 0.0,
  Outstanding_Principal_Total: 0.0,
  EMI_Delay_Count: 0,
  Default_History: 0,
  Current_Employees: 12,
  Average_Salary: 30000.0,
  Annual_Attrition_Rate: 0.12,
  Hiring_Trend_Pct: 0.05,
  Net_Employees_Added: 1,
  EPFO_Registered: 1,
  Skill_Level_Index: 0.60
};

export default function Assessor() {
  const { showToast } = useAuth();
  const navigate = useNavigate();

  // Wizard state: 1 to 5, "processing", or "results"
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  // AI progress screen steps
  const [aiStage, setAiStage] = useState(0);
  const aiStagesList = [
    "Reading Business Profile...",
    "Computing Ratios...",
    "Running AI Models...",
    "Generating SHAP...",
    "Preparing Recommendation..."
  ];

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSliderChange = (name, value) => {
    setForm(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  const nextStep = () => {
    if (step === 1 && !form.biz_name.trim()) {
      showToast("Business name is required.", "error");
      return;
    }
    setStep(prev => prev + 1);
  };
  
  const prevStep = () => setStep(prev => prev - 1);

  const handleTriggerAI = () => {
    setStep("processing");
    setAiStage(0);

    const interval = setInterval(() => {
      setAiStage(prev => {
        if (prev >= 4) {
          clearInterval(interval);
          return 4;
        }
        return prev + 1;
      });
    }, 500);

    setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.predictSingle(form);
        setResults(data);
        setStep("results");
        showToast("Credit decision complete.", "success");
      } catch (e) {
        setError(e.message);
        setStep(5);
        showToast("Assessment failed.", "error");
      } finally {
        setLoading(false);
      }
    }, 2500);
  };

  const handleDownloadReport = async () => {
    try {
      const blob = await api.downloadReportPdf(form);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Report_${form.biz_name.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast("PDF Report downloaded.", "success");
    } catch (e) {
      showToast("Failed to compile PDF.", "error");
    }
  };

  const handleExportJSON = () => {
    try {
      const exportData = {
        meta: {
          timestamp: new Date().toISOString(),
          app: "IDBI CreditSense",
          version: "2.0.0"
        },
        inputs: form,
        predictions: results
      };
      const jsonStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Audit_${form.biz_name.replace(/\s+/g, "_")}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast("JSON exported.", "success");
    } catch (e) {
      showToast("JSON export failed.", "error");
    }
  };

  const handlePrint = () => window.print();

  const handleReset = () => {
    setStep(1);
    setResults(null);
  };

  const getAIRecommendationText = () => {
    if (!results) return "";
    const score = results.score;
    const defaultProb = results.default_probability * 100;
    const gstScore = form.GST_Compliance_Mean;
    const margin = form.Profit_Margin_Mean;
    const currentRatio = form.Current_Ratio_Mean;
    const defaults = form.Default_History;
    const emiDelays = form.EMI_Delay_Count;
    const leverage = form.Outstanding_Principal_Total / Math.max(form.Annual_Turnover, 1.0);
    const digital = form.Digital_Adoption_Score;

    let reasons = [];
    if (defaults > 0) reasons.push("historical default records detected on past credit lines");
    if (emiDelays > 3) reasons.push(`severe loan repayment strain (${emiDelays} EMI delays)`);
    else if (emiDelays > 0) reasons.push(`minor repayment friction (${emiDelays} late EMI payments)`);
    if (gstScore < 70) reasons.push(`poor tax compliance (GST score of ${gstScore}%)`);
    if (margin < 0) reasons.push(`unprofitable operations (negative operating margin of ${(margin*100).toFixed(1)}%)`);
    if (currentRatio < 1.0) reasons.push(`weak liquidity backing (current ratio of ${currentRatio})`);
    if (leverage > 0.35) reasons.push(`high debt leverage burden (debt-to-turnover ratio of ${(leverage*100).toFixed(0)}%)`);
    if (digital < 0.4) reasons.push("low digital collections adoption rate");

    let recText = "";
    if (score >= 85) {
      recText = `This MSME demonstrates pristine financial creditworthiness, healthy GST compliance of ${gstScore}%, and stable operating margins. The model recommends immediate approval for a working capital limit of ${results.max_loan.toLocaleString()} INR, subject to standard KYC validations. Defaults risk is negligible at ${defaultProb.toFixed(1)}%.`;
    } else if (score >= 70) {
      recText = `This MSME demonstrates stable credit indices with minor compliance deviations. GST delays or turnover volatility present moderate variance, but consistent UPI volumes support debt servicing capacity. Approved for a working capital overdraft up to ${results.max_loan.toLocaleString()} INR.`;
    } else if (score >= 50) {
      recText = `This MSME presents stressed capital ratios and elevated compliance delays. Debt coverage is tight, and default transition probability stands at ${defaultProb.toFixed(1)}%. Recommended for structured trade credit facilities with monthly receivables sweeps.`;
    } else {
      recText = `This MSME exhibits high credit risk exposure. Low operating margins, outstanding debt loads, and a default risk of ${defaultProb.toFixed(1)}% require restrictive covenants. Term credit facilities are locked. Propose structured restructuring reviews.`;
    }

    if (reasons.length > 0) {
      recText += ` Underwriting analysis flagged key risk indicators: ${reasons.join("; ")}; requiring strict supervisory monitoring.`;
    }
    return recText;
  };

  const getHealthStatusColor = () => {
    if (!results) return "text-slate-650 bg-slate-50";
    const score = results.score;
    if (score >= 85) return "text-emerald-700 bg-emerald-50 border-emerald-100";
    if (score >= 70) return "text-blue-700 bg-blue-50 border-blue-100";
    if (score >= 50) return "text-amber-700 bg-amber-50 border-amber-100";
    return "text-rose-700 bg-rose-50 border-rose-100";
  };

  const renderStepIndicator = (stepNum, title) => {
    const isCompleted = step > stepNum;
    const isActive = step === stepNum;
    return (
      <span className={`flex items-center space-x-1.5 flex-shrink-0 whitespace-nowrap ${
        isActive ? 'text-blue-600 border-b-2 border-blue-600 pb-1 font-bold' : isCompleted ? 'text-emerald-600 font-bold' : 'text-slate-400 font-medium'
      }`}>
        {isCompleted && <CheckCircle className="w-3.5 h-3.5" />}
        <span>{title}</span>
      </span>
    );
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto px-6 py-8">
      {step !== "processing" && step !== "results" && (
        <PageHeader 
          title="IDBI CreditSense Underwriter Wizard" 
          subtitle={`Step ${step} of 5 — Enter statutory parameters, tax averages, and active liabilities to run ML risk scoring.`}
        />
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* STEP 1: BUSINESS PROFILE */}
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 15 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -15 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl px-4 md:px-8 py-3.5 shadow-premium text-xs font-poppins overflow-x-auto whitespace-nowrap gap-4 md:gap-0 select-none scrollbar-hide">
              {renderStepIndicator(1, "1. Profile")}
              {renderStepIndicator(2, "2. Financials")}
              {renderStepIndicator(3, "3. Transactions")}
              {renderStepIndicator(4, "4. Liabilities")}
              {renderStepIndicator(5, "5. Review")}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-premium space-y-6">
              <h3 className="text-xs font-bold text-slate-400 font-poppins uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Section 1: MSME Corporate Demographics</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-inter text-xs">
                <div className="space-y-4">
                  <div>
                    <label className="text-slate-700 font-bold mb-1 flex items-center space-x-1.5">
                      <span>Business Name</span>
                      <Info className="w-3.5 h-3.5 text-slate-455 cursor-help" title="Enter registered legal MSME corporation name." />
                    </label>
                    <input
                      type="text"
                      name="biz_name"
                      value={form.biz_name}
                      onChange={handleChange}
                      placeholder="e.g. Sharma Wholesale Traders"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500 text-xs shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Industry Sector</label>
                    <select
                      name="Industry"
                      value={form.Industry}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500 text-xs shadow-sm"
                    >
                      {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">State / Location</label>
                      <select
                        name="State"
                        value={form.State}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none text-xs shadow-sm"
                      >
                        {STATES.map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">MSME Classification</label>
                      <select
                        name="MSME_Type"
                        value={form.MSME_Type}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none text-xs shadow-sm"
                      >
                        {MSME_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1.5 font-bold text-slate-700">
                      <span>Business Age (Years)</span>
                      <span className="text-blue-600 font-semibold">{form.Business_Age_Yrs} Yrs</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="40"
                      name="Business_Age_Yrs"
                      value={form.Business_Age_Yrs}
                      onChange={(e) => handleSliderChange('Business_Age_Yrs', e.target.value)}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Annual Turnover (INR)</label>
                    <input
                      type="number"
                      name="Annual_Turnover"
                      value={form.Annual_Turnover}
                      onChange={handleChange}
                      placeholder="e.g. 12000000"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500 text-xs shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between mb-1.5 font-bold text-slate-700">
                        <span>Digital Score</span>
                        <span className="text-blue-600 font-semibold">{(form.Digital_Adoption_Score * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        name="Digital_Adoption_Score"
                        value={form.Digital_Adoption_Score}
                        onChange={(e) => handleSliderChange('Digital_Adoption_Score', e.target.value)}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1.5 font-bold text-slate-700">
                        <span>Sector Risk</span>
                        <span className="text-blue-600 font-semibold">{form.Industry_Risk.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        name="Industry_Risk"
                        value={form.Industry_Risk}
                        onChange={(e) => handleSliderChange('Industry_Risk', e.target.value)}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={nextStep}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 h-12 w-full sm:w-auto rounded-lg text-xs font-poppins tracking-wide shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-transform"
              >
                <span>Financial Performance Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: FINANCIAL PERFORMANCE */}
        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 15 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -15 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl px-4 md:px-8 py-3.5 shadow-premium text-xs font-poppins overflow-x-auto whitespace-nowrap gap-4 md:gap-0 select-none scrollbar-hide">
              {renderStepIndicator(1, "1. Profile")}
              {renderStepIndicator(2, "2. Financials")}
              {renderStepIndicator(3, "3. Transactions")}
              {renderStepIndicator(4, "4. Liabilities")}
              {renderStepIndicator(5, "5. Review")}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-premium space-y-6">
              <h3 className="text-xs font-bold text-slate-400 font-poppins uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Section 2: Operating Margins & Liquid Assets</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-inter text-xs">
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between mb-1.5 font-bold text-slate-700">
                      <span>Operating Margin (Mean)</span>
                      <span className="text-blue-600 font-semibold">{(form.Profit_Margin_Mean * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="-0.2"
                      max="0.6"
                      step="0.01"
                      name="Profit_Margin_Mean"
                      value={form.Profit_Margin_Mean}
                      onChange={(e) => handleSliderChange('Profit_Margin_Mean', e.target.value)}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1.5 font-bold text-slate-700">
                      <span>Sales Growth MoM (Mean)</span>
                      <span className="text-blue-600 font-semibold">{(form.Revenue_Growth_MoM_Mean * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="-0.3"
                      max="0.5"
                      step="0.01"
                      name="Revenue_Growth_MoM_Mean"
                      value={form.Revenue_Growth_MoM_Mean}
                      onChange={(e) => handleSliderChange('Revenue_Growth_MoM_Mean', e.target.value)}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Revenue Volatility (Std)</label>
                      <input
                        type="number"
                        name="Revenue_Std"
                        value={form.Revenue_Std}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500 text-xs shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Working Capital (Mean)</label>
                      <input
                        type="number"
                        name="Working_Capital_Mean"
                        value={form.Working_Capital_Mean}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500 text-xs shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-700 font-bold mb-0.5">Current Ratio</label>
                      <input
                        type="number"
                        step="0.1"
                        name="Current_Ratio_Mean"
                        value={form.Current_Ratio_Mean}
                        onChange={handleChange}
                        className="w-full px-2 py-2 border border-slate-200 rounded-lg text-slate-700 text-xs shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-0.5">Quick Ratio</label>
                      <input
                        type="number"
                        step="0.1"
                        name="Quick_Ratio_Mean"
                        value={form.Quick_Ratio_Mean}
                        onChange={handleChange}
                        className="w-full px-2 py-2 border border-slate-200 rounded-lg text-slate-700 text-xs shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-0.5">DPO (Days)</label>
                      <input
                        type="number"
                        name="DPO_Mean"
                        value={form.DPO_Mean}
                        onChange={handleChange}
                        className="w-full px-2 py-2 border border-slate-200 rounded-lg text-slate-700 text-xs shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4">
              <button
                onClick={prevStep}
                className="flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-600 font-semibold border border-slate-200 px-4 py-3 h-12 w-full sm:w-auto rounded-lg text-xs font-poppins shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-transform"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
              <button
                onClick={nextStep}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 h-12 w-full sm:w-auto rounded-lg text-xs font-poppins tracking-wide shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-transform"
              >
                <span>Compliance & GST Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: GST & DIGITAL TRANSACTIONS */}
        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 15 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -15 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl px-4 md:px-8 py-3.5 shadow-premium text-xs font-poppins overflow-x-auto whitespace-nowrap gap-4 md:gap-0 select-none scrollbar-hide">
              {renderStepIndicator(1, "1. Profile")}
              {renderStepIndicator(2, "2. Financials")}
              {renderStepIndicator(3, "3. Transactions")}
              {renderStepIndicator(4, "4. Liabilities")}
              {renderStepIndicator(5, "5. Review")}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-premium space-y-6">
              <h3 className="text-xs font-bold text-slate-400 font-poppins uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center space-x-1.5">
                <Database className="w-4 h-4 text-blue-600" />
                <span>Section 3: Statutory GST & UPI Telemetry</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-inter text-xs">
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between mb-1.5 font-bold text-slate-700">
                      <span>GST Compliance Score</span>
                      <span className="text-blue-600 font-semibold">{form.GST_Compliance_Mean.toFixed(0)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      name="GST_Compliance_Mean"
                      value={form.GST_Compliance_Mean}
                      onChange={(e) => handleSliderChange('GST_Compliance_Mean', e.target.value)}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">GST On-Time filing</label>
                      <input
                        type="number"
                        step="0.05"
                        name="GST_OnTime_Rate"
                        value={form.GST_OnTime_Rate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none text-xs shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">GST Delay days (Std)</label>
                      <input
                        type="number"
                        step="0.5"
                        name="GST_Delay_Days_Std"
                        value={form.GST_Delay_Days_Std}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none text-xs shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-700 font-bold mb-0.5">UPI Txns Mean</label>
                      <input
                        type="number"
                        name="UPI_Transactions_Mean"
                        value={form.UPI_Transactions_Mean}
                        onChange={handleChange}
                        className="w-full px-2 py-2 border border-slate-200 rounded-lg text-slate-700 text-xs shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-0.5">Total UPI Vol</label>
                      <input
                        type="number"
                        name="UPI_Volume_Total"
                        value={form.UPI_Volume_Total}
                        onChange={handleChange}
                        className="w-full px-2 py-2 border border-slate-200 rounded-lg text-slate-700 text-xs shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-0.5">UPI AOV</label>
                      <input
                        type="number"
                        name="UPI_Order_Value_Mean"
                        value={form.UPI_Order_Value_Mean}
                        onChange={handleChange}
                        className="w-full px-2 py-2 border border-slate-200 rounded-lg text-slate-700 text-xs shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4">
              <button
                onClick={prevStep}
                className="flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-600 font-semibold border border-slate-200 px-4 py-3 h-12 w-full sm:w-auto rounded-lg text-xs font-poppins shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-transform"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
              <button
                onClick={nextStep}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 h-12 w-full sm:w-auto rounded-lg text-xs font-poppins tracking-wide shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-transform"
              >
                <span>Liabilities & HR Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: LOANS & WORKFORCE */}
        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, x: 15 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -15 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl px-4 md:px-8 py-3.5 shadow-premium text-xs font-poppins overflow-x-auto whitespace-nowrap gap-4 md:gap-0 select-none scrollbar-hide">
              {renderStepIndicator(1, "1. Profile")}
              {renderStepIndicator(2, "2. Financials")}
              {renderStepIndicator(3, "3. Transactions")}
              {renderStepIndicator(4, "4. Liabilities")}
              {renderStepIndicator(5, "5. Review")}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-premium space-y-6">
              <h3 className="text-xs font-bold text-slate-400 font-poppins uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Section 4: Liabilities & Staff Registry</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-inter text-xs">
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 font-poppins">Active Debts & EMI Performance</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Active Loan Count</label>
                      <input
                        type="number"
                        name="Active_Loan_Count"
                        value={form.Active_Loan_Count}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none text-xs shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Historical Debt Principal</label>
                      <input
                        type="number"
                        name="Total_Loan_Amount"
                        value={form.Total_Loan_Amount}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none text-xs shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-700 font-bold mb-0.5">Outstanding</label>
                      <input
                        type="number"
                        name="Outstanding_Principal_Total"
                        value={form.Outstanding_Principal_Total}
                        onChange={handleChange}
                        className="w-full px-2 py-2 border border-slate-200 rounded-lg text-slate-700 text-xs shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-0.5">EMI Misses</label>
                      <input
                        type="number"
                        name="EMI_Delay_Count"
                        value={form.EMI_Delay_Count}
                        onChange={handleChange}
                        className="w-full px-2 py-2 border border-slate-200 rounded-lg text-slate-700 text-xs shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-0.5">Default history</label>
                      <select
                        name="Default_History"
                        value={form.Default_History}
                        onChange={handleChange}
                        className="w-full px-2 py-2 border border-slate-200 rounded-lg text-slate-700 text-xs shadow-sm"
                      >
                        <option value={0}>0 (Clean)</option>
                        <option value={1}>1 (Default Record)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 font-poppins">Employment Register</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Staff Headcount</label>
                      <input
                        type="number"
                        name="Current_Employees"
                        value={form.Current_Employees}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none text-xs shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Average Salary (INR)</label>
                      <input
                        type="number"
                        name="Average_Salary"
                        value={form.Average_Salary}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none text-xs shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-700 font-bold mb-0.5">Attrition Rate</label>
                      <input
                        type="number"
                        step="0.01"
                        name="Annual_Attrition_Rate"
                        value={form.Annual_Attrition_Rate}
                        onChange={handleChange}
                        className="w-full px-2 py-2 border border-slate-200 rounded-lg text-slate-700 text-xs shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-0.5">EPFO registered</label>
                      <select
                        name="EPFO_Registered"
                        value={form.EPFO_Registered}
                        onChange={handleChange}
                        className="w-full px-2 py-2 border border-slate-200 rounded-lg text-slate-700 text-xs shadow-sm"
                      >
                        <option value={1}>1 (Yes)</option>
                        <option value={0}>0 (No)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-0.5">Skill Index</label>
                      <input
                        type="number"
                        step="0.05"
                        name="Skill_Level_Index"
                        value={form.Skill_Level_Index}
                        onChange={handleChange}
                        className="w-full px-2 py-2 border border-slate-200 rounded-lg text-slate-700 text-xs shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4">
              <button
                onClick={prevStep}
                className="flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-600 font-semibold border border-slate-200 px-4 py-3 h-12 w-full sm:w-auto rounded-lg text-xs font-poppins shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-transform"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
              <button
                onClick={nextStep}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 h-12 w-full sm:w-auto rounded-lg text-xs font-poppins tracking-wide shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-transform"
              >
                <span>Review Inputs Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 5: REVIEW INPUTS */}
        {step === 5 && (
          <motion.div 
            key="step5"
            initial={{ opacity: 0, x: 15 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -15 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl px-4 md:px-8 py-3.5 shadow-premium text-xs font-poppins overflow-x-auto whitespace-nowrap gap-4 md:gap-0 select-none scrollbar-hide">
              {renderStepIndicator(1, "1. Profile")}
              {renderStepIndicator(2, "2. Financials")}
              {renderStepIndicator(3, "3. Transactions")}
              {renderStepIndicator(4, "4. Liabilities")}
              {renderStepIndicator(5, "5. Review")}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-premium space-y-6">
              <h3 className="text-xs font-bold text-slate-800 font-poppins uppercase tracking-wider border-b border-slate-100 pb-3 mb-4 flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span>Section 5: Final Review Checklist</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-inter text-xs text-slate-600">
                <div className="space-y-4">
                  <div>
                    <span className="font-bold text-slate-800 font-poppins block mb-2">🏢 Business & Demographics</span>
                    <ul className="space-y-1">
                      <li><b>Legal Entity:</b> {form.biz_name}</li>
                      <li><b>Industry Sector:</b> {form.Industry}</li>
                      <li><b>Location:</b> {form.State}</li>
                      <li><b>MSME Classification:</b> {form.MSME_Type}</li>
                      <li><b>Business Tenure:</b> {form.Business_Age_Yrs} Yrs</li>
                      <li><b>Annual Turnover:</b> {form.Annual_Turnover.toLocaleString()} INR</li>
                    </ul>
                  </div>

                  <div>
                    <span className="font-bold text-slate-800 font-poppins block mb-2">📊 Financial Performance</span>
                    <ul className="space-y-1">
                      <li><b>Operating Margin:</b> {(form.Profit_Margin_Mean * 100).toFixed(0)}%</li>
                      <li><b>Sales Growth Rate:</b> {(form.Revenue_Growth_MoM_Mean * 100).toFixed(0)}%</li>
                      <li><b>Sales Volatility:</b> {form.Revenue_Std.toLocaleString()} INR</li>
                      <li><b>Current Liquidity:</b> {form.Current_Ratio_Mean} Ratio</li>
                      <li><b>Working Capital:</b> {form.Working_Capital_Mean.toLocaleString()} INR</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="font-bold text-slate-800 font-poppins block mb-2">🧾 Compliance & Transactions</span>
                    <ul className="space-y-1">
                      <li><b>GST Compliance Score:</b> {form.GST_Compliance_Mean}</li>
                      <li><b>GST On-Time Filing:</b> {(form.GST_OnTime_Rate * 100).toFixed(0)}%</li>
                      <li><b>UPI Volume Total:</b> {form.UPI_Volume_Total.toLocaleString()} INR</li>
                      <li><b>UPI Average Order Value:</b> {form.UPI_Order_Value_Mean.toLocaleString()} INR</li>
                    </ul>
                  </div>

                  <div>
                    <span className="font-bold text-slate-800 font-poppins block mb-2">💳 Debt Liabilities & Human Resources</span>
                    <ul className="space-y-1">
                      <li><b>Active Loans:</b> {form.Active_Loan_Count} Accounts</li>
                      <li><b>EMI Delay Count:</b> {form.EMI_Delay_Count} Misses</li>
                      <li><b>Default Records:</b> {form.Default_History === 0 ? 'Clean' : 'History'}</li>
                      <li><b>Current Headcount:</b> {form.Current_Employees} Staff</li>
                      <li><b>Average Staff Salary:</b> {form.Average_Salary.toLocaleString()} INR</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4">
              <button
                onClick={prevStep}
                className="flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-600 font-semibold border border-slate-200 px-4 py-3 h-12 w-full sm:w-auto rounded-lg text-xs font-poppins shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-transform"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
              <button
                onClick={handleTriggerAI}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 h-12 w-full sm:w-auto rounded-lg text-xs font-poppins tracking-wider uppercase shadow hover:-translate-y-0.5 active:translate-y-0 transition-transform"
              >
                <span>🚀 Analyze Business</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* AI PROCESSING TRANSITION SCREEN */}
        {step === "processing" && (
          <motion.div 
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0 }}
            className="bg-white border border-slate-200 rounded-2xl p-12 max-w-xl mx-auto shadow-premium text-center space-y-8 font-inter"
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <Cpu className="w-12 h-12 text-blue-600 animate-spin" />
              <h2 className="text-xl font-bold tracking-tight text-slate-800 font-poppins">Ensembles Underwriting Calculation</h2>
              <p className="text-xs text-slate-400 max-w-sm">Calculating risk matrices, compliance delays, and UPI transaction thresholds...</p>
            </div>

            <div className="text-xs space-y-3.5 max-w-xs mx-auto text-left border-t border-slate-50 pt-6">
              {aiStagesList.map((stage, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  {aiStage > idx ? (
                    <span className="text-emerald-600 font-bold font-poppins">✓</span>
                  ) : aiStage === idx ? (
                    <span className="text-blue-600 animate-pulse font-bold font-poppins">⏳</span>
                  ) : (
                    <span className="text-slate-300 font-bold font-poppins">○</span>
                  )}
                  <span className={`font-semibold ${aiStage >= idx ? 'text-slate-700' : 'text-slate-400'}`}>
                    {stage}
                  </span>
                </div>
              ))}
            </div>

            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-6">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${(aiStage + 1) * 20}%` }}
              />
            </div>
          </motion.div>
        )}

        {/* POLISHED RESULTS SCORECARD DASHBOARD */}
        {step === "results" && results && (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* HERO BAR */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-premium flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-3 flex-1 text-center md:text-left">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-poppins uppercase tracking-wider border ${getHealthStatusColor()}`}>
                  {results.risk_category} Rating
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-poppins leading-none">
                  {form.biz_name}
                </h1>
                <p className="text-xs text-slate-500 font-inter font-medium">
                  Sector: {form.Industry} • Incorporated in {form.State} • Age: {form.Business_Age_Yrs} Yrs
                </p>
              </div>

              {/* Health Score Gauge */}
              <div className="flex-shrink-0">
                <ScoreGauge score={results.score} />
              </div>
            </div>

            {/* EXECUTIVE SUMMARY WIDGET */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-premium flex flex-col justify-between min-h-32 hover:shadow-premium-hover transition-all duration-300">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none font-poppins">Credit Risk Rating</span>
                <h2 className="text-xl font-bold tracking-tight text-slate-800 font-poppins mt-2">{results.risk_category}</h2>
                <p className="text-[9px] text-slate-400 mt-1.5 leading-normal font-inter">
                  Credit Risk Rating is calculated using repayment history, leverage, liquidity, compliance, and financial health.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-premium flex flex-col justify-between h-32 hover:shadow-premium-hover transition-all duration-300">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none font-poppins">Credit Eligibility</span>
                <h2 className={`text-xl font-bold tracking-tight font-poppins mt-2 ${results.eligible ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {results.eligible ? 'APPROVED' : 'LOCKED'}
                </h2>
                <p className="text-[10px] text-slate-400 mt-1 leading-none font-inter">Ensemble underwriting decision</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-premium flex flex-col justify-between h-32 hover:shadow-premium-hover transition-all duration-300">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none font-poppins">Default Probability</span>
                <h2 className="text-xl font-bold tracking-tight text-slate-800 font-poppins mt-2">{(results.default_probability * 100).toFixed(2)}%</h2>
                <p className="text-[10px] text-slate-400 mt-1 leading-none font-inter">NPA transition likelihood</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-premium flex flex-col justify-between h-32 hover:shadow-premium-hover transition-all duration-300">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none font-poppins">Recommended Credit Limit</span>
                <h2 className="text-xl font-bold tracking-tight text-slate-800 font-poppins mt-2">
                  {results.eligible ? `${results.max_loan.toLocaleString()} INR` : '0 INR'}
                </h2>
                <p className="text-[10px] text-slate-400 mt-1 leading-none font-inter">Working capital overdraft</p>
              </div>
            </div>

            {/* AI RECOMMENDATION */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-premium space-y-3">
              <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase border-b border-slate-100 pb-3 font-poppins">
                💡 Executive AI Recommendation
              </h3>
              <p 
                className="text-xs text-slate-655 leading-relaxed font-inter" 
                dangerouslySetInnerHTML={{ __html: getAIRecommendationText() }} 
              />
            </div>

            {/* DRIVERS CONTRIBUTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-premium space-y-4">
                <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase border-b border-slate-100 pb-3 font-poppins">
                  🟢 Top Positive Accelerating Drivers
                </h3>
                <div className="space-y-3.5 font-inter text-xs text-slate-600">
                  {results.top_positive.map((drv, idx) => (
                    <div key={idx} className="flex items-center justify-between pb-2 border-b border-slate-50 last:border-0 last:pb-0">
                      <span className="font-semibold text-slate-700">{drv.display_name}</span>
                      <span className="font-bold text-emerald-600">+{drv.impact.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-premium space-y-4">
                <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase border-b border-slate-100 pb-3 font-poppins">
                  🔴 Top Negative Drag Drivers
                </h3>
                <div className="space-y-3.5 font-inter text-xs text-slate-600">
                  {results.top_negative.map((drv, idx) => (
                    <div key={idx} className="flex items-center justify-between pb-2 border-b border-slate-50 last:border-0 last:pb-0">
                      <span className="font-semibold text-slate-700">{drv.display_name}</span>
                      <span className="font-bold text-rose-500">{drv.impact.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SHAP IMPACT GRAPH */}
            <ChartCard title="💡 Feature Impact Plot (Local SHAP)">
              <div className="space-y-4 h-full flex flex-col justify-between">
                <p className="text-[10px] text-slate-400 font-inter">
                  * These features had the greatest influence on the model's prediction. Positive scores support credit-worthiness; negative scores increase risk thresholds.
                </p>
                <div className="flex-1 min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={results.top_positive.concat(results.top_negative)}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                    >
                      <XAxis type="number" stroke="#94A3B8" fontSize={9} />
                      <YAxis dataKey="display_name" type="category" stroke="#94A3B8" fontSize={8} width={130} />
                      <Tooltip />
                      <ReferenceLine x={0} stroke="#E2E8F0" strokeWidth={1} />
                      <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                        {results.top_positive.concat(results.top_negative).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.impact >= 0 ? '#16A34A' : '#DC2626'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </ChartCard>

            {/* AUDIT BUSINESS DETAILS SUMMARY */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-premium space-y-4">
              <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase border-b border-slate-100 pb-3 font-poppins">
                🏢 Business Audit Executive Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 font-inter text-xs text-slate-655">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-poppins">Industry Sector</span>
                  <span className="font-bold text-slate-700">{form.Industry}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-poppins">Registered State</span>
                  <span className="font-bold text-slate-700">{form.State}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-poppins">Annual Turnover</span>
                  <span className="font-bold text-slate-700">{form.Annual_Turnover.toLocaleString()} INR</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-poppins">Active Headcount</span>
                  <span className="font-bold text-slate-700">{form.Current_Employees} Employees</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-poppins">Digital Adoption Score</span>
                  <span className="font-bold text-slate-700">{(form.Digital_Adoption_Score * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-poppins">GST Compliance Average</span>
                  <span className="font-bold text-slate-700">{form.GST_Compliance_Mean}%</span>
                </div>
              </div>
            </div>

            {/* DOWNLOAD ACTIONS */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-premium flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="space-y-1 text-center md:text-left">
                <h4 className="text-xs font-bold text-slate-800 font-poppins leading-none">Export Regulatory Documentation</h4>
                <p className="text-[10px] text-slate-400 font-inter">Download credit assessment audits, parameters list, or print pages.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto text-xs font-poppins font-bold uppercase tracking-wide">
                <button
                  onClick={handleDownloadReport}
                  className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 h-12 rounded-lg shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-transform w-full sm:w-auto"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Report</span>
                </button>
                <button
                  onClick={handleExportJSON}
                  className="flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-3 h-12 rounded-lg shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-transform w-full sm:w-auto"
                >
                  <Code className="w-4 h-4 text-slate-505" />
                  <span>Export JSON</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-3 h-12 rounded-lg shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-transform w-full sm:w-auto"
                >
                  <Printer className="w-4 h-4 text-slate-505" />
                  <span>Print Report</span>
                </button>
              </div>
            </div>

            <div className="flex justify-start pt-4">
              <button
                onClick={handleReset}
                className="flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-600 font-semibold border border-slate-200 px-4 py-3 h-12 w-full sm:w-auto rounded-lg text-xs font-outfit shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-transform"
              >
                ⬅ Back to Underwriting Wizard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

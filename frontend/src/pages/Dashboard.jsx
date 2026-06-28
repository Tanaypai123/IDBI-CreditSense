import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, 
  Layers, 
  TrendingUp, 
  ShieldCheck, 
  Activity, 
  FileText, 
  HelpCircle,
  Database,
  ArrowRight,
  ChevronRight,
  ShieldAlert,
  Server,
  FileSpreadsheet,
  Cpu,
  Radio,
  ArrowLeft,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  ExternalLink,
  Zap,
  Play
} from 'lucide-react';
import KPICard from '../components/KPICard';
import Card from '../components/Card';
import TableComponent from '../components/TableComponent';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState("landing"); // "landing" or "console"

  // Counting Animation Hook States (Smoother counter speeds)
  const [bizCount, setBizCount] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [modelCount, setModelCount] = useState(0);

  useEffect(() => {
    if (view === "landing") {
      const bizTimer = setInterval(() => {
        setBizCount(prev => {
          if (prev >= 25000) {
            clearInterval(bizTimer);
            return 25000;
          }
          return prev + 1250;
        });
      }, 30);

      const accTimer = setInterval(() => {
        setAccuracy(prev => {
          if (prev >= 98.7) {
            clearInterval(accTimer);
            return 98.7;
          }
          return parseFloat((prev + 3.1).toFixed(1));
        });
      }, 25);

      const modelTimer = setInterval(() => {
        setModelCount(prev => {
          if (prev >= 7) {
            clearInterval(modelTimer);
            return 7;
          }
          return prev + 1;
        });
      }, 100);

      return () => {
        clearInterval(bizTimer);
        clearInterval(accTimer);
        clearInterval(modelTimer);
      };
    }
  }, [view]);

  // Features list
  const features = [
    { title: "Explainable AI", desc: "Local SHAP driver calculations explain exact modeling weights for every single credit decision.", icon: Cpu },
    { title: "Batch Processing", desc: "Automated bulk CSV underwriting processor evaluates hundreds of portfolios in parallel.", icon: Layers },
    { title: "Portfolio Analytics", desc: "Aggregate correlation heatmaps, default ratios, and distribution charts for risk managers.", icon: TrendingUp },
    { title: "PDF Reports", desc: "Exports bank-ready regulatory audit PDFs complete with model parameters and signatures.", icon: FileText },
    { title: "Risk Classification", desc: "Classifies MSMEs into standard risk tiers (SMA-0, SMA-1, SMA-2) to fit compliance models.", icon: ShieldAlert },
    { title: "Credit Recommendation", desc: "Auto-determines maximum approved capital limits based on cash flow margins and GST delays.", icon: UserCheck }
  ];

  const timeline = [
    { step: "01", label: "Upload Data", desc: "Upload CSV tables or enter variables." },
    { step: "02", label: "Feature Engineering", desc: "Calculates UPI flows and GST ratios." },
    { step: "03", label: "AI Models", desc: "Runs LightGBM and XGBoost ensembles." },
    { step: "04", label: "SHAP Explainability", desc: "Derives positive and negative factors." },
    { step: "05", label: "Credit Decision", desc: "Approved loan limit and risk badges." },
    { step: "06", label: "Download Report", desc: "Download the compliance PDF report." }
  ];

  // Console metrics
  const recentAssessments = [
    { id: 'MSME-9831', name: 'Sharma Wholesale Traders', industry: 'Retail', score: 94.0, risk: 'Excellent', limit: '3,000,000 INR' },
    { id: 'MSME-1492', name: 'Nandan Food Court', industry: 'Restaurant', score: 68.5, risk: 'Medium Risk', limit: '2,000,000 INR' },
    { id: 'MSME-4309', name: 'Vibrant Textiles', industry: 'Textile', score: 48.0, risk: 'High Risk', limit: '0 INR' },
    { id: 'MSME-7721', name: 'Apex Tech Solutions', industry: 'IT', score: 87.2, risk: 'Excellent', limit: '5,000,000 INR' },
    { id: 'MSME-3208', name: 'Ankur Agro Mills', industry: 'Agriculture', score: 32.5, risk: 'Critical Risk', limit: '0 INR' },
  ];

  const recentReports = [
    { name: "Report_Sharma_Wholesale.pdf", date: "Today, 2:14 PM", size: "245 KB" },
    { name: "Report_Nandan_Food.pdf", date: "Today, 11:30 AM", size: "230 KB" },
    { name: "Report_Apex_Tech.pdf", date: "Yesterday, 4:45 PM", size: "250 KB" }
  ];

  const predictionsLog = [
    { time: "2:30 PM", id: "MSME-9831", score: 94.0, status: "APPROVED" },
    { time: "2:15 PM", id: "MSME-4309", score: 48.0, status: "LOCKED" },
    { time: "1:48 PM", id: "MSME-7721", score: 87.2, status: "APPROVED" }
  ];

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 25 } }
  };

  return (
    <AnimatePresence mode="wait">
      {view === "landing" ? (
        /* RENDER STRIPE/VERCEL-STYLE LANDING PAGE */
        <motion.div 
          key="landing"
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[#F8FAFC] relative overflow-hidden"
        >
          {/* Floating background gradient decorations (Mercury/Vercel visual style) */}
          <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[200px] left-[-200px] w-[600px] h-[600px] bg-slate-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* HERO SECTION */}
          <section className="max-w-[1400px] mx-auto px-12 py-24 md:py-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center border-b border-slate-200/50 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="lg:col-span-7 space-y-8"
            >
              <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 text-blue-600 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-outfit shadow-sm">
                <span>Predict • Explain • Approve</span>
              </div>
              
              <h1 className="text-5xl lg:text-[60px] font-extrabold tracking-tight text-slate-900 leading-[1.05] font-outfit">
                IDBI CreditSense <br />
                <span className="text-blue-600 text-3xl lg:text-[38px] font-bold block mt-3">
                  AI-Powered MSME Credit Intelligence Platform
                </span>
              </h1>
              
              <p className="text-sm text-slate-500 font-inter leading-relaxed max-w-xl">
                Redefining priority sector lending with explainable machine learning models. Underwrite MSME accounts instantly with GST, UPI, and financial statement aggregates.
              </p>

              <div className="flex items-center space-x-4 pt-2 font-outfit font-bold uppercase tracking-wider text-xs">
                <button 
                  onClick={() => setView("console")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-lg shadow-sm hover:scale-[1.02] hover:-translate-y-0.5 active:translate-y-0 active:scale-100 transition-all flex items-center space-x-2"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Enter Credit Console</span>
                </button>
                <Link 
                  to="/assess"
                  className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-3.5 rounded-lg hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-sm"
                >
                  Start Assessment
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3 font-outfit">Security & Compliance standards</span>
                <div className="flex flex-wrap gap-4 text-[9px] font-bold font-outfit tracking-wider text-slate-500 uppercase">
                  <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200/40">Explainable AI</span>
                  <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200/40">RBI Ready</span>
                  <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200/40">Basel III Inspired</span>
                  <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200/40">Secure Assessment</span>
                </div>
              </div>
            </motion.div>

            {/* Premium Workflow Illustration SVG - Pulsing and dashes */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="lg:col-span-5 flex justify-center"
            >
              <svg width="420" height="350" viewBox="0 0 420 350" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[420px]">
                <path d="M70 0V350M210 0V350M350 0V350" stroke="#F1F5F9" strokeWidth="1" />
                <path d="M0 70H420M0 210H420M0 280H420" stroke="#F1F5F9" strokeWidth="1" />

                <g transform="translate(40, 20)">
                  {/* Row 1: Inputs */}
                  <rect x="0" y="0" width="100" height="36" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1" className="shadow-sm" />
                  <text x="50" y="22" fill="#475569" fontSize="9" fontFamily="Inter" fontWeight="bold" textAnchor="middle">MSME Business</text>

                  <path d="M100 18H140" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="4 4">
                    <animate attributeName="stroke-dashoffset" values="40;0" dur="2.5s" repeatCount="indefinite" />
                  </path>

                  {/* Row 1: GST */}
                  <rect x="140" y="0" width="70" height="36" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1" className="shadow-sm" />
                  <text x="175" y="22" fill="#475569" fontSize="9" fontFamily="Inter" fontWeight="bold" textAnchor="middle">GST Logs</text>

                  <path d="M210 18H250" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="4 4">
                    <animate attributeName="stroke-dashoffset" values="40;0" dur="2.5s" repeatCount="indefinite" />
                  </path>

                  {/* Row 1: Bank statement */}
                  <rect x="250" y="0" width="90" height="36" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1" className="shadow-sm" />
                  <text x="295" y="22" fill="#475569" fontSize="9" fontFamily="Inter" fontWeight="bold" textAnchor="middle">Bank Statements</text>

                  {/* Vertical arrows to middle flow */}
                  <path d="M50 36V70" stroke="#CBD5E1" strokeWidth="1.2" strokeDasharray="3 3" />
                  <path d="M295 36V70" stroke="#CBD5E1" strokeWidth="1.2" strokeDasharray="3 3" />

                  {/* Row 2: UPI & Financial statements */}
                  <rect x="10" y="70" width="80" height="36" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1" className="shadow-sm" />
                  <text x="50" y="92" fill="#475569" fontSize="9" fontFamily="Inter" fontWeight="bold" textAnchor="middle">UPI Sync</text>

                  <rect x="250" y="70" width="90" height="36" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1" className="shadow-sm" />
                  <text x="295" y="92" fill="#475569" fontSize="9" fontFamily="Inter" fontWeight="bold" textAnchor="middle">Financial Ledgers</text>

                  {/* Downward flow to core engine */}
                  <path d="M50 106C50 130 130 135 150 145" stroke="#CBD5E1" strokeWidth="1.2" />
                  <path d="M295 106C295 130 210 135 190 145" stroke="#CBD5E1" strokeWidth="1.2" />

                  {/* Core AI Risk Engine */}
                  <rect x="120" y="145" width="100" height="46" rx="10" fill="#2563EB" className="shadow-premium" />
                  <text x="170" y="168" fill="white" fontSize="10" fontFamily="Outfit" fontWeight="extrabold" textAnchor="middle">AI RISK ENGINE</text>
                  <text x="170" y="180" fill="#EFF6FF" fontSize="7" fontFamily="Inter" textAnchor="middle">LGBM + XGBoost</text>

                  {/* Pulsing indicator circle in the center */}
                  <circle cx="170" cy="168" r="4" fill="#60A5FA">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite" />
                  </circle>

                  {/* Outward paths to final parameters */}
                  <path d="M170 191V225" stroke="#2563EB" strokeWidth="1.5" />

                  {/* Row 3: Credit scoring */}
                  <rect x="125" y="225" width="90" height="36" rx="8" fill="white" stroke="#2563EB" strokeWidth="1.5" className="shadow-sm" />
                  <text x="170" y="247" fill="#1E293B" fontSize="9" fontFamily="Outfit" fontWeight="bold" textAnchor="middle">Credit score</text>

                  <path d="M170 261V280" stroke="#CBD5E1" strokeWidth="1.2" />

                  {/* Row 4: Final Limit */}
                  <rect x="110" y="280" width="120" height="36" rx="8" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1" className="shadow-premium" />
                  <text x="170" y="302" fill="#15803D" fontSize="9" fontFamily="Outfit" fontWeight="extrabold" textAnchor="middle">Loan Recommendation</text>
                </g>
              </svg>
            </motion.div>
          </section>

          {/* ANIMATED STATISTICS STRIP */}
          <section className="bg-white border-b border-slate-200 py-12 relative z-10">
            <div className="max-w-[1400px] mx-auto px-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shadow-sm"><Database className="w-5 h-5" /></div>
                <div className="space-y-0.5">
                  <span className="text-2xl font-bold tracking-tight text-slate-900 font-outfit block">{bizCount.toLocaleString()}+</span>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-outfit">Businesses Assessed</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shadow-sm"><ShieldCheck className="w-5 h-5" /></div>
                <div className="space-y-0.5">
                  <span className="text-2xl font-bold tracking-tight text-slate-900 font-outfit block">{accuracy}%</span>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-outfit">Model Accuracy</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shadow-sm"><Cpu className="w-5 h-5" /></div>
                <div className="space-y-0.5">
                  <span className="text-2xl font-bold tracking-tight text-slate-900 font-outfit block">{modelCount}</span>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-outfit">AI Models</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="p-3 bg-slate-50 text-slate-600 rounded-xl shadow-sm"><Radio className="w-5 h-5" /></div>
                <div className="space-y-0.5">
                  <span className="text-2xl font-bold tracking-tight text-slate-900 font-outfit block">&lt; 2s</span>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-outfit">Inference Time</p>
                </div>
              </div>
            </div>
          </section>

          {/* FEATURES SECTION (Staggered Children) */}
          <section className="max-w-[1400px] mx-auto px-12 py-24 space-y-16 relative z-10">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-outfit">Features Overview</h2>
              <p className="text-xs text-slate-500 font-inter">Complete modular services compiled inside the IDBI CreditSense console.</p>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {features.map((feat, idx) => (
                <motion.div 
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -4, shadow: "0 10px 30px -10px rgba(0,0,0,0.08)" }}
                  className="bg-white border border-slate-200 rounded-xl p-6 shadow-premium transition-all duration-300 flex flex-col justify-between h-52"
                >
                  <div className="space-y-4 font-inter text-xs">
                    <div className="w-9 h-9 rounded-lg bg-blue-50/50 flex items-center justify-center text-blue-600 shadow-sm"><feat.icon className="w-4 h-4" /></div>
                    <h3 className="text-sm font-bold text-slate-800 font-outfit leading-none">{feat.title}</h3>
                    <p className="text-slate-550 leading-relaxed">{feat.desc}</p>
                  </div>
                  <Link to="/assess" className="text-[10px] font-bold font-outfit tracking-wider text-blue-600 hover:text-blue-700 inline-flex items-center space-x-1 uppercase">
                    <span>Learn More</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* PROCESS TIMELINE STEPPER (Staggered Children) */}
          <section className="max-w-[1400px] mx-auto px-12 py-20 border-t border-slate-200/50 space-y-16 relative z-10">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-outfit">Credit Assessment Pipeline</h2>
              <p className="text-xs text-slate-500 font-inter">End-to-end telemetry pipeline mapping raw ledger uploads to approved credit limits.</p>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 font-inter text-xs"
            >
              {timeline.map((step, idx) => (
                <motion.div 
                  key={idx} 
                  variants={itemVariants}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-premium text-center space-y-3 flex flex-col items-center justify-between relative hover:shadow-premium-hover transition-shadow duration-300"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold font-outfit text-xs shadow-sm">
                    {step.step}
                  </div>
                  <div className="space-y-1 flex-1 pt-2">
                    <h4 className="font-bold text-slate-800 font-outfit leading-none">{step.label}</h4>
                    <p className="text-[10px] text-slate-400 leading-normal">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* PREVIEW MOCKUP */}
          <section className="max-w-[1100px] mx-auto px-12 py-20 space-y-12 relative z-10">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-outfit">Console Preview</h2>
            </div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-premium-hover overflow-hidden font-inter"
            >
              <div className="h-10 bg-slate-50 border-b border-slate-200 flex items-center px-4 justify-between text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                </div>
                <div className="w-72 bg-white border border-slate-200 rounded-md text-[9px] py-1 text-center font-semibold truncate text-slate-400">https://credit.idbi.creditsense.saas/console</div>
                <div className="w-12" />
              </div>
              <div className="p-8 bg-[#F8FAFC] space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center space-y-3 shadow-sm h-full">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-outfit">Stability Gauge</span>
                    <div className="w-16 h-16 rounded-full border-4 border-blue-600 flex items-center justify-center font-bold text-slate-800 text-base">87.2</div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Health Score</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm h-full text-xs">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-outfit">Risk Index</span>
                    <h3 className="text-emerald-600 font-extrabold text-base font-outfit mt-1">EXCELLENT</h3>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm h-full text-xs">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-outfit">Credit status</span>
                    <h3 className="text-emerald-600 font-extrabold text-base font-outfit mt-1">APPROVED</h3>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm h-full text-xs">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-outfit">NPA Probability</span>
                    <h3 className="text-slate-800 font-extrabold text-base font-outfit mt-1">2.14%</h3>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* FOOTER */}
          <footer className="max-w-[1400px] mx-auto px-12 pt-20 pb-12 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 font-inter border-t border-slate-200/50 relative z-10">
            <span>© IDBI CreditSense 2026. Internal Credit Underwriter Console.</span>
            <div className="flex items-center space-x-6">
              <a href="#" className="hover:text-slate-700">GitHub Repository</a>
              <a href="#" className="hover:text-slate-700">API Documentation</a>
            </div>
          </footer>
        </motion.div>
      ) : (
        /* RENDER COMPREHENSIVE CONSOLE OVERVIEW DASHBOARD */
        <motion.div 
          key="console"
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="space-y-8 max-w-[1400px] mx-auto px-12 py-16"
        >
          {/* Header Action with back button */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setView("landing")}
                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors shadow-sm hover:-translate-y-0.5 active:translate-y-0"
                title="Back to Landing Page"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 font-outfit tracking-tight leading-none">Credit Console Dashboard</h1>
                <p className="text-xs text-slate-500 mt-2 font-inter">Adjust thresholds, download audit exports, or trigger assessment wizards.</p>
              </div>
            </div>
            
            <Link
              to="/assess"
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs font-outfit tracking-wider uppercase px-4 py-2.5 rounded-lg shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <UserCheck className="w-4 h-4" />
              <span>Launch Underwriter</span>
            </Link>
          </div>

          {/* SIX KPI CARDS WITH STAGGERED FADE-IN */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 lg:grid-cols-6 gap-6 font-inter text-xs text-slate-500"
          >
            {/* KPI 1: Portfolio Size - White, soft shadow, blue database icon */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4, shadow: "0 10px 25px -10px rgba(0,0,0,0.08)" }}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-premium transition-all duration-350 flex flex-col justify-between h-36"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-outfit">Portfolio Size</span>
                <Database className="w-4 h-4 text-blue-500" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 font-outfit leading-none">25,000+</h2>
              <span className="text-[9px] text-slate-400">Total active MSMEs</span>
            </motion.div>

            {/* KPI 2: Average Health Score - Blue top border, elevated */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4, shadow: "0 10px 25px -10px rgba(0,0,0,0.08)" }}
              className="bg-white border-t-4 border-t-blue-600 border-x border-b border-slate-200 rounded-2xl p-5 shadow-premium transition-all duration-350 flex flex-col justify-between h-36"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-outfit">Mean Health</span>
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 font-outfit leading-none">67.4 / 100</h2>
              <span className="text-[9px] text-slate-400">Ensemble score avg</span>
            </motion.div>

            {/* KPI 3: Loan Approval Rate - Green left border, elevated */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4, shadow: "0 10px 25px -10px rgba(0,0,0,0.08)" }}
              className="bg-white border-l-4 border-l-emerald-600 border-y border-r border-slate-200 rounded-2xl p-5 shadow-premium transition-all duration-350 flex flex-col justify-between h-36"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-outfit">Approval Rate</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 font-outfit leading-none">84.2%</h2>
              <span className="text-[9px] text-slate-400">Priority sectors limits</span>
            </motion.div>

            {/* KPI 4: Average Default Probability - Orange/amber right border, elevated */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4, shadow: "0 10px 25px -10px rgba(0,0,0,0.08)" }}
              className="bg-white border-r-4 border-r-amber-500 border-y border-l border-slate-200 rounded-2xl p-5 shadow-premium transition-all duration-350 flex flex-col justify-between h-36"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-outfit">NPA Default</span>
                <ShieldAlert className="w-4 h-4 text-amber-500" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 font-outfit mt-2">14.8%</h2>
              <span className="text-[9px] text-slate-400">12-mo default probability</span>
            </motion.div>

            {/* KPI 5: High Risk Accounts - Red top border, elevated */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4, shadow: "0 10px 25px -10px rgba(0,0,0,0.08)" }}
              className="bg-white border-t-4 border-t-rose-500 border-x border-b border-slate-200 rounded-2xl p-5 shadow-premium transition-all duration-350 flex flex-col justify-between h-36"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-outfit">High Risk</span>
                <ShieldAlert className="w-4 h-4 text-rose-500" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-rose-600 font-outfit leading-none">2,140</h2>
              <span className="text-[9px] text-slate-400">Accounts flagged</span>
            </motion.div>

            {/* KPI 6: Active AI Models - White, subtle shadow, CPU icon */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4, shadow: "0 10px 25px -10px rgba(0,0,0,0.08)" }}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-premium transition-all duration-350 flex flex-col justify-between h-36"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-outfit">Active Models</span>
                <Cpu className="w-4 h-4 text-slate-400" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 font-outfit leading-none">3 Core</h2>
              <span className="text-[9px] text-slate-400">LGBM + XGBoost + CatBoost</span>
            </motion.div>
          </motion.div>

          {/* LOWER GRID SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card title="Recent Credit Underwriting Audits">
                <TableComponent 
                  headers={['Business ID', 'Legal Name', 'Sector', 'Score', 'Risk Rating', 'Approved Limit']}
                  data={recentAssessments}
                  renderRow={(row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 pl-2 font-semibold text-slate-800 font-outfit">{row.id}</td>
                      <td className="py-3.5 font-medium text-slate-700">{row.name}</td>
                      <td className="py-3.5 text-slate-500">{row.industry}</td>
                      <td className="py-3.5 font-semibold text-slate-800">{row.score.toFixed(1)}</td>
                      <td className="py-3.5 flex items-center space-x-1"><StatusBadge status={row.risk} /></td>
                      <td className="py-3.5 font-semibold text-slate-800 text-right pr-2">{row.limit}</td>
                    </tr>
                  )}
                />
              </Card>

              {/* Today's Predictions and Recent Decisions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Today's Underwriting Predictions">
                  <div className="space-y-4 font-inter text-xs text-slate-600">
                    {predictionsLog.map((pred, idx) => (
                      <div key={idx} className="flex items-center justify-between pb-2 border-b border-slate-50 last:border-0 last:pb-0">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-700">{pred.id}</span>
                          <span className="text-slate-450">{pred.time}</span>
                        </div>
                        <span className={`font-bold font-outfit text-[10px] px-2 py-0.5 rounded ${
                          pred.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {pred.status} (Score: {pred.score})
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Quick Console Actions">
                  <div className="grid grid-cols-1 gap-3 font-outfit font-bold uppercase tracking-wider text-[10px]">
                    <Link 
                      to="/assess"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 rounded-lg hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-sm"
                    >
                      Run Single Underwrite
                    </Link>
                    <Link 
                      to="/batch"
                      className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-center py-2.5 rounded-lg hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-sm"
                    >
                      Batch CSV Upload
                    </Link>
                    <Link 
                      to="/analytics"
                      className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-center py-2.5 rounded-lg hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-sm"
                    >
                      Portfolio Analytics
                    </Link>
                  </div>
                </Card>
              </div>
            </div>

            {/* Right side: Reports, Notifications & Health */}
            <div className="space-y-8">
              <Card title="Recent Assessment Reports">
                <div className="space-y-3.5 font-inter text-xs text-slate-600">
                  {recentReports.map((rep, idx) => (
                    <div key={idx} className="flex items-center justify-between pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-700 block truncate max-w-[160px]">{rep.name}</span>
                        <span className="text-[10px] text-slate-400">{rep.date} ({rep.size})</span>
                      </div>
                      <button 
                        onClick={() => navigate('/assess')}
                        className="text-blue-600 hover:text-blue-700 font-bold font-outfit flex items-center space-x-1 uppercase text-[9px] tracking-wider"
                      >
                        <span>Download</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* System health */}
              <Card title="System Node Telemetry">
                <div className="space-y-4 font-inter text-xs text-slate-600">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">FastAPI Engine</span>
                    <span className="font-semibold text-emerald-600 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Online</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Model Latencies</span>
                    <span className="font-semibold text-slate-800">12 ms avg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Active Database</span>
                    <span className="font-semibold text-slate-800">SQLite (Synced)</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

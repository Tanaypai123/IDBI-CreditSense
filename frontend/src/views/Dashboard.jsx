import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import { 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  Database,
  ArrowRight,
  UserCheck
} from 'lucide-react';

export default function Dashboard() {
  const kpis = [
    { label: 'MSME Portfolio Processed', value: '25,000', change: 'Total databases', icon: Database, color: 'text-blue-600 bg-blue-50' },
    { label: 'Portfolio Health Mean', value: '67.4 / 100', change: 'Ensemble weighted', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Underwriting Ensembles', value: '3 Active', change: 'LGBM + XGBoost + CatBoost', icon: Layers, color: 'text-amber-600 bg-amber-50' },
  ];

  const recentAssessments = [
    { id: 'MSME-9831', name: 'Sharma Wholesale Traders', industry: 'Retail', score: 94.0, risk: 'Excellent', eligible: true, limit: '3,000,000 INR' },
    { id: 'MSME-1492', name: 'Nandan Food Court', industry: 'Restaurant', score: 68.5, risk: 'Medium Risk', eligible: true, limit: '2,000,000 INR' },
    { id: 'MSME-4309', name: 'Vibrant Textiles', industry: 'Textile', score: 48.0, risk: 'High Risk', eligible: false, limit: '0 INR' },
    { id: 'MSME-7721', name: 'Apex Tech Solutions', industry: 'IT', score: 87.2, risk: 'Excellent', eligible: true, limit: '5,000,000 INR' },
    { id: 'MSME-3208', name: 'Ankur Agro Mills', industry: 'Agriculture', score: 32.5, risk: 'Critical Risk', eligible: false, limit: '0 INR' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight font-outfit">
            Overview Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time credit risk analytics, audit records, and ensemble evaluations.
          </p>
        </div>
        <div>
          <Link
            to="/assess"
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs font-outfit tracking-wider uppercase px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200"
          >
            <UserCheck className="w-4 h-4" />
            <span>New Risk Underwriting</span>
          </Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white border border-slate-200/60 rounded-xl p-6 shadow-premium flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none font-outfit block">
                {kpi.label}
              </span>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight font-outfit leading-none">
                {kpi.value}
              </h2>
              <span className="text-[11px] text-slate-500 font-medium font-inter block">
                {kpi.change}
              </span>
            </div>
            <div className={`p-3.5 rounded-xl ${kpi.color}`}>
              <kpi.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Audits Table */}
        <div className="lg:col-span-2">
          <Card title="Recent Credit Underwriting Audits">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 pl-2">Business ID</th>
                    <th className="pb-3">Legal Name</th>
                    <th className="pb-3">Sector</th>
                    <th className="pb-3">Score</th>
                    <th className="pb-3">Risk Category</th>
                    <th className="pb-3 text-right pr-2">Loan Limit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-inter text-xs text-slate-600">
                  {recentAssessments.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 pl-2 font-semibold text-slate-800 font-outfit">
                        {item.id}
                      </td>
                      <td className="py-3.5 font-medium text-slate-700">
                        {item.name}
                      </td>
                      <td className="py-3.5">
                        {item.industry}
                      </td>
                      <td className="py-3.5 font-semibold text-slate-800">
                        {item.score.toFixed(1)}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold font-outfit ${
                          item.score >= 85 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : item.score >= 70
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : item.score >= 50
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {item.risk}
                        </span>
                      </td>
                      <td className="py-3.5 text-right pr-2 font-semibold text-slate-800">
                        {item.limit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* System telemetry info */}
        <div>
          <Card title="System Telemetry Status">
            <div className="space-y-5 font-inter">
              <div className="flex items-center justify-between text-xs pb-3.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">FastAPI Engine</span>
                <span className="font-semibold text-emerald-600 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Online / SSL</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pb-3.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Underwriting Latency</span>
                <span className="font-semibold text-slate-800">12ms (avg)</span>
              </div>
              <div className="flex items-center justify-between text-xs pb-3.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">SHAP Estimations</span>
                <span className="font-semibold text-blue-600">On-The-Fly Enabled</span>
              </div>
              <div className="flex items-center justify-between text-xs pb-3.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">PDF Engine</span>
                <span className="font-semibold text-slate-800">ReportLab Ready</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Database Node</span>
                <span className="font-semibold text-slate-800">SQLite (Synced)</span>
              </div>
              
              <Link
                to="/assess"
                className="mt-4 flex items-center justify-center space-x-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/50 hover:bg-blue-50 py-2.5 rounded-lg border border-blue-100/50 transition-all font-outfit"
              >
                <span>Launch Underwriting Session</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
